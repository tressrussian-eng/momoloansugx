'use client';

import { useRouter } from 'next/navigation';
import { CircleAlert, ArrowRight, Wallet } from 'lucide-react';
import { SharedLayout } from '@/components/shared-layout';

export default function SuccessPage() {
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <SharedLayout>
      {/* Success Section */}
      <div className="flex flex-col items-center justify-center py-6 sm:py-12">
        <CircleAlert className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 mb-4 sm:mb-6 animate-bounce" />
        
        <h2 className="text-2xl sm:text-4xl font-black text-black mb-2 sm:mb-4 text-center">Loan Denied!</h2>
        <p className="text-gray-500 text-sm sm:text-lg mb-6 sm:mb-12 text-center">Your loan has been Denied</p>

        {/* Loan Details Card */}
        <div className="bg-red-50 border-2 border-red-300 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 w-full">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            <span className="text-black font-bold text-lg sm:text-xl">Inactive MTN</span>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm sm:text-base mb-2">Please deposit atleast</p>
            <h3 className="text-3xl sm:text-4xl font-black text-green-600">5,000 RWF</h3>
            <p className="text-gray-600 text-sm sm:text-base mt-2">in your MTN account to make it active and reapply</p>
          </div>
        </div>

        {/* Important Info */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 w-full">
          <p className="text-black font-semibold text-sm sm:text-base">
            ✓ Funds will be transferred to your account within 30 minutes
          </p>
          <p className="text-black font-semibold text-sm sm:text-base mt-2">
            ✓ Loan repayment period: 6 months
          </p>
          <p className="text-black font-semibold text-sm sm:text-base mt-2">
            ✓ You can now access your Fast Credit dashboard
          </p>
        </div>

        {/* Dashboard Button */}
        <button
        onClick={handleBackToLogin}
        className="w-full bg-yellow-400 text-black font-bold text-base sm:text-xl py-3 sm:py-4 rounded-lg sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 hover:bg-yellow-500 transition-colors mb-3 sm:mb-4">
          Go to Dashboard
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Back to Login */}
        <button 
          onClick={handleBackToLogin}
          className="w-full text-center text-gray-500 hover:text-black text-sm sm:text-base transition-colors">
          Back to login
        </button>
      </div>
    </SharedLayout>
  );
}

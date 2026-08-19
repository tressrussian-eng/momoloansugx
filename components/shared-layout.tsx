import React from 'react';

export function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-yellow-400 flex flex-col">
      {/* Logo and Tagline */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
          <div className="relative">
            <div className="text-2xl sm:text-4xl font-black text-black">≡</div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-black italic">MTN Fast credit</h1>
        </div>
        <p className="text-black text-center text-xs sm:text-base">
          Quick loans. <span className="font-bold">Anytime. Anywhere.</span>
        </p>
      </div>

      {/* Main Card */}
      <div className="flex-1 px-3 sm:px-4 py-6 sm:py-8 overflow-y-auto">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg">
          {children}
        </div>
      </div>

      {/* Bottom Illustration Section */}
      <div className="relative pt-8 sm:pt-12 pb-2 sm:pb-4">
        <svg className="w-full" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path d="M0 50 Q100 25 200 40 T400 50 L400 100 L0 100 Z" fill="#FCD34D" opacity="0.6"></path>
        </svg>
        
        {/* Illustration Elements */}
        <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex items-end justify-center gap-3 sm:gap-6 px-4">
          {/* Phone */}
          <div className="relative w-10 sm:w-14 h-18 sm:h-24 bg-yellow-400 border-2 border-black rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transform -translate-y-1 sm:-translate-y-2">
            <div className="w-8 sm:w-11 h-16 sm:h-20 bg-white rounded-md sm:rounded-lg flex flex-col items-center justify-center border border-black p-1">
              <div className="w-4 sm:w-6 h-4 sm:h-6 bg-black rounded-full mb-0.5 sm:mb-1"></div>
              <div className="text-black font-bold text-xs text-center">
                <div className="text-xs font-bold">MTN</div>
              </div>
            </div>
          </div>

          {/* Lock */}
          <div className="w-10 sm:w-14 h-16 sm:h-20 bg-gray-800 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg">
            <div className="text-2xl sm:text-3xl">🔒</div>
          </div>

          {/* Coins Stack */}
          <div className="flex flex-col items-center gap-0.5 sm:gap-1">
            <div className="w-9 sm:w-12 h-2.5 sm:h-3 rounded-full bg-yellow-300 border-2 border-yellow-600 shadow-md flex items-center justify-center text-xs font-bold text-yellow-700">MTN</div>
            <div className="w-8 sm:w-10 h-2 sm:h-2.5 rounded-full bg-yellow-200 border-2 border-yellow-600 shadow-md flex items-center justify-center text-xs font-bold text-yellow-700">M</div>
          </div>

          {/* Coin */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-400 border-2 border-yellow-600 flex items-center justify-center shadow-lg text-lg sm:text-xl font-bold text-yellow-700">
            ₦
          </div>
        </div>
      </div>
    </div>
  );
}

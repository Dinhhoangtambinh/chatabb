import React from "react";

export default function SplashScreen() {
  return (
    <>
        <style>{`
            @keyframes bounce-smooth {
            0%, 100% {
                transform: translateY(0%);
                animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
            }
            50% {
                transform: translateY(-25%);
                animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
            }
            }
            .animate-bounce-smooth {
            animation: bounce-smooth 1.5s infinite;
            }
        `}</style>
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-[var(--subBg)]">
            <div className="text-3xl font-bold text-[var(--dark1)] mb-6">
            Expense Tracker
            </div>

            {/* Ba chấm nhảy lên mượt mà hơn */}
            <div className="flex space-x-2">
            <span 
                className="w-3 h-3 bg-[var(--dark1)] rounded-full animate-bounce-smooth" 
                style={{ animationDelay: '0ms' }}
            ></span>
            <span 
                className="w-3 h-3 bg-[var(--dark1)] rounded-full animate-bounce-smooth" 
                style={{ animationDelay: '200ms' }}
            ></span>
            <span 
                className="w-3 h-3 bg-[var(--dark1)] rounded-full animate-bounce-smooth" 
                style={{ animationDelay: '400ms' }}
            ></span>
            </div>
        </div>
    </>
  );
}
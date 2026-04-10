import React from "react";

const Loading = ({ fullScreen = false }) => {
  return (
    <div className={`flex flex-col justify-center items-center ${fullScreen ? "fixed inset-0 z-[9999]" : "min-h-[80vh] flex-1"} w-full bg-gradient-to-br from-slate-50 via-blue-100 to-indigo-50`}>
      <div className="relative">
        {/* Outer glow effect */}
        <div className="absolute inset-0 blur-2xl opacity-40 animate-pulse">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
        </div>
        
        {/* Main spinner container */}
        <div className="relative flex flex-col items-center gap-6">
          {/* Triple ring spinner */}
          <div className="relative w-24 h-24">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin"></div>
            
            {/* Middle ring */}
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-indigo-500 border-r-indigo-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
            
            {/* Inner ring */}
            <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-500 border-r-purple-400 animate-spin" style={{ animationDuration: '2s' }}></div>
            
            {/* Center dot with pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse shadow-lg shadow-blue-500/50"></div>
            </div>
          </div>
          
          {/* Loading text with gradient */}
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
              Kasuwar Zamani
            </h3>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;

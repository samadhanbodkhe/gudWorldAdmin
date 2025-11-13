// src/components/LoadingSpinner.jsx
import React, { useState, useEffect } from "react";

const LoadingSpinner = ({ message = "Loading...", timeout = 8000 }) => {
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F4] to-[#E8D5C4] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#B97A57] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#5C3A21] font-medium">{message}</p>
        <p className="text-sm text-[#8B7355] mt-2">
          {showTimeoutMessage 
            ? "Taking longer than expected. Please check your connection."
            : "Please wait while we verify your session"
          }
        </p>
        
        {showTimeoutMessage && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#B97A57] text-white rounded-lg hover:bg-[#9C623E] transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
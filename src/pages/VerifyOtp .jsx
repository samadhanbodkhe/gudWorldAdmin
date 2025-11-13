import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useVerifyAdminMutation } from "../redux/api/authApi";
import { toast } from "react-toastify";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const [verifyAdmin, { isLoading: verifyLoading }] = useVerifyAdminMutation();

  const email = localStorage.getItem("adminEmail");

  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split("").slice(0, 4);
      setOtp([...newOtp, ...Array(4 - newOtp.length).fill("")]);
      
      // Focus the last input with value
      const lastFilledIndex = Math.min(newOtp.length - 1, 3);
      if (inputRefs.current[lastFilledIndex]) {
        inputRefs.current[lastFilledIndex].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      toast.error("Please enter the complete 4-digit OTP");
      return;
    }

    if (!/^\d{4}$/.test(otpString)) {
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyAdmin({ email, otp: otpString }).unwrap();
      
      if (response.message === "Login successful") {
        toast.success("Login successful! Redirecting...");
        
        // Clear stored email
        localStorage.removeItem("adminEmail");
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error?.data?.message || "Invalid OTP. Please try again.");
      
      // Clear OTP on error
      setOtp(["", "", "", ""]);
      inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      const response = await verifyAdmin({ email, resend: true }).unwrap();
      
      if (response.message === "OTP sent successfully") {
        toast.success("New OTP sent to your email!");
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", ""]);
        inputRefs.current[0].focus();
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("adminEmail");
    navigate("/login");
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F4] to-[#E8D5C4] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#B97A57] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#5C3A21] mb-2">Verify OTP</h1>
          <p className="text-[#8B7355]">
            Enter the 4-digit code sent to<br />
            <span className="font-medium">{email}</span>
          </p>
        </div>

        {/* OTP Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            {/* OTP Inputs */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#5C3A21] mb-4 text-center">
                4-Digit Verification Code
              </label>
              <div className="flex justify-center space-x-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#B97A57] focus:ring-2 focus:ring-[#B97A57] transition-colors"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                {canResend ? (
                  "Didn't receive the code?"
                ) : (
                  <>
                    Resend OTP in <span className="font-medium text-[#B97A57]">{timer}s</span>
                  </>
                )}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join("").length !== 4}
              className="w-full bg-[#B97A57] text-white py-3 px-4 rounded-lg hover:bg-[#9C623E] focus:outline-none focus:ring-2 focus:ring-[#B97A57] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium mb-4"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                "Verify OTP"
              )}
            </button>

            {/* Resend OTP */}
            {canResend && (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="w-full text-[#B97A57] py-2 px-4 rounded-lg border border-[#B97A57] hover:bg-[#B97A57] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#B97A57] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Resend OTP
              </button>
            )}
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={handleBackToLogin}
              className="text-[#8B7355] hover:text-[#5C3A21] transition-colors text-sm font-medium"
            >
              ← Back to Login
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-medium">Security Tip</p>
              <p className="text-xs text-blue-700 mt-1">
                Never share your OTP with anyone. Our team will never ask for your verification code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
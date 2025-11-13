// src/components/Header.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutAdminMutation } from "../redux/api/authApi";
import { toast } from "react-toastify";
import { clearAuth } from "../redux/slices/authSlice";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { admin } = useSelector((state) => state.auth);

  const [logoutAdmin, { isLoading }] = useLogoutAdminMutation();

  const handleLogout = async () => {
    try {
      await logoutAdmin().unwrap();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(clearAuth());
      localStorage.removeItem("admin");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminEmail");
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 relative z-50">
      <div className="flex justify-between items-center">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back, {admin?.name || "Admin"}
          </p>
        </div>

        {/* Profile Section */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-2 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-[#B97A57] rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-medium">
                {admin?.name?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                {admin?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500">{admin?.email}</p>
            </div>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${
                showDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 transition-all duration-200 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {admin?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
              </div>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate("/admin/settings");
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </button>

              {/* 🔥 Stylish Logout Button */}
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`flex items-center justify-center w-[85%] mx-auto mt-2 mb-1 text-sm font-semibold text-white bg-[#B97A57] py-2 rounded-lg shadow-md hover:shadow-lg hover:bg-[#a16748] active:scale-95 transition-all duration-150 ${
                  isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {isLoading ? (
                  "Logging out..."
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default Header;

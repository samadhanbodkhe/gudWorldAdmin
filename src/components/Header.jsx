import React from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useLogoutAdminMutation } from "../redux/api/authApi";

const Header = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [logoutAdmin, { isLoading }] = useLogoutAdminMutation();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        // ✅ Call logout API
        await logoutAdmin().unwrap();

        // ✅ Clear any local flags (optional)
        localStorage.removeItem("isAuthenticated");

        // ✅ Update state
        setIsAuthenticated(false);

        // ✅ Redirect to login page
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        alert("Failed to logout. Please try again.");
      }
    }
  };

  return (
    <header className="bg-white shadow-md h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <h1 className="text-xl font-semibold text-[#5C3A21]">
        Admin Dashboard
      </h1>

      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="flex items-center gap-2 bg-[#B97A57] text-white px-3 py-1.5 rounded-md hover:bg-[#9C623E] transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <FiLogOut />
        {isLoading ? "Logging out..." : "Logout"}
      </button>
    </header>
  );
};

export default Header;

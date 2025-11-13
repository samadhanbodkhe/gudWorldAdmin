import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiImage,
  FiSettings,
  FiMenu,
  FiX,
  FiHash,
} from "react-icons/fi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FiHome /> },
    { name: "Products", path: "/admin/products", icon: <FiBox /> },
    { name: "Orders", path: "/admin/orders", icon: <FiShoppingBag /> },
    { name: "Users", path: "/admin/users", icon: <FiUsers /> },
    { name: "Refunds", path: "/admin/refunds", icon: <FiHash /> },
    { name: "Profile", path: "/admin/profile", icon: <FiUsers /> },
  ];

  return (
    <>
      {/* Mobile Header with Toggle Button */}
      <div className="md:hidden flex items-center justify-between bg-[#5C3A21] text-white px-4 py-3 shadow-md fixed top-0 left-0 right-0 z-50">
        <h1 className="text-xl font-bold">Govind Admin</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-2xl">
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#5C3A21] text-white shadow-lg transform transition-transform duration-300 z-40 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:w-64 w-64`}
      >
        <div className="hidden md:block p-6 text-2xl font-bold border-b border-[#7b5435]">
          Govind Admin
        </div>
        <nav className="flex-1 mt-6 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)} // close sidebar on mobile after navigation
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-base hover:bg-[#B97A57] transition-colors ${
                  isActive ? "bg-[#B97A57]" : ""
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile when sidebar open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;

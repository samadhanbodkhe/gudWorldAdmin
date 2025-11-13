// src/pages/Users.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiEye,
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import { useGetAllUsersQuery } from "../redux/api/userApi";

const Users = () => {
  const { data, isLoading, error } = useGetAllUsersQuery();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold text-gray-600">
        Loading users...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center mt-10">
        Failed to fetch users 😞
      </div>
    );

  const users = data?.users || [];

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-5 min-h-screen bg-gradient-to-br from-[#fdf8f3] to-[#fffaf0] overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#5C3A21] to-amber-600 bg-clip-text text-transparent text-center md:text-left">
          👥 Users Management
        </h2>

        {/* Search */}
        <div className="flex items-center bg-white shadow-md px-3 py-2 rounded-xl w-full sm:w-72 border border-amber-100">
          <FiSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none w-full text-gray-700 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Table View (Desktop) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
        <table className="w-full text-sm table-auto">
          <thead className="bg-gradient-to-r from-[#F8F6F4] to-amber-100">
            <tr>
              {[
                "Profile",
                "Name",
                "Email",
                "Mobile",
                "Addresses",
                "Joined",
                "Actions",
              ].map((head) => (
                <th
                  key={head}
                  className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <motion.tr
                key={user._id}
                className="hover:bg-amber-50 transition-all duration-300"
                whileHover={{ scale: 1.01 }}
              >
                <td className="px-6 py-4">
                  <img
                    src={
                      user.profilePhoto ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                  />
                </td>
                <td className="px-6 py-4 font-medium text-gray-800">
                  {user.name}
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-gray-600">{user.mobile}</td>
                <td className="px-6 py-4 text-gray-500">
                  {user.addresses?.length || 0} Address(es)
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="text-blue-500 hover:text-blue-700 transition-transform hover:scale-110"
                    title="View Details"
                  >
                    <FiEye size={20} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {filteredUsers.map((user) => (
          <motion.div
            key={user._id}
            className="bg-white p-4 rounded-2xl shadow-lg border border-amber-100 flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
            <img
              src={
                user.profilePhoto ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-base">
                {user.name}
              </h3>
              <p className="text-gray-600 text-sm truncate">{user.email}</p>
              <p className="text-gray-500 text-xs mt-1">
                {user.addresses?.length || 0} Address(es)
              </p>
              <button
                onClick={() => setSelectedUser(user)}
                className="mt-2 text-blue-600 text-sm font-semibold hover:text-blue-800"
              >
                View Details →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 px-2"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative border-t-4 border-amber-500 overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              >
                <FiX size={22} />
              </button>

              {/* Profile Section */}
              <div className="flex flex-col items-center mb-5">
                <img
                  src={
                    selectedUser.profilePhoto ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="User"
                  className="w-24 h-24 rounded-full border-4 border-amber-400 mb-3 object-cover"
                />
                <h3 className="text-lg md:text-xl font-bold text-[#5C3A21] text-center">
                  {selectedUser.name}
                </h3>
              </div>

              {/* Info */}
              <div className="space-y-3 text-gray-700 text-sm md:text-base">
                <p className="flex items-center gap-2 break-all">
                  <FiMail /> <strong>Email:</strong> {selectedUser.email}
                </p>
                <p className="flex items-center gap-2">
                  <FiPhone /> <strong>Mobile:</strong> {selectedUser.mobile}
                </p>
                <p className="flex items-center gap-2">
                  <FiCalendar />{" "}
                  <strong>Joined:</strong>{" "}
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
                <div>
                  <p className="flex items-center gap-2 font-semibold mb-2">
                    <FiMapPin /> Addresses:
                  </p>
                  {selectedUser.addresses?.length > 0 ? (
                    <ul className="pl-6 list-disc text-gray-600 space-y-1 text-sm">
                      {selectedUser.addresses.map((addr, idx) => (
                        <li key={idx}>
                          {addr.street}, {addr.city}, {addr.state} -{" "}
                          {addr.pincode}, {addr.country}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No addresses added.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;

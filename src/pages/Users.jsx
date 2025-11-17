// src/pages/Users.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiEye,
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiRefreshCw
} from "react-icons/fi";
import { useGetAllUsersQuery } from "../redux/api/userApi";

const Users = () => {
  const { data, isLoading, error, refetch } = useGetAllUsersQuery();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Filter users based on search
  useEffect(() => {
    if (data?.users) {
      const filtered = data.users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.mobile.includes(search)
      );
      setFilteredUsers(filtered);
    }
  }, [data?.users, search]);

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3A21] mb-4"></div>
          <p className="text-lg font-semibold text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to load users</h3>
          <p className="text-gray-600 mb-4">
            {error?.data?.message || "Please try again later"}
          </p>
          <button 
            onClick={refetch}
            className="bg-[#5C3A21] text-white px-6 py-2 rounded-lg hover:bg-[#7A4B2F] transition-colors flex items-center mx-auto"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const users = data?.users || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#5C3A21]">
              Users Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and view all registered users ({users.length} users)
            </p>
          </div>
          
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <FiSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5C3A21] focus:border-transparent bg-white"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <FiUser className="mx-auto text-2xl text-blue-500 mb-2" />
          <h4 className="font-semibold text-gray-800">Total Users</h4>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <FiMail className="mx-auto text-2xl text-green-500 mb-2" />
          <h4 className="font-semibold text-gray-800">Verified Users</h4>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <FiMapPin className="mx-auto text-2xl text-purple-500 mb-2" />
          <h4 className="font-semibold text-gray-800">With Addresses</h4>
          <p className="text-2xl font-bold text-gray-900">
            {users.filter(user => user.addresses && user.addresses.length > 0).length}
          </p>
        </div>
      </div>

      {/* Table View (Desktop) */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "User",
                  "Contact Info",
                  "Addresses",
                  "Joined Date",
                  "Actions"
                ].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors"
                  whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        {user.profilePhoto ? (
                          <img
                            src={user.profilePhoto}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <FiUser className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.mobile}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.addresses?.length || 0} address{user.addresses?.length !== 1 ? 'es' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-lg hover:bg-blue-50"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <FiUser className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? "No users found" : "No users available"}
            </h3>
            <p className="text-gray-500">
              {search ? "Try adjusting your search terms" : "Users will appear here once registered"}
            </p>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredUsers.map((user) => (
          <motion.div
            key={user._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(user)}
                className="text-blue-600 hover:text-blue-800 transition-colors p-2"
              >
                <FiEye className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Mobile</p>
                <p className="font-medium">{user.mobile}</p>
              </div>
              <div>
                <p className="text-gray-500">Addresses</p>
                <p className="font-medium">
                  {user.addresses?.length || 0}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Joined</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <FiUser className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? "No users found" : "No users available"}
            </h3>
            <p className="text-gray-500">
              {search ? "Try adjusting your search terms" : "Users will appear here once registered"}
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Profile Section */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedUser.profilePhoto ? (
                      <img
                        src={selectedUser.profilePhoto}
                        alt={selectedUser.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiMail className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Email</span>
                    </div>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiPhone className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Mobile</span>
                    </div>
                    <p className="text-gray-900">{selectedUser.mobile}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiCalendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Joined Date</span>
                    </div>
                    <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>

                {/* Addresses Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <FiMapPin className="w-5 h-5 text-gray-500" />
                    <h4 className="text-lg font-semibold text-gray-900">Addresses</h4>
                    <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                      {selectedUser.addresses?.length || 0}
                    </span>
                  </div>

                  {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                    <div className="space-y-4">
                      {selectedUser.addresses.map((address, index) => (
                        <div key={address._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">
                              {address.name} {address.isDefault && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2">
                                  Default
                                </span>
                              )}
                            </h5>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {address.type}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} - {address.pincode}</p>
                            <p>{address.country}</p>
                            <p className="text-gray-500">Phone: {address.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FiMapPin className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-gray-500">No addresses added</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="bg-[#5C3A21] text-white px-6 py-2 rounded-lg hover:bg-[#7A4B2F] transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;
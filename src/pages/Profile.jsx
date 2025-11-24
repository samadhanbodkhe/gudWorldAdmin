// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiCamera, FiSave, FiLogOut, FiX, FiCheck, FiEdit2 } from "react-icons/fi";
import { 
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useUploadAdminPhotoMutation,
  useRemoveAdminPhotoMutation,
  useLogoutAdminMutation,
  useSendEmailVerificationMutation,
  useVerifyEmailOtpMutation
} from "../redux/api/authApi";
import LoadingSpinner from "./LoadingSpinner";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [activeModal, setActiveModal] = useState(null); // 'edit', 'email', 'otp', 'logout'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: ""
  });
  const [emailData, setEmailData] = useState({
    newEmail: "",
    otp: ""
  });

  const navigate = useNavigate();

  // RTK Query hooks
  const { 
    data: profileResponse, 
    isLoading: isProfileLoading,
    refetch
  } = useGetAdminProfileQuery();

  const [updateProfile, { isLoading: isUpdating }] = useUpdateAdminProfileMutation();
  const [uploadPhoto, { isLoading: isUploading }] = useUploadAdminPhotoMutation();
  const [removePhoto, { isLoading: isRemoving }] = useRemoveAdminPhotoMutation();
  const [logoutAdmin, { isLoading: isLoggingOut }] = useLogoutAdminMutation();
  const [sendEmailVerification, { isLoading: isSendingOtp }] = useSendEmailVerificationMutation();
  const [verifyEmailOtp, { isLoading: isVerifyingEmail }] = useVerifyEmailOtpMutation();

  const admin = profileResponse?.admin;

  // Scroll to top when modal opens
  useEffect(() => {
    if (activeModal) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModal]);

  // Initialize form data
  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name || "",
        email: admin.email || "",
        mobile: admin.mobile || ""
      });
    }
  }, [admin]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    try {
      await uploadPhoto(file).unwrap();
      toast.success("Profile photo updated successfully!");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to upload photo");
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await removePhoto().unwrap();
      toast.success("Profile photo removed successfully!");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to remove photo");
    }
  };

  const handleSendEmailOtp = async () => {
    if (!emailData.newEmail) {
      toast.error("Please enter a new email address");
      return;
    }

    if (emailData.newEmail === admin.email) {
      toast.error("New email cannot be same as current email");
      return;
    }

    try {
      await sendEmailVerification({ email: emailData.newEmail }).unwrap();
      toast.success("OTP sent to your new email address");
      setActiveModal('otp');
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailData.otp || emailData.otp.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      await verifyEmailOtp({ otp: emailData.otp }).unwrap();
      toast.success("Email updated successfully!");
      setActiveModal(null);
      setEmailData({ newEmail: "", otp: "" });
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to verify OTP");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      await updateProfile({
        name: formData.name,
        mobile: formData.mobile
      }).unwrap();
      toast.success("Profile updated successfully!");
      setActiveModal(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin().unwrap();
      toast.success("Logged out successfully!");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to logout");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      navigate("/login");
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setEmailData({ newEmail: "", otp: "" });
  };

  // Show loading only for initial profile load
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-gray-200">
            <div className="relative group">
              {admin?.profilePhoto ? (
                <div className="relative">
                  <img
                    src={admin.profilePhoto}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                  {(isRemoving || isUploading) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs mt-1">
                          {isUploading ? "Uploading..." : "Removing..."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-gray-300 flex items-center justify-center">
                  <FiUser className="text-white text-3xl" />
                </div>
              )}
              
              <div className="flex gap-2 mt-3 justify-center">
                <label className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  <FiCamera size={14} />
                  {isUploading ? "Uploading..." : "Change"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploading || isRemoving}
                  />
                </label>
                
                {admin?.profilePhoto && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={isRemoving}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <FiX size={14} />
                    {isRemoving ? "Removing..." : "Remove"}
                  </button>
                )}
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-semibold text-gray-800">{admin?.name || "Admin"}</h2>
              <p className="text-gray-600">{admin?.email}</p>
              <p className="text-sm text-gray-500 capitalize mt-1">{admin?.role || 'admin'}</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium text-gray-800">{admin?.name || "Not set"}</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-medium text-gray-800">{admin?.email}</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Mobile Number</p>
                <p className="font-medium text-gray-800">{admin?.mobile || "Not set"}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between pt-6 border-t border-gray-200">
            <button
              onClick={() => setActiveModal('logout')}
              disabled={isLoggingOut}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging out...
                </>
              ) : (
                <>
                  <FiLogOut size={16} />
                  Logout
                </>
              )}
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveModal('edit')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 cursor-pointer"
              >
                <FiEdit2 size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Account Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                admin?.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {admin?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Last Login</span>
              <span className="text-sm text-gray-800">
                {admin?.lastLogin 
                  ? new Date(admin.lastLogin).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Never'
                }
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Member Since</span>
              <span className="text-sm text-gray-800">
                {admin?.createdAt 
                  ? new Date(admin.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'N/A'
                }
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Login Count</span>
              <span className="text-sm font-medium text-gray-800">
                {admin?.loginCount !== undefined ? admin.loginCount : (admin?.loginCount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {activeModal === 'edit' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-md my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Edit Profile</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your mobile number"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveModal('email')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {activeModal === 'email' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-md my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Change Email Address</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Email
                </label>
                <input
                  type="email"
                  value={admin?.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Email Address
                </label>
                <input
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new email address"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmailOtp}
                  disabled={isSendingOtp}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {isSendingOtp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiMail size={16} />
                      Send OTP
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {activeModal === 'otp' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-md my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Verify OTP</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                We've sent a 4-digit OTP to <strong>{emailData.newEmail}</strong>. 
                Please enter it below to verify your new email address.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 4-digit OTP
                </label>
                <input
                  type="text"
                  value={emailData.otp}
                  onChange={(e) => {
                    // Allow only numbers and limit to 4 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setEmailData(prev => ({ ...prev, otp: value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                  placeholder="0000"
                  maxLength={4}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setActiveModal('email')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyEmailOtp}
                  disabled={isVerifyingEmail || emailData.otp.length !== 4}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {isVerifyingEmail ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FiCheck size={16} />
                      Verify OTP
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {activeModal === 'logout' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-md my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Logout</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Are you sure you want to logout? You'll need to login again to access your account.
              </p>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <FiLogOut size={16} />
                      Yes, Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
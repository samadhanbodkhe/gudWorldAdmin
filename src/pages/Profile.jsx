// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiCamera, FiSave, FiLogOut, FiX, FiCheck } from "react-icons/fi";
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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: ""
  });
  const [emailVerification, setEmailVerification] = useState({
    isVerifying: false,
    newEmail: "",
    otp: "",
    isOtpSent: false
  });

  const navigate = useNavigate();

  // RTK Query hooks
  const { 
    data: profileResponse, 
    isLoading,
    refetch
  } = useGetAdminProfileQuery();

  const [updateProfile, { isLoading: isUpdating }] = useUpdateAdminProfileMutation();
  const [uploadPhoto, { isLoading: isUploading }] = useUploadAdminPhotoMutation();
  const [removePhoto, { isLoading: isRemoving }] = useRemoveAdminPhotoMutation();
  const [logoutAdmin, { isLoading: isLoggingOut }] = useLogoutAdminMutation();
  const [sendEmailVerification, { isLoading: isSendingOtp }] = useSendEmailVerificationMutation();
  const [verifyEmailOtp, { isLoading: isVerifyingEmail }] = useVerifyEmailOtpMutation();

  const admin = profileResponse?.admin;

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

    // Check file type
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

  const handleEmailVerification = async () => {
    if (!emailVerification.newEmail) {
      toast.error("Please enter a new email address");
      return;
    }

    if (emailVerification.newEmail === admin.email) {
      toast.error("New email cannot be same as current email");
      return;
    }

    try {
      await sendEmailVerification({ email: emailVerification.newEmail }).unwrap();
      toast.success("OTP sent to your new email address");
      setEmailVerification(prev => ({ ...prev, isOtpSent: true }));
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailVerification.otp) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      await verifyEmailOtp({ otp: emailVerification.otp }).unwrap();
      toast.success("Email updated successfully!");
      setEmailVerification({
        isVerifying: false,
        newEmail: "",
        otp: "",
        isOtpSent: false
      });
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to verify OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfile({
        name: formData.name,
        mobile: formData.mobile
      }).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin().unwrap();
      toast.success("Logged out successfully!");
      // Clear local storage
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to logout");
      // Force logout even if API fails
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      navigate("/login");
    }
  };

  const cancelEmailVerification = () => {
    setEmailVerification({
      isVerifying: false,
      newEmail: "",
      otp: "",
      isOtpSent: false
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
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
                  {isRemoving && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                  <FiUser className="text-gray-500 text-3xl" />
                </div>
              )}
              
              <div className="flex gap-2 mt-3 justify-center">
                <label className="bg-blue-600 text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                  <FiCamera size={14} />
                  Change
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
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiX size={14} />
                    Remove
                  </button>
                )}
              </div>

              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <LoadingSpinner size="sm" />
                    <p className="text-xs mt-1">Uploading...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-semibold text-gray-800">{admin?.name || "Admin"}</h2>
              <p className="text-gray-600">{admin?.email}</p>
              <p className="text-sm text-gray-500 capitalize mt-1">{admin?.role || 'admin'}</p>
            </div>
          </div>

          {/* Email Verification Section */}
          {emailVerification.isVerifying && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-3">Verify New Email</h3>
              
              {!emailVerification.isOtpSent ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      value={emailVerification.newEmail}
                      onChange={(e) => setEmailVerification(prev => ({
                        ...prev,
                        newEmail: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new email address"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleEmailVerification}
                      disabled={isSendingOtp}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSendingOtp ? <LoadingSpinner size="sm" /> : <FiMail size={14} />}
                      {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                    </button>
                    <button
                      onClick={cancelEmailVerification}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-blue-700">
                    OTP sent to {emailVerification.newEmail}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={emailVerification.otp}
                      onChange={(e) => setEmailVerification(prev => ({
                        ...prev,
                        otp: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter OTP"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleVerifyEmailOtp}
                      disabled={isVerifyingEmail}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {isVerifyingEmail ? <LoadingSpinner size="sm" /> : <FiCheck size={14} />}
                      {isVerifyingEmail ? "Verifying..." : "Verify OTP"}
                    </button>
                    <button
                      onClick={cancelEmailVerification}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 cursor-text"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <FiMail className="inline mr-2" />
                    Email Address
                  </label>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setEmailVerification(prev => ({ ...prev, isVerifying: true }))}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Change Email
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  placeholder="Enter your email"
                />
                <p className="text-xs text-gray-500 mt-1">
                  To change email, click "Change Email" button
                </p>
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
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 cursor-text"
                  placeholder="Enter your mobile number"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <FiLogOut size={16} />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>

              <div className="flex gap-3">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data
                        setFormData({
                          name: admin?.name || "",
                          email: admin?.email || "",
                          mobile: admin?.mobile || ""
                        });
                        cancelEmailVerification();
                      }}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                      {isUpdating ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <FiSave size={16} />
                      )}
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Account Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Account Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                admin?.isActive 
                  ? 'bg-green-100 text-green-800 cursor-default' 
                  : 'bg-red-100 text-red-800 cursor-default'
              }`}>
                {admin?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Last Login</span>
              <span className="text-sm text-gray-800 cursor-default">
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
              <span className="text-sm text-gray-800 cursor-default">
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
              <span className="text-sm font-medium text-gray-800 cursor-default">
                {admin?.loginCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
"use client";

import React, { useState } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Header = ({ title }) => (
  <div className="bg-white shadow-md p-4 mb-4">
    <h1 className="text-2xl font-bold">{title}</h1>
  </div>
);

const ChangePasswordForm = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        apiUrl(API_CONFIG.ENDPOINTS.SECURITY.CHANGE_PASSWORD),
        { oldPassword, newPassword },
        {
          withCredentials: true,
        }
      );
      toast.success("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-8/12">
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>
      <form
        onSubmit={handleChangePassword}
        className="space-y-6 p-8 bg-white rounded-lg shadow-md border border-gray-300"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Old Password
          </label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="mt-1 block w-full h-12 rounded-md border-2 border-gray-400 shadow-sm focus:border-gray-500 focus:ring-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full h-12 rounded-md border-2 border-gray-400 shadow-sm focus:border-gray-500 focus:ring-gray-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-3 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(apiUrl(API_CONFIG.ENDPOINTS.SECURITY.RESET_PASSWORD), {
        email,
      });
      toast.success("Password reset link sent to your email");
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-8/12">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      <form
        onSubmit={handleResetPassword}
        className="space-y-6 p-8 bg-white rounded-lg shadow-md border border-gray-300"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full h-12 rounded-md border-2 border-gray-400 shadow-sm focus:border-gray-500 focus:ring-gray-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-3 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
        >
          {loading ? "Sending..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

const PasswordManagementPage = () => {
  const [activeTab, setActiveTab] = useState("change-password");

  return (
    <div>
      <Header title="Password Management" />
      <div className="flex flex-col md:flex-row">
        <ToastContainer />
        <div className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 p-4">
            <button
              onClick={() => setActiveTab("change-password")}
              className={`px-4 py-2 text-left rounded-lg w-full ${
                activeTab === "change-password"
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Change Password
            </button>
            <button
              onClick={() => setActiveTab("reset-password")}
              className={`px-4 py-2 text-left rounded-lg w-full ${
                activeTab === "reset-password"
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Reset Password
            </button>
          </div>
        </div>
        <div className="w-full md:w-3/4 p-8">
          {activeTab === "change-password" && <ChangePasswordForm />}
          {activeTab === "reset-password" && <ResetPasswordForm />}
        </div>
      </div>
    </div>
  );
};

export default PasswordManagementPage;

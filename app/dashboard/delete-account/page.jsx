"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { decryptData } from "@/lib/encryption";

import { useAppContext } from "@/context/AppContext";

const DeleteAccountPage = () => {
  const { logout } = useAppContext();
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const decryptedData = decryptData(user);
      setUserId(decryptedData.id);
    }
  }, []);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const encryptedUser = localStorage.getItem("user");
      const userData = decryptData(encryptedUser);
      const payload = { password, phone: phoneNumber };
      console.log("Deleting account with payload:", payload);
      await axios.post(
        `${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.DELETE)}${userData.id}`,
        payload
      );
      toast.success("Account deleted successfully");
      logout();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-8/12">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-4">Delete Account</h1>
      <p className="mb-4">
        Are you sure you want to delete your account? This action cannot be
        undone.
      </p>
      <form
        onSubmit={handleDeleteAccount}
        className="space-y-6 p-8 bg-white rounded-lg shadow-md border border-gray-300"
      >
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <input
            type="text"
            id="phoneNumber"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400"
        >
          {loading ? "Deleting..." : "Delete Account"}
        </button>
      </form>
    </div>
  );
};

export default DeleteAccountPage;

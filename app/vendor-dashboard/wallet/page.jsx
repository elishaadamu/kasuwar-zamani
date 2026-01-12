"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Wallet = () => {
  const [nin, setNin] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountDetails, setAccountDetails] = useState(null);
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [showFundModal, setShowFundModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  const handlePayment = async () => {
    const PaystackPop = (await import("@paystack/inline-js")).default;
    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: user?.email,
      amount: amount * 100, // Convert to kobo
      ref: new Date().getTime().toString(),
      onSuccess: (transaction) => {
        onSuccess(transaction);
      },
      onCancel: () => {
        onClose();
      },
    });
  };

  useEffect(() => {
    const encryptedUser = localStorage.getItem("user");
    if (encryptedUser) {
      const decryptedUser = decryptData(encryptedUser);
      setUser(decryptedUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAccountDetails();
    }
  }, [user]);

  const fetchAccountDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.GET + user.id),
        { withCredentials: true }
      );
      console.log("Details", response.data);
      setAccountDetails(response.data);
    } catch (error) {
      console.error("Error fetching account details:", error);
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSuccess = async (transaction) => {
    setLoading(true);
    try {
      // Call your backend API to verify and process the payment
      await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.FUND + user.id),
        {
          amount: amount,
          reference: transaction.reference,
        },
        { withCredentials: true }
      );

      toast.success("Wallet funded successfully!");
      setAmount("");
      fetchAccountDetails(); // Refresh wallet balance
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    toast.info("Payment cancelled");
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { nin };
    console.log(payload);
    try {
      await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.CREATE + user.id),
        payload,
        { withCredentials: true }
      );
      toast.success("Account created successfully!");
      fetchAccountDetails();
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error(error.response?.data?.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const encryptedUser = localStorage.getItem("user");
        if (encryptedUser) {
          const userData = decryptData(encryptedUser);
          const walletResponse = await axios.get(
            apiUrl(
              API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance +
                userData.id +
                "/balance"
            ),
            { withCredentials: true }
          );
          console.log("Wallet Balance", walletResponse.data.data);
          setWalletBalance(walletResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    fetchWalletBalance();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <ToastContainer />
      <h1 className="text-4xl font-bold mb-4">Wallet</h1>

      {loading && <p>Loading...</p>}

      {!loading && accountDetails && (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-full md:max-w-3xl">
          <div className=" bg-gray-50  rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Wallet Balance
            </h2>
            <p className="text-3xl font-bold text-gray-900">
              ₦{walletBalance.balance}
            </p>
          </div>
          <hr className="my-4 border-t" />
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Account Details</h2>
            <div className="space-y-3">
              <p className="flex justify-between">
                <span className="text-gray-600">Account Name:</span>
                <span className="font-medium">
                  {accountDetails.accountName}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Account Number:</span>
                <span className="font-medium">
                  {accountDetails.accountNumber}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Bank Name:</span>
                <span className="font-medium">{accountDetails.bankName}</span>
              </p>
            </div>
          </div>
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Fund Wallet</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-600">Amount (₦)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border p-2 rounded-md"
                  placeholder="Enter amount"
                  min="100"
                />
              </div>
              <button
                onClick={handlePayment}
                disabled={!amount || loading || !user?.email}
                className="bg-blue-600 text-white p-3 rounded-md w-full hover:bg-blue-700 transition disabled:bg-blue-300"
              >
                {loading ? "Processing..." : "Fund Wallet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !accountDetails && user && (
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-4">Create Virtual Account</h2>
          <p className="mb-4">
            You do not have a virtual account yet. Create one to easily fund
            your wallet.
          </p>
          <form onSubmit={handleCreateAccount}>
            <div className="flex flex-col gap-1 mb-4">
              <label>NIN (National Identification Number)</label>
              <input
                onChange={(e) => setNin(e.target.value)}
                value={nin}
                className="border p-2 rounded-md"
                type="text"
                placeholder="Enter your NIN"
              />
            </div>
            <button
              disabled={loading}
              className="bg-gray-800 text-white p-2 rounded-md flex items-center justify-center w-full"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Wallet;

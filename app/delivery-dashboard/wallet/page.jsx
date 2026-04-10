"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import { useAppContext } from "@/context/AppContext";
import Script from "next/script";
import "react-toastify/dist/ReactToastify.css";

const Wallet = () => {
  const [loading, setLoading] = useState(false);
  const [accountDetails, setAccountDetails] = useState(null);
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState("");
  const { userData, authLoading } = useAppContext();

  const handlePayment = () => {
    if (!amount || amount < 100) { toast.error("Minimum ₦100 required"); return; }
    
    if (window.PaystackPop) {
      new window.PaystackPop().newTransaction({
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
    } else {
      toast.error("Payment layer is initializing. Please retry in a moment.");
    }
  };

  useEffect(() => {
    if (userData?.user) {
      setUser(userData.user);
    }
  }, [userData]);

  const fetchAccountDetails = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.GET + user._id)
      );
      setAccountDetails(response.data);
    } catch (error) {
      // A 404 probably means no account exists, which is a valid state
      if (error.response?.status !== 404) {
        toast.error("Could not fetch account details.");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const onSuccess = async (transaction) => {
    setLoading(true);
    try {
      // Call your backend API to verify and process the payment
      await axios.post(apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.FUND + user._id), {
        amount: amount,
        reference: transaction.reference,
      });

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

  useEffect(() => {
    fetchAccountDetails();
  }, [fetchAccountDetails]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <ToastContainer />
      <Script 
        src="https://js.paystack.co/v2/inline.js" 
        strategy="lazyOnload"
      />
      {loading || authLoading ? (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      ) : accountDetails ? (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-full md:max-w-3xl">
          <div className=" bg-gray-50  rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Wallet Balance
            </h2>
            <p className="text-3xl font-bold text-gray-900">
              ₦{accountDetails.balance}
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
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">No Wallet Found</h2>
          <p>
            Please create a virtual account from your dashboard to view your
            wallet details.
          </p>
        </div>
      )}
    </div>
  );
};

export default Wallet;

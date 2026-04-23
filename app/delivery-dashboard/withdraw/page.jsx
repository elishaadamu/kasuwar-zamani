"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import { AiFillBank } from "react-icons/ai";

const Withdraw = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { userData, authLoading } = useAppContext();
  const [walletBalance, setWalletBalance] = useState(0);
  const [hasWallet, setHasWallet] = useState(false);

  const pinInputs = useRef([]);
  const currentUser = userData?.user;

  const fetchBalance = useCallback(async () => {
    if (!currentUser?._id) return;
    // Don't set loading for balance refresh
    try {
      const response = await axios.get(
        apiUrl(
          `${API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance}${currentUser._id}/balance`
        )
      );
      setWalletBalance(response.data.data.balance);
      setHasWallet(true);
    } catch (error) {
      // Don't show toast on balance fetch error to avoid being noisy
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?._id) return;
    setLoading(true);
    fetchBalance();
    setLoading(false); // Set loading to false after initial fetch
  }, [currentUser, fetchBalance]);
  const fetchWithdrawals = useCallback(async () => {
    if (!currentUser?._id) return;
    setLoading(true);
    try {
      const response = await axios.get(
        apiUrl(
          API_CONFIG.ENDPOINTS.DELIVERY_WITHDRAWAL.GET_BY_USER + currentUser._id
        )
      );
      const withdrawalData = response.data.data || [];
      setWithdrawals(Array.isArray(withdrawalData) ? withdrawalData : []);
    } catch (error) {
      toast.error("Failed to fetch withdrawal history");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (filter === "all") return true;
    return withdrawal.status.toLowerCase() === filter;
  });

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 500) {
      toast.warn("Minimum withdrawal amount is ₦500.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        role: currentUser.role,
        amount: amount,
        pin,
      };
      const response = await axios.post(
        apiUrl(
          API_CONFIG.ENDPOINTS.DELIVERY_WITHDRAWAL.CREATE + currentUser._id
        ),
        payload
      );
      toast.success("Withdrawal request submitted successfully!");
      setAmount("");
      setPin("");
      fetchBalance(); // Re-fetch balance to update UI
      fetchWithdrawals();
      // Consider refreshing user data from context if balance is not updated automatically
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit withdrawal request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinChange = (e, index) => {
    const { value } = e.target;
    const newPin = [...pin];

    // Only allow a single digit
    if (/^[0-9]$/.test(value)) {
      newPin[index] = value;
      setPin(newPin.join(""));
      // Move focus to the next input
      if (index < 3) {
        pinInputs.current[index + 1].focus();
      }
    } else if (value === "") {
      // Handle backspace
      newPin[index] = "";
      setPin(newPin.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      // Move focus to the previous input on backspace if current is empty
      pinInputs.current[index - 1].focus();
    }
  };

  return (
    <div className="p-6 space-y-8">
      <ToastContainer />
      {/* Wallet Card Section */}
      <div className="mb-8">
        {/* Wallet Balance */}
        {hasWallet ? (
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full opacity-20 -mr-10 -mt-10"></div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80 flex items-center gap-2">
                  <AiFillBank />
                  <span>Bank</span>
                </p>
                <h2 className="text-lg font-semibold">
                  {currentUser?.bankName || "N/A"}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Wallet Balance</p>
                <h1 className="text-3xl font-bold">
                  ₦{walletBalance?.toFixed(1) || "0.00"}
                </h1>
              </div>
            </div>
            <div className="mt-4 border-t border-blue-400/40 pt-4 flex justify-between text-sm">
              <div>
                <p className="opacity-80">Account Name</p>
                <p className="font-medium">
                  {currentUser?.accountName || "N/A"}
                </p>
              </div>
              <div className="text-right">
                <p className="opacity-80">Account Number</p>
                <p className="font-medium">
                  {currentUser?.accountNumber || "N/A"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-center items-center">
            <p className="text-center text-gray-600 mb-4">
              You don't have a wallet yet. Create one to get started.
            </p>
          </div>
        )}
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Request a Withdrawal
        </h2>
        <form onSubmit={handleWithdrawal} className="space-y-6">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount (₦)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900"
              min="500"
              step="0.01"
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction PIN
            </label>
            <div className="flex justify-center space-x-2 sm:space-x-4">
              {[...Array(4)].map((_, index) => (
                <input
                  key={index}
                  ref={(el) => (pinInputs.current[index] = el)}
                  type="password"
                  maxLength="1"
                  value={pin[index] || ""}
                  onChange={(e) => handlePinChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-14 h-14 sm:w-16 sm:h-16 text-center text-3xl font-bold bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                  disabled={submitting}
                  autoComplete="off"
                  inputMode="numeric"
                />
              ))}
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !pin || pin.length < 4 || !amount}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              )}
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
        <div className="mt-6 space-y-2 text-gray-500 text-xs">
          <p>• Minimum withdrawal amount is ₦500.</p>
          <p>• Requests are processed within 24 business hours.</p>
          <p>
            • Ensure your bank details in Settlement Accounts are correct to
            avoid failure.
          </p>
        </div>
      </div>

      {/* Withdrawal History */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Recent Withdrawals</h1>
            <Link
              href="/delivery-dashboard/withdrawal-history"
              className="mt-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              View All
            </Link>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Filter by Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWithdrawals.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No withdrawal records found
                      </td>
                    </tr>
                  ) : (
                    filteredWithdrawals.slice(0, 5).map((withdrawal) => (
                      <tr
                        key={withdrawal.transactionId}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {withdrawal.transactionId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₦{withdrawal.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {currentUser?.bankName} - {currentUser?.accountNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                              withdrawal.status
                            )}`}
                          >
                            {withdrawal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                          <br />
                          <span className="text-xs">
                            {new Date(
                              withdrawal.createdAt
                            ).toLocaleTimeString()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdraw;

"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { message } from "antd";

const WithdrawalRequestPage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  const getUserFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return decryptData(raw) || null;
    } catch (err) {
      return null;
    }
  };

  const getUserId = () => {
    const u = getUserFromStorage();
    return u?.id || null;
  };

  const fetchWalletBalance = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setWalletBalance(0);
      return;
    }
    try {
      const response = await axios.get(
        apiUrl(
          API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + userId + "/balance"
        ),
        { withCredentials: true }
      );
      setWalletBalance(response.data.data.balance || 0);
    } catch (error) {
      console.error("Failed to fetch wallet balance", error);
    }
  }, []);

  const fetchWithdrawals = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      setWithdrawals([]);
      setLoadingWithdrawals(false);
      return;
    }

    setLoadingWithdrawals(true);
    try {
      // API_CONFIG.DELIVERY_WITHDRAWAL.GET_BY_USER ends with '/withdrawal/'
      const resp = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_WITHDRAWAL.GET_BY_USER + userId),
        { withCredentials: true }
      );
      console.log("Fetched withdrawals", resp.data);
      const data = resp.data || [];
      setWithdrawals(Array.isArray(data) ? data : data.withdrawals || []);
    } catch (err) {
      console.error("Failed to fetch withdrawals", err);
      message.error("Failed to load withdrawal history.");
      setWithdrawals([]);
    } finally {
      setLoadingWithdrawals(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
    fetchWalletBalance();
  }, [fetchWithdrawals, fetchWalletBalance]);

  const openWithdrawModal = () => setIsWithdrawModalOpen(true);
  const closeWithdrawModal = () => setIsWithdrawModalOpen(false);

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawalAmount || Number(withdrawalAmount) <= 0) {
      message.warn("Please enter a valid withdrawal amount.");
      return;
    }

    const amount = Number(withdrawalAmount);
    if (amount < 100) {
      message.warn("Minimum withdrawal amount is ₦100.");
      return;
    }

    const userId = getUserId();
    if (!userId) {
      message.error("You must be signed in to make a withdrawal.");
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      const payload = { userId, amount };
      await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_WITHDRAWAL.CREATE),
        payload,
        { withCredentials: true }
      );
      message.success("Withdrawal request submitted successfully.");
      setWithdrawalAmount("");
      closeWithdrawModal();
      // Refresh the history
      fetchWithdrawals();
      fetchWalletBalance(); // Refresh balance
    } catch (err) {
      console.error("Withdrawal submit error", err);
      message.error(
        err?.response?.data?.message || "Failed to submit withdrawal."
      );
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const formatCurrency = (n) => {
    try {
      return `₦${Number(n).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } catch (e) {
      return `₦${n}`;
    }
  };

  const currentUser = getUserFromStorage();

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium text-gray-600">
              Wallet Balance
            </h2>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {isBalanceVisible ? formatCurrency(walletBalance) : "₦ ******"}
            </p>
          </div>
          <button
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
          >
            {isBalanceVisible ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          This is your current available balance for withdrawals.
        </p>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Withdrawal Requests</h1>
        <button
          onClick={openWithdrawModal}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          New Withdrawal Request
        </button>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">Withdrawal History</h2>
        {loadingWithdrawals ? (
          <div className="p-6 text-center">Loading withdrawals...</div>
        ) : withdrawals.length === 0 ? (
          <div className="p-4 bg-white shadow rounded">
            No withdrawal records found.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded border border-gray-200">
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawals.map((w, i) => (
                  <tr key={w.transactionId || i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {w.transactionId || `#${i + 1}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(w.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1.5 text-sm font-medium rounded-full capitalize ${
                          {
                            completed: "bg-green-100 text-green-800",
                            paid: "bg-green-100 text-green-800",
                            approved: "bg-blue-100 text-blue-800",
                            pending: "bg-yellow-100 text-yellow-800",
                            failed: "bg-red-100 text-red-800",
                            cancelled: "bg-red-100 text-red-800",
                          }[w.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {w.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {w.createdAt
                        ? new Date(w.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Request Withdrawal</h3>
              <button
                onClick={closeWithdrawModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount (₦)
                </label>
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount (minimum ₦100)"
                  disabled={submittingWithdrawal}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeWithdrawModal}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdrawal}
                  className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
                >
                  {submittingWithdrawal ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequestPage;

"use client";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_CONFIG, apiUrl } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TransactionHistoryPage = () => {
  const { userData, authLoading } = useAppContext();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedDeliveries: 0,
    pendingBalance: 0,
    thisMonthEarnings: 0,
  });
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (authLoading) return;

      if (!userData) {
        router.push("/signin");
        return;
      }

      try {
        const response = await axios.get(
          apiUrl(
            `${API_CONFIG.ENDPOINTS.FUNDING_HISTORY.GET}${userData.id}` +
              "/transactions"
          ),
          { withCredentials: true }
        );
        console.log("Fetched Transactions:", response.data);
        const transactionsData =
          response.data.data ||
          response.data.transactions ||
          response.data ||
          [];
        setTransactions(transactionsData);

        // Calculate stats from transactions
        calculateStats(transactionsData);
      } catch (error) {
        toast.error("Failed to fetch transaction history");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWalletBalance = async () => {
      if (authLoading || !userData) return;
      try {
        const response = await axios.get(
          apiUrl(
            API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance +
              userData.id +
              "/balance"
          ),
          { withCredentials: true }
        );
        setWalletBalance(response.data.data.balance || 0);
      } catch (error) {
        console.error("Failed to fetch wallet balance", error);
      }
    };

    fetchTransactions();
    fetchWalletBalance();
  }, [userData, authLoading, router]);

  const calculateStats = (transactions) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const statsData = {
      totalEarnings: 0,
      completedDeliveries: 0,
      pendingBalance: 0,
      thisMonthEarnings: 0,
    };

    transactions.forEach((transaction) => {
      if (transaction.type === "credit" && transaction.status === "completed") {
        statsData.totalEarnings += transaction.amount;

        // This month earnings
        const transactionDate = new Date(transaction.createdAt);
        if (
          transactionDate.getMonth() === thisMonth &&
          transactionDate.getFullYear() === thisYear
        ) {
          statsData.thisMonthEarnings += transaction.amount;
        }

        // Count completed deliveries
        if (transaction.category === "delivery_payment") {
          statsData.completedDeliveries += 1;
        }
      } else if (transaction.status === "pending") {
        statsData.pendingBalance += transaction.amount;
      }
    });

    setStats(statsData);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type
    if (filter !== "all" && transaction.type !== filter) {
      return false;
    }

    // Filter by date range
    if (dateRange.startDate && dateRange.endDate) {
      const transactionDate = new Date(transaction.createdAt);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999); // End of day

      if (transactionDate < start || transactionDate > end) {
        return false;
      }
    }

    return true;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        label: "Completed",
        icon: "✅",
      },
      pending: {
        color: "bg-amber-100 text-amber-800 border border-amber-200",
        label: "Pending",
        icon: "⏳",
      },
      failed: {
        color: "bg-rose-100 text-rose-800 border border-rose-200",
        label: "Failed",
        icon: "❌",
      },
      cancelled: {
        color: "bg-gray-100 text-gray-800 border border-gray-200",
        label: "Cancelled",
        icon: "🚫",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium ${config.color}`}
      >
        <span className="text-xs">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      credit: {
        color: "bg-green-100 text-green-800 border border-green-200",
        label: "Credit",
        icon: "⬆️",
      },
      debit: {
        color: "bg-red-100 text-red-800 border border-red-200",
        label: "Debit",
        icon: "⬇️",
      },
    };

    const config = typeConfig[type] || typeConfig.credit;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium ${config.color}`}
      >
        <span className="text-xs">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      delivery_payment: { icon: "🚚", label: "Delivery Payment" },
      bonus: { icon: "🎁", label: "Bonus" },
      refund: { icon: "↩️", label: "Refund" },
      adjustment: { icon: "⚖️", label: "Adjustment" },
      withdrawal: { icon: "🏦", label: "Withdrawal" },
      fee: { icon: "💸", label: "Fee" },
      other: { icon: "💰", label: "Other" },
    };

    return icons[category] || icons.other;
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const clearFilters = () => {
    setFilter("all");
    setDateRange({ startDate: "", endDate: "" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <ToastContainer />

      {/* Header */}
      <div className="relative mb-8">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-green-100 rounded-full opacity-50 blur-xl"></div>

        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Transaction History
          </h1>
          <p className="text-gray-600 text-lg">
            Track your earnings and transaction history
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium mb-1">
                Total funding
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{stats.totalEarnings.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium mb-1">
                This Month
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{stats.thisMonthEarnings.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-medium mb-1">
                Current Balance
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{walletBalance.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex-center lg:flex lg:flex-wrap gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                name="transactionType"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Transactions</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={clearFilters}
              className="w-full lg:w-auto px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
              <span className="text-4xl text-gray-400">💸</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No transactions found
            </h3>
            <p className="text-gray-500 mb-6">
              {transactions.length === 0
                ? "You don't have any transactions yet. Complete deliveries to see your earnings here."
                : "No transactions match your current filters."}
            </p>
            {transactions.length > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-colors duration-200 shadow-sm"
              >
                <span>🔄</span>
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Transaction
                  </th>
                  <th
                    scope="col"
                    className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => {
                  const categoryInfo = getCategoryIcon(transaction.category);
                  return (
                    <tr
                      key={transaction._id}
                      className="hover:bg-gray-50/80 transition-all duration-200 group"
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                            <span className="text-lg">{categoryInfo.icon}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {transaction.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="mt-1">
                          {getTypeBadge(transaction.type)}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div
                          className={`text-lg font-bold ${
                            transaction.type === "credit"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}₦
                          {transaction.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-2xl"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Transaction Overview */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Transaction Overview
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <span className="text-sm text-gray-600 block mb-1">
                        Amount
                      </span>
                      <p
                        className={`text-2xl font-bold ${
                          selectedTransaction.type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedTransaction.type === "credit" ? "+" : "-"}₦
                        {selectedTransaction.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <span className="text-sm text-gray-600 block mb-1">
                        Type
                      </span>
                      <p>{getTypeBadge(selectedTransaction.type)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <span className="text-sm text-gray-600 block mb-1">
                        Status
                      </span>
                      <p>{getStatusBadge(selectedTransaction.status)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <span className="text-sm text-gray-600 block mb-1">
                        Category
                      </span>
                      <p className="font-medium text-gray-900 capitalize">
                        {(selectedTransaction.category || "").replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Transaction Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/80 rounded-xl p-4 border border-blue-100">
                      <span className="text-sm text-gray-600 block mb-1">
                        Description
                      </span>
                      <p className="font-medium text-gray-900">
                        {selectedTransaction.description}
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-blue-100">
                      <span className="text-sm text-gray-600 block mb-1">
                        Reference ID
                      </span>
                      <p className="font-medium text-gray-900">
                        {selectedTransaction.reference || "N/A"}
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-blue-100">
                      <span className="text-sm text-gray-600 block mb-1">
                        Transaction Date
                      </span>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          selectedTransaction.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-blue-100">
                      <span className="text-sm text-gray-600 block mb-1">
                        Last Updated
                      </span>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          selectedTransaction.updatedAt ||
                            selectedTransaction.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {selectedTransaction.metadata && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Additional Information
                    </h4>
                    <div className="bg-white/80 rounded-xl p-4 border border-green-100">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                        {JSON.stringify(selectedTransaction.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-200 shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryPage;

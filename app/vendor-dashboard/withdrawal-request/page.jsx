"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { customToast } from "@/lib/customToast";
import { apiUrl, API_CONFIG } from "@/configs/api";
import {
  FaTruck,
  FaWallet,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaReceipt,
  FaTimes,
  FaMoneyBillWave,
} from "react-icons/fa";

const WithdrawalRequestPage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [hasPendingOrders, setHasPendingOrders] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

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
    if (!userId) { setWalletBalance(0); return; }
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + userId + "/balance")
      );
      setWalletBalance(response.data.data.balance || 0);
    } catch (error) {}
  }, []);

  const fetchOrdersStatus = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_ALL + userId));
      const orders = response.data.orders || [];
      const pending = orders.filter(order => order.status !== "delivered" && order.status !== "cancelled");
      setHasPendingOrders(pending.length > 0);
      setPendingOrdersCount(pending.length);
    } catch (error) {}
  }, []);

  const fetchWithdrawals = useCallback(async () => {
    const userId = getUserId();
    if (!userId) { setWithdrawals([]); setLoadingWithdrawals(false); return; }
    setLoadingWithdrawals(true);
    try {
      const resp = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_WITHDRAWAL.GET_BY_USER + userId));
      const data = resp.data || [];
      setWithdrawals(Array.isArray(data) ? data : data.withdrawals || []);
    } catch (err) {
      customToast.error("Failed to load withdrawal history.");
      setWithdrawals([]);
    } finally {
      setLoadingWithdrawals(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
    fetchWalletBalance();
    fetchOrdersStatus();
  }, [fetchWithdrawals, fetchWalletBalance, fetchOrdersStatus]);

  const openWithdrawModal = () => setIsWithdrawModalOpen(true);
  const closeWithdrawModal = () => setIsWithdrawModalOpen(false);

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawalAmount || Number(withdrawalAmount) <= 0) {
      customToast.warn("Please enter a valid withdrawal amount.");
      return;
    }
    if (hasPendingOrders) {
      customToast.error(`You have ${pendingOrdersCount} order(s) in queue. All orders must be marked as 'Delivered' before you can withdraw funds.`);
      return;
    }
    const amount = Number(withdrawalAmount);
    if (amount < 100) {
      customToast.warn("Minimum withdrawal amount is ₦100.");
      return;
    }
    const userId = getUserId();
    if (!userId) {
      customToast.error("You must be signed in to make a withdrawal.");
      return;
    }
    setSubmittingWithdrawal(true);
    try {
      await axios.post(apiUrl(API_CONFIG.ENDPOINTS.DELIVERY_WITHDRAWAL.CREATE), { userId, amount });
      customToast.success("Withdrawal request submitted successfully.");
      setWithdrawalAmount("");
      closeWithdrawModal();
      fetchWithdrawals();
      fetchWalletBalance();
    } catch (err) {
      customToast.error(err?.response?.data?.message || "Failed to submit withdrawal.");
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const formatCurrency = (n) => {
    try {
      return `₦${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } catch (e) {
      return `₦${n}`;
    }
  };

  const getStatusConfig = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "completed" || s === "approved") return { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: <FaCheckCircle /> };
    if (s === "rejected") return { color: "bg-rose-50 text-rose-600 border-rose-100", icon: <FaTimesCircle /> };
    return { color: "bg-amber-50 text-amber-600 border-amber-100", icon: <FaClock /> };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <span className="text-indigo-600 font-black text-[8px] md:text-[10px] uppercase tracking-[0.4em] mb-2 block">
            Merchant Finance Hub
          </span>
          <h1 className="text-2xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">
            Payout <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Pipeline</span>
          </h1>
          <p className="mt-3 text-gray-500 font-medium text-xs md:text-base max-w-xl">
            Manage your earnings and request settlements to your registered account.
          </p>
        </div>

        {/* Balance Stat */}
        <div className="flex bg-white border border-gray-100 p-1 md:p-2 rounded-2xl shadow-sm h-fit">
          <div className="flex items-center gap-3 px-4 py-2 md:px-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <FaWallet />
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Net Balance</p>
              <p className="text-sm md:text-lg font-black text-gray-900">
                {isBalanceVisible ? formatCurrency(walletBalance) : "₦ ••••••"}
              </p>
            </div>
            <button
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors text-gray-400"
            >
              {isBalanceVisible ? <FaEyeSlash className="w-3 h-3" /> : <FaEye className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Left: Action Panel */}
        <div className="lg:col-span-1 space-y-6">

          {/* Pending Orders Warning */}
          {hasPendingOrders && (
            <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <FaTruck className="text-amber-600 text-sm animate-pulse" />
                </div>
                <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Payout Locked</h4>
              </div>
              <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                <span className="font-black">{pendingOrdersCount} order(s)</span> must be marked <span className="font-black">'Delivered'</span> before funds can be released.
              </p>
            </div>
          )}

          {/* Balance Card */}
          <div className="bg-indigo-900 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl -mr-12 -mt-12"></div>
            <p className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Available Balance</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-1">
              {isBalanceVisible ? formatCurrency(walletBalance) : "₦ ••••••"}
            </h2>
            <p className="text-[9px] text-indigo-400 uppercase tracking-widest mb-6">Total funds ready for settlement.</p>
            <button
              onClick={openWithdrawModal}
              disabled={hasPendingOrders}
              className={`w-full py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                hasPendingOrders
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg"
              }`}
            >
              {hasPendingOrders ? (
                <><FaLock className="w-3 h-3" /> Restricted</>
              ) : (
                <>Initialize Payout <FaArrowRight className="w-3 h-3" /></>
              )}
            </button>
          </div>

          {/* Support Card */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <FaReceipt />
              </div>
              <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Finance Support</h4>
            </div>
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed mb-4">
              Having issues with a payout? Our merchant finance team is available.
            </p>
            <button
              onClick={() => window.location.href = "/vendor-dashboard/inbox-support"}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:gap-3 transition-all"
            >
              Open Support <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Right: Withdrawal History Feed */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-widest">Payout History</h2>
            <div className="h-px flex-1 bg-gray-100 ml-6"></div>
          </div>

          {loadingWithdrawals ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] border border-gray-100 p-5 md:p-8 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-100 rounded w-32"></div>
                        <div className="h-2 bg-gray-50 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-100 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl text-gray-200">
                <FaMoneyBillWave className="text-2xl md:text-3xl" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2 tracking-tight">No Payouts Yet</h3>
              <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8 text-xs md:text-sm">
                Your withdrawal history will appear here once you initiate your first payout.
              </p>
              {!hasPendingOrders && (
                <button
                  onClick={openWithdrawModal}
                  className="bg-indigo-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  Initialize First Payout
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((w, i) => {
                const statusCfg = getStatusConfig(w.status);
                return (
                  <div
                    key={w.transactionId || i}
                    className="group bg-white rounded-[2rem] border border-gray-100 p-5 md:p-8 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors"></div>

                    <div className="relative flex flex-col md:flex-row gap-4 md:gap-8 justify-between items-start md:items-center">
                      <div className="flex gap-4 md:gap-5 items-center">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${statusCfg.color} shadow-inner`}>
                          {statusCfg.icon}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-sm md:text-base font-black text-gray-900 tracking-tight uppercase font-mono">
                              #{(w.transactionId || `TXN-${i + 1}`).toString().slice(-10)}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1 ${statusCfg.color}`}>
                              {statusCfg.icon} {w.status || "pending"}
                            </span>
                          </div>
                          <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">
                            {w.createdAt ? new Date(w.createdAt).toLocaleString() : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-1 pt-3 md:pt-0 border-t md:border-t-0 border-gray-50">
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">Payout Amount</p>
                        <p className="text-xl md:text-2xl font-black text-indigo-600 tracking-tighter">{formatCurrency(w.amount)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Premium Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">

            {/* Modal Header */}
            <div className="bg-indigo-900 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl -mr-12 -mt-12"></div>
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Settlement Request</p>
                  <h3 className="text-xl font-black text-white tracking-tight">Initialize Payout</h3>
                </div>
                <button
                  onClick={closeWithdrawModal}
                  className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[9px] text-indigo-300 uppercase tracking-widest">Available Balance</p>
                <p className="text-2xl font-black text-white tracking-tighter">{formatCurrency(walletBalance)}</p>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleWithdrawalSubmit} className="p-6 md:p-8 space-y-6">
              <div>
                <label htmlFor="amount" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Withdrawal Amount (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-300 text-lg">₦</span>
                  <input
                    id="amount"
                    type="number"
                    min="100"
                    step="1"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full pl-10 pr-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 transition-all font-black text-lg text-gray-900 focus:outline-none"
                    placeholder="0.00"
                    disabled={submittingWithdrawal}
                  />
                </div>
                <p className="text-[9px] text-gray-400 font-medium mt-2 ml-1">Minimum withdrawal: ₦100</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeWithdrawModal}
                  className="flex-1 py-4 rounded-2xl border-2 border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdrawal}
                  className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submittingWithdrawal ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>Submit <FaArrowRight className="w-3 h-3" /></>
                  )}
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

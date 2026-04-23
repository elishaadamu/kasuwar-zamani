"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import { customToast } from "@/lib/customToast";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, TimeScale } from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { startOfWeek, startOfMonth, format, subMonths } from "date-fns";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { FaHome, FaCommentDots, FaTruck, FaBoxOpen, FaUser, FaPlus, FaWallet, FaCreditCard, FaShoppingCart, FaUniversity as FaBank, FaUserCircle, FaChevronRight, FaArrowUp, FaArrowDown, FaCog, FaTimes } from "react-icons/fa";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, TimeScale);

const DashboardHome = () => {
  const { userData: contextUserData, authLoading } = useAppContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    userName: "",
    totalOrders: 0,
    orders: [],
    recentOrders: [],
    totalProducts: 0,
  });
  const [walletBalance, setWalletBalance] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [nin, setNin] = useState("");
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [timePeriod, setTimePeriod] = useState("monthly");

  const fetchWalletBalance = async (uid) => {
    try {
      const walletResponse = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + uid + "/balance"), { withCredentials: true });
      setWalletBalance(walletResponse.data.data);
    } catch (error) {
      setWalletBalance(null);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading) return;
      const encryptedUser = localStorage.getItem("user");
      if (!encryptedUser) {
        router.push("/signin");
        return;
      }
      setLoading(true);
      try {
        const decryptedUserData = decryptData(encryptedUser);
        setUserData(decryptedUserData);
        setDashboardData((prev) => ({ ...prev, userName: decryptedUserData.firstName }));

        const ordersResponse = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_ALL + decryptedUserData.id), { withCredentials: true });
        if (ordersResponse.data.orders) {
          const orders = ordersResponse.data.orders;
          setDashboardData((prev) => ({ ...prev, orders: orders, recentOrders: orders.slice(0, 5) }));
        }
        await fetchWalletBalance(decryptedUserData.id);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [authLoading]);

  const orderStatusCounts = useMemo(() => {
    return dashboardData.orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, { pending: 0, paid: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });
  }, [dashboardData.orders]);

  const chartData = useMemo(() => ({
    labels: ["Pending", "Paid", "Shipped", "Delivered", "Canceled"],
    datasets: [{
      data: [orderStatusCounts.pending, orderStatusCounts.paid, orderStatusCounts.shipped, orderStatusCounts.delivered, orderStatusCounts.cancelled],
      backgroundColor: ["#FBBF24", "#3B82F6", "#8B5CF6", "#10B981", "#EF4444"],
      hoverOffset: 20,
      borderWidth: 0,
    }],
  }), [orderStatusCounts]);

  const lineChartData = useMemo(() => {
    const now = new Date();
    let labels = Array.from({ length: 12 }, (_, i) => format(subMonths(now, 11 - i), "MMM"));
    let dataPoints = labels.map(() => Math.floor(Math.random() * 10)); // Default demo data

    if (dashboardData.orders.length > 0) {
      const monthlyData = new Map(labels.map(l => [l, 0]));
      dashboardData.orders.forEach(o => {
        const m = format(new Date(o.createdAt), "MMM");
        if (monthlyData.has(m)) monthlyData.set(m, monthlyData.get(m) + 1);
      });
      dataPoints = Array.from(monthlyData.values());
    }

    return {
      labels,
      datasets: [{
        label: "Orders",
        data: dataPoints,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    };
  }, [dashboardData.orders]);

  const handlePayment = () => {
    if (!amount || amount < 100) { customToast.warn("Minimum ₦100 required"); return; }

    // Use the script that was loaded via Next/Script
    if (window.PaystackPop) {
      new window.PaystackPop().newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: userData?.email,
        amount: amount * 100,
        onSuccess: async () => {
          customToast.success("Success", "Wallet funded successfully!");
          setShowFundModal(false);
          await fetchWalletBalance(userData.id);
        },
      });
    } else {
      customToast.info("Redirecting", "Payment secure layer is initializing. Please retry in a moment.");
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.CREATE + userData.id), { nin }, { withCredentials: true });
      customToast.success("Account created!");
      setShowCreateAccount(false);
      await fetchWalletBalance(userData.id);
    } catch (error) {
      customToast.error(error.response?.data?.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) return <Loading fullScreen={false} />;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 md:pb-12 bg-white">
      <Script
        src="https://js.paystack.co/v2/inline.js"
        strategy="lazyOnload"
      />

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 my-6">
            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Dashboard</h1>
          </div>
          <p className="text-gray-500 font-medium text-lg">Good day, {dashboardData.userName}. Your commerce dashboard is ready.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/" className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">Start Shopping</Link>
          <button onClick={() => router.push('/dashboard/personal-details')} className="bg-gray-50 text-gray-900 p-4 rounded-2xl hover:bg-gray-100 transition-all border border-gray-100"><FaCog className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Financial Hub - Futuristic Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-gray-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden group shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-110"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:gap-12">
            <div className="flex-1">
              <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Master Balance</p>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 md:mb-10 truncate">₦{walletBalance?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</h2>
              <div className="flex gap-4">
                <button onClick={() => setShowFundModal(true)} className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">Top Up</button>
                <Link href="/dashboard/transaction-history" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-sm flex items-center gap-2">History <FaChevronRight className="w-2.5 h-2.5" /></Link>
              </div>
            </div>
            {walletBalance?.wallet ? (
              <div className="w-full md:w-72 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm self-start">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Settlement Account</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">Bank Name</p>
                    <p className="text-white font-bold text-sm tracking-tight">{walletBalance.wallet.virtualBanktName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">Account Number</p>
                    <p className="text-white font-black text-lg md:text-xl tracking-widest font-mono break-all">{walletBalance.wallet.virtualAccountNumber}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 font-bold uppercase">Payee</p>
                    <p className="text-white font-bold text-sm line-clamp-1">{walletBalance.wallet.virtualAccountName}</p>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowCreateAccount(true)} className="md:w-72 h-full bg-blue-600/20 border-2 border-dashed border-blue-600/40 rounded-3xl flex flex-col items-center justify-center p-8 group hover:bg-blue-600/30 transition-all">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/50"><FaPlus /></div>
                <p className="text-white font-black text-xs uppercase tracking-widest text-center">Activate Virtual Settlement</p>
              </button>
            )}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="flex flex-col gap-6">
          <div className="flex-1 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Spend</p>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><FaArrowDown className="w-4 h-4" /></div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-2">₦{dashboardData.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}</h3>
            <p className="text-gray-400 text-xs font-semibold">Accumulated across {dashboardData.orders.length} orders</p>
          </div>
          <Link href="/dashboard/referrals" className="flex-1 bg-blue-600 rounded-[2.5rem] p-8 shadow-lg shadow-blue-200 hover:scale-[1.02] transition-all relative overflow-hidden group text-white">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-6">Affiliate Wallet</p>
            <h3 className="text-3xl font-black mb-2 tracking-tight">Refer & Earn</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-100 uppercase tracking-widest mt-4">Invite Friends <FaChevronRight className="w-2.5 h-2.5" /></div>
          </Link>
        </div>
      </div>

      {/* Grid: Actions & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        {/* Actions Column */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 px-2"><FaPlus className="text-blue-600" /> Key Shortcuts</h2>
          {[
            { href: "/", icon: <FaShoppingCart />, label: "Marketplace", color: "blue" },
            { href: "/dashboard/track-order", icon: <FaTruck />, label: "Transit Monitor", color: "green" },
            { href: "/dashboard/request-delivery", icon: <FaBoxOpen />, label: "Logistics Hub", color: "purple" },
            { href: "/dashboard/inbox-support", icon: <FaCommentDots />, label: "Support Desk", color: "amber" },
          ].map((action) => (
            <Link key={action.href} href={action.href} className="flex items-center gap-4 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 p-5 rounded-3xl transition-all duration-300 group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all`}>
                {action.icon}
              </div>
              <span className="font-bold text-gray-700 tracking-tight">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Charts Column */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Order Distribution</h3>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{dashboardData.orders.length} TOTAL</div>
            </div>
            <div className="h-64 flex items-center justify-center">
              <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {chartData.labels.map((l, i) => (
                <div key={l} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartData.datasets[0].backgroundColor[i] }}></div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Growth Trend</h3>
              <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} className="text-[10px] font-black uppercase bg-gray-50 border-0 rounded-lg px-3 py-1.5 focus:ring-0">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="h-72">
              <Line data={lineChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Activity Log</h2>
            <p className="text-gray-400 font-medium text-sm mt-1">Real-time status of your recently confirmed orders.</p>
          </div>
          <Link href="/dashboard/all-orders" className="bg-gray-50 text-gray-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">View All Orders</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hash</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Financials</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dashboardData.recentOrders.length > 0 ? dashboardData.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/30 transition-colors group cursor-pointer" onClick={() => router.push(`/dashboard/all-orders`)}>
                  <td className="px-10 py-6">
                    <span className="font-black text-gray-900 tracking-tighter">#{order._id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-xs font-bold text-gray-500">{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-sm font-black text-gray-900">₦{order.totalAmount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${order.status === "delivered" ? "bg-green-50 text-green-700 border-green-200" :
                      order.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <FaChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-600 transition-colors ml-auto" />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-10 py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-200"><FaBoxOpen className="text-3xl" /></div>
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No Recent Activity</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fund Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFundModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full relative z-10 shadow-2xl">
            <button 
              onClick={() => setShowFundModal(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Fund Wallet</h2>
            <p className="text-gray-500 font-medium mb-8">Enter the amount to inject into your wallet.</p>
            <div className="relative mb-8">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-900">₦</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-gray-50 border-0 rounded-2xl p-6 pl-14 text-2xl font-black focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-gray-200" />
            </div>
            <button onClick={handlePayment} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 hover:bg-black transition-all">Execute Payment</button>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateAccount && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateAccount(false)}></div>
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full relative z-10 shadow-2xl">
            <button 
              onClick={() => setShowCreateAccount(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">KYC Activation</h2>
            <p className="text-gray-500 font-medium mb-8">Provide your NIN to generate a secure virtual settlement account.</p>
            <form onSubmit={handleCreateAccount} className="space-y-6">
              <input type="text" value={nin} onChange={(e) => setNin(e.target.value)} placeholder="Enter 11-digit NIN" className="w-full bg-gray-50 border-0 rounded-2xl p-6 text-lg font-bold focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-gray-200" required />
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Generate Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;

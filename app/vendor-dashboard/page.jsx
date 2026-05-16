"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import {
  FaBoxOpen,
  FaPlus,
  FaWallet,
  FaCreditCard,
  FaShoppingCart,
  FaUniversity as FaBank,
  FaUserCircle,
  FaChartLine,
  FaTruck,
  FaCommentDots,
  FaUser,
  FaArrowRight,
  FaHistory,
  FaTimes,
  FaCopy,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { RiBankFill } from "react-icons/ri";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  TimeScale,
  Filler,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { startOfWeek, format, subMonths } from "date-fns";
import Script from "next/script";
import { customToast } from "@/lib/customToast";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  TimeScale,
  Filler
);

const VendorDashboard = () => {
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
  const [walletBalance, setWalletBalance] = useState({ balance: 0 });
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [nin, setNin] = useState("");
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [showBalance, setShowBalance] = useState(true);

  const orderStatusCounts = useMemo(() => {
    return dashboardData.orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {
        pending: 0,
        paid: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      }
    );
  }, [dashboardData.orders]);

  const pieChartData = useMemo(() => {
    const hasOrders = dashboardData.orders.length > 0;
    const data = hasOrders
      ? [
        orderStatusCounts.pending,
        orderStatusCounts.paid,
        orderStatusCounts.shipped,
        orderStatusCounts.delivered,
        orderStatusCounts.cancelled,
      ]
      : [12, 19, 3, 5, 2]; // Demo data

    return {
      labels: ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"],
      datasets: [
        {
          data: data,
          backgroundColor: [
            "rgba(251, 191, 36, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: "#fff",
          borderWidth: 2,
          hoverOffset: 15,
        },
      ],
    };
  }, [orderStatusCounts, dashboardData.orders]);

  const lineChartData = useMemo(() => {
    const hasOrders = dashboardData.orders.length > 0;
    const now = new Date();
    let labels = [];
    let dataPoints = [];

    if (timePeriod === "monthly") {
      labels = Array.from({ length: 6 }, (_, i) =>
        format(subMonths(now, 5 - i), "MMM")
      );
      if (hasOrders) {
        const monthlyData = new Map(labels.map((label) => [label, 0]));
        dashboardData.orders.forEach((order) => {
          const orderMonth = format(new Date(order.createdAt), "MMM");
          if (monthlyData.has(orderMonth)) {
            monthlyData.set(orderMonth, monthlyData.get(orderMonth) + 1);
          }
        });
        dataPoints = Array.from(monthlyData.values());
      } else {
        dataPoints = [30, 45, 32, 70, 48, 85]; // Demo
      }
    } else {
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      dataPoints = hasOrders ? [5, 8, 3, 12, 7, 10, 4] : [10, 20, 15, 25, 22, 30, 28]; // Demo
    }

    return {
      labels,
      datasets: [
        {
          label: "Sales Volume",
          data: dataPoints,
          fill: true,
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#3B82F6",
        },
      ],
    };
  }, [dashboardData.orders, timePeriod]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const encryptedUser = localStorage.getItem("user");
        if (!encryptedUser) {
          router.push("/vendor-signin");
          return;
        }

        const decryptedUserData = decryptData(encryptedUser);
        setUserData(decryptedUserData);

        const [ordersRes, walletRes, profileRes] = await Promise.all([
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_ALL + decryptedUserData.id)),
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + decryptedUserData.id + "/balance"), { withCredentials: true }),
          axios.get(`${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.GET)}/${decryptedUserData.id}`),
        ]);

        if (ordersRes.data.orders) {
          const orders = ordersRes.data.orders;
          setDashboardData({
            userName: decryptedUserData.firstName,
            orders: orders,
            recentOrders: orders.slice(0, 5),
            totalOrders: orders.length,
          });
        }

        if (walletRes.data.data) {
          setAccountDetails(walletRes.data.data);
          setWalletBalance(walletRes.data.data);
        }

        if (profileRes.data.user) {
          setProfileData(profileRes.data.user);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [router]);

  const fetchWalletBalance = async (uid) => {
    try {
      const [walletRes, profileRes] = await Promise.all([
        axios.get(apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + uid + "/balance"), { withCredentials: true }),
        axios.get(`${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.GET)}/${uid}`),
      ]);

      if (walletRes.data.data) {
        setAccountDetails(walletRes.data.data);
        setWalletBalance(walletRes.data.data);
      }
      if (profileRes.data.user) {
        setProfileData(profileRes.data.user);
      }
    } catch (error) {
    }
  };

  const handleCopy = (text) => {
    if (!text || text === "---") return;
    navigator.clipboard.writeText(text);
    customToast.success("Copied!", "Item copied to clipboard.");
  };

  const copyAllDetails = (type) => {
    let details = "";
    if (type === 'inbound') {
      details = `Account Number: ${accountDetails?.wallet?.virtualAccountNumber || "---"}\nBank: ${accountDetails?.wallet?.virtualBanktName || "---"}\nAccount Name: ${accountDetails?.wallet?.virtualAccountName || "---"}`;
    } else {
      details = `Account Number: ${profileData?.accNumber || "---"}\nBank: ${profileData?.bankName || "---"}\nAccount Name: ${profileData?.accName || "---"}`;
    }
    navigator.clipboard.writeText(details);
    customToast.success("All Details Copied!", "Account summary copied to clipboard.");
  };

  const handlePayment = () => {
    if (!amount || amount < 100) { customToast.warn("Minimum ₦100 required"); return; }

    if (window.PaystackPop) {
      new window.PaystackPop().newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: userData?.email,
        amount: amount * 100,
        onSuccess: async () => {
          customToast.success("Success", "Wallet funded successfully!");
          setShowFundModal(false);
          setAmount("");
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
      customToast.success("Account activated!");
      setShowCreateAccount(false);
      await fetchWalletBalance(userData.id);
    } catch (error) {
      customToast.error(error.response?.data?.message || "Failed to activate account.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) return <Loading fullScreen={false} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4">
      <ToastContainer />

      {/* Header - Glass Aesthetic */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-4 md:gap-6">
        <div>
          <span className="text-blue-600 font-black text-[8px] md:text-[10px] uppercase tracking-[0.4em] mb-1 md:mb-2 block">
            Vendor Prosperity Center
          </span>
          <h1 className="text-2xl md:text-5xl font-black text-gray-900 tracking-tighter">
            Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Business</span>
          </h1>
          <p className="mt-1 md:mt-3 text-gray-500 font-medium text-sm md:text-lg">
            Welcome back, <span className="text-gray-900 font-bold">{dashboardData.userName}</span>. Your store is showing strong momentum.
          </p>
        </div>
        <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
          <button onClick={() => setTimePeriod("weekly")} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timePeriod === "weekly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}>Weekly</button>
          <button onClick={() => setTimePeriod("monthly")} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timePeriod === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}>Monthly</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Financial Hub - Dark Mode Style */}
        <div className="lg:col-span-2">
          <div className="bg-[#0f172a] rounded-3xl p-6 relative overflow-hidden text-white shadow-2xl shadow-blue-900/30 group border border-white/5">
            {/* Animated Background Accent */}
            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-gradient-to-br from-blue-600/20 to-indigo-600/10 rounded-full blur-[80px] -mr-20 -mt-10 group-hover:scale-125 transition-transform duration-1000"></div>
            
            <div className="relative flex flex-col gap-6">
              {/* Header: Balance & Status */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-400 font-black text-[9px] uppercase tracking-[0.4em] mb-1.5">Available Balance</p>
                  <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-black tracking-tighter flex items-baseline gap-2">
                      <span className="text-blue-500 text-2xl font-light">₦</span>
                      {accountDetails ? (
                        showBalance 
                          ? accountDetails?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })
                          : "••••••"
                      ) : (
                        "0.00"
                      )}
                    </h2>
                    <button 
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-gray-500 hover:text-white transition-colors p-1"
                    >
                      {showBalance ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white/10 to-white/5 p-3 rounded-2xl border border-white/10 shadow-inner">
                  <FaWallet className="w-6 h-6 text-blue-400" />
                </div>
              </div>

              {/* Horizontal Channels */}
              <div className="space-y-3">
                {/* Channel: Inbound (Virtual) */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.06] transition-all duration-300 group/row">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <FaCreditCard className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-white uppercase tracking-widest">Inbound</p>
                          {accountDetails?.wallet && (
                            <button onClick={() => copyAllDetails('inbound')} className="flex items-center gap-1 text-[7px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors mt-0.5">
                              <FaCopy /> Copy Details
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-wrap items-center gap-x-6 gap-y-2">
                        {!accountDetails ? (
                           <div className="flex items-center gap-4">
                             <p className="text-xs font-medium text-gray-400 italic">No wallet established</p>
                             <button onClick={() => setShowCreateAccount(true)} className="text-[8px] font-black text-blue-400 uppercase tracking-widest hover:underline">Create Wallet</button>
                          </div>
                        ) : accountDetails?.wallet ? (
                          <>
                            <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => handleCopy(accountDetails?.wallet?.virtualAccountNumber)}>
                              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Acc No:</p>
                              <p className="text-sm font-bold tracking-wider flex items-center gap-2">
                                {accountDetails?.wallet?.virtualAccountNumber || "---"}
                                <FaCopy className="opacity-0 group-hover/copy:opacity-100 transition-opacity text-blue-400 text-[10px]" />
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Bank:</p>
                              <p className="text-sm font-bold">{accountDetails?.wallet?.virtualBanktName || "---"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Name:</p>
                              <p className="text-sm font-bold truncate max-w-[200px]">{accountDetails?.wallet?.virtualAccountName || "---"}</p>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-4">
                             <p className="text-xs font-medium text-gray-400 italic">Virtual account not active</p>
                             <button onClick={() => setShowCreateAccount(true)} className="text-[8px] font-black text-blue-400 uppercase tracking-widest hover:underline">Activate Now</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end md:justify-start pt-2 border-t border-white/5">
                      <button
                        onClick={() => setShowFundModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40"
                      >
                        Add Fund
                      </button>
                    </div>
                  </div>
                </div>

                {/* Channel: Outbound (Settlement) */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.06] transition-all duration-300 group/row">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <RiBankFill className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-white uppercase tracking-widest">Outbound</p>
                          {profileData?.accNumber && (
                            <button onClick={() => copyAllDetails('outbound')} className="flex items-center gap-1 text-[7px] font-black text-emerald-400 uppercase tracking-widest hover:text-white transition-colors mt-0.5">
                              <FaCopy /> Copy Details
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => handleCopy(profileData?.accNumber)}>
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Acc No:</p>
                          <p className="text-sm font-bold tracking-wider flex items-center gap-2">
                            {profileData?.accNumber || "---"}
                            <FaCopy className="opacity-0 group-hover/copy:opacity-100 transition-opacity text-blue-400 text-[10px]" />
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Bank:</p>
                          <p className="text-sm font-bold">{profileData?.bankName || "---"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Name:</p>
                          <p className="text-sm font-bold truncate max-w-[200px]">{profileData?.accName || "---"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end md:justify-start pt-2 border-t border-white/5">
                      <Link
                        href="/vendor-dashboard/withdrawal-request"
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all text-center"
                      >
                        Withdraw Fund
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Admin Operations */}
        <div className="lg:col-span-1 grid grid-cols-2 gap-4">
          {[
            { label: "New Product", icon: <FaPlus />, href: "/vendor-dashboard/add-products", bgColor: "bg-blue-50", textColor: "text-blue-600" },
            { label: "Delivery Requests", icon: <FaTruck />, href: "/vendor-dashboard/request-delivery", bgColor: "bg-indigo-50", textColor: "text-indigo-600" },
            { label: "Inventory", icon: <FaBoxOpen />, href: "/vendor-dashboard/products-list", bgColor: "bg-purple-50", textColor: "text-purple-600" },
            { label: "Orders", icon: <FaShoppingCart />, href: "/vendor-dashboard/all-orders", bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
          ].map((btn) => (
            <Link key={btn.label} href={btn.href} className="group bg-white p-5 rounded-[2rem] border border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col items-center justify-center text-center">
              <div className={`w-10 h-10 rounded-2xl ${btn.bgColor} ${btn.textColor} flex items-center justify-center mb-3 transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                {btn.icon}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 leading-tight">{btn.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Primary Section: Recent Activity Hub */}
      <div className="mb-8">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Pulse Feed</h3>
              <p className="text-sm text-gray-400 font-medium">Real-time business updates and recent orders</p>
            </div>
            <Link href="/vendor-dashboard/all-orders" className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all">View Full Log</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.recentOrders.length > 0 ? (
              dashboardData.recentOrders.slice(0, 6).map((order) => (
                <div key={order._id} className="group p-5 bg-gray-50 rounded-3xl flex items-center gap-4 cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all border border-transparent hover:border-blue-100" onClick={() => router.push(`/vendor-dashboard/all-orders/${order._id}`)}>
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                    <FaShoppingCart className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-gray-900">₦{order.totalAmount.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-0.5 justify-end">
                      <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'delivered' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{order.status}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-sm text-gray-400 font-medium italic">Pulse is steady. Awaiting first orders.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Stats & Performance */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Chart - Minimalist Premium */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm group">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <FaChartLine className="text-blue-600" />
                  Sales Trajectory
                </h3>
                <p className="text-sm text-gray-400 font-medium">Visualizing your business growth</p>
              </div>
              <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                +12% vs LY
              </div>
            </div>
            <div className="h-[300px] w-full">
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { backgroundColor: "#111827", padding: 12, titleFont: { size: 14, weight: "bold" } } },
                  scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { borderDash: [5, 5] } } }
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order distribution & Activity */}
        <div className="space-y-8">

          {/* Status Breakdown - Circular Chart */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Fulfillment Pulse</h3>
            <div className="relative h-64 flex items-center justify-center">
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 6, font: { weight: "bold", size: 11 } } } }
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50">
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900">{orderStatusCounts.delivered}</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Successful</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900">{orderStatusCounts.pending}</p>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">In Queue</p>
              </div>
            </div>
          </div>

          {/* Bottom Promo / Link */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <h4 className="text-sm font-black tracking-tight mb-2 relative z-10">Grow your reach</h4>
            <p className="text-xs text-blue-100 mb-4 opacity-80 leading-relaxed relative z-10">
              Join the premium vendor network and boost visibility by 40%.
            </p>
            <button className="bg-white text-blue-700 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10 hover:shadow-lg transition">Explore Pro</button>
          </div>
        </div>

      </div>

      {/* Futuristic Bottom Floating Navigation for Mobile */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-gray-900/90 backdrop-blur-2xl px-6 py-4 rounded-[2rem] border border-white/10 shadow-2xl flex items-center justify-between">
          <Link href="/vendor-dashboard" className="text-blue-500">
            <FaUser className="w-5 h-5" />
          </Link>
          <Link href="/vendor-dashboard/all-orders" className="text-gray-500 hover:text-white transition">
            <FaTruck className="w-5 h-5" />
          </Link>
          <Link href="/vendor-dashboard/add-products" className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center -mt-8 shadow-xl shadow-blue-600/30 border-4 border-white/5">
            <FaPlus className="w-5 h-5" />
          </Link>
          <Link href="/vendor-dashboard/products-list" className="text-gray-500 hover:text-white transition">
            <FaBoxOpen className="w-5 h-5" />
          </Link>
          <Link href="/vendor-dashboard/inbox-support" className="text-gray-500 hover:text-white transition">
            <FaCommentDots className="w-5 h-5" />
          </Link>
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
            <p className="text-gray-500 font-medium mb-8">Enter the amount to fund your vendor wallet.</p>
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

      <Script
        src="https://js.paystack.co/v2/inline.js"
        strategy="lazyOnload"
      />
    </div>
  );
};

export default VendorDashboard;

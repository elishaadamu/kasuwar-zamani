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
} from "react-icons/fa";
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
  const [accountDetails, setAccountDetails] = useState(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [nin, setNin] = useState("");
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [timePeriod, setTimePeriod] = useState("monthly");

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

        const [ordersRes, walletRes] = await Promise.all([
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_ALL + decryptedUserData.id)),
          axios.get(apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + decryptedUserData.id + "/balance"), { withCredentials: true }),
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
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [router]);

  if (loading || authLoading) return <Loading fullScreen={false} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4">
      <ToastContainer />
      
      {/* Header - Glass Aesthetic */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">
            Vendor Prosperity Center
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
            Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Business</span>
          </h1>
          <p className="mt-3 text-gray-500 font-medium text-lg">
            Welcome back, <span className="text-gray-900 font-bold">{dashboardData.userName}</span>. Your store is showing strong momentum.
          </p>
        </div>
        <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
          <button onClick={() => setTimePeriod("weekly")} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timePeriod === "weekly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}>Weekly</button>
          <button onClick={() => setTimePeriod("monthly")} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timePeriod === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}>Monthly</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Performance */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Financial Hub - Dark Mode Style */}
          <div className="bg-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden text-white shadow-2xl shadow-blue-900/20 group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] -mr-40 -mt-20 group-hover:scale-110 transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-1">Available Profit</p>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter flex items-baseline gap-2 truncate">
                    <span className="text-blue-500 text-3xl">₦</span>
                    {accountDetails?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h2>
                </div>
                <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                  <FaWallet className="w-6 h-6 text-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Num</p>
                  <p className="text-lg font-bold">{accountDetails?.wallet?.virtualAccountNumber || "Setting up..."}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bank Name</p>
                  <p className="text-lg font-bold truncate">{accountDetails?.wallet?.virtualBanktName || "Kasuwar Pay"}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-lg font-bold">Active</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/vendor-dashboard/withdrawal-request" className="flex-1 min-w-[140px] bg-white text-gray-900 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-center hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5">
                  Request Payout
                </Link>
                <Link href="/vendor-dashboard/transaction-history" className="flex-1 min-w-[140px] bg-white/10 text-white border border-white/20 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-center hover:bg-white/20 transition-all backdrop-blur-sm">
                  View History
                </Link>
              </div>
            </div>
          </div>

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

          {/* Quick Admin Operations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "New Product", icon: <FaPlus />, href: "/vendor-dashboard/products/add", color: "blue" },
              { label: "Inventory", icon: <FaBoxOpen />, href: "/vendor-dashboard/all-products", color: "purple" },
              { label: "Shipments", icon: <FaTruck />, href: "/vendor-dashboard/all-orders", color: "indigo" },
              { label: "Support", icon: <FaCommentDots />, href: "/vendor-dashboard/inbox-support", color: "emerald" },
            ].map((btn) => (
              <Link key={btn.label} href={btn.href} className="group bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl bg-${btn.color}-50 text-${btn.color}-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                  {btn.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900">{btn.label}</span>
              </Link>
            ))}
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

          {/* Activity Feed - Latest Orders */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Activity</h3>
              <Link href="/vendor-dashboard/all-orders" className="text-[10px] font-black uppercase tracking-widest text-blue-600">View All</Link>
            </div>
            
            <div className="space-y-6">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => (
                  <div key={order._id} className="group flex items-center gap-4 cursor-pointer" onClick={() => router.push(`/vendor-dashboard/all-orders/${order._id}`)}>
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <FaShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate">Order #{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                        {format(new Date(order.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">₦{order.totalAmount.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-0.5 justify-end">
                        <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'delivered' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{order.status}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-400 font-medium italic">Pulse is steady. Awaiting first orders.</p>
                </div>
              )}
            </div>

            {/* Bottom Promo / Link */}
            <div className="mt-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
              <h4 className="text-sm font-black tracking-tight mb-2 relative z-10">Grow your reach</h4>
              <p className="text-xs text-blue-100 mb-4 opacity-80 leading-relaxed relative z-10">
                Join the premium vendor network and boost visibility by 40%.
              </p>
              <button className="bg-white text-blue-700 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10 hover:shadow-lg transition">Explore Pro</button>
            </div>
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
          <Link href="/vendor-dashboard/products/add" className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center -mt-8 shadow-xl shadow-blue-600/30 border-4 border-white/5">
            <FaPlus className="w-5 h-5" />
          </Link>
          <Link href="/vendor-dashboard/all-products" className="text-gray-500 hover:text-white transition">
            <FaBoxOpen className="w-5 h-5" />
          </Link>
          <Link href="/vendor-dashboard/inbox-support" className="text-gray-500 hover:text-white transition">
            <FaCommentDots className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

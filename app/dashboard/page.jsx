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
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { 
  FaTruck, 
  FaBoxOpen, 
  FaPlus, 
  FaWallet, 
  FaShoppingCart, 
  FaChevronRight, 
  FaCog, 
  FaTimes, 
  FaHeadset, 
  FaShareAlt, 
  FaCheckCircle, 
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaEyeSlash,
  FaCopy
} from "react-icons/fa";

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
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [nin, setNin] = useState("");
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const fetchWalletBalance = async (uid) => {
    try {
      const walletResponse = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance + uid + "/balance"), { withCredentials: true });
      setWalletBalance(walletResponse.data.data);
    } catch (error) {
      setWalletBalance(null);
    }
  };
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    customToast.success(`${label} copied to clipboard!`);
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

  const handlePayment = () => {
    if (!amount || amount < 100) { customToast.warn("Minimum ₦100 required"); return; }
    if (window.PaystackPop) {
      new window.PaystackPop().newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: userData?.email,
        amount: amount * 100,
        onSuccess: async () => {
          customToast.success("Wallet funded successfully!");
          setShowFundModal(false);
          await fetchWalletBalance(userData.id);
        },
      });
    } else {
      customToast.info("Redirecting", "Payment secure layer is initializing.");
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

  const formatCurrency = (n) => {
    try {
      return `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } catch (e) {
      return `₦${n}`;
    }
  };

  if (loading || authLoading) return <Loading fullScreen={false} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4 bg-white">
      <Script src="https://js.paystack.co/v2/inline.js" strategy="lazyOnload" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-blue-600 font-black text-[7px] md:text-[9px] uppercase tracking-[0.4em] mb-1.5 block">
            Client Commerce Stream
          </span>
          <h1 className="text-lg md:text-2xl font-black text-gray-900 tracking-tighter uppercase">
            Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dashboard</span>
          </h1>
          <p className="mt-2 text-gray-500 font-medium text-[10px] md:text-xs">
            Welcome back, {dashboardData.userName}. Your secure hub for commerce and logistics.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="bg-gray-900 text-white px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200">Start Shopping</Link>
          <button onClick={() => router.push('/dashboard/personal-details')} className="bg-gray-50 text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all border border-gray-100"><FaCog className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Financial Hub - COMPACT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl p-4 md:p-6 relative overflow-hidden group shadow-xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-110"></div>
          <div className="relative flex flex-col md:flex-row justify-between gap-4 md:gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <p className="text-blue-400 font-black text-[8px] uppercase tracking-[0.4em] mb-1">Available Balance</p>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter truncate">
                    {isBalanceVisible ? formatCurrency(walletBalance?.balance) : "₦ ••••••"}
                  </h2>
                </div>
                <button onClick={() => setIsBalanceVisible(!isBalanceVisible)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all ml-auto">
                  {isBalanceVisible ? <FaEyeSlash className="w-3 h-3" /> : <FaEye className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowFundModal(true)} className="bg-white text-gray-900 px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">Top Up</button>
                <Link href="/dashboard/transaction-history" className="bg-white/10 text-white border border-white/20 px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-sm flex items-center gap-2">History <FaChevronRight className="w-1.5 h-1.5" /></Link>
              </div>
            </div>
            
            {walletBalance?.wallet ? (
              <div className="w-full md:w-52 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm self-start">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Settlement</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-[7px] text-gray-500 font-bold uppercase">Bank</p>
                    <p className="text-white font-bold text-[10px] tracking-tight">{walletBalance.wallet.virtualBanktName}</p>
                  </div>
                  <div className="group/copy relative">
                    <p className="text-[7px] text-gray-500 font-bold uppercase">Account</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white font-black text-sm md:text-base tracking-widest font-mono break-all">{walletBalance.wallet.virtualAccountNumber}</p>
                      <button 
                        onClick={() => handleCopy(walletBalance.wallet.virtualAccountNumber, "Account number")}
                        className="p-1.5 bg-white/5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
                        title="Copy Account Number"
                      >
                        <FaCopy className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowCreateAccount(true)} className="md:w-52 h-full bg-blue-600/20 border-2 border-dashed border-blue-600/40 rounded-xl flex flex-col items-center justify-center p-4 group hover:bg-blue-600/30 transition-all">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-2 shadow-lg shadow-blue-600/50 scale-90"><FaPlus /></div>
                <p className="text-white font-black text-[8px] uppercase tracking-widest text-center">Activate Settlement</p>
              </button>
            )}
          </div>
        </div>

        {/* Affiliate & Quick Stats */}
        <div className="flex flex-col gap-4">
          <Link href="/dashboard/referrals" className="flex-1 bg-blue-600 rounded-2xl p-6 pb-12 shadow-lg shadow-blue-200 hover:scale-[1.02] transition-all relative overflow-hidden group text-white">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-[9px] font-black text-blue-200 uppercase tracking-[0.2em] mb-4">Affiliate Wallet</p>
            <h3 className="text-xl md:text-2xl font-black mb-1 tracking-tight">Refer & Earn</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-100 uppercase tracking-widest mt-2">Invite Friends <FaChevronRight className="w-2 h-2" /></div>
          </Link>
          <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm scale-90"><FaBoxOpen /></div>
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active Orders</p>
                <p className="text-base font-black text-gray-900">{orderStatusCounts.pending + orderStatusCounts.paid + orderStatusCounts.shipped} In Pipeline</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation & Shortcuts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">Essential Navigation</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/", icon: <FaShoppingCart />, label: "Shop" },
                { href: "/dashboard/all-orders", icon: <FaBoxOpen />, label: "Orders" },
                { href: "/dashboard/request-delivery", icon: <FaTruck />, label: "Delivery" },
                { href: "/dashboard/referrals", icon: <FaShareAlt />, label: "Referral" },
                { href: "/dashboard/inbox-support", icon: <FaHeadset />, label: "Support" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gray-50/50 hover:bg-blue-600 hover:text-white transition-all group border border-transparent hover:border-blue-500">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm">
                    {link.icon}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-center">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* POS & Activity */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* POS Operations Hub */}
          <div className="bg-indigo-900 rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl text-center md:text-left">
                <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 inline-block">Direct Sales Stream</span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 uppercase leading-none">POS Operations <span className="text-indigo-400">Hub</span></h2>
                <p className="text-indigo-200 font-medium text-xs md:text-sm leading-relaxed">Accept and pay for orders sent directly from your Sales Manager. Monitor your retail interaction in real-time.</p>
              </div>
              <button className="w-full md:w-auto bg-white text-indigo-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 shadow-xl">
                Accept POS Order <FaArrowRight />
              </button>
            </div>
          </div>

          {/* Activity Pipeline */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-widest">Order Pipeline Stream</h2>
              <div className="h-px flex-1 bg-gray-100 ml-6"></div>
            </div>

            <div className="space-y-4">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => {
                  const isShipped = order.status === "shipped";
                  const isDelivered = order.status === "delivered";
                  return (
                    <div key={order._id} className="group bg-white rounded-[2rem] border border-gray-100 p-5 md:p-6 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 relative overflow-hidden cursor-pointer" onClick={() => router.push('/dashboard/all-orders')}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors"></div>
                      <div className="relative flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        <div className="flex gap-4 items-center">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110 duration-500 ${isDelivered ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                            <FaBoxOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-sm md:text-lg font-black text-gray-900 tracking-tight uppercase">#{order._id.slice(-8).toUpperCase()}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                                isDelivered ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                isShipped ? "bg-indigo-50 text-indigo-600 border-indigo-100" : 
                                "bg-amber-50 text-amber-600 border-amber-100"
                              }`}>
                                {isDelivered ? <FaCheckCircle /> : <FaClock />} {order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5 font-mono"><FaCalendarAlt /> {format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                              <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                              <span>{order.products?.length || 0} Units Catalyzed</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:w-auto flex flex-col md:items-end gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                          <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">Transaction Value</p>
                          <p className="text-xl md:text-2xl font-black text-blue-600 tracking-tighter">₦{order.totalAmount.toLocaleString()}</p>
                          
                          {isShipped && (
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await axios.put(apiUrl(API_CONFIG.ENDPOINTS.ORDER.UPDATE_STATUS + order._id), { status: "delivered" }, { withCredentials: true });
                                  customToast.success("Order marked as Delivered!");
                                  window.location.reload();
                                } catch (error) {
                                  customToast.error("Failed to update status");
                                }
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
                            >
                              Confirm Receipt <FaCheckCircle />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                  <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl text-gray-200">
                    <FaBoxOpen className="text-3xl" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight uppercase">Empty Reservoir</h3>
                  <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8 text-xs">No recent orders in your pipeline. Ready for a new marketplace entry?</p>
                  <Link href="/" className="bg-gray-900 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">Go Shopping</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fund Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFundModal(false)}></div>
          <div className="bg-white rounded-[2rem] max-w-md w-full relative z-10 shadow-2xl overflow-hidden">
            <div className="bg-gray-900 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl -mr-12 -mt-12"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Wallet Funding</p>
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase">Inject Funds</h2>
                </div>
                <button onClick={() => setShowFundModal(false)} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-all"><FaTimes className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-8">
              <p className="text-gray-500 font-medium mb-8 text-sm">Enter the amount to inject into your secure commerce wallet.</p>
              <div className="relative mb-8">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-900">₦</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-gray-50 border-0 rounded-2xl p-6 pl-14 text-2xl font-black focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-gray-200 focus:outline-none" />
              </div>
              <button onClick={handlePayment} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all">Execute Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateAccount && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateAccount(false)}></div>
          <div className="bg-white rounded-[2rem] max-w-md w-full relative z-10 shadow-2xl overflow-hidden">
            <div className="bg-blue-600 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -mr-12 -mt-12"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em] mb-2">Identity Verification</p>
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase">KYC Activation</h2>
                </div>
                <button onClick={() => setShowCreateAccount(false)} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-all"><FaTimes className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-8">
              <p className="text-gray-500 font-medium mb-8 text-sm">Provide your 11-digit NIN to generate a secure virtual settlement account.</p>
              <form onSubmit={handleCreateAccount} className="space-y-6">
                <input type="text" value={nin} onChange={(e) => setNin(e.target.value)} placeholder="Enter 11-digit NIN" className="w-full bg-gray-50 border-0 rounded-2xl p-6 text-lg font-bold focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-gray-200 focus:outline-none" required />
                <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all">Generate Account</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;

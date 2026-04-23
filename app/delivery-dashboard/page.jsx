"use client";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { API_CONFIG, apiUrl } from "@/configs/api";
import { customToast } from "@/lib/customToast";
import Loading from "@/components/Loading";
import Link from "next/link";
import {
  FaHome,
  FaCommentDots,
  FaTruck,
  FaBoxOpen,
  FaUser,
  FaWallet,
  FaTasks,
  FaHistory,
  FaCheckCircle,
  FaClock,
  FaChevronRight,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";

const DashboardHome = () => {
  const { userData, authLoading } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const [dashboardData, setDashboardData] = useState({
    userName: "",
    newTasks: [],
    ongoingTasks: [],
    completedTasks: [],
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [hasWallet, setHasWallet] = useState(false);
  const [activeTab, setActiveTab] = useState("new");

  const currentUser = userData?.user ?? userData;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading) return;
      if (!userData) {
        router.push("/delivery-signin");
        return;
      }
      setLoading(true);
      try {
        const [tasksResponse, walletResponse] = await Promise.all([
          axios.get(apiUrl(`${API_CONFIG.ENDPOINTS.DELIVERY.GET_TASKS_BY_DELIVERY_PERSON}/${currentUser._id}`)),
          axios.get(apiUrl(`${API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance}${currentUser._id}/balance`)),
        ]);
        
        const tasks = tasksResponse.data.data || [];
        if (walletResponse.data.data) {
          setWalletBalance(walletResponse.data.data.balance);
          setHasWallet(true);
        }

        setDashboardData({
          userName: currentUser.firstName,
          newTasks: tasks.filter((task) => task.status === "pending"),
          ongoingTasks: tasks.filter((task) => task.status === "assigned" || task.status === "on delivery"),
          completedTasks: tasks.filter((task) => task.status === "completed" || task.status === "canceled"),
          totalOrders: tasks.length,
        });
      } catch (error) {
        if (error.response?.status === 404) setHasWallet(false);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userData, authLoading, router, currentUser?._id]);

  const handleCreateWallet = async () => {
    setLoading(true);
    try {
      if (!currentUser?._id) {
        customToast.error("Request Failed", "Unable to create wallet.");
        return;
      }
      await axios.post(apiUrl(API_CONFIG.ENDPOINTS.DELIVERY.CREATE_WALLET + currentUser._id));
      customToast.success("Wallet Created", "Wallet created successfully!");
      setHasWallet(true);
      window.location.reload();
    } catch (error) {
      customToast.error("Creation Failed", error.response?.data?.message || "Failed to create wallet.");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId, status) => {
    try {
      await axios.put(apiUrl(`${API_CONFIG.ENDPOINTS.DELIVERY.UPDATE_TASK_STATUS}/${taskId}`), { status });
      customToast.success("Status Updated", `Task status updated to ${status}`);
      router.refresh(); // Or fetch data again
    } catch (error) {
      customToast.error("Update Failed", "Failed to update task status.");
    }
  };

  const renderTaskCard = (task) => (
    <div key={task._id} className="group bg-white rounded-[2rem] border border-gray-100 p-6 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 mb-4 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors"></div>
      
      <div className="flex justify-between items-start gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
            <FaBoxOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-900 tracking-tight">#{task._id.slice(-8).toUpperCase()}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg">{(task.deliveryType || 'Standard').toUpperCase()}</span>
              <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-lg ${task.status === 'on delivery' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                {task.status}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Earning</p>
          <p className="text-2xl font-black text-gray-900 tracking-tight">₦{(task.price || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
        <div className="space-y-2">
          <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Pickup
          </p>
          <p className="text-sm font-bold text-gray-700 leading-relaxed">{task.pickupAddress?.address}, {task.pickupAddress?.lga}</p>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Destination
          </p>
          <p className="text-sm font-bold text-gray-700 leading-relaxed">{task.dropoffAddress?.address}, {task.dropoffAddress?.lga}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-50 relative z-10">
        {task.status === "pending" && (
          <>
            <button onClick={() => handleTaskUpdate(task._id, "assigned")} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">Accept Assignment</button>
            <button onClick={() => handleTaskUpdate(task._id, "rejected")} className="px-8 bg-gray-50 text-gray-500 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">Decline</button>
          </>
        )}
        {task.status === "assigned" && (
          <button onClick={() => handleTaskUpdate(task._id, "on delivery")} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Initiate Journey</button>
        )}
        {task.status === "on delivery" && (
          <button onClick={() => handleTaskUpdate(task._id, "completed")} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">Mark as Delivered</button>
        )}
      </div>
    </div>
  );

  if (loading || authLoading) return <Loading fullScreen={false} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4">

      {/* Modern Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">
            Logistics Command Center
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
            Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{dashboardData.userName}</span>
          </h1>
          <p className="mt-3 text-gray-500 font-medium text-lg">
            Awaiting your next move. {dashboardData.newTasks.length} opportunities ready.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-gray-100 p-4 rounded-3xl flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-black text-gray-700 uppercase tracking-widest">Active Status</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Earnings & Stats Hub */}
        <div className="lg:col-span-2 space-y-8">
          
          {hasWallet ? (
            <div className="bg-gray-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden group shadow-2xl shadow-blue-900/20 text-white">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-40 -mt-20 group-hover:scale-110 transition-transform duration-1000"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex-1">
                  <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Total Revenue Pot</p>
                  <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-10 flex items-baseline gap-2 truncate">
                    <span className="text-blue-500 text-3xl">₦</span>
                    {walletBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h2>
                  <div className="flex gap-4">
                    <button onClick={() => router.push('/delivery-dashboard/wallet')} className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">Withdraw</button>
                    <button onClick={() => router.push('/delivery-dashboard/withdrawal-history')} className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] backdrop-blur-sm hover:bg-white/20 transition-all">History</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-md">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Ongoing</p>
                    <p className="text-3xl font-black">{dashboardData.ongoingTasks.length}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-md">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Success</p>
                    <p className="text-3xl font-black">{dashboardData.completedTasks.length}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-[3rem] p-16 text-center border-2 border-dashed border-gray-200">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50">
                <FaWallet className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-2">Initialize Wallet</h3>
              <p className="text-gray-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed text-lg">Setup your secure digital wallet to start receiving payments for successful deliveries instantly.</p>
              <button onClick={handleCreateWallet} className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all">Create Account</button>
            </div>
          )}

          {/* Activity Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
                {["new", "ongoing", "completed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab 
                        ? "bg-white text-gray-900 shadow-md" 
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab === "new" ? "New Invites" : tab === "ongoing" ? "Active Journeys" : "History"}
                  </button>
                ))}
              </div>
              <Link href="/delivery-dashboard/delivery" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:gap-3 transition-all">
                All Assignments <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="min-h-[400px]">
              {activeTab === "new" && (dashboardData.newTasks.length > 0 ? dashboardData.newTasks.map(renderTaskCard) : <EmptyState icon={<FaTasks />} title="Quiet Dispatch" description="Currently no new delivery requests in your zone." />)}
              {activeTab === "ongoing" && (dashboardData.ongoingTasks.length > 0 ? dashboardData.ongoingTasks.map(renderTaskCard) : <EmptyState icon={<FaTruck />} title="No Active Routes" description="Ready for your next journey? Check New Invites!" />)}
              {activeTab === "completed" && (dashboardData.completedTasks.length > 0 ? dashboardData.completedTasks.map(renderTaskCard) : <EmptyState icon={<FaHistory />} title="Clean Slate" description="Your delivery history will manifest here." />)}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
          
          {/* Support & Profile Quick Access */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Quick Actions</h3>
            <div className="space-y-4">
              <Link href="/delivery-dashboard/personal-details" className="group flex items-center justify-between p-5 bg-gray-50 rounded-3xl hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-sm group-hover:text-blue-600 transition-colors">
                    <FaUser />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">Profile</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Update Details</p>
                  </div>
                </div>
                <FaChevronRight className="w-3 h-3 text-gray-300 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link href="/delivery-dashboard/support" className="group flex items-center justify-between p-5 bg-gray-50 rounded-3xl hover:bg-indigo-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-sm group-hover:text-indigo-600 transition-colors">
                    <FaCommentDots />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">Support</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Help Center</p>
                  </div>
                </div>
                <FaChevronRight className="w-3 h-3 text-gray-300 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Delivery Tips / Promo */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <FaClock className="text-blue-300/30 text-6xl absolute -bottom-4 -right-4 rotate-12 group-hover:scale-110 transition-transform duration-700" />
            
            <h4 className="text-2xl font-black tracking-tighter mb-4 relative z-10">Maximize Your <br/> Earnings</h4>
            <p className="text-blue-100/80 text-sm font-medium leading-relaxed mb-8 relative z-10">
              Peak hours are currently active. Deliveries in your area are yielding 20% higher service fees.
            </p>
            <button className="bg-white text-blue-700 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl transition relative z-10">View Hotzones</button>
          </div>

        </div>
      </div>

      {/* Persistent Bottom Nav Mobile */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-gray-900/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl md:hidden z-50 p-2">
        <div className="flex justify-between items-center h-16 px-4">
          {[
            { href: "/delivery-dashboard", icon: <FaHome />, active: pathname === "/delivery-dashboard" },
            { href: "/delivery-dashboard/delivery", icon: <FaTasks />, active: pathname === "/delivery-dashboard/delivery" },
            { href: "/delivery-dashboard/wallet", icon: <FaWallet />, active: pathname === "/delivery-dashboard/wallet" },
            { href: "/delivery-dashboard/personal-details", icon: <FaUser />, active: pathname === "/delivery-dashboard/personal-details" }
          ].map((item, idx) => (
            <Link key={idx} href={item.href} className="flex-1 flex justify-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${item.active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40" : "text-gray-500 hover:text-gray-300"}`}>
                <span className="text-xl">{item.icon}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon, title, description }) => (
  <div className="py-20 text-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-100">
    <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-gray-200 shadow-sm">
      <span className="text-3xl">{icon}</span>
    </div>
    <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">{title}</h3>
    <p className="text-gray-400 font-medium max-w-[200px] mx-auto text-xs leading-relaxed">{description}</p>
  </div>
);

export default DashboardHome;

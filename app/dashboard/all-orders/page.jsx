"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_CONFIG, apiUrl } from "@/configs/api";
import { decryptData } from "@/lib/encryption";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/Loading";
import Link from "next/link";
import { 
  FaBoxOpen, 
  FaSearch, 
  FaChevronRight, 
  FaCalendarAlt, 
  FaShippingFast, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaShoppingBag,
  FaArrowRight,
  FaMapMarkerAlt,
  FaChevronLeft
} from "react-icons/fa";

const ITEMS_PER_PAGE = 5;

const OrderHistory = () => {
  const { userData: contextUserData, authLoading } = useAppContext();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const encryptedUser = localStorage.getItem("user");
    if (encryptedUser) {
      try {
        const decryptedUser = decryptData(encryptedUser);
        setUser(decryptedUser);
      } catch (e) {
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_ALL + (user.id || user._id)),
        { withCredentials: true }
      );
      setOrders(response.data.orders || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const statusConfigs = {
    paid: { color: "bg-blue-50 text-blue-600 border-blue-100", icon: <FaClock /> },
    pending: { color: "bg-amber-50 text-amber-600 border-amber-100", icon: <FaClock /> },
    shipped: { color: "bg-purple-50 text-purple-600 border-purple-100", icon: <FaShippingFast /> },
    delivered: { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: <FaCheckCircle /> },
    cancelled: { color: "bg-rose-50 text-rose-600 border-rose-100", icon: <FaTimesCircle /> },
  };

  const getStatusConfig = (status) => statusConfigs[status.toLowerCase()] || { color: "bg-gray-50 text-gray-500 border-gray-100", icon: <FaBoxOpen /> };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = filterStatus === "all" || order.status.toLowerCase() === filterStatus;
      const matchesSearch = 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  if (loading || authLoading) return <Loading fullScreen={false} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4">
      <ToastContainer />
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">
            Customer Asset Archive
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
            Purchase <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">History</span>
          </h1>
          <p className="mt-3 text-gray-500 font-medium text-lg">
            Effortlessly monitor your orders and track real-time delivery progress.
          </p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit h-fit">
           <div className="flex items-center gap-2 px-6 py-2.5">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{orders.length} Total Orders</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left: Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
             <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Discovery</h3>
             <div className="relative group mb-8">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Order ID / Item" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-100 transition-all font-bold text-sm"
                />
             </div>

             <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Status Filter</h3>
             <div className="flex flex-col gap-2">
               {["all", "pending", "paid", "shipped", "delivered", "cancelled"].map((status) => (
                 <button 
                   key={status}
                   onClick={() => setFilterStatus(status)}
                   className={`flex justify-between items-center px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     filterStatus === status 
                       ? "bg-blue-600 text-white shadow-xl shadow-blue-200" 
                       : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                   }`}
                 >
                   {status}
                   {filterStatus === status && <FaCheckCircle />}
                 </button>
               ))}
             </div>
           </div>

           <div className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600 opacity-20 rounded-full blur-2xl -mr-12 -mt-12 transition-transform duration-1000 group-hover:scale-150"></div>
              <h4 className="text-lg font-black tracking-tight mb-4 relative z-10">Need Help?</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-6 relative z-10">Our support dispatch is active 24/7 to resolve any delivery issues.</p>
              <Link href="/dashboard/support" className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all">
                Dispatch Support <FaArrowRight />
              </Link>
           </div>
        </div>

        {/* Right: Orders Feed */}
        <div className="lg:col-span-3 space-y-6">
          {paginatedOrders.length > 0 ? (
            <>
              {paginatedOrders.map((order) => {
                const status = getStatusConfig(order.status);
                return (
                  <div 
                    key={order._id} 
                    className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-10 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 cursor-pointer overflow-hidden relative"
                    onClick={() => router.push(`/dashboard/all-orders/${order._id}`)}
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gray-50 rounded-full -mr-20 -mt-20 group-hover:bg-blue-50 transition-colors"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
                      <div className="flex gap-6 items-center">
                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${status.color} shadow-inner transition-transform group-hover:scale-110 duration-500`}>
                          <FaBoxOpen className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">#{order._id.slice(-8)}</h3>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${status.color}`}>
                              {status.icon} {order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                             <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-gray-300" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                             <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                             <span>{order.products.length} {order.products.length === 1 ? 'Item' : 'Items'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-col items-end gap-2 pt-6 md:pt-0 border-t md:border-t-0 border-gray-50">
                         <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Settlement Amount</p>
                         <p className="text-3xl font-black text-blue-600 tracking-tighter">₦{order.totalAmount.toLocaleString()}</p>
                         <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                            View Details <FaArrowRight />
                         </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-50 flex items-center gap-3 relative z-10">
                      <FaMapMarkerAlt className="text-gray-300 w-3 h-3" />
                      <p className="text-xs font-bold text-gray-500 truncate italic">"{(order.deliveryAddress || "Standard Hub Pick-up")}"</p>
                    </div>
                  </div>
                );
              })}

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-12 px-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <FaChevronLeft /> Previous
                  </button>
                  <div className="flex items-center gap-3">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${
                            currentPage === pageNum 
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                              : "bg-white text-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Next <FaArrowRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-32 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
               <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl text-gray-200">
                 <FaShoppingBag className="text-4xl" />
               </div>
               <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Archives are Empty</h3>
               <p className="text-gray-500 font-medium max-w-sm mx-auto mb-12 leading-relaxed">It seems your purchase history is calling for some action. Discover the latest marketplace treasures now.</p>
               <button onClick={() => router.push("/")} className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Start Journey</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OrderHistory;

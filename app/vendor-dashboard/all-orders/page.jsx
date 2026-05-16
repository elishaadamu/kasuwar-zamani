"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { decryptData } from "@/lib/encryption";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/Loading";
import {
  FaBoxOpen,
  FaSearch,
  FaChevronRight,
  FaCalendarAlt,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaReceipt,
  FaArrowRight,
  FaMapMarkerAlt,
  FaChevronLeft
} from "react-icons/fa";
import { useAppContext } from "@/context/AppContext";

const ITEMS_PER_PAGE = 5;

const OrderHistory = () => {
  const { authLoading } = useAppContext();
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
        apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_ALL + user.id),
        { withCredentials: true }
      );
      console.log(response.data.orders);
      setOrders(response.data.orders || response.data || []);
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
        (order._id && order._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.products && order.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
          <span className="text-indigo-600 font-black text-[8px] md:text-[10px] uppercase tracking-[0.4em] mb-2 block">
            Vendor Fulfillment Stream
          </span>
          <h1 className="text-2xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">
            Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Pipeline</span>
          </h1>
          <p className="mt-3 text-gray-500 font-medium text-xs md:text-lg max-w-xl">
            Monitor incoming requests and manage your commercial fulfillment efficiency.
          </p>
        </div>
        <div className="flex bg-white border border-gray-100 p-1 md:p-2 rounded-2xl shadow-sm h-fit">
          <div className="flex items-center gap-3 px-4 py-2 md:px-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 scale-90 md:scale-100">
              <FaReceipt />
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Active Queue</p>
              <p className="text-sm md:text-lg font-black text-gray-900">{orders.length} Orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Left: Operations Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Pipeline Audit</h3>
            <div className="relative group mb-8">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Order ID / Product"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 transition-all font-bold text-sm"
              />
            </div>

            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Lifecycle State</h3>
            <div className="flex flex-col gap-2">
              {["all", "pending", "paid", "shipped", "delivered", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`flex justify-between items-center px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                >
                  {status}
                  {filterStatus === status && <FaCheckCircle />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400 opacity-20 rounded-full blur-2xl -mr-12 -mt-12 transition-transform duration-1000 group-hover:scale-150"></div>
            <h4 className="text-lg font-black tracking-tight mb-4 relative">Revenue Support</h4>
            <p className="text-xs text-indigo-200 leading-relaxed mb-6 relative">Having trouble with a transaction? Our merchant assistance is online.</p>
            <button
              type="button"
              onClick={() => window.location.href = "/vendor-dashboard/inbox-support"}
              className="inline-flex items-center gap-2 bg-white text-indigo-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all"
            >
              Open Assistance <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Right: Pipeline Feed */}
        <div className="lg:col-span-3 space-y-4">
          {paginatedOrders.length > 0 ? (
            <>
              {paginatedOrders.map((order) => {
                const status = getStatusConfig(order.status);
                return (
                  <div
                    key={order._id}
                    className="group bg-white rounded-[2rem] border border-gray-100 p-5 md:p-8 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all duration-500 cursor-pointer relative overflow-hidden"
                    onClick={() => window.location.href = `/vendor-dashboard/all-orders/${order._id}`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors"></div>

                    <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 justify-between items-start md:items-center">
                      <div className="flex gap-4 md:gap-5 items-center">
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center ${status.color} shadow-inner transition-transform group-hover:scale-110 duration-500 scale-90 md:scale-100`}>
                          <FaBoxOpen className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-sm md:text-lg font-black text-gray-900 tracking-tight uppercase">#{order._id?.slice(-8)}</h3>
                            <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 ${status.color}`}>
                              {status.icon} {order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1 font-mono"><FaCalendarAlt className="text-gray-300" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                            <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                            <span>{order.products?.length || 0} Units</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-col items-end gap-1 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                        <p className="text-[8px] md:text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Expected Inflow</p>
                        <p className="text-xl md:text-2xl font-black text-indigo-600 tracking-tighter">₦{order.totalAmount?.toLocaleString()}</p>
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-[8px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                          Resolve <FaArrowRight />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-50 flex items-center gap-3 relative">
                      <FaMapMarkerAlt className="text-gray-300 w-3 h-3" />
                      <p className="text-xs font-bold text-gray-400 truncate italic">"{(order.deliveryAddress || "Hub Destination Not Specified")}"</p>
                    </div>
                  </div>
                );
              })}

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 px-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <FaChevronLeft /> Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === (i + 1)
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                          : "bg-white text-gray-400 hover:bg-gray-50"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
                  >
                    Next <FaArrowRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl text-gray-200">
                <FaBoxOpen className="text-3xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Empty Reservoir</h3>
              <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8 text-sm">No orders currently match your pipeline search criteria. Active commerce awaits.</p>
              <button onClick={() => window.location.reload()} className="bg-gray-900 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">Refresh Pipeline</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OrderHistory;

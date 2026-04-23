"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { decryptData } from "@/lib/encryption";
import Link from "next/link";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import {
  FaBox,
  FaTimes,
  FaShippingFast,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTag,
  FaReceipt,
  FaCheckCircle,
  FaClock,
  FaChevronRight,
  FaLock,
  FaPrint,
  FaWallet,
  FaArrowRight,
  FaTimesCircle,
} from "react-icons/fa";

/* ─────────────── Order Details Modal ─────────────── */
const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;
  const currency = "₦";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.3)] flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header - Glass Aesthetic */}
        <div className="bg-gray-50/50 border-b border-gray-100 px-8 py-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <FaReceipt className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Transaction Proof</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                Ref: {order.uniqueOrderCode || order._id?.slice(-12).toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm">
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Summary Indicator */}
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                <FaCheckCircle className="text-sm" />
              </div>
              <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                Payment {order.status || "Confirmed"}
              </span>
            </div>
            <div className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest">
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Acquired Assets</h3>
            <div className="space-y-3">
              {order.products?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-50/50 border border-gray-50 rounded-3xl p-4 group transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 overflow-hidden shrink-0 shadow-sm p-1">
                    {item.productId?.images?.[0]?.url ? (
                      <img src={item.productId.images[0].url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200"><FaBox size={24} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate tracking-tight">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Qty: {item.quantity} · Service: {item.productId?.category || "Standard"}</p>
                  </div>
                  <p className="text-lg font-black text-gray-900 shrink-0 tracking-tighter">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Financial Reconciliation</h4>
            <div className="space-y-4 text-xs font-bold">
              <div className="flex justify-between items-center text-gray-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>₦{Number(order.originalAmount || order.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400 uppercase tracking-widest">
                <span>Service Fee</span>
                <span className="text-blue-400">₦{Number(order.shippingFee || 0).toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/5 my-4"></div>
              <div className="flex justify-between items-end">
                <span className="text-blue-400 text-[10px] uppercase tracking-[0.3em]">Final Settlement</span>
                <span className="text-4xl font-black tracking-tighter self-end">₦{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button onClick={() => window.print()} className="w-full py-5 bg-gray-50 text-gray-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-center gap-3">
             <FaPrint /> Broadcast to Printer
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────── PIN Input ─────────────── */
const PinInput = ({ length, onChange, onSubmit }) => {
  const [pin, setPin] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === "") {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      onChange(newPin.join(""));
      if (value && index < length - 1) inputRefs.current[index + 1].focus();
      if (newPin.filter((d) => d === "").length === 0 && index === length - 1) setTimeout(() => onSubmit(), 100);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) inputRefs.current[index - 1].focus();
  };

  return (
    <div className="flex gap-4 justify-center">
      {pin.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="password"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-16 h-16 text-center text-3xl font-black border-2 border-gray-100 rounded-[1.25rem] bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none"
        />
      ))}
    </div>
  );
};

const POSSales = () => {
  const { userData: contextUserData, authLoading } = useAppContext();
  const [posOrders, setPosOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewedOrder, setViewedOrder] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [pin, setPin] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const encryptedUser = localStorage.getItem("user");
    if (encryptedUser) {
      setUser(decryptData(encryptedUser));
    }
  }, []);

  useEffect(() => {
    if (user) fetchPosOrders();
  }, [user]);

  const fetchPosOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_ALL + user.id), { withCredentials: true });
      const pendingOrders = response.data?.pendingPosOrders || [];
      const completedOrders = response.data?.orders || [];
      setPosOrders([...pendingOrders, ...completedOrders]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedOrder || pin.length !== 4) return;
    setPaymentLoading(true);
    try {
      await axios.post(apiUrl(`${API_CONFIG.ENDPOINTS.POS.PAY}${selectedOrder._id}`), { pin }, { withCredentials: true });
      toast.success("Payment Protocol Successful");
      setPin("");
      setSelectedOrder(null);
      setTimeout(() => fetchPosOrders(), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Protocol Failure");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading || authLoading) return <Loading fullScreen={false} />;

  const pendingOrders = posOrders.filter(o => o.status === "pending_payment");
  const paidOrders = posOrders.filter(o => o.status !== "pending_payment");
  const displayedOrders = activeTab === "pending" ? pendingOrders : paidOrders;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4">
      <ToastContainer />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">
            Point of Sale Terminal
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
            Transaction <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Hub</span>
          </h1>
          <p className="mt-3 text-gray-500 font-medium text-lg">
            Authorize point-of-sale orders and audit your local commerce records.
          </p>
        </div>
        <div className="flex gap-4">
           {[['Total', posOrders.length], ['Pending', pendingOrders.length, 'amber']].map(([label, val, col]) => (
             <div key={label} className={`bg-white border-2 border-gray-100 rounded-2xl px-6 py-3 min-w-[100px] text-center shadow-sm`}>
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">{label}</p>
               <p className={`text-xl font-black ${col === 'amber' ? 'text-amber-500' : 'text-gray-900'}`}>{val}</p>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Orders Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
            {['pending', 'history'].map(tab => (
              <button 
                key={tab} onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-gray-900 shadow-md" : "text-gray-400 hover:text-gray-600"}`}
              >
                {tab === 'pending' ? 'Auth Required' : 'Audit History'}
              </button>
            ))}
          </div>

          <div className="space-y-4 min-h-[400px]">
            {displayedOrders.length > 0 ? displayedOrders.map(order => (
              <div 
                key={order._id} 
                onClick={() => activeTab === 'pending' ? setSelectedOrder(order) : (setViewedOrder(order), setIsHistoryModalOpen(true))}
                className={`group bg-white rounded-[2.5rem] border-2 p-6 cursor-pointer transition-all duration-300 ${selectedOrder?._id === order._id ? "border-blue-500 shadow-2xl shadow-blue-900/10" : "border-gray-50 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5"}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${order.status === 'pending_payment' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                      <FaReceipt className="text-xl" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900 uppercase">#{order.uniqueOrderCode || order._id.slice(-6)}</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()} · {order.products.length} Units</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <p className="text-2xl font-black text-gray-900 tracking-tighter">₦{order.totalAmount.toLocaleString()}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${order.status === 'pending_payment' ? 'text-amber-500' : 'text-blue-500'}`}>{order.status.replace('_', ' ')}</span>
                    </div>
                    <FaChevronRight className="text-gray-200 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </div>
            )) : <div className="py-24 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100"><FaReceipt className="text-gray-200 text-4xl mx-auto mb-4" /><p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No transactions detected</p></div>}
          </div>
        </div>

        {/* Auth Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-[3rem] p-10 text-white sticky top-10 shadow-2xl shadow-blue-900/20 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/30 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-1000"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400"><FaLock /></div>
                <h3 className="text-xl font-black tracking-tight">Access Gate</h3>
              </div>

              {selectedOrder ? (
                <div className="space-y-8 animate-fadeIn">
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Active Settlement</p>
                    <p className="text-4xl font-black mt-2 tracking-tighter">₦{selectedOrder.totalAmount.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-4 uppercase tracking-widest truncate">{selectedOrder.uniqueOrderCode}</p>
                  </div>

                  <div>
                    <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Security Credential Required</p>
                    <PinInput length={4} onChange={setPin} onSubmit={handlePayment} />
                  </div>

                  <button 
                    onClick={handlePayment} 
                    disabled={paymentLoading || pin.length !== 4} 
                    className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-blue-900/40 hover:bg-blue-700 active:scale-95 transition-all disabled:bg-white/5 disabled:text-gray-600"
                  >
                    {paymentLoading ? "Validating Protocol..." : "Complete Settlement"}
                  </button>
                  <button onClick={() => setSelectedOrder(null)} className="w-full text-center text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition">De-select Order</button>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600 border border-white/5"><FaWallet className="text-3xl" /></div>
                  <p className="text-gray-400 font-medium text-sm leading-relaxed">Select a pending order from the terminal feed to initiate payment protocol.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <OrderDetailsModal order={viewedOrder} isOpen={isHistoryModalOpen} onClose={() => setViewedOrder(null)} />
    </div>
  );
};

export default POSSales;

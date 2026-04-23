"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { decryptData } from "@/lib/encryption";
import Loading from "@/components/Loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { 
  FaArrowLeft, 
  FaBox, 
  FaShippingFast, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaUser,
  FaReceipt,
  FaArrowRight
} from "react-icons/fa";

const OrderDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const encryptedUser = localStorage.getItem("user");
      if (!encryptedUser) {
        router.push("/signin");
        return;
      }
      const userData = decryptData(encryptedUser);
      
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_ALL + userData.id),
          { withCredentials: true }
        );
        const foundOrder = response.data.orders?.find(o => o._id === id);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          toast.error("Order not found or access denied.");
        }
      } catch (error) {
        toast.error("Protocol failed to retrieve order telemetry.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, router]);

  if (loading) return <Loading fullScreen={false} />;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6">
          <FaTimesCircle className="text-3xl" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Order Nullification</h2>
        <p className="text-gray-500 font-medium mb-8">We could not locate this order in your historical records.</p>
        <button onClick={() => router.back()} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest">Return to Archive</button>
      </div>
    );
  }

  const statusConfigs = {
    paid: { color: "bg-blue-600", light: "bg-blue-50 text-blue-600", icon: <FaClock />, label: "Paid & Queued" },
    pending: { color: "bg-amber-500", light: "bg-amber-50 text-amber-600", icon: <FaClock />, label: "Pending Verification" },
    shipped: { color: "bg-purple-600", light: "bg-purple-50 text-purple-600", icon: <FaShippingFast />, label: "In Transit" },
    delivered: { color: "bg-emerald-600", light: "bg-emerald-50 text-emerald-600", icon: <FaCheckCircle />, label: "Delivered Successfully" },
    cancelled: { color: "bg-rose-600", light: "bg-rose-50 text-rose-600", icon: <FaTimesCircle />, label: "Transaction Voided" },
  };

  const status = statusConfigs[order.status.toLowerCase()] || { color: "bg-gray-600", light: "bg-gray-50 text-gray-600", icon: <FaBox />, label: order.status };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4">
      <ToastContainer />
      
      <button 
        onClick={() => router.back()}
        className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-gray-900 transition-all mb-10"
      >
        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all">
          <FaArrowLeft />
        </div>
        Back to Archive
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Detailed Manifest */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm relative overflow-hidden">
             <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
               <div>
                 <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">Transaction Manifest</span>
                 <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Order #{order._id.slice(-12)}</h1>
                 <p className="mt-2 text-gray-500 font-medium italic">Confirmed {new Date(order.createdAt).toLocaleString()}</p>
               </div>
               <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border ${status.light} h-fit shadow-sm`}>
                 {status.icon}
                 <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
               </div>
             </div>

             <div className="space-y-6">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><FaBox /></div>
                  Itemized Composition
                </h3>
                <div className="divide-y divide-gray-50">
                  {order.products?.map((item, idx) => (
                    <div key={idx} className="py-6 flex gap-6 items-center group">
                      <div className="w-20 h-20 bg-gray-50 rounded-2xl relative overflow-hidden shrink-0 border border-gray-100 shadow-inner">
                        {item.productId?.images?.[0]?.url ? (
                          <Image src={item.productId.images[0].url} alt={item.productId.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200"><FaBox /></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{item.productId?.category || "Essential"}</p>
                        <h4 className="text-lg font-black text-gray-900 tracking-tight leading-tight">{item.productId?.name || item.name || "Commercial Product"}</h4>
                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Qty: {item.quantity || item.quantity_bought || 1}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-gray-900 tracking-tighter">₦{(item.price || item.productId?.price || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="mt-12 pt-10 border-t-2 border-dashed border-gray-50 flex justify-between items-center">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Aggregate Total</p>
                <p className="text-4xl font-black text-blue-600 tracking-tighter">₦{order.totalAmount?.toLocaleString()}</p>
             </div>
           </div>
        </div>

        {/* Right: Logistics & Party Details */}
        <div className="lg:col-span-1 space-y-8">
           {/* Recipient Intelligence */}
           <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
             <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><FaUser /></div>
                Recipient Intelligence
             </h3>
             <div className="space-y-6">
                <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0"><FaMapMarkerAlt /></div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination Address</p>
                      <p className="text-sm font-bold text-gray-600 leading-relaxed italic">"{order.deliveryAddress || "Hub pickup location not specified."}"</p>
                   </div>
                </div>
                <div className="flex gap-4 items-center">
                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0"><FaPhoneAlt /></div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Secure Contact</p>
                      <p className="text-sm font-black text-gray-900 font-mono italic">Handshake required on delivery</p>
                   </div>
                </div>
             </div>
           </div>

           {/* Performance Tracking */}
           <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/10">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-white"><FaShippingFast /></div>
                Transit Log
              </h3>
              <div className="space-y-8 relative">
                 <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-white/5"></div>
                 <div className="relative pl-12">
                   <div className="absolute left-3 top-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                   <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Origin Verified</p>
                   <p className="text-xs font-bold text-white">The vendor has catalyzed the product manifest.</p>
                 </div>
                 <div className="relative pl-12 opacity-50">
                   <div className="absolute left-3 top-0 w-2 h-2 rounded-full bg-white/10"></div>
                   <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Logistics Allocation</p>
                   <p className="text-xs font-bold text-gray-400 italic">"Waiting for courier signal..."</p>
                 </div>
              </div>
           </div>

           {/* Quick Actions */}
           <div className="flex flex-col gap-4">
              <button 
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-100 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-900 hover:bg-gray-50 transition-all"
              >
                <FaReceipt /> Generate Order Invoice
              </button>
              <button 
                onClick={() => router.push("/dashboard/support-ticket")}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                 Open Support Ticket <FaArrowRight />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

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
  FaUser,
  FaReceipt,
  FaArrowRight,
  FaChartLine
} from "react-icons/fa";

const VendorOrderDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const encryptedUser = localStorage.getItem("user");
        if (!encryptedUser) {
          router.push("/vendor-signin");
          return;
        }
        const decryptedUser = decryptData(encryptedUser);
        
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_ALL + decryptedUser.id),
          { withCredentials: true }
        );
        // Backend returns orders array, find the specific one
        const orders = response.data.orders || response.data || [];
        const foundOrder = orders.find(o => o._id === id);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          toast.error("Order payload not found in your sector.");
        }
      } catch (error) {
        toast.error("Failed to synchronize with order pipeline.");
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
        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6 font-black italic">!</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Order Desync</h2>
        <p className="text-gray-500 font-medium mb-8">This order manifest is no longer available in your active stream.</p>
        <button onClick={() => router.back()} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest">Return to Pipeline</button>
      </div>
    );
  }

  const statusConfigs = {
    paid: { color: "bg-blue-600", light: "bg-blue-50 text-blue-600", icon: <FaClock />, label: "Settlement Confirmed" },
    pending: { color: "bg-amber-500", light: "bg-amber-50 text-amber-600", icon: <FaClock />, label: "In Limbo" },
    shipped: { color: "bg-purple-600", light: "bg-purple-50 text-purple-600", icon: <FaShippingFast />, label: "Dispatch Active" },
    delivered: { color: "bg-emerald-600", light: "bg-emerald-50 text-emerald-600", icon: <FaCheckCircle />, label: "Fulfillment Success" },
    cancelled: { color: "bg-rose-600", light: "bg-rose-50 text-rose-600", icon: <FaTimesCircle />, label: "Aborted" },
  };

  const status = statusConfigs[order.status.toLowerCase()] || { color: "bg-gray-600", light: "bg-gray-50 text-gray-600", icon: <FaBox />, label: order.status };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4">
      <ToastContainer />
      
      <button 
        onClick={() => router.back()}
        className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-gray-900 transition-all mb-10"
      >
        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <FaArrowLeft />
        </div>
        Back to Pipeline Stream
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Commercial Detail */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-10 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
             
             <div className="flex flex-col md:flex-row justify-between gap-6 mb-12 relative">
               <div>
                 <span className="text-indigo-600 font-black text-[8px] md:text-[10px] uppercase tracking-[0.4em] mb-2 block">Merchant Fulfillment View</span>
                 <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase">Manifest #{order._id.slice(-12)}</h1>
                 <p className="mt-2 text-[10px] md:text-sm text-gray-500 font-medium italic">Pipeline Entry: {new Date(order.createdAt).toLocaleString()}</p>
               </div>
               <div className={`px-4 py-2 md:px-6 md:py-3 rounded-2xl flex items-center gap-3 border ${status.light} h-fit shadow-sm`}>
                 <div className="scale-75 md:scale-100">{status.icon}</div>
                 <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{status.label}</span>
               </div>
             </div>

             <div className="space-y-6 relative">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><FaBox /></div>
                  Stock Allocation
                </h3>
                <div className="divide-y divide-gray-50">
                  {order.products?.map((item, idx) => (
                    <div key={idx} className="py-4 md:py-6 flex gap-4 md:gap-6 items-center group">
                      <div className="w-12 h-12 md:w-20 md:h-20 bg-gray-50 rounded-2xl relative overflow-hidden shrink-0 border border-gray-100 shadow-inner">
                        {item.productId?.images?.[0]?.url ? (
                          <Image src={item.productId.images[0].url} alt={item.productId.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200 scale-75 md:scale-100"><FaBox /></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 font-mono">ID: {item.productId?._id?.slice(-6) || "N/A"}</p>
                        <h4 className="text-xs md:text-lg font-black text-gray-900 tracking-tight leading-tight">{item.productId?.name || item.name || "Commercial Product"}</h4>
                        <p className="text-[8px] md:text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Inflow Qty: {item.quantity || item.quantity_bought || 1}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm md:text-xl font-black text-indigo-600 tracking-tighter">₦{(item.price || item.productId?.price || 0).toLocaleString()}</p>
                        <p className="text-[8px] md:text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">Vendor Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="mt-8 md:mt-12 pt-8 md:pt-10 border-t-2 border-dashed border-gray-50 flex justify-between items-center relative">
                <p className="text-[10px] md:text-sm font-black text-gray-400 uppercase tracking-widest">Total Transaction Impact</p>
                <div className="text-right">
                  <p className="text-2xl md:text-4xl font-black text-indigo-600 tracking-tighter">₦{order.totalAmount?.toLocaleString()}</p>
                  <p className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Funds Secured</p>
                </div>
             </div>
           </div>
        </div>

        {/* Right: Fulfillment & Logistics */}
        <div className="lg:col-span-1 space-y-8">
           {/* Logistics Target */}
           <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
             <h3 className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-indigo-50 rounded-lg md:rounded-xl flex items-center justify-center text-indigo-600 scale-90 md:scale-100"><FaMapMarkerAlt /></div>
                Logistics Destination
             </h3>
             <div className="space-y-4 md:space-y-6">
                <div>
                  <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivery Sector</p>
                  <p className="text-xs md:text-sm font-bold text-gray-600 leading-relaxed italic border-l-4 border-indigo-100 pl-4 py-2 bg-gray-50 rounded-r-xl">
                    "{order.deliveryAddress || "Recipient has not finalized address."}"
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                   <div className="flex -space-x-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[8px] md:text-[10px] font-black text-indigo-600"><FaUser /></div>
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[8px] md:text-[10px] font-black text-blue-600">ID</div>
                   </div>
                   <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure Client</p>
                </div>
             </div>
           </div>

           {/* Performance Stats */}
           <div className="bg-indigo-900 rounded-[2rem] p-6 md:p-8 text-white shadow-2xl shadow-indigo-900/10 group">
              <h3 className="text-[10px] md:text-xs font-black text-indigo-400 uppercase tracking-widest mb-6 md:mb-8 flex items-center gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center text-white scale-90 md:scale-100"><FaChartLine /></div>
                Market Impact
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] md:text-xs">
                    <span className="text-indigo-200 font-bold">Commission Rate</span>
                    <span className="font-black text-indigo-400">Handled</span>
                 </div>
                 <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                 </div>
                 <p className="text-[8px] md:text-[10px] text-indigo-300 leading-relaxed mt-4 italic">Confirming this order streamlines your merchant credibility metric by 2.4%.</p>
              </div>
           </div>

           {/* Quick Actions */}
           <div className="flex flex-col gap-3 md:gap-4">
              <button 
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-100 py-3 md:py-4 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-900 hover:bg-gray-50 transition-all font-mono"
              >
                <FaReceipt className="scale-90 md:scale-100" /> PRINT PACKAGING SLIP
              </button>
              <button 
                onClick={() => router.push("/vendor-dashboard/inbox-support")}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 py-3 md:py-4 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                 DISPATCH ASSISTANCE <FaArrowRight className="scale-90 md:scale-100" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetails;

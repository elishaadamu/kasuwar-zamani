"use client";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_CONFIG, apiUrl } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/Loading";
import { 
  FaBoxOpen, 
  FaMapMarkerAlt, 
  FaArrowRight, 
  FaMoneyBillWave, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaPlusCircle 
} from "react-icons/fa";

const DeliveryAssignmentsPage = () => {
  const { userData, authLoading } = useAppContext();
  const router = useRouter();
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Support two possible shapes: either userData is the user object or it has a `user` property
  const currentUser = userData?.user ?? userData;

  useEffect(() => {
    const fetchDeliveryRequests = async () => {
      if (authLoading) return;
      if (!userData) {
        router.push("/delivery-signin");
        return;
      }

      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.DELIVERY.GET_DELIVERY + currentUser._id)
        );
        setDeliveryRequests(response.data.requests || response.data);
      } catch (error) {
        toast.error("Failed to fetch delivery requests");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryRequests();
  }, [currentUser._id, userData, authLoading, router]);

  const handleAccept = async (requestId) => {
    try {
      await axios.put(
        apiUrl(API_CONFIG.ENDPOINTS.DELIVERY.ACCEPT_DELIVERY + currentUser?._id + "/" + requestId),
        {}
      );
      setDeliveryRequests(prev => prev.map(req => req._id === requestId ? { ...req, deliveryManStatus: "accepted", status: "accepted" } : req));
      toast.success("Delivery request accepted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.put(
        apiUrl(API_CONFIG.ENDPOINTS.DELIVERY.REJECT_DELIVERY + currentUser?._id + "/" + requestId),
        {}
      );
      setDeliveryRequests(prev => prev.filter(req => req._id !== requestId));
      toast.success("Delivery request rejected");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject");
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  if (loading) return <Loading fullScreen={false} />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <ToastContainer />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <FaBoxOpen className="text-blue-600" />
          Delivery Tasks
        </h1>
        <p className="text-gray-500 mt-1">Accept and manage your delivery assignments</p>
      </div>

      {deliveryRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBoxOpen className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Requests</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">You don't have any delivery requests at the moment. Check back later!</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">Refresh Feed</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveryRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  request.deliveryManStatus === 'accepted' ? 'bg-green-50 text-green-700 border-green-100' :
                  'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {request.deliveryManStatus || 'Pending'}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Fee</p>
                  <p className="text-xl font-black text-blue-600">₦{(request.approvedPrice || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex flex-col items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-blue-50"></div>
                    <div className="w-0.5 h-10 bg-gray-100 border-l border-dashed border-gray-300"></div>
                    <FaMapMarkerAlt className="text-red-500 w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pickup</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{request.senderState}, {request.senderLGA}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Drop-off</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{request.receipientState}, {request.receipientLGA}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {(request.deliveryManStatus === "pending" || request.status === "assigned") ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(request._id)} className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition flex items-center justify-center gap-2">
                      <FaCheckCircle /> Accept
                    </button>
                    <button onClick={() => handleReject(request._id)} className="px-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition border border-red-100">
                      <FaTimesCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => router.push(`/delivery-dashboard`)} className="w-full bg-blue-50 text-blue-700 py-3 rounded-xl text-sm font-bold hover:bg-blue-100 transition flex items-center justify-center gap-2">
                    Active in Dashboard
                  </button>
                )}
                <button onClick={() => handleViewDetails(request)} className="w-full bg-white text-gray-700 py-2.5 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 transition">View Full Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Premium Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl my-auto shadow-2xl overflow-hidden border border-gray-100 animate-scaleIn">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Assignment Details</h2>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition">
                <FaTimesCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Route Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1">From</p>
                    <p className="text-lg font-bold truncate">{selectedRequest.senderState}</p>
                    <p className="text-xs text-blue-200 truncate">{selectedRequest.senderLGA}</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <FaArrowRight className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1">To</p>
                    <p className="text-lg font-bold truncate">{selectedRequest.receipientState}</p>
                    <p className="text-xs text-blue-200 truncate">{selectedRequest.receipientLGA}</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-blue-100">Delivery Earnings</p>
                    <p className="text-2xl font-black">₦{selectedRequest.approvedPrice.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-100">Request ID</p>
                    <p className="text-xs font-mono font-bold">#{selectedRequest._id.slice(-10).toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Pickup Information</h4>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-sm font-bold text-gray-800">{selectedRequest.senderName}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedRequest.senderPhone}</p>
                      <p className="text-xs text-gray-600 mt-2 italic">"{selectedRequest.senderAddress}"</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Recipient Information</h4>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-sm font-bold text-gray-800">{selectedRequest.receipientName}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedRequest.receipientPhone}</p>
                      <p className="text-xs text-gray-600 mt-2 italic">"{selectedRequest.receipientAddress}"</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl text-amber-500">
                  <FaClock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Delivery Deadline</p>
                  <p className="text-sm font-bold text-amber-900 capitalize">{selectedRequest.deliveryDuration} Delivery</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50/50 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-white text-gray-700 py-4 rounded-2xl text-sm font-bold border border-gray-200 hover:bg-gray-50 transition">Dismiss</button>
              {(selectedRequest.deliveryManStatus === "pending" || selectedRequest.status === "assigned") && (
                <button onClick={() => { handleAccept(selectedRequest._id); setShowModal(false); }} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">Accept Task</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAssignmentsPage;

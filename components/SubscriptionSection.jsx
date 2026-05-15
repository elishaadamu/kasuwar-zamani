"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, API_CONFIG } from "@/configs/api";
import axios from "axios";
import { FaGem, FaBolt, FaCrown, FaCheck, FaArrowRight } from "react-icons/fa";

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.GET_ALL),
        { withCredentials: true }
      );
      setPlans(response.data.plans);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    router.push(`/subscription/payment?subscriptionId=${plan._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-[2rem] p-8 bg-white h-[400px] animate-pulse border border-gray-100 shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center p-10 bg-white rounded-[2rem] border border-red-50 shadow-xl max-w-md mx-6">
          <div className="text-red-500 text-3xl mb-4">!</div>
          <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Connection Error</h2>
          <p className="text-gray-500 font-medium mb-6 text-sm">{error}</p>
          <button
            onClick={fetchSubscriptionPlans}
            className="w-full bg-[#004AAD] text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#003D8F] transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden px-6 lg:px-12">

      {/* Background Accents (Subtle) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#004AAD]/5 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#EBF2FF] rounded-full blur-[100px] translate-y-1/3" />
      </div>

      <div className="max-w-6xl mx-auto relative">

        {/* Header Section (Scaled Down) */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white shadow-sm border border-gray-100 mb-6">
            <div className="w-1.5 h-1.5 bg-[#004AAD] rounded-full animate-ping" />
            <span className="text-[#004AAD] font-black text-[9px] uppercase tracking-[0.3em]">Subscription Plans</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight mb-4">
            Power Your <span className="text-[#004AAD]">Sales</span>
          </h1>

          <p className="text-base text-gray-500 font-medium max-w-xl leading-relaxed">
            Select the perfect membership tier to unlock advanced merchant features and reach more buyers.
          </p>
        </div>

        {/* Pricing Grid (More Compact) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => {
            const isPopular = index === 1;
            const Icon = index === 0 ? FaBolt : index === 1 ? FaCrown : FaGem;

            return (
              <div
                key={plan._id}
                className={`group relative flex flex-col rounded-[2rem] p-8 transition-all duration-500 border ${isPopular
                    ? "bg-[#004AAD] border-[#004AAD] text-white shadow-xl scale-105 z-10"
                    : "bg-white border-gray-100 text-gray-900 shadow-sm hover:shadow-md hover:-translate-y-2"
                  }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-yellow-400 text-gray-900 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg">
                    Recommended
                  </div>
                )}

                {/* Plan Identity */}
                <div className="mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${isPopular ? 'bg-white/10' : 'bg-[#EBF2FF]'
                    }`}>
                    <Icon className={`w-6 h-6 ${isPopular ? 'text-white' : 'text-[#004AAD]'}`} />
                  </div>

                  <h3 className="text-xl font-black tracking-tight uppercase mb-4">
                    {plan.package}
                  </h3>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter">
                      ₦{plan.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold opacity-60 uppercase tracking-widest">
                      / {plan.duration} Days
                    </span>
                  </div>
                </div>

                {/* Feature Highlight (Clean & Minimal) */}
                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isPopular ? 'bg-white/20 text-white' : 'bg-[#EBF2FF] text-[#004AAD]'
                      }`}>
                      <FaCheck className="w-2 h-2" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">
                      {plan.products >= 1000 ? "Unlimited" : `${plan.products} Products`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isPopular ? 'bg-white/20 text-white' : 'bg-[#EBF2FF] text-[#004AAD]'
                      }`}>
                      <FaCheck className="w-2 h-2" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">Marketplace Search</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-60">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isPopular ? 'bg-white/20 text-white' : 'bg-[#EBF2FF] text-[#004AAD]'
                      }`}>
                      <FaCheck className="w-2 h-2" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">Vendor Dashboard</span>
                  </div>
                </div>

                {/* Compact Action Button */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full h-14 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md ${isPopular
                      ? "bg-white text-[#004AAD] hover:bg-gray-50"
                      : "bg-gray-900 text-white hover:bg-[#004AAD]"
                    }`}
                >
                  Select Plan
                  <FaArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-12 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Secure Payment · Instant Activation
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;

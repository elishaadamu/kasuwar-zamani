import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, API_CONFIG } from "@/configs/api";
import axios from "axios";
import Image from "next/image";

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
      setError(null); // Reset error state on new fetch
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 sm:p-8 shadow-lg bg-white h-96 animate-pulse"
              >
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mx-auto mb-8"></div>
                <div className="h-16 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-12 bg-gray-200 rounded w-full mt-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg">Error: {error}</p>
          <button
            onClick={fetchSubscriptionPlans}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50  px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 lg:text-5xl">
            Choose Your Subscription Plan
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600">
            Select the plan that best fits your business needs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 items-center">
          {plans.map((plan, index) => {
            const isPopular = index === 1; // Highlight the second plan
            return (
              <div
                key={plan._id}
                className={`relative rounded-2xl p-6 sm:p-8 shadow-lg transition-transform duration-300 ${
                  isPopular
                    ? "bg-blue-600 text-white scale-105"
                    : "bg-white text-gray-900 hover:scale-105"
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <span className="bg-yellow-400 text-blue-900 text-sm font-bold px-4 py-1 rounded-full uppercase">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-xl sm:text-2xl font-bold text-center">
                  {plan.package}
                </h3>
                <p
                  className={`text-center mt-2 text-sm ${
                    isPopular ? "text-blue-200" : "text-gray-500"
                  }`}
                >
                  {plan.description}
                </p>

                <div className="mt-8 text-center">
                  <span className="text-4xl sm:text-5xl font-extrabold">
                    ₦{plan.price.toLocaleString()}
                  </span>
                  <span
                    className={`text-base sm:text-lg ml-1 ${
                      isPopular ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    / {plan.duration} days
                  </span>
                </div>

                <ul className="mt-6 sm:mt-8 space-y-4 text-sm sm:text-base">
                  <li className="flex items-center">
                    <span className="font-semibold">Products Limit:</span>
                    <span className="ml-auto">
                      {plan.products >= 1000 ? "Unlimited" : plan.products}
                    </span>
                  </li>
                </ul>

                {plan.image && (
                  <div className="mt-6">
                    <Image
                      src={plan.image}
                      alt={plan.package}
                      width={400}
                      height={200}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold text-center transition-colors duration-300 ${
                    isPopular
                      ? "bg-white text-blue-600 hover:bg-blue-100"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isPopular ? "focus:ring-white" : "focus:ring-blue-500"
                  }`}
                >
                  Select Plan
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;

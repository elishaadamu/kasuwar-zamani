"use client";

import React, { useState, useEffect, Suspense, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppContext } from "@/context/AppContext";

const SubscriptionPaymentContent = () => {
  const router = useRouter();
  const { userData, isLoggedIn, authLoading } = useContext(AppContext);
  const searchParams = useSearchParams();
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const planId = searchParams.get("subscriptionId");

  useEffect(() => {
    // Wait for the initial authentication check to complete
    if (authLoading) {
      return;
    }

    if (!isLoggedIn || userData?.role !== "vendor") {
      toast.error("Access Denied. Only vendors can subscribe. Redirecting...", {
        autoClose: 5000,
      });
      setTimeout(() => {
        router.push("/vendor-signin");
      }, 5000);
      return; // Stop further execution in this component
    }

    if (planId) {
      fetchSubscriptionDetails(planId);
    }
  }, [planId, isLoggedIn, userData, authLoading, router]);

  useEffect(() => {
    // This effect is now combined with the authorization check above
  }, []);

  const fetchSubscriptionDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.GET_ALL),
        { withCredentials: true }
      );

      const allPlans = response.data.plans || [];
      const selectedPlan = allPlans.find((plan) => plan._id === id);

      if (selectedPlan) {
        setSubscriptionPlan(selectedPlan);
      } else {
        setError("The selected subscription plan could not be found.");
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load subscription details.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      const payload = {
        vendorId: userData?.id,
        planId: planId,
      };
      console.log("Payment payload:", payload);

      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.SUBSCRIBE), // Changed to SUBSCRIBE endpoint
        payload,
        { withCredentials: true }
      );

      const result = response.data;

      // Show success message
      console.log("Payment successful:", result);
      toast.success(result.message || "Subscription successful!");
      setTimeout(() => {
        router.push("/vendor-dashboard/my-subscription");
      }, 2000); // Delay redirect to allow user to see the success message
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error.response?.data?.message || "Payment failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Render nothing or a loading state while auth is being checked or redirecting
  if (authLoading || !isLoggedIn || userData?.role !== "vendor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !subscriptionPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <p className="text-red-600 text-lg">
            {error || "Subscription plan not found"}
          </p>
          <button
            onClick={() => router.push("/subscription")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Subscription
          </h1>
          <p className="mt-2 text-gray-600">
            Enter your payment details to activate your plan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {subscriptionPlan.package}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {subscriptionPlan.description}
                  </p>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  ₦{subscriptionPlan.price}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Products Limit:</span>
                  <span className="font-medium">
                    {subscriptionPlan.products >= 1000
                      ? "Unlimited"
                      : subscriptionPlan.products}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {subscriptionPlan.duration} days
                  </span>
                </div>
              </div>

              {subscriptionPlan.image && (
                <div className="mt-4">
                  <img
                    src={subscriptionPlan.image}
                    alt={subscriptionPlan.package}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Confirm Subscription
            </h2>
            <p className="text-gray-600 mb-6">
              You are about to subscribe to the{" "}
              <strong>{subscriptionPlan.package}</strong> plan. Click the button
              below to proceed.
            </p>

            <div className="mt-10 space-y-1">
              <button
                type="button"
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing...
                  </div>
                ) : (
                  `Pay ₦${subscriptionPlan.price} Now`
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/subscription")}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200"
              >
                Back to Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriptionPayment = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubscriptionPaymentContent />
    </Suspense>
  );
};

export default SubscriptionPayment;

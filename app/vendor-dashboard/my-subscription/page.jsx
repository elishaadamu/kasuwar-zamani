"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { AppContext } from "@/context/AppContext";
import {
  FaStar,
  FaBoxOpen,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import Link from "next/link";

const MySubscriptionPage = () => {
  const { userData, authLoading } = useContext(AppContext);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) {
      return; // Wait for user data to be loaded
    }

    if (!userData || userData.role !== "vendor") {
      router.push("/vendor-signin"); // Redirect if not a logged-in vendor
      return;
    }

    const fetchSubscriptionDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, check if the vendor can post products.
        // NOTE: Assuming an endpoint like 'SUBSCRIPTION.CHECK_STATUS' exists in your API_CONFIG.
        const statusResponse = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CHECK_STATUS + userData.id),
          { withCredentials: true }
        );

        // If canPostProduct is false, set an error and do not proceed.
        if (statusResponse.data?.canPostProduct === false) {
          setError("You do not have an active subscription.");
          setLoading(false);
          return;
        }

        // If the status check passes, fetch the full subscription details.
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.GET_DETAILS + userData.id),
          { withCredentials: true }
        );

        if (response.data.success && response.data.subscription) {
          setSubscription(response.data.subscription);
        } else {
          setError("You do not have an active subscription.");
        }
      } catch (err) {
        console.error("Error fetching subscription details:", err);
        const errorMessage =
          err.response?.data?.message ||
          "Failed to load subscription details. You may not have an active plan.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, [userData, authLoading, router]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center text-center">
          <FaTimesCircle className="text-red-500 text-5xl mb-4" />
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link
            href="/vendor-dashboard/subscription-plans"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Subscription Plans
          </Link>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return null; // Should be handled by error state
  }

  const { plan, startDate, endDate, status } = subscription;
  const isActive = status === "active";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Subscription</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaStar className="text-yellow-400 mr-2" /> {plan.package} Plan
            </h2>
            <span
              className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isActive ? (
                <FaCheckCircle className="mr-2" />
              ) : (
                <FaTimesCircle className="mr-2" />
              )}
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-4 sm:mt-0">
            ₦{plan.price}
            <span className="text-base font-medium text-gray-500">
              /{plan.duration} days
            </span>
          </div>
        </div>

        <p className="text-gray-600 mb-6">{plan.description}</p>

        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700 flex items-center">
              <FaBoxOpen className="mr-2 text-gray-500" />
              Products Limit:
            </span>
            <span className="font-medium text-gray-900">
              {plan.products >= 1000 ? "Unlimited" : plan.products}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700 flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-500" />
              Start Date:
            </span>
            <span className="font-medium text-gray-900">
              {formatDate(startDate)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700 flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-500" />
              End Date:
            </span>
            <span className="font-medium text-gray-900">
              {formatDate(endDate)}
            </span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/vendor-dashboard/subscription-plans"
            className="w-full sm:w-auto bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
          >
            Upgrade or Renew Plan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MySubscriptionPage;

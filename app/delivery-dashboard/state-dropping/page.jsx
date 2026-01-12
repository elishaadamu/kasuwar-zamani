"use client";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_CONFIG, apiUrl } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StateDropping = () => {
  const { userData, authLoading } = useAppContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      if (authLoading) return;

      if (!userData) {
        router.push("/signin");
        return;
      }

      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_SELLER_ORDERS),
          {
            withCredentials: true,
          }
        );
        // Filter deliveries for state dropping (you might want to adjust this based on your actual data structure)
        const stateDropDeliveries = response.data.filter(
          (delivery) =>
            delivery.status === "on delivery" &&
            delivery.pickupAddress.state !== delivery.dropoffAddress.state
        );
        setDeliveries(stateDropDeliveries);
      } catch (error) {
        toast.error("Failed to fetch state dropping deliveries");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [userData, authLoading, router]);

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      await axios.put(apiUrl(API_CONFIG.ENDPOINTS.ORDER.UPDATE_STATUS), {
        orderId: deliveryId,
        status: newStatus,
      });

      toast.success(`Delivery status updated to ${newStatus}`);

      // Remove the delivery from the list or update its status
      setDeliveries((prev) => prev.filter((d) => d._id !== deliveryId));
    } catch (error) {
      toast.error("Failed to update delivery status");
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <ToastContainer />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">State Dropping</h1>
        <p className="mt-2 text-gray-600">
          Manage inter-state deliveries at dropping points
        </p>
      </div>

      {/* Deliveries List */}
      {deliveries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg">
            No state dropping deliveries available
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {deliveries.map((delivery) => (
            <div
              key={delivery._id}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              {/* Delivery Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">
                      #{delivery._id.slice(-6)}
                    </h2>
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                      Inter-State Delivery
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-bold text-green-600">
                    ₦{delivery.price.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      handleStatusUpdate(delivery._id, "completed")
                    }
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Mark as Delivered
                  </button>
                </div>
              </div>

              {/* Locations */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Pickup Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Pickup Details</h3>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="text-gray-600">State:</span>
                      <span className="font-medium">
                        {delivery.pickupAddress.state}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">LGA:</span>
                      <span className="font-medium">
                        {delivery.pickupAddress.lga}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">
                        {delivery.pickupAddress.address}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Notable Location:</span>
                      <span className="font-medium">
                        {delivery.pickupAddress.notableLocation}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Drop-off Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Drop-off Details
                  </h3>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="text-gray-600">State:</span>
                      <span className="font-medium">
                        {delivery.dropoffAddress.state}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">LGA:</span>
                      <span className="font-medium">
                        {delivery.dropoffAddress.lga}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">
                        {delivery.dropoffAddress.address}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Notable Location:</span>
                      <span className="font-medium">
                        {delivery.dropoffAddress.notableLocation}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              {delivery.customerDetails && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">
                    Customer Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <p className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">
                        {delivery.customerDetails.name}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium">
                        {delivery.customerDetails.phone}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StateDropping;

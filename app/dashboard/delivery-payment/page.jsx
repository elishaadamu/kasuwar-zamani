"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import PinInput from "@/components/PinInput";
import { message } from "antd";

const DeliveryPaymentPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewRequest, setViewRequest] = useState(null); // For viewing details
  const [paying, setPaying] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // Dropdown component for actions
  const DropdownMenu = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        {isOpen && (
          <div
            className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <div className="py-1" role="none">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getUserId = () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return null;
      const data = decryptData(user);
      return data?.id || null;
    } catch (err) {
      return null;
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    setFetchError(null);
    const userId = getUserId();
    if (!userId) {
      setFetchError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.DELIVERY.GET_USER_REQUESTS + userId),
        {
          withCredentials: true,
        }
      );
      console.log("Fetched requests:", res.data);
      setRequests(res.data.requests || []);
    } catch (error) {
      console.error("Failed to fetch delivery requests", error);
      setFetchError(
        error?.response?.data?.message || error.message || "Failed to fetch"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openPayModal = (request) => {
    setSelectedRequest(request);
  };

  const openViewModal = (request) => {
    setViewRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setPin("");
    setPinError("");
  };
  const closeViewModal = () => setViewRequest(null);

  const handlePay = async () => {
    if (!selectedRequest) return;
    const userId = getUserId();
    if (!userId) {
      message.error("You must be signed in to pay.");
      return;
    }

    if (!selectedRequest.approvedPrice) {
      message.error("This request has no price set yet.");
      return;
    }

    if (!pin || pin.length !== 4) {
      setPinError("Please enter your 4-digit PIN");
      return;
    }

    setPaying(true);
    try {
      const payload = {
        price: selectedRequest.approvedPrice,
        userId,
        pin: pin,
      };
      console.log("Payload:", { ...payload, pin: pin }); // Log payload without showing the actual PIN
      await axios.put(
        apiUrl(
          API_CONFIG.ENDPOINTS.DELIVERY.PAY_DELIVERY + selectedRequest._id
        ),
        payload
      );
      message.success(
        `Payment of ₦${selectedRequest.approvedPrice.toLocaleString()} successful`
      );
      closeModal();
      fetchRequests();
    } catch (error) {
      console.error("Payment failed", error);
      message.error(error?.response?.data?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        Delivery Requests / Payments
      </h1>

      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : fetchError ? (
        <div className="p-4 text-red-600">{fetchError}</div>
      ) : requests.length === 0 ? (
        <div className="p-4">No delivery requests found.</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pickup
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{r._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.senderAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.receipientAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {r.approvedPrice
                      ? `₦${r.approvedPrice.toLocaleString()}`
                      : "Not set"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`p-2 inline-flex text-[16px] leading-5  rounded-[10px]
                      ${
                        r.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : r.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : r.status === "assigned"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {r.status || "Processing"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`p-2 inline-flex text-[16px] leading-5  rounded-[10px] ${
                        r.isPaid
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {r.isPaid ? "Paid" : "Not Paid"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <button
                        onClick={() => openViewModal(r)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => openPayModal(r)}
                        disabled={!r.approvedPrice || r.isPaid}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          r.isPaid
                            ? "text-green-600 cursor-not-allowed"
                            : r.approvedPrice
                            ? "text-blue-600 hover:bg-blue-700 hover:text-white"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        role="menuitem"
                      >
                        {r.isPaid ? "✓ Paid" : "Pay Now"}
                      </button>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Confirm Payment
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Request ID</span>
                <span className="font-semibold text-gray-900">
                  #{selectedRequest._id.slice(-6)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-2xl text-gray-900">
                  ₦{selectedRequest.approvedPrice.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your 4-digit PIN to confirm payment
                </label>
                <div className="flex justify-center mb-1">
                  <PinInput
                    length={4}
                    initialValue=""
                    onChange={(value) => {
                      setPin(value);
                      setPinError("");
                    }}
                    type="number"
                    inputMode="number"
                    style="default"
                    inputStyle="w-12 h-12 border-2 rounded-lg mx-1 text-center text-xl"
                    inputFocusStyle="border-green-500 ring-2 ring-green-200"
                    autoSelect={true}
                    regexCriteria={/^[ 0-9_]$/}
                  />
                </div>
                {pinError && (
                  <p className="text-red-500 text-sm text-center mt-1">
                    {pinError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                disabled={paying}
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={paying}
              >
                {paying ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full m-4 transform transition-all">
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Request Details{" "}
                <span className="text-gray-500">
                  #{viewRequest._id.slice(-6)}
                </span>
              </h2>
              <button
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
              {/* Delivery Man Details */}
              {viewRequest.deliveryMan && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center mb-4">
                    <svg
                      className="w-6 h-6 text-blue-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <h3 className="font-bold text-lg text-blue-900">
                      Assigned Delivery Person
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <span className="text-sm text-blue-600 block">
                        Full Name
                      </span>
                      <span className="font-medium text-gray-900">
                        {viewRequest.deliveryMan.firstName}{" "}
                        {viewRequest.deliveryMan.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-blue-600 block">
                        Phone Number
                      </span>
                      <span className="font-medium text-gray-900">
                        {viewRequest.deliveryMan.phone}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-blue-600 block">
                        Company
                      </span>
                      <span className="font-medium text-gray-900">
                        {viewRequest.deliveryMan.companyName}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sender & Recipient Details */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-4">
                    <svg
                      className="w-5 h-5 text-gray-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    <h3 className="font-bold text-lg text-gray-900">Sender</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 block">Name</span>
                      <span className="font-medium text-gray-900">
                        {viewRequest.senderName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Phone</span>
                      <span className="font-medium text-gray-900">
                        {viewRequest.senderPhone}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">
                        Address
                      </span>
                      <span className="font-medium text-gray-900">
                        {viewRequest.senderAddress}, {viewRequest.senderLGA},{" "}
                        {viewRequest.senderState}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-4">
                    <svg
                      className="w-5 h-5 text-gray-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <h3 className="font-bold text-lg text-gray-900">
                      Recipient
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 block">Name</span>
                      <span className="font-medium text-gray-900">
                        {viewRequest.receipientName}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">Phone</span>
                      <span className="font-medium text-gray-900">
                        {viewRequest.receipientPhone}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block">
                        Address
                      </span>
                      <span className="font-medium text-gray-900">
                        {viewRequest.receipientAddress},{" "}
                        {viewRequest.receipientLGA},{" "}
                        {viewRequest.receipientState}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Details */}
              <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                <div>
                  <span className="text-sm text-gray-500 block">
                    Description
                  </span>
                  <span className="font-medium text-gray-900">
                    {viewRequest.description}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">
                    Delivery Duration
                  </span>
                  <span className="font-medium text-gray-900">
                    {viewRequest.deliveryDuration}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">
                    Payment Status
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      viewRequest.isPaid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {viewRequest.isPaid ? "✓ Paid" : "Pending Payment"}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end">
              <button
                onClick={closeViewModal}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPaymentPage;

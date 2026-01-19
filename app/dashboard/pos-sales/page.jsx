"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { decryptData } from "@/lib/encryption";
import Link from "next/link";

const Header = ({ title }) => (
  <div className="bg-white shadow-md p-6 mb-6 rounded-lg">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
  </div>
);

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

      if (value && index < length - 1) {
        inputRefs.current[index + 1].focus();
      }

      // Auto-submit when PIN is complete
      if (newPin.filter((d) => d === "").length === 0 && index === length - 1) {
        setTimeout(() => onSubmit(), 100);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    if (paste.length === length && /^[0-9]+$/.test(paste)) {
      const newPin = paste.split("");
      setPin(newPin);
      onChange(newPin.join(""));
      inputRefs.current[length - 1].focus();
      setTimeout(() => onSubmit(), 100);
    }
  };

  return (
    <div className="flex space-x-2 justify-center md:justify-start">
      {pin.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="password"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        />
      ))}
    </div>
  );
};

const POSSales = () => {
  const [posOrders, setPosOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pin, setPin] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [user, setUser] = useState(null);
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "₦";

  useEffect(() => {
    const encryptedUser = localStorage.getItem("user");
    if (encryptedUser) {
      const decryptedUser = decryptData(encryptedUser);
      setUser(decryptedUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPosOrders();
    }
  }, [user]);

  const fetchPosOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_ALL + user.id),
        {
          withCredentials: true,
        },
      );
      console.log("POS Orders Response:", response.data);

      // Combine pending and regular orders
      const pendingOrders = response.data?.pendingPosOrders || [];
      const completedOrders = response.data?.orders || [];
      const allOrders = [...pendingOrders, ...completedOrders];

      setPosOrders(Array.isArray(allOrders) ? allOrders : []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch POS orders",
      );
      console.error("Error fetching POS orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedOrder) {
      toast.error("Please select an order");
      return;
    }

    if (!pin || pin.length !== 4) {
      toast.error("Please enter a valid 4-digit PIN");
      return;
    }

    setPaymentLoading(true);
    try {
      const response = await axios.post(
        apiUrl(`${API_CONFIG.ENDPOINTS.POS.PAY}${selectedOrder._id}`),
        { pin },
        { withCredentials: true },
      );

      toast.success(response.data?.message || "Payment successful!");
      setPin("");
      setSelectedOrder(null);

      // Refresh orders list
      setTimeout(() => {
        fetchPosOrders();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Payment failed. Please try again.";
      toast.error(errorMessage);
      console.error("Payment error:", error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const pendingOrders = posOrders?.filter(
    (order) => order.status === "pending_payment",
  );
  const paidOrders = posOrders?.filter(
    (order) => order.status !== "pending_payment",
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} />

      <Header title="POS Sales Orders" />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : posOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No POS orders found</p>
          <Link href="/dashboard">
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
              Go to Dashboard
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Pending Payment ({pendingOrders.length})
            </h2>

            {pendingOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                No pending orders
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
                      selectedOrder?._id === order._id
                        ? "ring-2 ring-blue-600 shadow-lg"
                        : "hover:shadow-lg"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Order Code</p>
                        <p className="text-lg font-bold text-gray-800">
                          {order.uniqueOrderCode}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          <span className="font-semibold">Sales Manager:</span>{" "}
                          {order.salesManager?.firstName}{" "}
                          {order.salesManager?.lastName}
                        </p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Pending
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-semibold text-gray-800">
                          {order.salesManager?.firstName}{" "}
                          {order.salesManager?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.customerPhone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold text-blue-600">
                          {currency}
                          {order.totalAmount?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Products
                      </h4>
                      <div className="space-y-2">
                        {order.products?.map((product, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm text-gray-700"
                          >
                            <span>
                              {product.name} × {product.quantity}
                            </span>
                            <span className="font-semibold">
                              {currency}
                              {(
                                product.price * product.quantity
                              ).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 border-t pt-3">
                      <p>
                        <span className="font-semibold">Delivery Address:</span>{" "}
                        {order.deliveryAddress}
                      </p>
                      <p className="mt-1">
                        <span className="font-semibold">Location:</span>{" "}
                        {order.lga}, {order.state}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paid Orders */}
            {paidOrders.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Completed Orders ({paidOrders.length})
                </h2>
                <div className="space-y-3">
                  {paidOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {order.uniqueOrderCode}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.salesManager?.firstName}{" "}
                            {order.salesManager?.lastName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {currency}
                            {order.totalAmount?.toLocaleString()}
                          </p>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            Paid
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Make Payment
              </h2>

              {selectedOrder ? (
                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Selected Order</p>
                    <p className="text-lg font-bold text-gray-800 mt-1">
                      {selectedOrder.uniqueOrderCode}
                    </p>
                    <p className="text-xs text-gray-700 mt-2 font-semibold">
                      Sales Manager: {selectedOrder.salesManager?.firstName}{" "}
                      {selectedOrder.salesManager?.lastName}
                    </p>

                    <p className="text-2xl font-bold text-blue-600 mt-4">
                      {currency}
                      {selectedOrder.totalAmount?.toLocaleString()}
                    </p>
                  </div>

                  {/* PIN Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Enter 4-Digit PIN
                    </label>
                    <PinInput
                      length={4}
                      onChange={setPin}
                      onSubmit={handlePayment}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Enter your PIN or paste it
                    </p>
                  </div>

                  {/* Payment Button */}
                  <button
                    onClick={handlePayment}
                    disabled={paymentLoading || pin.length !== 4}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Confirm Payment</span>
                    )}
                  </button>

                  {/* Clear Selection */}
                  <button
                    onClick={() => {
                      setSelectedOrder(null);
                      setPin("");
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Select an order to make payment
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSSales;

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBox,
  FaShoppingCart,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaExternalLinkAlt,
} from "react-icons/fa";

// Order Tracking Modal Component
const OrderTrackingModal = ({ isOpen, onClose }) => {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");

  // Mock order data - replace with actual API call
  const mockOrderData = {
    _id: "ORD12345678",
    customer: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+234 812 345 6789",
    },
    shippingAddress: {
      address: "123 Main Street, Lagos Island",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
    },
    status: "shipped",
    createdAt: "2024-01-15T10:30:00Z",
    estimatedDelivery: "2024-01-20T18:00:00Z",
    items: [
      {
        name: "Wireless Bluetooth Headphones",
        quantity: 1,
        price: 15000,
        image: "/headphones.jpg",
      },
      {
        name: "Phone Case",
        quantity: 2,
        price: 2500,
        image: "/phone-case.jpg",
      },
    ],
    tracking: {
      carrier: "DHL Express",
      trackingNumber: "DHL123456789",
      timeline: [
        {
          status: "ordered",
          title: "Order Placed",
          description: "Your order has been received",
          date: "2024-01-15T10:30:00Z",
          completed: true,
        },
        {
          status: "confirmed",
          title: "Order Confirmed",
          description: "Seller has confirmed your order",
          date: "2024-01-15T14:20:00Z",
          completed: true,
        },
        {
          status: "processing",
          title: "Processing",
          description: "Seller is preparing your order",
          date: "2024-01-16T09:15:00Z",
          completed: true,
        },
        {
          status: "shipped",
          title: "Shipped",
          description: "Your order has been shipped with DHL Express",
          date: "2024-01-17T16:45:00Z",
          completed: true,
        },
        {
          status: "out_for_delivery",
          title: "Out for Delivery",
          description: "Your order is out for delivery",
          date: "2024-01-20T08:30:00Z",
          completed: false,
        },
        {
          status: "delivered",
          title: "Delivered",
          description: "Your order has been delivered",
          date: null,
          completed: false,
        },
      ],
    },
  };

  const trackOrder = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      setError("Please enter a tracking ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes, we'll use mock data
      if (trackingId.toUpperCase().includes("ORD")) {
        setOrderData(mockOrderData);
        toast.success("Order found successfully!");
      } else {
        setError(
          "Order not found. Please check your tracking ID and try again."
        );
        toast.error("Order not found");
      }
    } catch (err) {
      setError("Failed to track order. Please try again.");
      toast.error("Tracking failed");
    } finally {
      setLoading(false);
    }
  };

  const resetTracking = () => {
    setTrackingId("");
    setOrderData(null);
    setError("");
  };

  const getStatusIcon = (status, completed) => {
    if (completed) {
      return <FaCheckCircle className="w-5 h-5 text-green-500" />;
    }

    const iconMap = {
      ordered: FaClock,
      confirmed: FaCheckCircle,
      processing: FaBox,
      shipped: FaTruck,
      out_for_delivery: FaTruck,
      delivered: FaCheckCircle,
    };

    const IconComponent = iconMap[status] || FaClock;
    return <IconComponent className="w-5 h-5 text-gray-400" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Pending";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCurrentStepIndex = () => {
    if (!orderData?.tracking?.timeline) return -1;
    return orderData.tracking.timeline.findIndex((step) => !step.completed);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <FaTruck className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Track Your Order
              </h2>
            </div>
            <button
              onClick={() => {
                resetTracking();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimesCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Search Form */}
          {!orderData && (
            <div className="mb-6">
              <form onSubmit={trackOrder} className="space-y-4">
                <div>
                  <label
                    htmlFor="trackingId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Enter Tracking ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="trackingId"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="Enter your order ID (e.g., ORD12345678)"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <FaTimesCircle className="w-4 h-4" />
                      {error}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    You can find your tracking ID in your order confirmation
                    email or in your order history.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Tracking...
                      </>
                    ) : (
                      <>
                        <FaSearch className="w-4 h-4" />
                        Track Order
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetTracking();
                      onClose();
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Order Tracking Results */}
          {orderData && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <FaShoppingCart className="w-4 h-4 text-blue-600" />
                      Order Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Order ID:</span>{" "}
                        <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                          #{orderData._id}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Order Date:</span>{" "}
                        {formatDate(orderData.createdAt)}
                      </p>
                      <p>
                        <span className="font-medium">Estimated Delivery:</span>{" "}
                        {formatDate(orderData.estimatedDelivery)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <FaTruck className="w-4 h-4 text-green-600" />
                      Shipping Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Carrier:</span>{" "}
                        {orderData.tracking.carrier}
                      </p>
                      <p>
                        <span className="font-medium">Tracking Number:</span>{" "}
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {orderData.tracking.trackingNumber}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        <span className="capitalize font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {orderData.status.replace("_", " ")}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FaUser className="w-4 h-4 text-gray-600" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaUser className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {orderData.customer.name}
                        </p>
                        <p className="text-gray-500">
                          {orderData.customer.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">
                        {orderData.customer.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Delivery Address
                      </p>
                      <p className="text-gray-600">
                        {orderData.shippingAddress.address}
                      </p>
                      <p className="text-gray-600">
                        {orderData.shippingAddress.city},{" "}
                        {orderData.shippingAddress.state}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Order Items
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {orderData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center mr-3">
                          <FaBox className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × ₦
                            {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                    <p className="text-base font-medium text-gray-900">
                      Total Amount
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      ₦{calculateTotal(orderData.items).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Shipping Progress
                </h3>
                <div className="space-y-4">
                  {orderData.tracking.timeline.map((step, index) => {
                    const isCurrentStep = index === getCurrentStepIndex();
                    const isCompleted = step.completed;

                    return (
                      <div key={step.status} className="flex items-start">
                        {/* Timeline line and icon */}
                        <div className="flex flex-col items-center mr-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : isCurrentStep
                                ? "bg-blue-500 text-white ring-2 ring-blue-200"
                                : "bg-gray-300 text-gray-500"
                            }`}
                          >
                            {getStatusIcon(step.status, isCompleted)}
                          </div>
                          {index < orderData.tracking.timeline.length - 1 && (
                            <div
                              className={`w-0.5 h-12 ${
                                isCompleted ? "bg-green-500" : "bg-gray-300"
                              }`}
                            ></div>
                          )}
                        </div>

                        {/* Step content */}
                        <div className="flex-1 pb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p
                                className={`font-medium ${
                                  isCompleted
                                    ? "text-green-700"
                                    : isCurrentStep
                                    ? "text-blue-700"
                                    : "text-gray-500"
                                }`}
                              >
                                {step.title}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {step.description}
                              </p>
                            </div>
                            <span
                              className={`text-sm whitespace-nowrap ml-4 ${
                                step.date ? "text-gray-500" : "text-gray-400"
                              }`}
                            >
                              {formatDate(step.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={resetTracking}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <FaSearch className="w-4 h-4" />
                  Track Another Order
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Order Tracking Component
const OrderTracking = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [userData, setUserData] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Status", color: "gray" },
    { value: "pending", label: "Pending", color: "yellow" },
    { value: "confirmed", label: "Confirmed", color: "blue" },
    { value: "processing", label: "Processing", color: "purple" },
    { value: "shipped", label: "Shipped", color: "indigo" },
    { value: "delivered", label: "Delivered", color: "green" },
    { value: "cancelled", label: "Cancelled", color: "red" },
  ];

  const dateOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ];

  useEffect(() => {
    const encryptedUser = localStorage.getItem("user");
    if (encryptedUser) {
      const decryptedUserData = decryptData(encryptedUser);
      setUserData(decryptedUserData);
      fetchOrders(decryptedUserData.id);
    }
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const fetchOrders = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_SELLER_ORDERS + "/" + userId),
        { withCredentials: true }
      );
      if (response.data.orders) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        switch (dateFilter) {
          case "today":
            return orderDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return orderDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      await axios.put(
        apiUrl(API_CONFIG.ENDPOINTS.ORDER.UPDATE + orderId),
        { status: newStatus },
        { withCredentials: true }
      );

      toast.success(`Order status updated to ${newStatus}`);

      // Refresh orders
      if (userData) {
        fetchOrders(userData.id);
      }

      // Close modal if open
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      processing: "bg-purple-100 text-purple-800 border-purple-200",
      shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      pending: FaClock,
      confirmed: FaCheckCircle,
      processing: FaBox,
      shipped: FaTruck,
      delivered: FaCheckCircle,
      cancelled: FaTimesCircle,
    };
    return iconMap[status] || FaClock;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotal = (order) => {
    return (
      order.items?.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ) || 0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <ToastContainer />

      {/* Customer Tracking Modal */}
      <OrderTrackingModal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order Tracking
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage and track all your customer orders
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <button
                onClick={() => setShowTrackingModal(true)}
                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <FaExternalLinkAlt className="w-4 h-4 mr-2" />
                Customer Tracking
              </button>
              <Link
                href="/vendor-dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by order ID, customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Total Orders
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaClock className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaTruck className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Processing</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {
                    orders.filter(
                      (o) => o.status === "processing" || o.status === "shipped"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Delivered</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter((o) => o.status === "delivered").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order._id.slice(-8).toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.customer?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₦{calculateTotal(order).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <FaEye className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaBox className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No orders found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {orders.length === 0
                  ? "You haven't received any orders yet."
                  : "No orders match your current filters."}
              </p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Order #{selectedOrder._id.slice(-8).toUpperCase()}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimesCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Order Items
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedOrder.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0"
                        >
                          <div className="flex items-center">
                            <img
                              src={item.image || "/placeholder-product.jpg"}
                              alt={item.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                        <p className="text-base font-medium text-gray-900">
                          Total
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          ₦{calculateTotal(selectedOrder).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Customer Information
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <FaUser className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {selectedOrder.customer?.name}
                          </span>
                        </div>
                        <div className="flex items-center mb-2">
                          <FaPhone className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {selectedOrder.customer?.phone || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {selectedOrder.shippingAddress?.address || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Update Status
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2">
                          {statusOptions
                            .filter((option) => option.value !== "all")
                            .map((option) => (
                              <button
                                key={option.value}
                                onClick={() =>
                                  updateOrderStatus(
                                    selectedOrder._id,
                                    option.value
                                  )
                                }
                                disabled={
                                  loading ||
                                  selectedOrder.status === option.value
                                }
                                className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
                                  selectedOrder.status === option.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {option.label}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Current Status */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Current Status
                      </h3>
                      <div
                        className={`p-3 rounded-lg border ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        <div className="flex items-center">
                          {React.createElement(
                            getStatusIcon(selectedOrder.status),
                            {
                              className: "w-5 h-5 mr-2",
                            }
                          )}
                          <span className="font-medium capitalize">
                            {selectedOrder.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;

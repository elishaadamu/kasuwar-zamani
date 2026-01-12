"use client";
import React, { useState, useEffect } from "react";
import {
  FaCopy,
  FaTicketAlt,
  FaCalendarAlt,
  FaPercentage,
  FaTag,
  FaSearch,
  FaFilter,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useAppContext } from "@/context/AppContext";
import { apiUrl, API_CONFIG } from "@/configs/api";

const CouponPage = () => {
  const { userData } = useAppContext();
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isClient, setIsClient] = useState(false);
  const businessName = "Kasuwar Zamani";

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (userData?.id) {
      fetchCoupons(userData.id);
    }
  }, [userData]);

  useEffect(() => {
    filterCoupons();
  }, [coupons, searchTerm, filterStatus]);

  const fetchCoupons = async (creatorId) => {
    setLoading(true);
    try {
      if (!creatorId) {
        toast.error("Could not identify user. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.COUPON.GET_ALL),
        {
          withCredentials: true,
        }
      );
      console.log(response.data);
      // Map API response to frontend state structure
      const fetchedCoupons = response.data.coupons.map((coupon) => ({
        id: coupon._id,
        ...coupon,
        discountValue: coupon.discountAmount,
        minOrderAmount: coupon.minimumOrderAmount,
      }));

      setCoupons(fetchedCoupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  };

  const filterCoupons = () => {
    let filtered = coupons;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (coupon) =>
          coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((coupon) =>
        filterStatus === "active" ? coupon.isActive : !coupon.isActive
      );
    }

    setFilteredCoupons(filtered);
  };

  const copyToClipboard = (text) => {
    if (!isClient || !text) {
      toast.warn("Nothing to copy.");
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => toast.success("Copied to clipboard!"),
      (err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy.");
      }
    );
  };

  const isCouponExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  const getStatusBadge = (coupon) => {
    if (!coupon.isActive) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
          Inactive
        </span>
      );
    }
    if (isCouponExpired(coupon.validUntil)) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
          Expired
        </span>
      );
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
          Limit Reached
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
        Active
      </span>
    );
  };

  const getDiscountText = (coupon) => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}% OFF`;
    }
    return `₦${coupon.discountValue.toLocaleString()} OFF`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
              {businessName} Coupons
            </h1>
            <p className="text-lg text-gray-600 capitalize">
              Check coupons for customers
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Coupons
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {coupons.length}
                </p>
              </div>
              <FaTicketAlt className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Coupons
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    coupons.filter(
                      (c) => c.isActive && !isCouponExpired(c.validUntil)
                    ).length
                  }
                </p>
              </div>
              <FaTag className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)}
                </p>
              </div>
              <FaPercentage className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coupons.filter((c) => isCouponExpired(c.validUntil)).length}
                </p>
              </div>
              <FaCalendarAlt className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search coupons by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Coupons Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
                  coupon.isActive && !isCouponExpired(coupon.validUntil)
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {coupon.code}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(coupon)}
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {coupon.discountType === "percentage"
                            ? "Percentage"
                            : "Fixed Amount"}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`p-2 rounded-full cursor-not-allowed ${
                        coupon.isActive ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {coupon.isActive ? <FaEye /> : <FaEyeSlash />}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {getDiscountText(coupon)}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      {coupon.description}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Min Order:</span>
                      <span className="font-medium">
                        ₦{coupon.minOrderAmount?.toLocaleString()}
                      </span>
                    </div>
                    {coupon.discountType === "percentage" &&
                      coupon.maxDiscountAmount && (
                        <div className="flex justify-between">
                          <span>Max Discount:</span>
                          <span className="font-medium">
                            ₦{coupon.maxDiscountAmount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between">
                      <span>Valid Until:</span>
                      <span className="font-medium">
                        {new Date(coupon.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Usage:</span>
                      <span className="font-medium">
                        {coupon.usedCount}/{coupon.usageLimit}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => copyToClipboard(coupon.code)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    >
                      <FaCopy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCoupons.length === 0 && (
          <div className="text-center py-12">
            <FaTicketAlt className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No coupons found
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponPage;

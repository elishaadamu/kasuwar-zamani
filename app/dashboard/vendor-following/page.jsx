"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import VendorCard from "@/components/VendorCard";
import Loading from "@/components/Loading";
import { FaUsers, FaSearch, FaRegSadTear } from "react-icons/fa";
import Link from "next/link";

const FollowingVendorsPage = () => {
  const { userData, isLoggedIn, authLoading } = useAppContext();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter vendors based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVendors(vendors);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = vendors.filter(
      (vendor) =>
        vendor.name?.toLowerCase().includes(query) ||
        vendor.category?.toLowerCase().includes(query) ||
        vendor.description?.toLowerCase().includes(query)
    );
    setFilteredVendors(filtered);
  }, [vendors, searchQuery]);

  const fetchFollowing = useCallback(async () => {
    if (!isLoggedIn || !userData?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Use Promise.all for parallel requests when possible
      const [followingResponse, allVendorsResponse] = await Promise.all([
        axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.FOLLOW.GET_FOLLOWING + userData.id),
          { withCredentials: true }
        ),
        axios.get(apiUrl(API_CONFIG.ENDPOINTS.VENDOR.GET_ALL), {
          withCredentials: true,
        }),
      ]);

      const followedVendorIds = (followingResponse.data.followingVendors || [])
        .map((v) => v._id)
        .filter((id) => id); // Filter out any undefined/null IDs

      if (followedVendorIds.length === 0) {
        setVendors([]);
        return;
      }

      // Create a Set for faster lookups
      const followedVendorSet = new Set(followedVendorIds);
      const fullVendorDetails = (allVendorsResponse.data || [])
        .filter((vendor) => vendor && followedVendorSet.has(vendor._id))
        .sort((a, b) => a.name?.localeCompare(b.name)); // Sort alphabetically

      setVendors(fullVendorDetails);
    } catch (err) {
      console.error("Error fetching followed vendors:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Could not load vendors. Please try again later.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userData?.id, isLoggedIn]);

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn || !userData?.id) {
      setLoading(false);
      return;
    }

    fetchFollowing();
  }, [userData, isLoggedIn, authLoading, fetchFollowing]);

  const handleRetry = () => {
    fetchFollowing();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <FaUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to view the vendors you're following.
            </p>
            <Link
              href="/signin"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Following
                </h1>
                <p className="text-gray-600 mt-1">
                  {vendors.length} vendor{vendors.length !== 1 ? "s" : ""}{" "}
                  followed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">!</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Unable to load vendors
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors duration-200 whitespace-nowrap"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loading />
          </div>
        )}

        {/* Vendors Grid */}
        {!loading && filteredVendors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-6">
            {filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor._id}
                {...vendor}
                className="transition-transform duration-200 hover:scale-105"
              />
            ))}
          </div>
        )}

        {/* No Results from Search */}
        {!loading && vendors.length > 0 && filteredVendors.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <FaSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No vendors found
            </h3>
            <p className="text-gray-600 mb-4">
              No vendors match your search for "{searchQuery}".
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Empty State - Not following any vendors */}
        {!loading && !error && vendors.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <FaRegSadTear className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Not following any vendors yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Start following your favorite vendors to see them here and stay
              updated with their latest offerings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/all-vendors"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Discover Vendors
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowingVendorsPage;

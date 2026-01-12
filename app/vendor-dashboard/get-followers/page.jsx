"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import Loading from "@/components/Loading";
import {
  FaUsers,
  FaUserCircle,
  FaEnvelope,
  FaCalendar,
  FaSearch,
  FaSync,
  FaExclamationTriangle,
} from "react-icons/fa";
import Link from "next/link";

const GetFollowersPage = () => {
  const { userData, isLoggedIn, authLoading } = useAppContext();
  const [followers, setFollowers] = useState([]);
  const [filteredFollowers, setFilteredFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filter followers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFollowers(followers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = followers.filter(
      (follower) =>
        follower.firstName?.toLowerCase().includes(query) ||
        follower.lastName?.toLowerCase().includes(query) ||
        follower.email?.toLowerCase().includes(query)
    );
    setFilteredFollowers(filtered);
  }, [followers, searchQuery]);

  const fetchFollowers = useCallback(async () => {
    if (!isLoggedIn || !userData?.id || userData?.role !== "vendor") return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.FOLLOW.GET_FOLLOWERS + userData.id),
        { withCredentials: true }
      );
      const followersData = response.data.followers || [];
      setFollowers(followersData);
      setFilteredFollowers(followersData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching followers:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Could not load your followers. Please try again later.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userData?.id, isLoggedIn, userData?.role]);

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn || !userData?.id || userData?.role !== "vendor") {
      setLoading(false);
      return;
    }

    fetchFollowers();
  }, [userData, isLoggedIn, authLoading, fetchFollowers]);

  const handleRetry = () => {
    fetchFollowers();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Loading your followers...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || userData?.role !== "vendor") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUsers className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vendor Access Required
            </h2>
            <p className="text-gray-600 mb-2">
              You need to be logged in as a vendor to view this page.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              This page shows all users who are following your store.
            </p>
            <div className="space-y-3">
              <Link
                href="/vendor-signin"
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Sign In as Vendor
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <FaUsers className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  My Followers
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <FaUserCircle className="w-4 h-4" />
                    {followers.length} follower
                    {followers.length !== 1 ? "s" : ""}
                  </span>
                  {lastUpdated && (
                    <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                      <FaCalendar className="w-3 h-3" />
                      Updated {formatDate(lastUpdated)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {followers.length > 0 && (
                <div className="relative flex-1 sm:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search followers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  />
                </div>
              )}
              <button
                onClick={fetchFollowers}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSync
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Unable to load followers
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={handleRetry}
                  className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Followers Content */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredFollowers.length > 0 ? (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Follower
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Contact
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Member Since
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFollowers.map((follower) => (
                      <tr
                        key={follower._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {follower.firstName?.[0]}
                                {follower.lastName?.[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {follower.firstName} {follower.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{follower.firstName?.toLowerCase()}
                                {follower.lastName?.[0]?.toLowerCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <FaEnvelope className="w-4 h-4 text-gray-400 mr-2" />
                            {follower.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {follower.createdAt
                            ? formatDate(follower.createdAt)
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Search Results Info */}
              {searchQuery && (
                <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
                  <p className="text-sm text-blue-700">
                    Showing {filteredFollowers.length} of {followers.length}{" "}
                    followers matching "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-6">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaUserCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchQuery ? "No matching followers" : "No followers yet"}
                </h3>
                <p className="text-gray-600 mb-2">
                  {searchQuery
                    ? `No followers found matching "${searchQuery}". Try adjusting your search.`
                    : "When users start following your store, they'll appear here."}
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Share your store to attract more followers and grow your
                  customer base.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Clear Search
                    </button>
                  ) : (
                    <Link
                      href="/vendor-dashboard"
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center"
                    >
                      Go to Dashboard
                    </Link>
                  )}
                  <Link
                    href="/all-vendors"
                    className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200 text-center"
                  >
                    Browse Stores
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {followers.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {followers.length}
              </div>
              <div className="text-sm text-gray-600">Total Followers</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {Math.ceil(followers.length / 10) * 10}+
              </div>
              <div className="text-sm text-gray-600">Potential Reach</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600">Engagement Ready</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetFollowersPage;

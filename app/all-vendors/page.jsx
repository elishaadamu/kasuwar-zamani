"use client";

import React, { useState, useEffect, useMemo } from "react";
import VendorCard from "@/components/VendorCard";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaStar,
  FaStore,
  FaTimes,
  FaSlidersH,
} from "react-icons/fa";

const ITEMS_PER_PAGE = 6;

const AllVendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { isLoggedIn, authLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // If auth finishes and they aren't logged in, stop loading so we can show the prompt
    if (!authLoading && !isLoggedIn) {
      setLoading(false);
      return;
    }

    if (isLoggedIn) {
      const fetchVendors = async () => {
        try {
          const response = await axios.get(
            apiUrl(API_CONFIG.ENDPOINTS.VENDOR.GET_ALL)
          );
          setVendors(response.data || []);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };
      fetchVendors();
    }
  }, [isLoggedIn, authLoading]);

  const filteredAndSorted = useMemo(() => {
    let result = [...vendors];

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter((v) =>
        v.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "rating") {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === "products") {
      result.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    } else if (sortBy === "name") {
      result.sort((a, b) =>
        (a.businessName || "").localeCompare(b.businessName || "")
      );
    } else if (sortBy === "followers") {
      result.sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0));
    }

    return result;
  }, [vendors, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedVendors = filteredAndSorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate visible page numbers (max 5 shown)
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const hasActiveFilters = searchQuery.trim() || sortBy !== "rating";

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("rating");
  };

  if (authLoading || loading) return <Loading />;

  // Sidebar filter content (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Search Vendors
        </label>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Sort By
        </label>
        <div className="flex flex-col gap-1">
          {[
            { key: "rating", label: "Top Rated" },
            { key: "products", label: "Most Products" },
            { key: "followers", label: "Most Followers" },
            { key: "name", label: "Name: A - Z" },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                sortBy === option.key
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-all ${
                  sortBy === option.key
                    ? "border-indigo-600 bg-indigo-600 shadow-sm shadow-indigo-300"
                    : "border-gray-300"
                }`}
              >
                {sortBy === option.key && (
                  <span className="block w-1.5 h-1.5 bg-white rounded-full m-auto mt-[2px]"></span>
                )}
              </span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Quick Stats
        </label>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Vendors</span>
            <span className="text-sm font-bold text-gray-900">
              {vendors.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Products</span>
            <span className="text-sm font-bold text-gray-900">
              {vendors.reduce((sum, v) => sum + (v.productCount || 0), 0)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Avg Rating</span>
            <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
              <FaStar className="text-yellow-400 text-xs" />
              {vendors.length > 0
                ? (
                    vendors.reduce(
                      (sum, v) => sum + (v.averageRating || 0),
                      0
                    ) / vendors.length
                  ).toFixed(1)
                : "0.0"}
            </span>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
        >
          <FaTimes className="text-xs" />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] relative">
      {/* Grid background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)`,
          backgroundSize: `40px 40px`,
        }}
      ></div>

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gray-900 text-white z-10">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-16 pt-16 pb-20 md:pt-20 md:pb-24">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 mb-6">
              <FaStore className="text-indigo-400 text-sm" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
                Verified Sellers Directory
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
              Discover Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-300 to-indigo-400">
                Trusted Vendors
              </span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
              Browse through our curated network of premium sellers.
            </p>
          </div>
        </div>

        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            className="w-full h-8 md:h-12 fill-[#f8fafc]"
          >
            <path d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page subheading + mobile filter button */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-bold text-gray-900">
              {filteredAndSorted.length}
            </span>{" "}
            vendor{filteredAndSorted.length !== 1 ? "s" : ""}
          </p>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-gray-300 transition-all"
          >
            <FaSlidersH className="text-sm" />
            Filters
          </button>
        </div>

        {/* Main Layout: Sidebar + Grid */}
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <FaSlidersH className="text-sm text-indigo-500" />
                Filters
              </h3>
              <FilterContent />
            </div>
          </aside>

          {/* Vendor Grid Area */}
          <div className="flex-1 min-w-0">
            {!isLoggedIn ? (
              <div className="py-24 px-6 flex flex-col items-center text-center bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full justify-center">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <FaStore className="text-4xl text-indigo-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                  Exclusive Vendor Access
                </h3>
                <p className="text-gray-500 max-w-md leading-relaxed mb-8 font-medium">
                  To ensure the privacy and security of our trusted sellers, our vendor directory is exclusively available to registered users.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => router.push("/signin")}
                    className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
                  >
                    Sign In to View
                  </button>
                  <button
                    onClick={() => router.push("/signup")}
                    className="px-8 py-3.5 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            ) : paginatedVendors.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 md:gap-6 mb-14">
                  {paginatedVendors.map((vendor) => (
                    <VendorCard key={vendor._id} {...vendor} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5">
                    {/* Prev */}
                    <button
                      disabled={currentPage === 1}
                      onClick={() => goToPage(currentPage - 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <FaChevronLeft className="text-xs" />
                    </button>

                    {/* Page numbers */}
                    {getPageNumbers()[0] > 1 && (
                      <>
                        <button
                          onClick={() => goToPage(1)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                        >
                          1
                        </button>
                        {getPageNumbers()[0] > 2 && (
                          <span className="text-gray-300 text-sm px-0.5">
                            …
                          </span>
                        )}
                      </>
                    )}

                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                          currentPage === pageNum
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                            : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {getPageNumbers()[getPageNumbers().length - 1] <
                      totalPages && (
                      <>
                        {getPageNumbers()[getPageNumbers().length - 1] <
                          totalPages - 1 && (
                          <span className="text-gray-300 text-sm px-0.5">
                            …
                          </span>
                        )}
                        <button
                          onClick={() => goToPage(totalPages)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    {/* Next */}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="py-20 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
                  <FaSearch className="text-2xl text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No vendors found
                </h3>
                <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-6">
                  We couldn&apos;t find any vendors matching &quot;
                  {searchQuery}&quot;. Try a different search.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          ></div>
          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-[300px] max-w-[85vw] bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaSlidersH className="text-sm text-indigo-500" />
                Filters
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </div>
  );
};

export default AllVendorsPage;

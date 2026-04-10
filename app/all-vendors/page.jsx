"use client";

import React, { useState, useEffect, useMemo } from "react";
import VendorCard from "@/components/VendorCard";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import Loading from "@/components/Loading";
import { FaChevronLeft, FaChevronRight, FaSearch, FaStar, FaStore } from "react-icons/fa";

const ITEMS_PER_PAGE = 6;

const AllVendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.VENDOR.GET_ALL)
        );
        setVendors(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

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

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-16 pt-16 pb-20 md:pt-20 md:pb-28">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 mb-6">
              <FaStore className="text-blue-400 text-sm" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                Verified Sellers Directory
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-[1.1]">
              Discover Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400">
                Trusted Vendors
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-medium leading-relaxed mb-10">
              Browse through our curated network of premium sellers.
              Quality-assured stores, all in one place.
            </p>

            {/* Stats Strip */}
            <div className="flex items-center gap-6 md:gap-10">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-black text-white">
                  {vendors.length}
                </p>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">
                  Active Stores
                </p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-black text-white">
                  {vendors.reduce(
                    (sum, v) => sum + (v.productCount || 0),
                    0
                  )}
                </p>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">
                  Products
                </p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <FaStar className="text-yellow-400 text-lg" />
                  <p className="text-3xl md:text-4xl font-black text-white">
                    {vendors.length > 0
                      ? (
                          vendors.reduce(
                            (sum, v) => sum + (v.averageRating || 0),
                            0
                          ) / vendors.length
                        ).toFixed(1)
                      : "0.0"}
                  </p>
                </div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">
                  Avg Rating
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-8 md:h-12 fill-gray-50">
            <path d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 -mt-2 mb-10">
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 md:p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
            <input
              type="text"
              placeholder="Search vendors by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200 focus:bg-white transition-all"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            {[
              { key: "rating", label: "Top Rated" },
              { key: "products", label: "Most Products" },
              { key: "name", label: "A → Z" },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  sortBy === option.key
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-xs font-bold text-blue-600">
              {filteredAndSorted.length} vendor{filteredAndSorted.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Vendor Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 pb-20">
        {paginatedVendors.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 mb-14">
              {paginatedVendors.map((vendor) => (
                <VendorCard key={vendor._id} {...vendor} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {/* Prev */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <FaChevronLeft className="text-xs" />
                </button>

                {/* Page numbers */}
                {getPageNumbers()[0] > 1 && (
                  <>
                    <button
                      onClick={() => goToPage(1)}
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      1
                    </button>
                    {getPageNumbers()[0] > 2 && (
                      <span className="text-gray-300 text-sm px-1">…</span>
                    )}
                  </>
                )}

                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-11 h-11 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                        : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                  <>
                    {getPageNumbers()[getPageNumbers().length - 1] <
                      totalPages - 1 && (
                      <span className="text-gray-300 text-sm px-1">…</span>
                    )}
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                {/* Next */}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="py-24 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-8">
              <FaSearch className="text-3xl text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
              No vendors found
            </h3>
            <p className="text-gray-500 font-medium max-w-sm leading-relaxed mb-8">
              We couldn&apos;t find any vendors matching &quot;{searchQuery}&quot;. Try a
              different search term.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSortBy("rating");
              }}
              className="px-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-300/30 active:scale-95"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllVendorsPage;

"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import ProductCard from "@/components/ProductCard";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";

const ITEMS_PER_PAGE = 12;

const AllProducts = () => {
  const { products, productsLoading } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET_ALL)
        );
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch category:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategory();
  }, []);

  const validCategories = useMemo(() => {
    return categories.filter((category) =>
      products.some((p) => p.category === category.name)
    );
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          (a.offerPrice || a.price || 0) - (b.offerPrice || b.price || 0)
      );
    } else if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          (b.offerPrice || b.price || 0) - (a.offerPrice || a.price || 0)
      );
    } else if (sortBy === "name") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      result.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const hasActiveFilters =
    searchQuery.trim() || selectedCategory !== "all" || sortBy !== "newest";

  if (!products || productsLoading || categoriesLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Title + Search row */}
          <div className="flex items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight whitespace-nowrap">
                All Products
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500">
                {filteredProducts.length}
              </span>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-xs">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all"
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

          {/* Filters row */}
          <div className="flex items-center gap-3 pb-3 overflow-x-auto scrollbar-hide">
            {/* Category pills */}
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                selectedCategory === "all"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              All
            </button>
            {validCategories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  selectedCategory === cat.name
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800"
                }`}
              >
                {cat.name}
              </button>
            ))}

            {/* Separator */}
            <div className="w-px h-5 bg-gray-200 flex-shrink-0 mx-1" />

            {/* Sort pills */}
            {[
              { key: "newest", label: "New" },
              { key: "price-low", label: "Low ₦" },
              { key: "price-high", label: "High ₦" },
              { key: "name", label: "A-Z" },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  sortBy === option.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSortBy("newest");
                }}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-all flex items-center gap-1"
              >
                <FaTimes className="text-[9px]" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 pb-20">
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-12">
              {paginatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <FaChevronLeft className="text-[10px]" />
                </button>

                {getPageNumbers()[0] > 1 && (
                  <>
                    <button
                      onClick={() => goToPage(1)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      1
                    </button>
                    {getPageNumbers()[0] > 2 && (
                      <span className="text-gray-300 text-xs px-0.5">…</span>
                    )}
                  </>
                )}

                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                  <>
                    {getPageNumbers()[getPageNumbers().length - 1] <
                      totalPages - 1 && (
                      <span className="text-gray-300 text-xs px-0.5">…</span>
                    )}
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <FaChevronRight className="text-[10px]" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
              <FaSearch className="text-2xl text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-6">
              Try adjusting your search or filtering by a different category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSortBy("newest");
              }}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all active:scale-95"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProducts;

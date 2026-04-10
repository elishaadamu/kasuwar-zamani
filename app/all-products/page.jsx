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
  FaSlidersH,
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
  };

  if (!products || productsLoading || categoriesLoading) {
    return <Loading />;
  }

  // Sidebar filter content (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Search</label>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search products..."
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

      {/* Categories */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Categories</label>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
              selectedCategory === "all"
                ? "bg-indigo-50 text-indigo-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            All Categories
            <span className="float-right text-xs text-gray-400 mt-0.5">{products.length}</span>
          </button>
          {validCategories.map((cat) => {
            const count = products.filter((p) => p.category === cat.name).length;
            return (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedCategory === cat.name
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {cat.name}
                <span className="float-right text-xs text-gray-400 mt-0.5">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">Sort By</label>
        <div className="flex flex-col gap-1">
          {[
            { key: "newest", label: "Newest First" },
            { key: "price-low", label: "Price: Low to High" },
            { key: "price-high", label: "Price: High to Low" },
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

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              All Products
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              {selectedCategory !== "all" && ` in ${selectedCategory}`}
            </p>
          </div>

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

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-12">
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
                      <FaChevronLeft className="text-xs" />
                    </button>

                    {getPageNumbers()[0] > 1 && (
                      <>
                        <button
                          onClick={() => goToPage(1)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                        >
                          1
                        </button>
                        {getPageNumbers()[0] > 2 && (
                          <span className="text-gray-300 text-sm px-0.5">…</span>
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

                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                      <>
                        {getPageNumbers()[getPageNumbers().length - 1] <
                          totalPages - 1 && (
                          <span className="text-gray-300 text-sm px-0.5">…</span>
                        )}
                        <button
                          onClick={() => goToPage(totalPages)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
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
                  No products found
                </h3>
                <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-6">
                  Try adjusting your search or filtering by a different category.
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

export default AllProducts;

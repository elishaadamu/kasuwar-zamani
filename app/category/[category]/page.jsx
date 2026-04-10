"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import Loading from "@/components/Loading";
import CategorySidebar from "@/components/CategorySidebar";

const CategoryPage = () => {
  const params = useParams();
  const categorySlug = params.category;
  const { router, products } = useAppContext();

  const [categoryName, setCategoryName] = useState("");

  // Decode category slug and set category name
  useEffect(() => {
    if (categorySlug) {
      const decodedCategory = decodeURIComponent(categorySlug);
      setCategoryName(decodedCategory);
    }
  }, [categorySlug]);

  // Filter products by category from AppContext
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }

    return products.filter((product) => {
      if (!product.category) return false;
      // Case-insensitive comparison
      return product.category.toLowerCase() === categoryName.toLowerCase();
    });
  }, [products, categoryName]);

  const isLoading = !products || products.length === 0;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden font-sans">
      {/* Grid background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)`,
          backgroundSize: `40px 40px`,
        }}
      ></div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-8 p-6 lg:p-10 max-w-[1440px] mx-auto">
        {/* Sidebar */}
        <aside className="w-full lg:w-[280px] lg:sticky lg:top-24 h-fit hidden md:block">
          <CategorySidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Category Title */}
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
              Browse Category
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 capitalize tracking-tight leading-tight">
              {categoryName}
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              We found <span className="text-indigo-600 font-bold">{filteredProducts.length}</span>{" "}
              {filteredProducts.length === 1 ? "premium item" : "premium items"} for you.
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 md:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl shadow-gray-200/50">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Inventory Empty</h3>
              <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8">
                It seems we don't have any products in the <span className="capitalize text-indigo-600 font-bold">{categoryName}</span> category at the moment.
              </p>
              <button
                onClick={() => router.push("/all-products")}
                className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-600/20 transition-all duration-300 active:scale-95"
              >
                Explore All Products
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;

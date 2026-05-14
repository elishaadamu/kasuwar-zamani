"use client";
import React from "react";
import { useAppContext } from "@/context/AppContext";
import ProductCard from "./ProductCard";
import { FaArrowRight } from "react-icons/fa";

const FeaturedProduct = () => {
  const { products, router } = useAppContext();

  // Get the first 3 latest products
  const featuredProducts = products.slice(0, 3);

  if (!featuredProducts.length) return null;

  return (
    <section className="bg-transparent relative z-10 w-full mb-12 overflow-hidden">
      {/* Premium Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#004AAD]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-[#EBF2FF] rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-center md:text-left">
          <div className="max-w-2xl mx-auto md:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004AAD]/5 border border-[#004AAD]/10 mb-4">
              <div className="w-2 h-2 bg-[#004AAD] rounded-full animate-ping" />
              <span className="text-[#004AAD] font-bold text-[10px] uppercase tracking-[0.2em]">
                Exclusive Collection
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[#004AAD] mb-4 tracking-tighter leading-none">
              Featured <br /> <span className="text-gray-900">Premium Picks</span>
            </h2>
            <p className="text-base text-gray-500 font-medium max-w-lg mx-auto md:mx-0">
              Explore our hand-selected assortment of top-tier products, crafted for those who demand excellence.
            </p>
          </div>
          
          <button
            onClick={() => router.push("/all-products")}
            className="group flex items-center justify-center md:justify-start gap-2 text-[#004AAD] font-black text-sm uppercase tracking-wider hover:gap-4 transition-all"
          >
            Explore All
            <FaArrowRight className="w-4 h-4 transition-transform" />
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10 justify-items-center">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct;

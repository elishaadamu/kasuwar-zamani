"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import ProductCard from "./ProductCard";

const CategoryProducts = () => {
  const { products } = useAppContext();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET_ALL),
          { withCredentials: true }
        );
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategory();
  }, []);

  // Filter categories that have at least one product
  const validCategories = useMemo(() => {
    return categories.filter((category) =>
      products.some((p) => p.category === category.name)
    );
  }, [categories, products]);

  if (!products || products.length === 0 || validCategories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-20 py-10">
      {validCategories.map((category) => {
        const categoryProducts = products
          .filter((p) => p.category === category.name)
          .slice(0, 4);

        return (
          <section key={category._id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004AAD]/5 border border-[#004AAD]/10">
                  <div className="w-1.5 h-1.5 bg-[#004AAD] rounded-full" />
                  <span className="text-[#004AAD] font-bold text-[10px] uppercase tracking-widest">
                    Collection
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter">
                  {category.name}
                </h2>
                <p className="text-sm md:text-base text-gray-500 font-medium max-w-xl">
                  Discover our curated selection of premium quality items in the {category.name} collection.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 justify-items-center">
              {categoryProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default CategoryProducts;

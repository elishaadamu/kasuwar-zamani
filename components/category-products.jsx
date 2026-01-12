"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import ProductCard from "./ProductCard";
import { FaTags } from "react-icons/fa";

const CategoryProducts = () => {
  const { products, router } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET_ALL),
          { withCredentials: "true" }
        );
        // console.log("Categories", response.data.categories);
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch category:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  // Filter categories to only those that have matching products
  const validCategories = categories.filter((category) =>
    products.some((p) => p.category === category.name)
  );

  if (validCategories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-16 py-16">
      {validCategories.map((category) => {
        const categoryProducts = products
          .filter((p) => p.category === category.name)
          .slice(0, 4); // Show up to 4 products per category

        return (
          <section key={category._id} className="w-full">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <FaTags className="w-6 h-6 text-blue-600" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {category.name}
                </h2>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Check out our latest arrivals in the {category.name} category.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-0">
              {categoryProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() =>
                  router.push(
                    `/category/${category.name
                      .toLowerCase()
                      .replace(/ & /g, "-")
                      .replace(/ /g, "-")}`
                  )
                }
                className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-300"
              >
                View All in {category.name}
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default CategoryProducts;

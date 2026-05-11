"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import ProductCard from "./ProductCard";

const CategoryProducts = () => {
  const { products, router } = useAppContext();
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
    <>

      {validCategories.map((category) => {
        const categoryProducts = products
          .filter((p) => p.category === category.name)
          .slice(0, 4);

        return (
          <React.Fragment key={category._id}>
            <section className="">
              <div className="flex flex-col text-left mb-6">
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4">
                  {category.name}
                </h2>
                <p className="text-lg text-gray-600 text-left max-w-2xl">
                  Check out our latest arrivals in the {category.name} category.
                </p>
              </div>

              <div className="home-products grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-center justify-items-center gap-6 mt-6 w-full">
                {categoryProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>

          </React.Fragment>
        );
      })}
    </>
  );
};

export default CategoryProducts;

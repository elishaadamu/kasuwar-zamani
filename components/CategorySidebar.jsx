"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

const CategorySidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET_ALL),
          { withCredentials: true }
        );
        setCategories(response.data.categories);
      } catch (error) {
        // You could set an error state here to show a message in the UI
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="w-full h-[400px] overflow-y-auto mt-6 bg-white shadow-lg rounded-lg z-10 pl-6 pt-5 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Categories</h3>
      {loading ? (
        <div className="space-y-4 h-full">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center animate-pulse">
              <div className="w-3/4 h-5 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category._id}>
              <Link
                href={`/category/${category.name
                  .toLowerCase()
                  .replace(/ & /g, "-")
                  .replace(/ /g, "-")}`}
                className="block p-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategorySidebar;

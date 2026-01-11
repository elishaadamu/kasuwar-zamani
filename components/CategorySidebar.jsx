"use client";
import React, { useState, useEffect } from "react";
import {
  HiOutlineCpuChip,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineHome,
  HiOutlineHeart,
  HiOutlineTruck,
  HiOutlineBuildingOffice2,
  HiOutlineArchiveBox,
  HiOutlineWrenchScrewdriver,
  HiOutlineComputerDesktop,
} from "react-icons/hi2";
import Link from "next/link";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

// Icon mapping for dynamic categories
const iconMap = {
  Electronics: <HiOutlineCpuChip className="w-5 h-5 mr-2 text-gray-500" />,
  Fashion: <HiOutlineShoppingBag className="w-5 h-5 mr-2 text-gray-500" />,
  "Foods and Drinks": (
    <HiOutlineSparkles className="w-5 h-5 mr-2 text-gray-500" />
  ),
  Furnitures: <HiOutlineHome className="w-5 h-5 mr-2 text-gray-500" />,
  "Beauty & Health": <HiOutlineHeart className="w-5 h-5 mr-2 text-gray-500" />,
  Automobiles: <HiOutlineTruck className="w-5 h-5 mr-2 text-gray-500" />,
  Property: <HiOutlineBuildingOffice2 className="w-5 h-5 mr-2 text-gray-500" />,
  "Kitchen Utensils": (
    <HiOutlineArchiveBox className="w-5 h-5 mr-2 text-gray-500" />
  ),
  "Home appliance": <HiOutlineHome className="w-5 h-5 mr-2 text-gray-500" />,
  Agriculture: <HiOutlineSparkles className="w-5 h-5 mr-2 text-gray-500" />,
  "Industrial equipment": (
    <HiOutlineWrenchScrewdriver className="w-5 h-5 mr-2 text-gray-500" />
  ),
  "Digital products": (
    <HiOutlineComputerDesktop className="w-5 h-5 mr-2 text-gray-500" />
  ),
  default: <HiOutlineArchiveBox className="w-5 h-5 mr-2 text-gray-500" />,
};

const getCategoryIcon = (categoryName) => {
  return iconMap[categoryName] || iconMap.default;
};

const CategorySidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET_ALL)
        );
        console.log(response.data);
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // You could set an error state here to show a message in the UI
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="w-full h-[400px] overflow-y-auto mt-6 bg-white shadow-lg rounded-lg z-10 pl-10 pt-5 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Categories</h3>
      {loading ? (
        <div className="space-y-2 h-full">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center p-2 animate-pulse">
              <div className="w-5 h-5 mr-2 bg-gray-200 rounded"></div>
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
                className="flex items-center p-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              >
                {getCategoryIcon(category.name)}
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

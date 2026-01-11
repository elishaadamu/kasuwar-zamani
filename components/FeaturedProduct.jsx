"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import {
  FaShoppingCart,
  FaEye,
  FaStar,
  FaArrowRight,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

const FeaturedProduct = () => {
  const { products, router } = useAppContext();
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  // Get the first 3 latest products
  const featuredProducts = products.slice(0, 3);

  const toggleFavorite = (productId, e) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const truncateDescription = (description, wordLimit = 8) => {
    if (!description) return "";
    const words = description.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : description;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 1,
    }).format(price);
  };

  if (!featuredProducts.length) return null;

  return (
    <section className=" bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              Featured Collection
            </span>
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium products
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {featuredProducts.map((product, index) => (
            <div
              key={product._id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
              onMouseEnter={() => setHoveredProduct(product._id)}
              onMouseLeave={() => setHoveredProduct(null)}
              onClick={() => router.push(`/product/${product._id}`)}
            >
              {/* Product Image Container */}
              <div className="relative overflow-hidden bg-gray-100">
                <Image
                  src={product.images?.[0]?.url || "/placeholder-product.jpg"}
                  alt={product.name}
                  width={400}
                  height={400}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Overlay Actions */}
                <div
                  className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 ${
                    hoveredProduct === product._id
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-4"
                  }`}
                >
                  <button
                    onClick={(e) => toggleFavorite(product._id, e)}
                    className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                  >
                    {favorites.has(product._id) ? (
                      <FaHeart className="w-4 h-4 text-red-500" />
                    ) : (
                      <FaRegHeart className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <button className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
                    <FaEye className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Quick View Overlay */}
                <div
                  className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 ${
                    hoveredProduct === product._id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-gray-100">
                    <FaEye className="w-4 h-4" />
                    Quick View
                  </button>
                </div>

                {/* Product Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1 flex-1">
                    {product.name}
                  </h3>
                  <button
                    onClick={(e) => toggleFavorite(product._id, e)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 ml-2"
                  >
                    {favorites.has(product._id) ? (
                      <FaHeart className="w-5 h-5 text-red-500" />
                    ) : (
                      <FaRegHeart className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {truncateDescription(product.description, 12)}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (product.rating || 4)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.reviewCount || 24})
                  </span>
                </div>

                {/* Price and CTA */}
                <div className="flex gap-2 items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.price || 99.99)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/product/${product._id}`);
                    }}
                    className="bg-gradient-to-r md:py-3 p-4 from-blue-600 to-purple-600 text-white  md:px-6  rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transform hover:scale-105 transition-all duration-200 group/btn"
                  >
                    <FaShoppingCart className="w-4 h-4" />
                    <span className="hidden text-[12px] md:inline">
                      Buy Now
                    </span>
                  </button>
                </div>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500 transition-all duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push("/all-products")}
            className="bg-white text-gray-900 border-2 border-gray-300 px-8 py-4 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300 flex items-center gap-3 mx-auto hover:shadow-lg"
          >
            View All Products
            <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct;

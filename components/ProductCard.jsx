"use client";
import React from "react";
import { useAppContext } from "@/context/AppContext";
import { customToast } from "@/lib/customToast";
import { FaStar, FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import Image from "next/image";

const ProductCard = ({ product }) => {
  const {
    currency,
    router,
    addToWishlist,
    wishlistItems,
    isLoggedIn,
    addToCart,
  } = useAppContext();

  const productImage =
    (product?.image && product.image.length > 0 ? product.image[0] : null) ||
    (product?.images && product.images.length > 0
      ? product.images[0]?.url
      : null) ||
    "https://picsum.photos/seed/product/300/300";

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      customToast.error("Sign In Required", "Please sign in to add items to your wishlist.");
      router.push("/signin");
      return;
    }
    addToWishlist(product._id);
    customToast.success(
      wishlistItems.includes(product._id) ? "Wishlist Updated" : "Wishlist Updated",
      wishlistItems.includes(product._id)
        ? `${product.name} removed from wishlist`
        : `${product.name} added to wishlist`
    );
  };

  const hasOffer = product.offerPrice && product.offerPrice < product.price;

  return (
    <div
      onClick={() => {
        router.push(`/product/${product._id}`);
        scrollTo(0, 0);
      }}
      className="group relative flex w-full max-w-xs cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-white bg-white/60 backdrop-blur-xl shadow-xl shadow-gray-200/50 p-2 sm:p-3 transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-900/10 hover:bg-white"
    >
      {/* Product Image */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden rounded-[1.5rem] bg-gray-50/50 border border-gray-100/50">
        <Image
          src={productImage.includes("cloudinary.com") ? `${productImage}?q_auto,f_auto` : productImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {hasOffer && (
          <span className="absolute top-2 left-2 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
            {Math.round(
              ((product.price - product.offerPrice) / product.price) * 100
            )}
            % OFF
          </span>
        )}
        {/* Wishlist Icon */}
        <div
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-white hover:scale-110"
        >
          {wishlistItems.includes(product._id) ? (
            <FaHeart className="h-5 w-5 text-red-500 scale-110" />
          ) : (
            <FiHeart className="h-5 w-5 text-gray-600" />
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-lg font-bold text-gray-900">
          {product.name}
        </h3>

        {/* Product description content */}
        {product.description && (
          <p className="line-clamp-2 text-xs font-medium text-gray-500 leading-relaxed mb-1">
            {product.description}
          </p>
        )}

        {/* Price + Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-gray-900">
              {currency}
              {hasOffer
                ? product.offerPrice?.toLocaleString()
                : product.price?.toLocaleString()}
            </span>
            {hasOffer && (
              <span className="text-sm text-gray-400 font-medium line-through">
                {currency}
                {product.price?.toLocaleString()}
              </span>
            )}
          </div>
          {/* <div className="flex items-center text-xs">
            <FaStar className="mr-1 h-3 w-3 text-yellow-400" />
            <span className="font-medium text-gray-700">
              {product.averageRating?.toFixed(1) || "4.5"}
            </span>
          </div> */}
        </div>

        {/* Add to Cart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isLoggedIn) {
              customToast.error("Sign In Required", "Please sign in to buy items.");
              router.push("/signin");
              return;
            }
            addToCart(product._id);
            router.push("/cart");
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95"
        >
          Buy now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

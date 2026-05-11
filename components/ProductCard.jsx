"use client";
import React from "react";
import { useAppContext } from "@/context/AppContext";
import { customToast } from "@/lib/customToast";
import { FaStar, FaHeart, FaCommentDots } from "react-icons/fa";
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
    "https://picsum.photos/seed/product/400/400";

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

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!isLoggedIn) {
      customToast.error("Sign In Required", "Please sign in to buy items.");
      router.push("/signin");
      return;
    }
    addToCart(product._id);
    router.push("/cart");
  };

  const handleChatVendor = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      customToast.error("Sign In Required", "Please sign in to chat with the vendor.");
      router.push("/signin");
      return;
    }
    router.push(`/chat?vendorId=${product.userId || product.vendorId}`);
  };

  const hasOffer = product.offerPrice && product.offerPrice < product.price;
  const isOutOfStock = product.stock === 0 || product.quantity === 0;
  const isFeatured = product.isFeatured || product.featured;

  return (
    <div
      onClick={() => {
        router.push(`/product/${product._id}`);
        scrollTo(0, 0);
      }}
      className="group relative flex w-full max-w-[320px] cursor-pointer flex-col overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-sm transition-all duration-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50"
    >
      {/* Product Image Section */}
      <div className="relative aspect-square w-full overflow-hidden p-2">
        <div className="relative h-full w-full overflow-hidden rounded-[2.5rem]">
          <Image
            src={productImage.includes("cloudinary.com") ? `${productImage}?q_auto,f_auto` : productImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Featured Badge */}
          {isFeatured && (
            <div className="absolute top-4 left-4 z-10 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold text-white shadow-lg">
              Featured
            </div>
          )}

          {/* Wishlist Button on Image */}
          <div
            onClick={handleWishlistClick}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-white hover:scale-110"
          >
            {wishlistItems.includes(product._id) ? (
              <FaHeart className="h-5 w-5 text-red-500" />
            ) : (
              <FiHeart className="h-5 w-5 text-gray-400" />
            )}
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <span className="rounded-full bg-white/90 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 shadow-lg">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Content Section */}
      <div className="flex flex-col gap-2 p-6 pt-3">
        {/* Product Name */}
        <h3 className="line-clamp-1 text-xl font-black text-gray-900 tracking-tight">
          {product.name}
        </h3>

        {/* Price & Condition Row */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gray-900 leading-none">
              {currency}
              {hasOffer
                ? product.offerPrice?.toLocaleString()
                : product.price?.toLocaleString()}
            </span>
            {hasOffer && (
              <span className="mt-1 text-xs font-medium text-gray-400 line-through">
                {currency}{product.price?.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Condition */}
          <span className="text-sm font-semibold text-gray-500 px-3 py-1 bg-gray-50 rounded-lg">
            {product.condition || "New"}
          </span>
        </div>

        {/* Rating Section (Subtle) */}
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex text-yellow-400">
            <FaStar className="h-3 w-3 fill-current" />
          </div>
          <span className="text-[10px] font-bold text-gray-400">
            {product.averageRating?.toFixed(1) || "4.8"} ({product.reviews?.length || 24})
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-3">
          {/* Buy Now Button */}
          <button
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white transition-all duration-300 shadow-lg ${
              isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95"
            }`}
          >
            Buy now
          </button>

          {/* Chat Vendor Button */}
          <button
            onClick={handleChatVendor}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-indigo-50 py-3 text-xs font-bold text-indigo-600 transition-all duration-300 hover:bg-indigo-50 hover:border-indigo-100 active:scale-95"
          >
            <FaCommentDots className="h-4 w-4" />
            Chat Vendor
          </button>
          
          {/* Restriction Note */}
          <p className="text-[9px] text-center text-gray-400 font-medium px-4 leading-tight">
            * Secure chat only. Sharing phone numbers or emails is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;



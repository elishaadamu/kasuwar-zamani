import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { customToast } from "@/lib/customToast";
import { FaStar, FaHeart, FaCommentDots, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiHeart, FiEye, FiShoppingCart } from "react-icons/fi";
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

  const images = [
    ...(product?.image || []),
    ...(product?.images?.map(img => typeof img === 'string' ? img : img?.url) || [])
  ].filter(Boolean);

  if (images.length === 0) {
    images.push("https://picsum.photos/seed/product/400/400");
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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
      className="group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-md bg-white shadow-sm transition-all duration-500 hover:shadow-md"
    >
      {/* Product Image Section - Square aspect ratio */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F3F4F6] rounded-t-md">
        {/* Background Patterns - Removed for cleaner look on mobile as per design */}
        <div className="hidden md:block absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 h-24 w-24 rounded-full border-[3px] border-[#004AAD]" />
          <div className="absolute top-40 right-10 h-16 w-16 rounded-full border-[3px] border-[#004AAD]" />
          <div className="absolute bottom-20 left-20 h-12 w-12 rounded-full bg-[#004AAD]/20" />
          <svg className="absolute top-1/4 right-1/4 w-20 h-10 text-[#004AAD]" viewBox="0 0 100 20">
            <path d="M0 10 Q 10 0, 20 10 T 40 10 T 60 10 T 80 10 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div className="absolute bottom-10 right-10 grid grid-cols-3 gap-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#004AAD]" />
            ))}
          </div>
        </div>

        <div className="relative h-full w-full">
          <Image
            src={images[currentImageIndex].includes("cloudinary.com") ? `${images[currentImageIndex]}?q_auto,f_auto` : images[currentImageIndex]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 340px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Hover Overlay with Eye Icon - Matching reference */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#004AAD]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <FiEye className="h-5 w-5 text-[#004AAD]" />
            </div>
          </div>



          {/* Pagination Dots */}
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 z-20">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(i);
                }}
                className={`h-2 w-2 rounded-full transition-all ${i === currentImageIndex ? "w-4 bg-black" : "bg-white"
                  }`}
              />
            ))}
          </div>

          {/* Featured Badge */}
          {isFeatured && (
            <div className="absolute top-0 left-0 z-10 rounded-full bg-[#004AAD] px-3 py-1 text-[10px] font-bold text-white shadow-lg">
              Featured
            </div>
          )}

          {/* Condition Badge - Sleek overlay */}
          {product.condition && (
            <div className="absolute top-2 left-2 z-10">
              <span className="rounded-full bg-white/80 backdrop-blur-sm px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#004AAD] shadow-sm border border-[#004AAD]/5">
                {product.condition}
              </span>
            </div>
          )}

          {/* Wishlist Button on Image */}
          <div
            onClick={handleWishlistClick}
            className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white"
          >
            {wishlistItems.includes(product._id) ? (
              <FaHeart className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <FiHeart className="h-3.5 w-3.5 text-[#004AAD]" />
            )}
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-2xl">
              <span className="rounded-full bg-white/90 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 shadow-lg">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Content Section */}
      <div className="flex flex-col gap-2 md:gap-4 p-4 md:p-6 text-center">
        {/* Product Name */}
        <h3 className="line-clamp-1 text-sm md:text-base font-semibold text-gray-800 tracking-tight">
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="flex flex-col items-center">
          <span className="text-sm md:text-base font-bold text-[#004AAD]">
            {currency}{hasOffer
              ? product.offerPrice?.toLocaleString()
              : product.price?.toLocaleString()}
          </span>
          {hasOffer && (
            <span className="text-[9px] font-medium text-gray-400 line-through">
              {currency}{product.price?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Chat Vendor - Minimalist version */}
        <button
          onClick={handleChatVendor}
          className="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#004AAD] hover:opacity-100 transition-opacity"
        >
          <FaCommentDots className="h-3 w-3" />
          CHAT VENDOR
        </button>
      </div>
    </div>
  );
};

export default ProductCard;



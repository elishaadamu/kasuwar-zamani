import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { customToast } from "@/lib/customToast";
import { FaStar, FaHeart, FaCommentDots, FaChevronLeft, FaChevronRight } from "react-icons/fa";
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
      className="group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl md:rounded-[2rem] bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Product Image Section with Slider and Background Patterns */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EBF2FF] rounded-t-[2rem]">
        {/* Background Patterns (Abstract Shapes) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
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

          {/* Wishlist Button on Image */}
          <div
            onClick={handleWishlistClick}
            className="absolute top-3 right-3 md:top-6 md:right-6 z-10 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-white hover:scale-110"
          >
            {wishlistItems.includes(product._id) ? (
              <FaHeart className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
            ) : (
              <FiHeart className="h-4 w-4 md:h-5 md:w-5 text-[#004AAD]" />
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
        <h3 className="line-clamp-1 text-sm md:text-2xl font-black text-[#004AAD] tracking-tight">
          {product.name}
        </h3>

        {/* Description */}
        <p className="line-clamp-2 text-[10px] md:text-xs font-medium text-[#004AAD]/70 leading-relaxed px-2">
          {product.description || "Premium quality product with exceptional design and durability for your daily needs."}
        </p>

        {/* Color Variants (Placeholders if not in data) */}
        <div className="flex items-center justify-center gap-2 md:gap-3 py-1">
          {product.colors && product.colors.length > 0 ? (
            product.colors.map((color, idx) => (
              <div key={idx} className="h-4 w-4 md:h-6 md:w-6 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: color }} />
            ))
          ) : (
            <>
              <div className="h-4 w-4 md:h-6 md:w-6 rounded-full bg-[#FF8B78]" />
              <div className="h-4 w-4 md:h-6 md:w-6 rounded-full bg-[#67C3C2]" />
              <div className="h-4 w-4 md:h-6 md:w-6 rounded-full bg-[#FFB75E]" />
            </>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-2 md:mt-4 gap-3">
          <div className="flex flex-row md:flex-col items-center md:items-start justify-center gap-2 md:gap-0">
            <span className="text-sm md:text-2xl font-black text-[#004AAD]">
              {currency}{hasOffer
                ? product.offerPrice?.toLocaleString()
                : product.price?.toLocaleString()}
            </span>
            {hasOffer && (
              <span className="text-[8px] md:text-[10px] font-bold text-gray-400 line-through">
                {currency}{product.price?.toLocaleString()}
              </span>
            )}
          </div>

          <button
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            className={`w-full md:w-auto rounded-lg md:rounded-xl border-2 border-[#004AAD] px-3 md:px-5 py-2 md:py-2.5 text-[8px] md:text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${isOutOfStock
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "text-[#004AAD] hover:bg-[#004AAD] hover:text-white active:scale-95"
              }`}
          >
            Add to Cart
          </button>
        </div>

        {/* Condition Badge (Preserved) */}
        {product.condition && (
          <div className="absolute bottom-40 right-6 z-10">
            <span className="text-[9px] font-black uppercase tracking-tighter text-[#004AAD]/50 px-2 py-0.5 border border-[#004AAD]/10 rounded-md">
              {product.condition}
            </span>
          </div>
        )}

        {/* Secondary Actions (Chat Vendor) */}
        <div className="mt-2 pt-4 border-t border-gray-50 flex flex-col gap-2">
          <button
            onClick={handleChatVendor}
            className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#004AAD] opacity-60 hover:opacity-100 transition-opacity"
          >
            <FaCommentDots className="h-3 w-3" />
            CHAT VENDOR
          </button>
          <p className="text-[8px] text-gray-400 font-medium leading-tight">
            * Secure chat only. Data protection enabled.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;



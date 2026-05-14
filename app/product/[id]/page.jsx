"use client";
import { useEffect, useState, useMemo } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import ImageMagnify from "@/components/ImageMagnify/ImageMagnify.jsx";

import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import Loading from "@/components/Loading.jsx";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { message } from "antd";
import { supabase } from "@/lib/supabase";
import { FaStar, FaShoppingCart, FaCommentDots, FaBox, FaTag, FaCheckCircle } from "react-icons/fa";

const Product = () => {
  const { id } = useParams();
  const pathname = usePathname();

  const { products, router, addToCart, isLoggedIn, currency, userData } =
    useAppContext();
  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    const fetchVendorProducts = async () => {
      const payload = {
        userId: userData?.id || null,
        page: 1,
      };
      try {
        const response = await axios.post(
          apiUrl(API_CONFIG.ENDPOINTS.PRODUCT.GET_PRODUCT),
          payload,
          { withCredentials: true }
        );
        const foundProduct = response.data.products?.find(
          (item) => item._id === id
        );
        if (foundProduct) {
          setProduct(foundProduct);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorProducts();
  }, [id, userData]);

  const handleMessageClick = async () => {
    if (!isLoggedIn) {
      message.error("Please sign in to message the vendor.");
      router.push(`/signin?redirect=${pathname}`);
      return;
    }

    if (isCreatingChat || !product || !userData) return;

    setIsCreatingChat(true);
    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", userData._id || userData.id)
        .eq("vendor_id", product?.vendor?._id)
        .single();

      if (existingConversation) {
        router.push(`/chat/${existingConversation.id}`);
      } else {
        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from("conversations")
          .insert({
            user_id: userData._id || userData.id,
            vendor_id: product?.vendor?._id,
            user_name: `${userData.firstName} ${userData.lastName}`,
            vendor_name: product?.vendor?.businessName,
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && newConversation) {
          router.push(`/chat/${newConversation.id}`);
        } else {
          message.error("Failed to start chat. Please try again.");
        }
      }
    } catch (error) {
      message.error("An error occurred");
    } finally {
      setIsCreatingChat(false);
    }
  };

  const relatedProducts = useMemo(() => {
    if (!product || !products) {
      return [];
    }
    return products
      .filter((p) => p.category === product.category && p._id !== product._id)
      .slice(0, 4);
  }, [product, products]);

  const images = useMemo(() => {
    if (!product) return [];
    return [
      ...(product.image || []),
      ...(product.images?.map(img => typeof img === 'string' ? img : img?.url) || [])
    ].filter(Boolean);
  }, [product]);

  if (loading || !product) {
    return <Loading />;
  }

  const hasOffer = product.offerPrice && product.offerPrice < product.price;

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-10">
        
        {/* Navigation Breadcrumb (Simplified) */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">
          <span className="hover:text-[#004AAD] cursor-pointer" onClick={() => router.push("/")}>Home</span>
          <span>/</span>
          <span className="hover:text-[#004AAD] cursor-pointer" onClick={() => router.push("/all-products")}>{product.category}</span>
          <span>/</span>
          <span className="text-[#004AAD]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square w-full rounded-[2.5rem] overflow-hidden bg-[#EBF2FF] border border-gray-100 shadow-sm [&_img]:object-cover">
              <ImageMagnify
                smallImage={{
                  alt: product.name,
                  src: mainImage || images[0],
                }}
                largeImage={{
                  src: mainImage || images[0],
                }}
              />
              
              {/* Product Status Badge */}
              {product.stock > 0 ? (
                 <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-green-100">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-700">In Stock</span>
                 </div>
              ) : (
                <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50/90 backdrop-blur-md shadow-sm border border-red-100">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-700">Out of Stock</span>
                 </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
              {images.map((imgUrl, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(imgUrl)}
                  className={`group relative cursor-pointer aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    (mainImage || images[0]) === imgUrl 
                    ? "border-[#004AAD] shadow-md ring-2 ring-[#004AAD]/10 opacity-100 scale-105 z-10" 
                    : "border-transparent bg-gray-50 hover:border-gray-200 opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${index}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {(mainImage || images[0]) === imgUrl && (
                    <div className="absolute inset-0 bg-[#004AAD]/10 flex items-center justify-center">
                       <FaCheckCircle className="text-[#004AAD] w-5 h-5 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            {/* Category Tag */}
            <span className="inline-flex items-center gap-2 text-[#004AAD] font-black text-[10px] uppercase tracking-[0.3em] mb-4">
               <FaTag className="w-2.5 h-2.5" />
               {product.category || "Premium Item"}
            </span>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            {/* Rating & Reviews (Removed as requested) */}
            <div className="mb-8" />

            {/* Price Display */}
            <div className="flex flex-col gap-2 mb-10">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Price</span>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black text-[#004AAD]">
                  {currency}{hasOffer ? product.offerPrice?.toLocaleString() : product.price?.toLocaleString()}
                </span>
                {hasOffer && (
                  <span className="text-xl font-bold text-gray-300 line-through">
                    {currency}{product.price?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 mb-10">
               <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Product Overview</h3>
               <p className="text-gray-500 leading-relaxed font-medium">
                 {product.description || "Indulge in the perfect blend of style and substance. This premium piece is meticulously crafted to elevate your daily experience, featuring high-quality materials and an eye for exceptional detail."}
               </p>
            </div>

            {/* Product Specifications Table */}
            <div className="bg-gray-50/50 rounded-3xl p-8 mb-10 space-y-6 border border-gray-100">
               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Availability</span>
                     <div className="flex items-center gap-2">
                        <FaBox className="text-[#004AAD] w-3 h-3" />
                        <span className="text-sm font-bold text-gray-900">{product.stock} Units</span>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Condition</span>
                     <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-[#004AAD] w-3 h-3" />
                        <span className="text-sm font-bold text-gray-900">{product.condition}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button
                  disabled={product.stock === 0}
                  onClick={() => {
                    if (!isLoggedIn) {
                      message.error("Please sign in to add items to cart");
                      router.push(`/signin?redirect=${pathname}`);
                      return;
                    }
                    addToCart(product._id);
                    message.success(`${product.name} added to cart!`);
                  }}
                  className="flex-1 h-16 rounded-2xl border-2 border-[#004AAD] text-[#004AAD] font-black uppercase tracking-widest text-xs hover:bg-[#004AAD] hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                <button
                  disabled={product.stock === 0}
                  onClick={() => {
                    if (!isLoggedIn) {
                      message.error("Please sign in to checkout");
                      router.push(`/signin?redirect=${pathname}`);
                      return;
                    }
                    addToCart(product._id);
                    router.push("/cart");
                  }}
                  className="flex-[2] h-16 rounded-2xl bg-[#004AAD] text-white font-black uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(0,74,173,0.3)] hover:bg-[#003D8F] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Message Vendor Button */}
              {isLoggedIn && product?.vendor && (
                <button
                  onClick={handleMessageClick}
                  disabled={isCreatingChat}
                  className="w-full h-16 rounded-2xl bg-white border border-gray-100 text-gray-900 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
                >
                  {isCreatingChat ? (
                    <span className="w-5 h-5 border-2 border-[#004AAD] border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <FaCommentDots className="w-4 h-4 text-[#004AAD]" />
                      Message Vendor
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-20 border-t border-gray-100">
            <div className="flex flex-col items-center mb-12">
               <span className="text-[#004AAD] font-black text-[10px] uppercase tracking-[0.4em] mb-4">You May Also Like</span>
               <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">Related <span className="text-[#004AAD]">Products</span></h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 justify-items-center">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;

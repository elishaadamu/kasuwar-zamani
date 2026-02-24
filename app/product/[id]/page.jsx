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
        console.error("Error fetching vendor products:", error);
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
          console.error("Error creating conversation:", error);
          message.error("Failed to start chat. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error in handleMessageClick:", error);
      message.error("An error occurred");
    } finally {
      setIsCreatingChat(false);
    }
  };

  const relatedProducts = useMemo(() => {
    if (!product || !products) {
      return [];
    }
    // Filter for products in the same category, exclude the current product, and take the first 4
    return products
      .filter((p) => p.category === product.category && p._id !== product._id)
      .slice(0, 4);
  }, [product, products]);
  if (loading || !product) {
    return <Loading />;
  }

  return (
    <>
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        <style jsx global>{`
          @media screen and (max-width: 360px) {
            .home-products {
              grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
            }
            .button-see_more {
              flex-direction: column;
              justify-content: start;
              align-items: baseline;
              gap: 10px;
            }
          }
        `}</style>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="px-5 lg:px-16 xl:px-20">
            <div
              className="rounded-lg overflow-hidden bg-gray-500/10 mb-4 relative"
              style={{ zIndex: 1 }}
            >
              {/* Magnifier effect */}
              <ImageMagnify
                smallImage={{
                  alt: product.name,
                  src: mainImage || product.images[0]?.url,
                }}
                largeImage={{
                  src: mainImage || product.images[0]?.url,
                }}
              />
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setMainImage(image.url)}
                  className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10"
                >
                  <Image
                    src={image.url}
                    alt="alt"
                    className="w-full h-auto object-cover mix-blend-multiply"
                    width={1280}
                    height={720}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <Image
                    key={i}
                    className="h-4 w-4"
                    src={assets.star_icon}
                    alt="star_icon"
                  />
                ))}
                <Image
                  className="h-4 w-4"
                  src={assets.star_dull_icon}
                  alt="star_dull_icon"
                />
              </div>
              <p>(4.5)</p>
            </div>
            <p className="text-gray-600 mt-3">{product.description}</p>
            <div className="text-3xl font-medium mt-6">
              {product.offerPrice ? (
                <>
                  {currency}
                  {product.offerPrice}
                  <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                    {currency}
                    {product.price}
                  </span>
                </>
              ) : (
                <>
                  {currency}
                  {product.price}
                </>
              )}
            </div>
            <hr className="bg-gray-600 my-6" />
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72">
                <tbody>
                  <tr>
                    <td className="text-gray-600 font-medium">
                      Stocks Available
                    </td>
                    <td className="text-gray-800/50 ">{product.stock}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Condition</td>
                    <td className="text-gray-800/50 ">{product.condition}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Category</td>
                    <td className="text-gray-800/50">{product.category}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 mt-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      message.error("Please sign in to add items to cart");
                      router.push(`/signin?redirect=${pathname}`);
                      return;
                    }
                    addToCart(product._id);
                    message.success(
                      `${product.name} has been added to your cart!`
                    );
                  }}
                  className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      message.error("Please sign in to add items to cart");
                      router.push(`/signin?redirect=${pathname}`);
                      return;
                    }
                    addToCart(product._id);
                    message.success(
                      `${product.name} has been added to your cart!`
                    );
                    router.push("/cart");
                  }}
                  className="w-full py-3.5 bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  Buy now
                </button>
              </div>

              {/* Message Vendor Button */}
              {isLoggedIn && product?.vendor && (
                <button
                  onClick={handleMessageClick}
                  disabled={isCreatingChat}
                  className="w-full py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  {isCreatingChat ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>Message Vendor</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-4 mt-16">
              <p className="text-3xl font-medium">
                Related{" "}
                <span className="font-medium text-blue-600">Products</span>
              </p>
              <div className="w-28 h-0.5 bg-blue-600 mt-2"></div>
            </div>
            <div className="home-products grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 items-center justify-items-center gap-6 mt-6 pb-14 w-full">
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
    </>
  );
};
export default Product;

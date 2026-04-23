"use client";
import React, { useEffect, useMemo, useState } from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";

import ProductCard from "@/components/ProductCard";
import { useAppContext } from "@/context/AppContext";
import { toast } from "react-toastify";
import { FaShoppingCart, FaTrash, FaArrowLeft, FaBox, FaCreditCard, FaCheckCircle } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { message } from "antd";
import { usePathname } from "next/navigation";

const Cart = () => {
  const pathname = usePathname();
  const {
    products,
    router,
    cartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    isLoggedIn,
    currency,
    userData,
  } = useAppContext();
  const [creatingChatFor, setCreatingChatFor] = useState(null);

  // States lifted from OrderSummary to make progress bar dynamic
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryLga, setDeliveryLga] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please sign in to view your cart.");
      router.push(`/signin?redirect=${pathname}`);
    }
  }, [isLoggedIn, router, pathname]);

  const handleMessageClick = async (product) => {
    if (!isLoggedIn) {
      message.error("Please sign in to message the vendor.");
      router.push(`/signin?redirect=${pathname}`);
      return;
    }

    if (creatingChatFor || !product || !userData) return;

    setCreatingChatFor(product._id);
    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', userData._id || userData.id)
        .eq('vendor_id', product?.vendor?._id)
        .single();

      if (existingConversation) {
        router.push(`/chat/${existingConversation.id}`);
      } else {
        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            user_id: userData._id || userData.id,
            vendor_id: product?.vendor?._id,
            user_name: `${userData.firstName} ${userData.lastName}`,
            vendor_name: product?.vendor?.businessName,
            last_message_at: new Date().toISOString()
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
      setCreatingChatFor(null);
    }
  };

  const cartProductList = useMemo(() => {
    return Object.keys(cartItems)
      .map((itemId) => {
        const product = products.find((p) => p._id === itemId);
        if (product && cartItems[itemId] > 0) {
          return { ...product, quantity: cartItems[itemId] };
        }
        return null;
      })
      .filter(Boolean);
  }, [cartItems, products]);

  const allRelatedProducts = useMemo(() => {
    if (cartProductList.length === 0 || products.length === 0) {
      return [];
    }

    const cartCategories = new Set(cartProductList.map((p) => p.category));
    const cartItemIds = new Set(cartProductList.map((p) => p._id));
    return products.filter(
      (p) => cartCategories.has(p.category) && !cartItemIds.has(p._id)
    );
  }, [cartProductList, products]);

  const relatedProductsToShow = useMemo(
    () => allRelatedProducts.slice(0, 4),
    [allRelatedProducts]
  );

  // Dynamic steps calculation
  const currentStep = useMemo(() => {
    if (pin.length === 4 && selectedShipping && deliveryAddress) return 2; // Payment stage (entered PIN)
    if (selectedShipping && deliveryAddress) return 2; // Payment stage (ready to pay)
    if (deliveryState) return 1; // Shipping stage
    return 0; // Cart stage
  }, [deliveryState, deliveryLga, deliveryAddress, selectedShipping, pin]);

  const steps = [
    { icon: FaShoppingCart, label: "Cart", active: currentStep >= 0 },
    { icon: FaBox, label: "Shipping", active: currentStep >= 1 },
    { icon: FaCreditCard, label: "Payment", active: currentStep >= 2 },
    { icon: FaCheckCircle, label: "Done", active: false }, // Only active on success page
  ];

  if (!isLoggedIn) {
    // Render nothing or a loader while redirecting
    return null;
  }

  if (cartProductList.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-20 px-6 animate-fadeIn">
        {/* Animated empty cart icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <FaShoppingCart className="text-5xl text-slate-300" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm">
            <span className="text-slate-400 text-lg font-bold">0</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Your Cart is Empty
        </h2>
        <p className="text-slate-500 mb-8 max-w-sm leading-relaxed">
          Looks like you haven&apos;t added anything to your cart yet. Explore our products and find something you love!
        </p>
        <button
          onClick={() => router.push("/all-products")}
          className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3.5 px-10 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl shadow-lg shadow-blue-500/25"
        >
          <span className="flex items-center gap-2">
            Start Shopping
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Progress Steps Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-0">
            {steps.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step.active
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    <step.icon className="text-sm" />
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${
                    step.active ? "text-slate-800" : "text-slate-400"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-10 sm:w-16 h-0.5 mx-2 rounded-full transition-all duration-500 ${
                    steps[i + 1].active ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-slate-200"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Column */}
          <div className="flex-1 min-w-0">
            {/* Cart Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Shopping Cart</h1>
                <p className="text-slate-500 mt-1">
                  {getCartCount()} {getCartCount() === 1 ? "item" : "items"} in your cart
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                <FaShoppingCart className="text-blue-600 text-sm" />
                <span className="text-blue-700 font-semibold text-sm">{getCartCount()}</span>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartProductList.map((product, index) => (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 animate-slideUp"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Main Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Product Image & Info */}
                    <div className="flex items-center gap-4 flex-grow min-w-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                        <Image
                          src={product.images?.[0]?.url || ""}
                          alt={product.name}
                          className="w-full h-full object-contain mix-blend-multiply p-2 group-hover:scale-110 transition-transform duration-500"
                          width={96}
                          height={96}
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-slate-800 truncate text-sm sm:text-base">{product.name}</p>
                        {product?.vendor?.businessName && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            by {product.vendor.businessName}
                          </p>
                        )}
                        <p className="text-blue-600 font-bold mt-1 sm:hidden">
                          {currency}
                          {product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* Price (Desktop) */}
                    <div className="hidden sm:block w-28 text-center">
                      <p className="text-sm text-slate-400 mb-0.5">Price</p>
                      <p className="font-semibold text-slate-700">
                        {currency}
                        {product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex-shrink-0">
                      <p className="text-sm text-slate-400 mb-1.5 hidden sm:block text-center">Qty</p>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() =>
                            updateCartQuantity(product._id, product.quantity - 1)
                          }
                          className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors font-medium"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-semibold text-slate-800 text-sm tabular-nums">
                          {product.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(product._id)}
                          className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors font-medium"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="hidden sm:block w-28 text-right">
                      <p className="text-sm text-slate-400 mb-0.5">Subtotal</p>
                      <p className="font-bold text-slate-900">
                        {currency}
                        {(product.price * product.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => updateCartQuantity(product._id, 0)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                        aria-label="Remove item"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile subtotal */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 sm:hidden">
                    <span className="text-sm text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-900">
                      {currency}
                      {(product.price * product.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Message Vendor Button */}
                  {product?.vendor && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleMessageClick(product)}
                        disabled={creatingChatFor === product._id}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-all duration-200 text-sm font-medium hover:shadow-md"
                      >
                        {creatingChatFor === product._id ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Starting...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Message Vendor</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <button
              onClick={() => router.push("/all-products")}
              className="group flex items-center mt-8 gap-2.5 text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform duration-200" />
              Continue Shopping
            </button>

            {/* Related Products Section (Desktop Only) */}
            {relatedProductsToShow.length > 0 && (
              <div className="hidden lg:block mt-14">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      You Might Also Like
                    </h2>
                    <p className="text-sm text-slate-400 mt-0.5">Based on items in your cart</p>
                  </div>
                  {allRelatedProducts.length > 4 && (
                    <button
                      onClick={() => router.push("/all-products")}
                      className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-medium"
                    >
                      View all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 xl:grid-cols-2 gap-5">
                  {relatedProductsToShow.map((product) => (
                    <div key={product._id} className="w-full">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[420px] flex-shrink-0">
            <div className="lg:sticky lg:top-20">
              <OrderSummary 
                externalState={{
                  deliveryState, setDeliveryState,
                  deliveryLga, setDeliveryLga,
                  deliveryAddress, setDeliveryAddress,
                  selectedShipping, setSelectedShipping,
                  pin, setPin
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

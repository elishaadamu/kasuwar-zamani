"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import ProductCard from "@/components/ProductCard";
import {
  FaStar,
  FaCopy,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FiCheck, FiPlus, FiMessageCircle, FiGift, FiBox, FiMessageSquare } from "react-icons/fi";
import { customToast } from "@/lib/customToast";
import { supabase } from "@/lib/supabase";

const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex gap-1.5">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => setRating(ratingValue)}
              className="hidden"
            />
            <FaStar
              className="cursor-pointer transition-transform hover:scale-110 drop-shadow-sm"
              color={ratingValue <= (hover || rating) ? "#fbbf24" : "#f3f4f6"}
              size={32}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)}
            />
          </label>
        );
      })}
    </div>
  );
};

const VendorPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const {
    isLoggedIn,
    userData,
    followVendor,
    followingList,
    checkIfFollowing,
  } = useAppContext();
  const [vendor, setVendor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [vendorProducts, setVendorProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const PRODUCTS_PER_PAGE = 8;

  const [isFollowing, setIsFollowing] = useState(followingList?.includes(id));

  useEffect(() => {
    if (id) {
      const fetchVendor = async () => {
        try {
          const response = await axios.get(
            apiUrl(API_CONFIG.ENDPOINTS.VENDOR.GET_ALL),
            { withCredentials: true }
          );
          const allVendors = response.data || [];
          const foundVendor = allVendors.find((v) => v._id === id);
          if (foundVendor) {
            setVendor(foundVendor);
            const reviewsResponse = await axios.get(
              apiUrl(
                API_CONFIG.ENDPOINTS.RATING.GET_BY_VENDOR + foundVendor._id
              ),
              { withCredentials: true }
            );
            setReviews(reviewsResponse.data.ratings || []);

            const followerCountResponse = await axios.get(
              apiUrl(
                API_CONFIG.ENDPOINTS.FOLLOW.GET_FOLLOWERS + foundVendor._id
              ),
              { withCredentials: true }
            );
            setFollowerCount(followerCountResponse.data.followersCount || 0);

            const couponsResponse = await axios.get(
              apiUrl(API_CONFIG.ENDPOINTS.COUPON.GET_ALL + foundVendor._id),
              { withCredentials: true }
            );
            setCoupons(couponsResponse.data.coupons || []);
          } else {
            router.push("/404");
          }
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };
      fetchVendor();

      if (isLoggedIn) {
        checkIfFollowing(id).then((status) => setIsFollowing(status));
      }
    }
  }, [id, router]);


  useEffect(() => {
    const fetchVendorProducts = async () => {
      if (vendor?._id) {
        try {
          const response = await axios.get(
            apiUrl(
              API_CONFIG.ENDPOINTS.PRODUCT.GET_SELLER_PRODUCTS + vendor._id
            ),
            { withCredentials: true }
          );
          setVendorProducts(response.data || []);
        } catch (error) {
        }
      }
    };
    fetchVendorProducts();
  }, [vendor]);

  const totalPages = useMemo(
    () => Math.ceil(vendorProducts.length / PRODUCTS_PER_PAGE),
    [vendorProducts]
  );
  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * PRODUCTS_PER_PAGE;
    return vendorProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [vendorProducts, productPage]);

  useEffect(() => {
    setProductPage(1);
  }, [vendorProducts]);

  const handleMessageClick = async () => {
    if (isCreatingChat || !vendor || !userData) return;

    setIsCreatingChat(true);
    try {
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", userData._id || userData.id)
        .eq("vendor_id", vendor?._id)
        .single();

      if (existingConversation) {
        router.push(`/chat/${existingConversation.id}`);
      } else {
        const { data: newConversation, error } = await supabase
          .from("conversations")
          .insert({
            user_id: userData._id || userData.id,
            vendor_id: vendor?._id,
            user_name: `${userData.firstName} ${userData.lastName}`,
            vendor_name: vendor?.businessName,
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && newConversation) {
          router.push(`/chat/${newConversation.id}`);
        } else {
          customToast.error("Chat Error", "Failed to start chat. Please try again.");
        }
      }
    } catch (error) {
      customToast.error("Service Error", "An unexpected error occurred while starting chat.");
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleFollowClick = async () => {
    if (!isLoggedIn) {
      customToast.error("Sign In Required", "Please sign in to follow vendors.");
      router.push(`/signin?redirect=${pathname}`);
      return;
    }

    // Save previous state to do optimistic toggle locally
    const previousState = isFollowing;
    setIsFollowing(!previousState);

    const responseData = await followVendor(id);
    
    // If successful, synchronize securely with the backend's explicit decision
    if (responseData && responseData.action) {
      if (responseData.action === "follow") {
        setIsFollowing(true);
        // Only increment if we weren't just following them already server-side
        if (!previousState) setFollowerCount((prev) => prev + 1);
      } else if (responseData.action === "unfollow") {
        setIsFollowing(false);
        // Only decrement if we were just following them server-side
        if (previousState) setFollowerCount((prev) => Math.max(0, prev - 1));
      }
    } else {
       // Revert on local failure
       setIsFollowing(previousState);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      customToast.error("Sign In Required", "Please log in to submit a review.");
      router.push(`/signin?redirect=${pathname}`);
      return;
    }

    if (userData?.role !== "user") {
      customToast.error("Access Denied", "Only users can submit reviews.");
      return;
    }

    const userHasReviewed = reviews.some(
      (review) => review.userId?._id === userData?.id
    );
    if (userHasReviewed) {
      customToast.warn("Review Limit", "You have already submitted a review for this vendor.");
      return;
    }

    if (rating === 0) {
      customToast.warn("Rating Missing", "Please select a rating for the vendor.");
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        vendorId: vendor._id,
        rating,
        comment,
        userId: userData.id,
      };
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.RATING.ADD),
        reviewData,
        { withCredentials: true }
      );
      if (response.data) {
        customToast.success("Review Posted", "Review submitted successfully!");
        setReviews((prevReviews) =>
          [response.data.review, ...prevReviews].filter(Boolean)
        );
        setRating(0);
        setComment("");
      }
    } catch (error) {
      customToast.error("Submission Failed", error.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(
        apiUrl(
          `${API_CONFIG.ENDPOINTS.RATING.DELETE}${vendor._id}/${userData._id}`
        ),
        { withCredentials: true }
      );
      customToast.success("Review Deleted", "Review deleted successfully!");
      setReviews(reviews.filter((review) => review._id !== reviewId));
    } catch (error) {
      customToast.error("Delete Failed", error.response?.data?.message || "Failed to delete review.");
    }
  };

  const isCouponActive = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);
    return now >= validFrom && now <= validUntil && coupon.isActive;
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code).then(
      () => customToast.success("Code Copied", `Copied: ${code}`),
      () => customToast.error("Copy Failed", "Failed to copy coupon code.")
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) return <Loading />;
  if (!vendor) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      
      {/* Decorative Background Blur */}
      <div className="absolute top-0 inset-x-0 h-[400px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-100/60 rounded-full blur-[100px] opacity-70"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 pt-8 sm:pt-12">
        {/* Modern Floating Header Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100 mb-12">
          
          {/* Banner Container */}
          <div className="relative w-full h-48 sm:h-64 lg:h-80 bg-gray-100">
            <Image
              src={vendor?.banner?.url || "https://picsum.photos/seed/1/1200/300"}
              alt={`${vendor.businessName} banner`}
              fill
              className="object-cover"
              priority
            />
            {/* Soft gradient bottom block */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-90" />
            
            {/* Inner Floating Status / Category */}
            <div className="absolute top-6 left-6">
               <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg">
                 Verified Vendor
               </span>
            </div>
          </div>

          {/* Profile Details Container */}
          <div className="relative px-6 sm:px-10 pb-10 sm:pb-12">
            
            {/* Massive Floating Avatar */}
            <div className="flex justify-center sm:justify-start">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] overflow-hidden ring-[6px] ring-white shadow-2xl bg-white relative z-20 -mt-16 sm:-mt-20 mb-4 sm:mb-6">
                <div className="w-full h-full relative rounded-[26px] overflow-hidden">
                  <Image
                    src={vendor?.avatar?.url || "https://i.pravatar.cc/150"}
                    alt={vendor.businessName}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start relative z-20">
              
              {/* Title and Simple Stats */}
              <div className="flex-1 text-center sm:text-left mb-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tight mb-3">
                  {vendor.businessName}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-yellow-100 p-1.5 rounded-lg text-yellow-500">
                      <FaStar className="text-sm" />
                    </div>
                    <span className="text-xl font-semibold text-gray-900">
                      {(vendor.averageRating || 0).toFixed(1)}
                    </span>
                    <span className="text-sm font-semibold text-gray-400">
                      ({vendor.totalReviews ?? 0})
                    </span>
                  </div>
                  
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-semibold text-gray-900">{followerCount}</span>
                    <span className="text-sm font-semibold text-gray-400">Followers</span>
                  </div>

                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200 hidden sm:block"></div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-semibold text-gray-900">{vendor.productCount ?? 0}</span>
                    <span className="text-sm font-semibold text-gray-400">Items</span>
                  </div>
                </div>
              </div>

              {/* High-End Action Buttons */}
              {isLoggedIn && (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                  <button
                    onClick={handleFollowClick}
                    className={`w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl text-base font-semibold tracking-wide transition-all duration-300 shadow-sm flex items-center justify-center gap-2 ${
                      isFollowing
                        ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border-2 border-transparent"
                        : "bg-gray-900 text-white hover:bg-black hover:scale-105 hover:shadow-xl border-2 border-gray-900"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <FiCheck className="text-lg" />
                        Following
                      </>
                    ) : (
                      <>
                        <FiPlus className="text-lg text-white/70" />
                        Follow Vendor
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleMessageClick}
                    disabled={isCreatingChat}
                    className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-white border-2 border-gray-200 text-gray-900 hover:border-blue-600 hover:text-blue-600 rounded-xl text-base font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isCreatingChat ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ...
                      </>
                    ) : (
                      <>
                        <FiMessageCircle className="text-lg" />
                        Message
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Sections Divider Layout --- */}
        
        {/* Coupons (If any) */}
        {coupons.length > 0 && (
          <section className="mb-16 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <FiGift className="text-white text-xl" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Active Offers</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => {
                const active = isCouponActive(coupon);
                return (
                  <div
                    key={coupon._id}
                    className={`relative rounded-3xl p-6 border-2 transition-all duration-300 ${
                      active
                        ? "bg-white border-emerald-100 hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1"
                        : "bg-gray-50 border-gray-100 opacity-70"
                    }`}
                  >
                    {/* Decorative dashed lines for "ticket" look */}
                    <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#F8F9FA] rounded-full transform -translate-y-1/2 border-r-2 border-transparent border-gray-100" style={{ borderRightColor: active ? '#D1FAE5' : '#F3F4F6' }}></div>
                    <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#F8F9FA] rounded-full transform -translate-y-1/2 border-l-2 border-transparent border-gray-100" style={{ borderLeftColor: active ? '#D1FAE5' : '#F3F4F6' }}></div>

                    <div className="flex items-start justify-between mb-4 px-2">
                      <div>
                        <p className={`text-3xl font-semibold ${active ? "text-emerald-600" : "text-gray-500"}`}>
                          {coupon.discountType === "fixed"
                            ? `₦${coupon.discountAmount} OFF`
                            : `${coupon.discount}% OFF`}
                        </p>
                        <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">
                          Expires {formatDate(coupon.validUntil)}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest ${
                          active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {active ? "Active" : "Expired"}
                      </span>
                    </div>

                    <div className="mt-6 flex items-center gap-3 px-2">
                      <div className={`flex-1 flex items-center justify-center p-3 rounded-xl border border-dashed ${
                        active ? "border-emerald-300 bg-emerald-50/50" : "border-gray-300 bg-gray-100"
                      }`}>
                         <code className={`text-lg font-mono font-bold tracking-widest ${active ? "text-emerald-900" : "text-gray-500"}`}>
                           {coupon.code}
                         </code>
                      </div>
                      <button
                        onClick={() => handleCopyCoupon(coupon.code)}
                        disabled={!active}
                        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                          active
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:scale-105"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <FaCopy size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Products */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <FiBox className="text-white text-xl" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Catalog</h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold ml-2">
                {vendorProducts.length}
              </span>
            </div>
          </div>

          {paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Premium Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-12 gap-2">
                  <button
                    onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                    disabled={productPage === 1}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setProductPage(page)}
                        className={`w-12 h-12 flex items-center justify-center rounded-2xl text-base font-semibold transition-all shadow-sm ${
                          page === productPage
                            ? "bg-gray-900 text-white shadow-md shadow-gray-200 scale-105"
                            : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setProductPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={productPage === totalPages}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FiBox className="text-3xl text-gray-300" />
              </div>
              <p className="text-lg font-bold text-gray-900">No items available</p>
              <p className="text-sm text-gray-500 mt-2">Check back later for exciting new products.</p>
            </div>
          )}
        </section>

        {/* Reviews Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-200">
              <FiMessageSquare className="text-white text-xl" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Verified Reviews</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Reviews List */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
              {reviews.length > 0 ? (
                reviews.filter(Boolean).map((review) => (
                  <div
                    key={review._id}
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-semibold text-xl">
                           {(review.user?.firstName?.[0] || "A").toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {review.user?.firstName
                              ? `${review.user.firstName} ${review.user.lastName}`
                              : "Anonymous Customer"}
                          </h4>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5 block">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {userData?.id === review.userId?._id && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className="text-[14px]"
                          color={i < review.rating ? "#fbbf24" : "#f3f4f6"}
                        />
                      ))}
                    </div>

                    {review.comment && (
                      <p className="text-gray-600 leading-relaxed font-medium">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-500">
                    <FaStar className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-500 font-medium">Be the first to share your experience with this vendor.</p>
                </div>
              )}
            </div>

            {/* Review Form (Sticky on Desktop) */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky top-24">
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] p-6 sm:p-8 relative overflow-hidden">
                {/* Decorative blob inside form card */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 rounded-full blur-[30px] z-0 pointer-events-none"></div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">
                    Share your experience
                  </h3>
                  <p className="text-sm font-medium text-gray-500 mb-8">
                    Your feedback helps others make better choices.
                  </p>
                  
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
                        Score
                      </label>
                      <StarRating rating={rating} setRating={setRating} />
                    </div>
                    
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
                        Feedback
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-4 border-2 border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 bg-gray-50/50 hover:bg-gray-50 transition-all resize-none"
                        rows="5"
                        placeholder="What do you think about their products and service?"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold text-base tracking-wide hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        "Submitting..."
                      ) : (
                        <>
                          Post Review
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};

export default VendorPage;

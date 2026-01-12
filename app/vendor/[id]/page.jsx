"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import ProductCard from "@/components/ProductCard";
import { FaStar, FaCopy } from "react-icons/fa";
import { message } from "antd";
import { supabase } from "@/lib/supabase";

const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex space-x-1">
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
              className="cursor-pointer"
              color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              size={24}
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

  // Follow state
  const [isFollowing, setIsFollowing] = useState(followingList?.includes(id));

  useEffect(() => {
    if (id) {
      const fetchVendor = async () => {
        try {
          // Fetch all vendors and find the one with the matching ID
          const response = await axios.get(
            apiUrl(API_CONFIG.ENDPOINTS.VENDOR.GET_ALL),
            { withCredentials: true }
          );
          console.log(response.data);
          const allVendors = response.data || [];
          const foundVendor = allVendors.find((v) => v._id === id);
          if (foundVendor) {
            setVendor(foundVendor);
            // Fetch reviews for the vendor
            const reviewsResponse = await axios.get(
              apiUrl(
                API_CONFIG.ENDPOINTS.RATING.GET_BY_VENDOR + foundVendor._id
              ),
              { withCredentials: true }
            );
            setReviews(reviewsResponse.data.ratings || []);

            // Fetch follower count
            const followerCountResponse = await axios.get(
              apiUrl(
                API_CONFIG.ENDPOINTS.FOLLOW.GET_FOLLOWERS + foundVendor._id
              ),
              { withCredentials: true }
            );
            const checkFollower = followerCountResponse.data.followers?.find(
              (item) => item._id === userData?.id
            );
            // Fetch coupons for the vendor
            const couponsResponse = await axios.get(
              apiUrl(API_CONFIG.ENDPOINTS.COUPON.GET_ALL + foundVendor._id),
              { withCredentials: true }
            );
            setCoupons(couponsResponse.data.coupons || []);
            setFollowerCount(followerCountResponse.data.followersCount || 0);
          } else {
            router.push("/404");
          }
        } catch (error) {
          console.error("Error fetching vendor:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchVendor();

      // Also perform an accurate check for follow status on page load
      if (isLoggedIn) {
        checkIfFollowing(id).then((status) => setIsFollowing(status));
      }
    }
  }, [id, router]);

  useEffect(() => {
    // Update following state if the followingList from context changes
    setIsFollowing(followingList?.includes(id));
  }, [followingList, id]);

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
          console.log(response.data);
          setVendorProducts(response.data || []);
        } catch (error) {
          console.error("Error fetching vendor products:", error);
        }
      }
    };
    fetchVendorProducts();
  }, [vendor]);

  const handleMessageClick = async () => {
    if (isCreatingChat || !vendor || !userData) return;

    setIsCreatingChat(true);
    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", userData._id || userData.id)
        .eq("vendor_id", vendor?._id)
        .single();

      if (existingConversation) {
        router.push(`/chat/${existingConversation.id}`);
      } else {
        // Create new conversation
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

  const handleFollowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      message.error("Please sign in to follow vendors.");
      router.push("/signin");
      return;
    }

    // Call the context function to handle the API call
    followVendor(id);

    // Optimistically update the UI
    setIsFollowing(!isFollowing);
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      message.error("Please log in to submit a review.");
      router.push("/signin");
      return;
    }

    if (userData?.role !== "user") {
      message.error("Only users can submit reviews.");
      return;
    }

    // Check if the user has already submitted a review
    const userHasReviewed = reviews.some(
      (review) => review.userId?._id === userData?.id
    );
    if (userHasReviewed) {
      message.error("You have already submitted a review for this vendor.");
      return;
    }

    if (rating === 0) {
      message.error("Please select a rating.");
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
      console.log(reviewData);
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.RATING.ADD),
        reviewData,
        { withCredentials: true }
      );
      console.log(response.data);
      if (response.data) {
        message.success("Review submitted successfully!");
        // Optimistically add the review to the UI
        setReviews((prevReviews) =>
          [response.data.review, ...prevReviews].filter(Boolean)
        );
        setRating(0);
        setComment("");
      } else {
        message.error("Failed to submit review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error.response.data.message);
      message.error(error.response.data.message);
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
      message.success("Review deleted successfully!");
      setReviews(reviews.filter((review) => review._id !== reviewId));
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to delete review."
      );
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
      () => {
        message.success(`Copied coupon code: ${code}`);
      },
      (err) => {
        message.error("Failed to copy coupon code.");
        console.error("Could not copy text: ", err);
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="px-6 md:px-16 lg:px-32 py-12">
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
      <div className="bg-white rounded-lg shadow-md mb-12 overflow-hidden">
        <div className="relative">
          <Image
            src={vendor?.banner?.url || "https://picsum.photos/seed/1/1200/300"}
            alt={`${vendor.businessName} banner`}
            width={1200}
            height={300}
            className="w-full h-48 object-cover"
            priority
          />
          <div className="absolute bottom-0 left-8 transform translate-y-1/2">
            <Image
              src={vendor?.avatar?.url || "https://i.pravatar.cc/150"}
              alt={`${vendor.businessName} logo`}
              width={150}
              height={150}
              className="rounded-full object-cover border-4 border-white bg-gray-200"
            />
          </div>
        </div>
        <div className="pt-24 pb-8 px-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl md:text-[32px] font-bold text-gray-800 mb-2 md:mb-0">
              {vendor.businessName}
            </h1>
            {isLoggedIn && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleFollowClick}
                  className={`px-6 py-3 text-base font-bold rounded-full transition-all duration-200 whitespace-nowrap flex items-center gap-2 transform hover:scale-105 ${
                    isFollowing
                      ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:shadow-lg"
                      : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:shadow-lg"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Following</span>
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
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      <span>Follow</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleMessageClick}
                  disabled={isCreatingChat}
                  className="px-6 py-3 text-base font-bold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 whitespace-nowrap flex items-center gap-2"
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
              </div>
            )}
          </div>

          <div className="flex items-center justify-center md:justify-start mt-4 space-x-6">
            <div className="flex items-center text-lg text-gray-600">
              <FaStar className="text-yellow-400 mr-2" />
              <span>
                {(vendor.averageRating || 0).toFixed(1)} ({vendor.totalReviews}{" "}
                reviews)
              </span>
            </div>
            <p className="text-gray-500 text-lg">
              <b>{vendor.productCount}</b> Products Listed
            </p>
            <p className="text-gray-500 text-lg">
              <b>{followerCount}</b> Followers
            </p>
          </div>
        </div>
      </div>

      {/* Coupon Management Section */}
      {coupons.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              🎁 Special Offers
            </h2>
          </div>

          {/* Available Coupons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {coupons.map((coupon) => {
              const active = isCouponActive(coupon);
              return (
                <div
                  key={coupon._id}
                  className={`border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${
                    active
                      ? "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200"
                      : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3
                        className={`text-xl font-bold ${
                          active ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {coupon.discountType === "fixed"
                          ? `₦${coupon.discountAmount} OFF`
                          : `${coupon.discount}% OFF`}
                      </h3>
                      <p
                        className={`text-sm ${
                          active ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {coupon.description || "Special discount coupon"}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        active
                          ? "bg-green-500 text-white"
                          : "bg-gray-400 text-white"
                      }`}
                    >
                      {active ? "Active" : "Expired"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <code
                      className={`text-lg font-mono font-bold px-3 py-2 rounded-lg border ${
                        active
                          ? "bg-white text-gray-900"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {coupon.code}
                    </code>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopyCoupon(coupon.code)}
                        className={`p-2 rounded-lg transition-colors ${
                          active
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-gray-400 text-white cursor-not-allowed"
                        }`}
                        title="Copy code"
                        disabled={!active}
                      >
                        <FaCopy size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Coupon Details */}
                  <div className="text-xs space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span
                        className={active ? "text-gray-600" : "text-gray-400"}
                      >
                        Valid Until:
                      </span>
                      <span
                        className={active ? "text-gray-800" : "text-gray-500"}
                      >
                        {formatDate(coupon.validUntil)}
                      </span>
                    </div>
                  </div>

                  {!active && (
                    <div className="text-center text-red-500 text-xs font-semibold mt-2">
                      This offer has expired
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Products from {vendor.businessName}
        </h2>
        {vendorProducts.length > 0 ? (
          <div className="grid home-products grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {vendorProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No products found for this vendor.</p>
        )}
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Customer Reviews
          </h2>
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews
                .filter(Boolean) // Add a filter to remove any potential null/undefined reviews
                .map((review) => (
                  <div
                    key={review._id}
                    className="bg-gray-50 p-4 rounded-lg border"
                  >
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <FaStar key={i} color="#ffc107" />
                        ))}
                        {[...Array(5 - review.rating)].map((_, i) => (
                          <FaStar key={i} color="#e4e5e9" />
                        ))}
                      </div>
                      <div className="ml-auto flex items-center">
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {userData?.id === review.userId?._id && (
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="ml-4 text-red-500 hover:text-red-700 text-xs"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      -{" "}
                      {review.user?.firstName
                        ? `${review.user.firstName} ${review.user.lastName}`
                        : "Anonymous"}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-gray-500">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* Add Review Form */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Leave a Review
          </h2>
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white p-6 rounded-lg shadow-md border"
          >
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Your Rating
              </label>
              <StarRating rating={rating} setRating={setRating} />
            </div>
            <div className="mb-4">
              <label
                htmlFor="comment"
                className="block text-gray-700 font-medium mb-2"
              >
                Your Comment
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Share your experience with this vendor..."
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorPage;

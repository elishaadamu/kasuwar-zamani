"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { FiFolder, FiUsers, FiShoppingBag } from "react-icons/fi";
import { useAppContext } from "@/context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

const VendorCard = ({
  _id,
  businessName,
  avatar,
  banner,
  productCount,
  averageRating,
  totalReviews,
  isClosed,
  category, // Added category prop
  followers,
}) => {
  const {
    isLoggedIn,
    router,
    userData,
    followingList,
    followVendor,
    checkIfFollowing,
  } = useAppContext();

  // Optimistic UI update
  const [isFollowing, setIsFollowing] = useState(followingList?.includes(_id));
  const [followerCount, setFollowerCount] = useState(followers || 0);

  useEffect(() => {
    // Sync with the accurate check from the backend when component mounts
    if (isLoggedIn) {
      checkIfFollowing(_id).then((status) => setIsFollowing(status));
    }

    const fetchFollowerCount = async () => {
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.FOLLOW.GET_FOLLOWERS + _id),
          { withCredentials: true }
        );

        setFollowerCount(response.data.followersCount || 0);
      } catch (error) {
        console.error("Error fetching follower count:", error);
        // Keep the initial prop value on error
      }
    };
    fetchFollowerCount();
  }, [_id, isLoggedIn, checkIfFollowing]);

  const handleFollowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Please sign in to follow vendors.");
      router.push("/signin");
      return;
    }

    // Call the context function to handle the API call
    followVendor(_id);

    // Optimistically update the UI
    setIsFollowing(!isFollowing);
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
  };

  return (
    <Link
      href={`/vendor/${_id}`}
      className="group block h-full w-full"
    >
      <div className="relative flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden">

        {/* Banner Section */}
        <div className="relative w-full h-32 sm:h-36 overflow-hidden bg-gray-100">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
          <Image
            src={banner?.url || "https://picsum.photos/seed/1/400/200"}
            alt="banner"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* CLOSED badge */}
          {isClosed && (
            <div className="absolute top-3 left-3 bg-red-500/95 text-white text-[11px] font-bold tracking-wider py-1.5 px-3.5 rounded-full shadow-md z-20 uppercase flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Closed
            </div>
          )}

          {/* View Store Overlay Centered in Banner */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-white/95 backdrop-blur-sm text-blue-600 text-sm font-bold tracking-wide px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
              View Store
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 relative px-5 pb-5 pt-12">
          {/* Avatar */}
          <div className="absolute -top-12 left-5 w-24 h-24 bg-white rounded-full p-1.5 shadow-md z-30 group-hover:scale-[1.03] group-hover:-translate-y-1 transition-all duration-300">
            <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-50">
              <Image
                src={avatar?.url || "https://i.pravatar.cc/150"}
                alt="avatar"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Follow Button */}
          {isLoggedIn && userData?.role === "user" && (
            <div className="absolute top-3 right-4 z-20">
              <button
                onClick={handleFollowClick}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 shadow-sm flex items-center gap-1.5 ${isFollowing
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-200"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 border border-transparent"
                  }`}
              >
                {isFollowing ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Following
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Follow
                  </>
                )}
              </button>
            </div>
          )}

          {/* Title & Category */}
          <div className="mb-5 flex-1">
            <h3 className="text-[1.35rem] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5 tracking-tight">
              {businessName}
            </h3>
            {category && (
              <div className="flex items-center text-sm text-gray-500 font-medium bg-gray-50 w-fit px-2.5 py-1 rounded-md border border-gray-100">
                <FiFolder className="mr-1.5 text-blue-500/70" />
                <span className="line-clamp-1 text-xs">{category}</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mt-auto">
            {/* Rating Column */}
            <div className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-gray-50/80 group-hover:bg-yellow-50/60 transition-colors border border-gray-100 group-hover:border-yellow-200/60">
              <div className="flex items-center gap-1.5 mb-1">
                <FaStar className="text-yellow-400 text-[15px]" />
                <span className="font-bold text-gray-900 text-[15px] leading-none">{(averageRating || 0).toFixed(1)}</span>
              </div>
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{totalReviews ?? 0} Reviews</span>
            </div>

            {/* Followers Column */}
            <div className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-gray-50/80 group-hover:bg-blue-50/60 transition-colors border border-gray-100 group-hover:border-blue-200/60">
              <div className="flex items-center gap-1.5 mb-1">
                <FiUsers className="text-blue-500 text-[15px]" />
                <span className="font-bold text-gray-900 text-[15px] leading-none">{followerCount}</span>
              </div>
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Followers</span>
            </div>

            {/* Products Column */}
            <div className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-gray-50/80 group-hover:bg-green-50/60 transition-colors border border-gray-100 group-hover:border-green-200/60">
              <div className="flex items-center gap-1.5 mb-1">
                <FiShoppingBag className="text-green-500 text-[15px]" />
                <span className="font-bold text-gray-900 text-[15px] leading-none">{productCount ?? 0}</span>
              </div>
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Products</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VendorCard;

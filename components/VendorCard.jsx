"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { FiFolder } from "react-icons/fi";
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
      className="block relative group bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Banner */}
      <div className="relative w-full h-28">
        <Image
          src={banner?.url || "https://picsum.photos/seed/1/400/200"}
          alt="banner"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />

        {/* CLOSED badge */}
        {isClosed && (
          <div className="absolute top-3 right-3 bg-[#696000] text-white text-sm font-semibold py-1 px-3 rounded-full">
            Closed Now
          </div>
        )}

        {/* Avatar */}
        <div className="absolute -bottom-10 left-4 w-20 h-20 rounded-full border-4 border-white overflow-hidden">
          <Image
            src={avatar?.url || "https://i.pravatar.cc/150"}
            alt="avatar"
            width={80}
            height={80}
            sizes="80px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 px-4 pb-4">
        <div className="flex flex-row justify-between items-start">
          <h3 className="text-lg sm:text-xl font-semibold flex-1 mr-2">
            {businessName}
          </h3>
          {isLoggedIn && userData?.role === "user" && (
            <button
              onClick={handleFollowClick}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${
                isFollowing
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
        <div className="flex flex-row justify-between items-baseline mt-2">
          <div className="text-blue-800 bg-gray-100 rounded-lg flex flex-row gap-2 items-center px-3 py-1">
            <p className="text-sm font-semibold">{followerCount}</p>
            <p className="text-gray-500 text-xs mt-0">Followers</p>
          </div>
        </div>

        {/* Category */}
        {category && (
          <div className="flex items-center mt-2 text-gray-500">
            <FiFolder className="mr-2 text-sm" />
            <p className="text-sm">{category}</p>
          </div>
        )}

        {/* Rating Row */}
        <div className="flex items-center mt-1">
          <FaStar className="text-yellow-400 mr-1 text-sm" />
          <span className="font-medium text-sm">
            {(averageRating || 0).toFixed(1)}
          </span>
          <span className="ml-1 text-gray-500 text-sm">Rating</span>
        </div>

        {/* Reviews + Products Row */}
        <div className="flex justify-center items-center gap-2 sm:gap-3 mt-4 text-center">
          <div className="text-blue-800 bg-gray-100 rounded-lg flex flex-row gap-2 items-center px-3 py-2">
            <p className="text-lg sm:text-xl font-semibold">
              {totalReviews ?? 0}
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-0">Reviews</p>
          </div>

          <div className="text-blue-800 bg-gray-100 rounded-lg flex flex-row gap-2 items-center px-3 py-2">
            <p className="text-lg sm:text-xl font-semibold">
              {productCount ?? 0}
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-0">Products</p>
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <span className="text-white text-lg font-bold border-2 border-white rounded-md px-4 py-2">
          View Store
        </span>
      </div>
    </Link>
  );
};

export default VendorCard;

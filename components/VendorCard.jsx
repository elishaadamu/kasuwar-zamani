"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaStar, FaStore } from "react-icons/fa";
import { FiCheck, FiPlus } from "react-icons/fi";
import { useAppContext } from "@/context/AppContext";
import { customToast } from "@/lib/customToast";
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
  category,
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

  const [isFollowing, setIsFollowing] = useState(followingList?.includes(_id));
  const [followerCount, setFollowerCount] = useState(followers || 0);

  useEffect(() => {
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
      } catch (error) {}
    };
    fetchFollowerCount();
  }, [_id, isLoggedIn, checkIfFollowing]);

  const handleFollowClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      customToast.error("Sign In Required", "Please sign in to follow vendors.");
      router.push("/signin");
      return;
    }

    const previousState = isFollowing;
    setIsFollowing(!previousState);

    const responseData = await followVendor(_id);

    if (responseData && responseData.action) {
      if (responseData.action === "follow") {
        setIsFollowing(true);
        if (!previousState) setFollowerCount((prev) => prev + 1);
      } else if (responseData.action === "unfollow") {
        setIsFollowing(false);
        if (previousState) setFollowerCount((prev) => Math.max(0, prev - 1));
      }
    } else {
      setIsFollowing(previousState);
    }
  };

  const rating = (averageRating || 0).toFixed(1);

  return (
    <Link href={`/vendor/${_id}`} className="group block h-full w-full">
      <div className="relative flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] transition-all duration-500 ease-out transform group-hover:-translate-y-1.5">
        
        {/* Banner */}
        <div className="relative w-full h-32 sm:h-40 overflow-hidden bg-gray-100">
          <Image
            src={banner?.url || "https://picsum.photos/seed/1/400/200"}
            alt="banner"
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Closed badge */}
          {isClosed && (
            <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold tracking-widest py-1.5 px-3.5 rounded-full shadow-lg z-20 uppercase flex items-center gap-1.5 border border-white/20">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Closed
            </div>
          )}

          {/* Rating floating badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1.5 z-20 shadow-lg border border-white/50">
            <FaStar className="text-yellow-400 text-sm" />
            <span className="text-sm font-semibold text-gray-900">{rating}</span>
          </div>
        </div>

        {/* Content area */}
        <div className="relative flex flex-col flex-1 px-5 sm:px-6 pb-6 pt-10">
          
          {/* Avatar floating */}
          <div className="absolute -top-12 left-5 w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full p-1.5 shadow-xl z-30 group-hover:scale-105 transition-transform duration-500">
            <div className="w-full h-full rounded-full overflow-hidden relative border border-gray-50 bg-gray-50">
              <Image
                src={avatar?.url || "https://i.pravatar.cc/150"}
                alt="avatar"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Follow button (Circle) */}
          {isLoggedIn && userData?.role === "user" && (
            <button
              onClick={handleFollowClick}
              className={`absolute top-4 right-5 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border-2 z-30 ${
                isFollowing
                  ? "bg-white text-gray-700 border-gray-200 hover:border-red-200 hover:text-red-500 hover:bg-red-50"
                  : "bg-gray-900 text-white border-gray-900 hover:bg-black hover:scale-105 hover:shadow-xl"
              }`}
              title={isFollowing ? "Unfollow" : "Follow"}
            >
              {isFollowing ? <FiCheck className="text-lg" /> : <FiPlus className="text-lg" />}
            </button>
          )}

          {/* Title & Category */}
          <div className="mb-5 mt-2">
            <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1 mb-2 pr-14">
              {businessName}
            </h3>
            {category && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-lg">
                <FaStore className="text-gray-400 text-[10px]" />
                {category}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-100 mb-5"></div>

          {/* Stats bottom row */}
          <div className="flex items-center justify-between text-gray-500 mt-auto px-2">
            <div className="flex flex-col items-center w-1/3 text-center">
              <span className="text-[18px] sm:text-[22px] font-semibold text-gray-900">{followerCount}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-0.5 truncate w-full">Followers</span>
            </div>
            <div className="w-px h-8 bg-gray-100 shrink-0"></div>
            <div className="flex flex-col items-center w-1/3 text-center">
              <span className="text-[18px] sm:text-[22px] font-semibold text-gray-900">{productCount ?? 0}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-0.5 truncate w-full">Items</span>
            </div>
            <div className="w-px h-8 bg-gray-100 shrink-0"></div>
            <div className="flex flex-col items-center w-1/3 text-center">
              <span className="text-[18px] sm:text-[22px] font-semibold text-gray-900">{totalReviews ?? 0}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-0.5 truncate w-full">Reviews</span>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
};

export default VendorCard;

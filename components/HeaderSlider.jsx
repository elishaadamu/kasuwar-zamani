"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

const HeaderSlider = ({ initialBanners }) => {
  const [banners, setBanners] = useState(initialBanners || []);
  const [loading, setLoading] = useState(
    !initialBanners || initialBanners.length === 0
  );
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Static brand description
  const brandDescription =
    "Kasuwar Zamani is your go-to online marketplace for quality products, great prices, and a seamless shopping experience.";

  // Static badges for brand trust
  const trustBadges = [
    { text: "Fast Delivery" },
    { text: "Secure Payments" },
    { text: "24/7 Support" },
  ];

  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) return;

    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.BANNERS.GET_ALL),
          { withCredentials: true }
        );
        setBanners(response.data.banners || []);
      } catch (err) {
        setError("Could not load banners at the moment.");
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [initialBanners]);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    // Animation effect for text on slide change
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500); // Duration of the fade-in animation
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const handleSlideChange = (index) => {
    if (index !== currentSlide) {
      setCurrentSlide(index);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl mt-6 bg-gray-100">
      {loading ? (
        <div className="flex items-center justify-center min-h-[280px] bg-gray-200 rounded-xl">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
        </div>
      ) : error || banners.length === 0 ? (
        <div className="flex items-center justify-center min-h-[280px] bg-gray-200 rounded-xl">
          <p className="text-gray-600">{error || "No banners available."}</p>
        </div>
      ) : (
        <>
          {/* SLIDER */}
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="min-w-full flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 py-8 md:py-6 bg-gradient-to-r from-[#E7ECF5] to-[#F6F7FA]"
              >
                {/* TEXT SECTION */}
                <div
                  className={`flex-1 md:max-w-[40%] text-center md:text-left mt-8 md:mt-0 transition-opacity duration-500 ${
                    isAnimating && currentSlide === banners.indexOf(banner)
                      ? "opacity-0"
                      : "opacity-100"
                  }`}
                >
                  {banner.offer && (
                    <p className="text-blue-600 font-medium tracking-wide mb-2">
                      {banner.offer}
                    </p>
                  )}

                  <h1 className="text-3xl md:text-5xl font-bold leading-tight text-gray-900 max-w-md mx-auto md:mx-0">
                    {banner.title}
                  </h1>

                  <div className="mt-6">
                    <Link
                      href={banner.link || "#"}
                      className="inline-block px-10 py-3 bg-blue-600 text-white rounded-full font-semibold transition-all hover:bg-blue-700"
                    >
                      Shop Now
                    </Link>
                  </div>

                  {/* TRUST BADGES */}
                  <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
                    {trustBadges.map((badge, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs text-gray-600"
                      >
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span>{badge.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* IMAGE SECTION */}
                <div className="flex-1 flex items-center justify-center">
                  <Image
                    src={`${banner.image.url}?q_auto,f_auto`}
                    alt={banner.title}
                    width={800}
                    height={800}
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain w-[80%] md:w-[90%] max-h-[280px] md:max-h-[320px]"
                    priority={banners.indexOf(banner) === 0}
                    loading={banners.indexOf(banner) === 0 ? "eager" : "lazy"}
                    fetchPriority={
                      banners.indexOf(banner) === 0 ? "high" : "auto"
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          {/* DOTS */}
          <div className="absolute bottom-5 mt-20 md:mt-2 w-full flex items-center justify-center gap-3">
            {banners.map((_, index) => (
              <div
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`h-3 w-3 rounded-full cursor-pointer transition-all 
                  ${
                    currentSlide === index
                      ? "bg-blue-600 scale-110"
                      : "bg-white/60 border border-gray-300"
                  }`}
              ></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeaderSlider;

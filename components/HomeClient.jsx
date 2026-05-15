"use client";
import React, { useEffect, useRef, useCallback, useState } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useRouter } from "next/navigation";

import dynamic from "next/dynamic";
import HeaderSlider from "@/components/HeaderSlider";
const HomeProducts = dynamic(() => import("@/components/HomeProducts"), { ssr: false });
const CategorySidebar = dynamic(() => import("@/components/CategorySidebar"), { ssr: false });
// const NewsLetter = dynamic(() => import("@/components/NewsLetter"), { ssr: false });
const Banner = dynamic(() => import("@/components/Banner"), { ssr: false });
import { useAppContext } from "@/context/AppContext";
const VendorSection = dynamic(() => import("@/components/VendorSection"), { ssr: false });
const FeaturedProduct = dynamic(() => import("@/components/FeaturedProduct"), { ssr: false });
const CategoryProducts = dynamic(() => import("@/components/CategoryProducts"), { ssr: false });
const SubscriptionPlans = dynamic(() => import("@/components/SubscriptionSection"), { ssr: false });

import Link from "next/link";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { FaArrowRight } from "react-icons/fa";

const useIdleTimeout = (
  onIdle,
  idleTimeInSeconds = 72000000,
  enabled = true
) => {
  const timeoutId = useRef();
  const channel = useRef(null);

  const startTimer = () => {
    clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(onIdle, idleTimeInSeconds * 1000);
  };

  const resetTimer = () => {
    startTimer();
  };

  const handleBroadcastMessage = useCallback((event) => {
    if (event.data === "user-activity") {
      resetTimer();
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      clearTimeout(timeoutId.current);
      return;
    }

    // Create a BroadcastChannel to communicate across tabs
    channel.current = new BroadcastChannel("idle-timeout");
    channel.current.onmessage = handleBroadcastMessage;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    let lastActivity = 0;
    const throttleDelay = 2000; // 2 seconds

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > throttleDelay) {
        lastActivity = now;
        // Notify other tabs about the activity
        if (channel.current) {
          channel.current.postMessage("user-activity");
        }
        resetTimer();
      }
    };

    // Set up event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, {
        passive: true,
        capture: true,
      });
    });

    startTimer();

    // Cleanup
    // Cleanup function
    const cleanup = () => {
      clearTimeout(timeoutId.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity, { capture: true });
      });
      if (channel.current) {
        channel.current.close();
        channel.current = null;
      }
    };

    // Handle pagehide for bfcache
    const handlePageHide = () => {
      if (channel.current) {
        channel.current.close();
        channel.current = null;
      }
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      cleanup();
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [onIdle, idleTimeInSeconds, handleBroadcastMessage, enabled]); // Dependencies for the effect
};

const HomeClient = ({ initialBanners }) => {
  const router = useRouter();
  const { logout, isLoggedIn, userData } = useAppContext();

  const handleIdle = useCallback(() => {
    logout();
  }, [logout]);

  // Set timeout for 2 minutes (120 seconds)
  // The idle timer is only enabled if the user is logged in.
  useIdleTimeout(handleIdle, 120, isLoggedIn);

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showBackToTop && window.pageYOffset > 400) {
        setShowBackToTop(true);
      } else if (showBackToTop && window.pageYOffset <= 400) {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", checkScrollTop);
    return () => {
      window.removeEventListener("scroll", checkScrollTop);
    };
  }, [showBackToTop]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="relative min-h-screen bg-[#f8fafc] pb-20 pt-4 overflow-hidden">
        {/* Visible Square Grid Background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)`,
            backgroundSize: `40px 40px`
          }}
        ></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#f8fafc] via-transparent to-transparent pointer-events-none"></div>

        {/* Main Content wrapper */}
        <div className="relative z-10 w-full">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-[500px]">
              {/* Category Sidebar */}
              <div className="hidden xl:block xl:col-span-1 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-4 h-full">
                <CategorySidebar />
              </div>

              {/* Hero Banner Grid (Bento) */}
              <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Slider Area */}
                <div className="md:col-span-2 md:row-span-2 rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/5 h-full relative group bg-white border border-gray-100">
                  <HeaderSlider initialBanners={initialBanners} />
                </div>

                {/* Banner Top Right */}
                <div className="md:col-span-1 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden group shadow-xl shadow-purple-900/10 flex items-center p-8 aspect-[4/3] md:aspect-auto">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute -bottom-10 -right-10 opacity-30 w-48 h-48 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                    <Image 
                      src={assets.girl_with_headphone_image} 
                      alt="Tech" 
                      fill 
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain" 
                    />
                  </div>
                  <div className="relative z-10 text-white w-full">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">Trending</span>
                    <h3 className="text-3xl font-black mt-6 tracking-tight leading-none mb-3">Urban<br />Lifestyle</h3>
                    <Link href="/all-products" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-white text-indigo-600 px-5 py-3 rounded-xl hover:gap-4 transition-all mt-4 hover:shadow-lg">
                      Shop Now <FaArrowRight />
                    </Link>
                  </div>
                </div>

                {/* Banner Bottom Right */}
                <div className="md:col-span-1 rounded-[2rem] bg-gradient-to-tr from-gray-900 to-blue-950 relative overflow-hidden group shadow-xl shadow-blue-900/10 flex items-center p-8 aspect-[4/3] md:aspect-auto">
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500 opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute top-10 -right-6 opacity-80 w-40 h-40 -rotate-12 group-hover:rotate-0 transition-transform duration-500 z-0">
                    <Image 
                      src={assets.apple_earphone_image} 
                      alt="Tech" 
                      fill 
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain" 
                    />
                  </div>
                  <div className="relative z-10 text-white w-full mt-auto mb-0 flex flex-col items-start justify-end h-full pt-16">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/20 text-blue-200">Limited Offer</span>
                    <h3 className="text-3xl font-black mt-4 tracking-tight leading-none">Gadget<br />Madness</h3>
                    <Link 
                      href="/all-products" 
                      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-blue-500 text-white px-5 py-3 rounded-xl hover:gap-4 transition-all mt-6 hover:shadow-lg hover:shadow-blue-500/20"
                    >
                      Explore Selection <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 max-w-[1440px] mx-auto lg:px-8 space-y-16">
            <HomeProducts />

            <VendorSection />
            <hr className="my-12 border-gray-200" />

            <FeaturedProduct />

            {/* Dynamically render a section for each category */}
            <CategoryProducts />

            <SubscriptionPlans />
          </div>
        </div>
      </div>
      {/* {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all duration-300 z-50"
          aria-label="Go to top"
          title="Go to top"
        >
          <FaArrowUp className="w-5 h-5" />
        </button>
      )} */}
    </>
  );
};

export default HomeClient;

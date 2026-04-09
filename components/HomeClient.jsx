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
      console.log("Activity in another tab, resetting idle timer.");
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
      console.log("Cleaning up idle timer.");
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
    console.log("User is idle. Logging out and redirecting.");
    logout();
    // Use userData from context, which is available in this scope
    const role = userData?.user?.role || userData?.role;
    if (role === "user") {
      router.push("/signin"); // Redirect to sign-in page after logout
    } else if (role === "admin") {
      router.push("/admin/signin"); // Redirect to admin sign-in page after logout
    } else if (role === "vendor") {
      router.push("/vendor-signin"); // Redirect to vendor sign-in page after logout
    } else if (role === "delivery") {
      router.push("/delivery-signin"); // Redirect to delivery sign-in page after logout
    }
  }, [logout, router, userData]);

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
      <div className="flex justify-center max-w-[1280px] mb-10 mx-auto gap-10 min-h-[400px]">
        <div className="hidden md:block md:w-[20%] min-w-[250px]">
          <CategorySidebar />
        </div>
        <div className="w-full md:w-[80%]">
          <HeaderSlider initialBanners={initialBanners} />
        </div>
      </div>
      <div className="px-6  max-w-[1280px] mx-auto lg:px-32">
        <HomeProducts />
        <hr className="my-6 border-gray-200" />

        <VendorSection />
        <hr className="my-12 border-gray-200" />

        <FeaturedProduct />

        {/* Dynamically render a section for each category */}
        <CategoryProducts />

        <SubscriptionPlans />
        <hr className="my-12 border-gray-200" />


        {/* <NewsLetter /> */}
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

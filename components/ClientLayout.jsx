"use client";
import React from "react";
import { useAppContext } from "@/context/AppContext";
import { usePathname } from "next/navigation";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterModal from "@/components/NewsletterModal";
import CookieConsent from "@/components/CookieConsent";
import BottomNavBar from "@/components/BottomNavBar";

const ClientLayout = ({ children, isSpecialRoute }) => {
  const { authLoading } = useAppContext();
  const pathname = usePathname();

  if (authLoading) {
    return <Loading fullScreen />;
  }

  // Define routes where Bottom Nav should NOT be shown
  const hideBottomNavRoutes = [
    "/signin",
    "/signup",
    "/vendor-signin",
    "/vendor-signup",
    "/delivery-signin",
    "/delivery-signup",
    "/chat"
  ];
  
  const showBottomNav = !hideBottomNavRoutes.some(route => pathname.startsWith(route));

  return (
    <>
      {!isSpecialRoute && <Navbar />}
      
      {/* Apply spacer if bottom nav is shown */}
      <div className={showBottomNav ? "bottom-nav-spacer" : ""}>
        {children}
      </div>
      
      {!isSpecialRoute && <Footer />}

      {/* Bottom Nav Bar for Mobile */}
      {showBottomNav && <BottomNavBar />}

      {/* Global Modals for End-Users */}
      {!isSpecialRoute && (
        <>
          <NewsletterModal />
          <CookieConsent />
        </>
      )}
    </>
  );
};

export default ClientLayout;

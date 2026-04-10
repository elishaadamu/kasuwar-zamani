"use client";
import React from "react";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterModal from "@/components/NewsletterModal";
import CookieConsent from "@/components/CookieConsent";

const ClientLayout = ({ children, isSpecialRoute }) => {
  const { authLoading } = useAppContext();

  if (authLoading) {
    return <Loading fullScreen />;
  }

  return (
    <>
      {!isSpecialRoute && <Navbar />}
      {children}
      {!isSpecialRoute && <Footer />}

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

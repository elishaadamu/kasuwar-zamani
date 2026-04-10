"use client";
import React from "react";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    </>
  );
};

export default ClientLayout;

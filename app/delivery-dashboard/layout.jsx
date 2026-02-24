"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { decryptData } from "../../lib/encryption";
import Logo from "@/assets/logo/logo.png";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/components/delivery-dashboard/Sidebar";

const WalletNotification = ({ onDismiss }) => (
  <div className="fixed top-4 right-4 w-1/2 md:w-[350px] bg-yellow-200 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-lg z-50 flex justify-between items-center">
    <div>
      <p className="font-bold">Create Your Wallet!</p>
      <p>
        You need to create a wallet for transactions.
        <Link href="/dashboard/wallet" className="font-bold underline">
          Create Wallet
        </Link>
      </p>
    </div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        className="text-yellow-700 hover:text-yellow-900 ml-4"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    )}
  </div>
);

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [openSettings, setOpenSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [hasWallet, setHasWallet] = useState(true);
  const [showWalletNotification, setShowWalletNotification] = useState(false);
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push(`/delivery-signin?redirect=${pathname}`);
    } else {
      const decryptedData = decryptData(user);
      setUserData(decryptedData);
    }
  }, [router, pathname]);

  useEffect(() => {
    if (userData) {
      const fetchAccountDetails = async () => {
        try {
          await axios.get(
            apiUrl(API_CONFIG.ENDPOINTS.ACCOUNT.GET + userData.id)
          );
          setHasWallet(true);
          setShowWalletNotification(false);
        } catch (error) {
          if (error.status === 404) {
            setHasWallet(false);
            setShowWalletNotification(true);
          }
        }
      };
      fetchAccountDetails();
    }
  }, [userData]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    console.log("Logging out and redirecting to homepage...");
    router.push("/");
  };

  const handleDismissNotification = () => {
    setShowWalletNotification(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      {showWalletNotification && (
        <WalletNotification onDismiss={handleDismissNotification} />
      )}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
        openSettings={openSettings}
        setOpenSettings={setOpenSettings}
      />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <div className="sticky top-0 z-10 bg-white md:hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Link href={"/"} className="flex items-center">
              <Image
                className="w-[12rem] mx-auto"
                src={Logo}
                alt="logo"
                priority
              />
            </Link>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;

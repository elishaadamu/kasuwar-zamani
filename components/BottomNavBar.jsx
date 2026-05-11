"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { customToast } from "@/lib/customToast";
import {
  FaUser,
  FaTruck,
  FaShoppingCart,
  FaBoxOpen,
  FaCommentDots,
  FaCog,
  FaTag,
  FaUsers,
  FaShieldAlt,
  FaKey,
  FaTrashAlt,
  FaSignOutAlt,
  FaTimes,
  FaChevronRight,
  FaGift,
  FaWallet,
  FaHeadset,
  FaHistory,
  FaMapMarkerAlt,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

const BottomNavBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, userData, logout } = useAppContext();
  const [showMePanel, setShowMePanel] = useState(false);

  const handleAuthGatedNavigation = (path, label) => {
    if (!isLoggedIn) {
      customToast.error("Sign In Required", `Please sign in to access ${label}.`);
      router.push(`/signin?redirect=${path}`);
      return;
    }
    router.push(path);
  };

  const tabs = [
    {
      id: "me",
      label: "Me",
      icon: FaUser,
      action: () => setShowMePanel(true),
      isActive: pathname.startsWith("/dashboard"),
    },
    {
      id: "delivery",
      label: "Delivery",
      icon: FaTruck,
      action: () => handleAuthGatedNavigation("/dashboard/request-delivery", "Delivery"),
      isActive: pathname.startsWith("/dashboard/request-delivery") || pathname.startsWith("/dashboard/delivery-payment"),
    },
    {
      id: "products",
      label: "Products",
      icon: FaShoppingCart,
      isCenter: true,
      action: () => router.push("/all-products"),
      isActive: pathname.startsWith("/all-products"),
    },
    {
      id: "orders",
      label: "Orders",
      icon: FaBoxOpen,
      action: () => handleAuthGatedNavigation("/dashboard/all-orders", "Orders"),
      isActive: pathname.startsWith("/dashboard/all-orders"),
    },
    {
      id: "chat",
      label: "Chat",
      icon: FaCommentDots,
      action: () => handleAuthGatedNavigation("/chat", "Chat"),
      isActive: pathname.startsWith("/chat"),
    },
  ];

  // "Me" panel menu items
  const meMenuItems = isLoggedIn
    ? [
      { icon: FaWallet, label: "Dashboard", href: "/dashboard", color: "text-blue-500" },
      { icon: FaCog, label: "Settings", href: "/dashboard/personal-details", color: "text-gray-500" },
      { icon: FaTag, label: "Coupons", href: "/dashboard/coupons", color: "text-orange-500" },
      { icon: FaUsers, label: "Refer & Earn", href: "/dashboard/referrals", color: "text-green-500" },
      { icon: FaHistory, label: "Transaction History", href: "/dashboard/transaction-history", color: "text-purple-500" },
      { icon: FaMapMarkerAlt, label: "My Addresses", href: "/dashboard/address", color: "text-red-500" },
      { icon: FaHeadset, label: "Support", href: "/dashboard/support-ticket", color: "text-indigo-500" },
      { icon: FaGift, label: "POS Sales", href: "/dashboard/pos-sales", color: "text-amber-500" },
    ]
    : [];

  return (
    <>
      {/* Bottom Navigation Bar — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden">
        {/* Glass-effect dark bar */}
        <div className="mx-3 mb-3 bg-gray-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-black/30 border border-white/[0.08]">
          <div className="flex items-center justify-around px-2 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              if (tab.isCenter) {
                return (
                  <button
                    key={tab.id}
                    onClick={tab.action}
                    className="relative -mt-6 flex items-center justify-center"
                    aria-label={tab.label}
                  >
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-xl scale-125" />
                    {/* Main button */}
                    <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/40 hover:shadow-blue-500/60 active:scale-90 transition-all duration-200">
                      <Icon className="w-6 h-6 text-white" />
                      {tab.badge > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">
                          {tab.badge}
                        </div>
                      )}
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={tab.action}
                  className="flex flex-col items-center justify-center py-2 px-3 group"
                  aria-label={tab.label}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${tab.isActive
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-gray-400 group-hover:text-gray-200 group-active:scale-90"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-0.5 transition-colors ${tab.isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"
                      }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* "Me" Slide-up Panel */}
      {showMePanel && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowMePanel(false)}
          />

          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] shadow-2xl max-h-[85vh] overflow-hidden animate-slideUp">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pt-2 pb-4 flex items-center justify-between">
              <div>
                {isLoggedIn ? (
                  <>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">
                      {userData?.firstName || "My Account"}
                    </h2>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      {userData?.phone || userData?.email || "Manage your account"}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Welcome!</h2>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      Sign in to manage your account
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowMePanel(false)}
                className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-all"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-8 overflow-y-auto max-h-[65vh]">
              {isLoggedIn ? (
                <>
                  {/* Menu Grid */}
                  <div className="space-y-1">
                    {meMenuItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        onClick={() => setShowMePanel(false)}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-all group"
                      >
                        <div className={`w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center ${item.color} group-hover:bg-white group-hover:shadow-sm transition-all`}>
                          <item.icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 flex-1">{item.label}</span>
                        <FaChevronRight className="w-3 h-3 text-gray-300 group-hover:text-gray-400 transition-colors" />
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="mt-4 px-2">
                    <button
                      onClick={() => {
                        setShowMePanel(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 active:bg-red-200 transition-all"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                /* Not logged in — show Sign In / Sign Up options */
                <div className="space-y-4 pt-2">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <FaUser className="w-7 h-7 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-1">Join Kasuwar Zamani</h3>
                    <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                      Sign in to track orders, manage your wishlist, request deliveries, and access exclusive deals.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowMePanel(false);
                          router.push("/signin");
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-95 transition-all"
                      >
                        <FaSignInAlt className="w-4 h-4" />
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setShowMePanel(false);
                          router.push("/signup");
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white text-gray-700 rounded-2xl font-bold text-sm border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
                      >
                        <FaUserPlus className="w-4 h-4" />
                        Sign Up
                      </button>
                    </div>
                  </div>

                  {/* Vendor / Delivery options */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">More Options</p>
                    {[
                      { label: "Become a Vendor", href: "/vendor-signup", icon: FaTag },
                      { label: "Vendor Login", href: "/vendor-signin", icon: FaTag },
                      { label: "Become a Delivery Man", href: "/delivery-signup", icon: FaTruck },
                      { label: "Delivery Login", href: "/delivery-signin", icon: FaTruck },
                    ].map((item, i) => (
                      <Link
                        key={i}
                        href={item.href}
                        onClick={() => setShowMePanel(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-all group"
                      >
                        <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-gray-600">{item.label}</span>
                        <FaChevronRight className="w-3 h-3 text-gray-300 ml-auto" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNavBar;

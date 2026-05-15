"use client";
import React, { useState, useEffect } from "react";
import Logo from "@/assets/logo/logo.png";
import { assets } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { decryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import axios from "axios";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { customToast } from "@/lib/customToast";
import {
  HiOutlineShoppingBag,
} from "react-icons/hi2";
import { FiSearch, FiX } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";

const Navbar = () => {
  const {
    isSeller,
    router,
    getCartCount,
    getWishlistCount,
    userData,
    isLoggedIn,
    logout,
    products,
    cartItems,
  } = useAppContext();
  const pathname = usePathname();

  // UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // Desktop dropdown opens (hover + click)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Mobile accordion state: which section is open ('categories','pages','vendor','delivery','account', null)
  const [mobileOpenSection, setMobileOpenSection] = useState(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Data
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);


  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET_ALL),
          { withCredentials: true }
        );
        setCategories(response.data.categories || []);
      } catch (err) {
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Filter products for search
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products]);

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const encryptedUser = localStorage.getItem("user");
        if (encryptedUser) {
          const userData = decryptData(encryptedUser);
          const walletResponse = await axios.get(
            apiUrl(
              API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance +
                userData.id +
                "/balance"
            ),
            { withCredentials: true }
          );
          setWalletBalance(walletResponse.data.data);
        }
      } catch (error) {
      }
    };
    fetchWalletBalance();
  }, []);

  // Window resize: close search on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animate mobile menu and lock body scroll
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => setAnimate(true));
    } else {
      document.body.style.overflow = "unset";
      setAnimate(false);
      setMobileOpenSection(null);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleCloseMenu = () => {
    setAnimate(false);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 300);
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
    setTimeout(() => document.getElementById("search-modal-input")?.focus(), 0);
  };

  const handleMessageClick = async () => {
    if (!isLoggedIn) {
      customToast.error("Sign In Required", "Please sign in to access messages.");
      router.push("/signin");
      return;
    }

    router.push("/chat");
  };

  // Toggle a mobile accordion section
  const toggleMobileSection = (section) => {
    setMobileOpenSection((prev) => (prev === section ? null : section));
  };

  // Helper to show rotated chevron class
  const chevronClass = (isOpen) =>
    `transform transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`;

  return (
    <nav className={`border-b border-gray-300 text-gray-700 relative bg-white shadow-md ${isMobileMenuOpen || isSearchOpen ? 'z-[400]' : 'z-40'}`}>
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-3 md:px-4 lg:px-4 py-3">
        <div className="flex items-center gap-4">
          <Image
            className="cursor-pointer w-[160px] md:w-[200px] lg:w-[250px]"
            onClick={() => router.push("/")}
            src={Logo}
            alt="logo"
            sizes="(max-width: 768px) 160px, (max-width: 1280px) 200px, 250px"
          />
        </div>

        {/* Desktop nav (>=1024px) */}
        <div className="hidden lg:flex items-center gap-6">
          <Link
            href="/"
            className={`transition text-[18px] ${
              pathname === "/"
                ? "text-blue-600 font-medium"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Home
          </Link>

          <Link
            href="/all-products"
            className={`transition text-[18px] ${
              pathname === "/all-products"
                ? "text-blue-600 font-medium"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Shop
          </Link>

          {/* Desktop: Categories (hover + click)
          <div
            className="relative"
            onMouseEnter={() => setIsCategoryMenuOpen(true)}
            onMouseLeave={() => setIsCategoryMenuOpen(false)}
          >
            <button
              onClick={() => setIsCategoryMenuOpen((s) => !s)}
              className="hover:text-gray-900 transition flex items-center gap-2 text-[18px]"
            >
              Categories
              <Image
                src={assets.arrow_icon}
                alt="arrow"
                className={`w-2 h-2 ${isCategoryMenuOpen ? "rotate-90" : ""}`}
              />
            </button>

            <div
              className={`absolute top-full mt-3 left-0 w-64 bg-white border rounded-lg shadow-lg z-30 transform transition-all duration-200 ease-in-out origin-top ${
                isCategoryMenuOpen
                  ? "opacity-100 scale-100 visible"
                  : "opacity-0 scale-95 invisible"
              }`}
            >
              <div className="p-2 max-h-96 overflow-y-auto">
                {loadingCategories ? (
                  <div className="p-3 text-sm text-gray-600">Loading...</div>
                ) : categories.length === 0 ? (
                  <div className="p-3 text-sm text-gray-600">No categories</div>
                ) : (
                  categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/category/${category.name
                        .toLowerCase()
                        .replace(/ & /g, "-")
                        .replace(/ /g, "-")}`}
                      className="flex items-center p-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    >
                      <span className="text-sm">{category.name}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div> */}

          {/* Desktop: Pages */}
          <div
            className="relative"
            onMouseEnter={() => setPagesOpen(true)}
            onMouseLeave={() => setPagesOpen(false)}
          >
            <button
              onClick={() => setPagesOpen((s) => !s)}
              className="hover:text-gray-900 transition flex items-center gap-2 text-[18px]"
            >
              Pages
              <Image
                src={assets.arrow_icon}
                alt="arrow"
                className={`${pagesOpen ? "rotate-90" : ""} w-2 h-2`}
              />
            </button>
            <div
              className={`absolute top-full mt-3 left-0 w-40 bg-white border rounded-lg shadow-lg z-30 transform transition-all duration-200 ease-in-out origin-top ${
                pagesOpen
                  ? "opacity-100 scale-100 visible"
                  : "opacity-0 scale-95 invisible"
              }`}
            >
              <Link
                href="/about"
                className={`block px-4 py-2 ${
                  pathname === "/about"
                    ? "bg-gray-100 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className={`block px-4 py-2 ${
                  pathname === "/contact"
                    ? "bg-gray-100 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                Contact
              </Link>
              <Link
                href="/all-vendors"
                className={`block px-4 py-2 ${
                  pathname === "/all-vendors"
                    ? "bg-gray-100 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                All Vendors
              </Link>
            </div>
          </div>

          {/* Desktop: Vendor */}
          {isLoggedIn && userData?.role === "vendor" ? (
            <Link
              href="/vendor-dashboard/add-products"
              className={`transition text-[18px] ${
                pathname.startsWith("/seller")
                  ? "text-blue-600 font-medium"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Add Products
            </Link>
          ) : (
            <div
              className="relative"
              onMouseEnter={() => setVendorOpen(true)}
              onMouseLeave={() => setVendorOpen(false)}
            >
              <button
                onClick={() => setVendorOpen((s) => !s)}
                className="hover:text-gray-900 transition flex items-center gap-2 text-[18px]"
              >
                Vendor
                <Image
                  src={assets.arrow_icon}
                  alt="arrow"
                  className={`${vendorOpen ? "rotate-90" : ""} w-2 h-2`}
                />
              </button>
              <div
                className={`absolute top-full mt-3 left-0 w-48 bg-white border rounded-lg shadow-lg z-30 transform transition-all duration-200 ease-in-out origin-top ${
                  vendorOpen
                    ? "opacity-100 scale-100 visible"
                    : "opacity-0 scale-95 invisible"
                }`}
              >
                <Link
                  href="/vendor-signup"
                  className={`block px-4 py-2 ${
                    pathname === "/vendor/signup"
                      ? "bg-gray-100 text-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Become a Vendor
                </Link>
                <Link
                  href="/vendor-signin"
                  className={`block px-4 py-2 ${
                    pathname === "/vendor-signin"
                      ? "bg-gray-100 text-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Vendor Login
                </Link>
              </div>
            </div>
          )}

          {/* Desktop: Delivery */}
          <div
            className="relative"
            onMouseEnter={() => setDeliveryOpen(true)}
            onMouseLeave={() => setDeliveryOpen(false)}
          >
            <button
              onClick={() => setDeliveryOpen((s) => !s)}
              className="hover:text-gray-900 transition flex items-center gap-2 text-[18px]"
            >
              Delivery Man
              <Image
                src={assets.arrow_icon}
                alt="arrow"
                className={`${deliveryOpen ? "rotate-90" : ""} w-2 h-2`}
              />
            </button>
            <div
              className={`absolute top-full mt-3 left-0 w-56 bg-white border rounded-lg shadow-lg z-30 transform transition-all duration-200 ease-in-out origin-top ${
                deliveryOpen
                  ? "opacity-100 scale-100 visible"
                  : "opacity-0 scale-95 invisible"
              }`}
            >
              {isLoggedIn && userData?.user?.role === "delivery" ? (
                <>
                  <Link
                    href="/delivery-dashboard"
                    className={`block px-4 py-2 ${
                      pathname === "/delivery-dashboard"
                        ? "bg-gray-100 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    Delivery Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/delivery-signup"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Become a Delivery Man
                  </Link>
                  <Link
                    href="/delivery-signin"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Delivery Man Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Messages relocated to icons section below */}
        {/* Right side icons (desktop) */}
        <ul className="hidden lg:flex items-center gap-6 relative">
          {/* Relocated Message Button (Icon Style) */}
          <button
            onClick={handleMessageClick}
            disabled={isCreatingChat}
            className="flex relative text-gray-700 hover:text-blue-600 transition-colors"
            title="Messages"
          >
            <div className="relative">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
            </div>
          </button>

          <Image
            className="w-6 sm:w-7 cursor-pointer hover:scale-110 transition-transform"
            src={assets.search_icon}
            alt="search icon"
            onClick={handleSearchIconClick}
          />
          <Link href="/wishlist" className="flex relative">
            <Image className="w-6" src={assets.heart_icon} alt="" />
            <div className="absolute -top-2 -right-2 text-xs bg-blue-500 text-white h-4 w-4 flex justify-center items-center rounded-full">
              <p>{getWishlistCount()}</p>
            </div>
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setIsCartOpen(true)}
            onMouseLeave={() => setIsCartOpen(false)}
          >
            <Link href="/cart" className="flex relative">
              <Image className="w-6" src={assets.cart_icon} alt="" />
              <div className="absolute -top-2 -right-2 text-xs bg-blue-500 text-white h-4 w-4 flex justify-center items-center rounded-full">
                <p>{getCartCount()}</p>
              </div>
            </Link>

            <div
              className={`absolute top-full mt-4 right-0 w-72 bg-white border rounded-lg shadow-lg z-30 transform transition-all duration-200 ease-in-out origin-top-right ${
                isCartOpen
                  ? "opacity-100 scale-100 visible"
                  : "opacity-0 scale-95 invisible"
              }`}
            >
              {getCartCount() > 0 ? (
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Your Cart</h3>
                  {Object.keys(cartItems).map((itemId) => {
                    const product = products.find((p) => p._id === itemId);
                    if (!product) return null;
                    return (
                      <div
                        key={itemId}
                        className="flex items-center gap-3 py-2 border-b last:border-b-0"
                      >
                        <Image
                          src={product.images?.[0]?.url || ""}
                          alt={product.name}
                          width={50}
                          height={50}
                          className="rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {cartItems[itemId]} x ₦
                            {product.price?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <Link href="/cart">
                    <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
                      View Cart
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Your cart is empty.
                </div>
              )}
            </div>
          </div>

          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <p className="text-2xl text-gray-600">
                ₦
                {walletBalance?.balance?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          )}

          <div className="relative">
            <div
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
            >
              <Image
                src={assets.user_icon}
                alt="user"
                className="w-8 h-8 md:w-10 md:h-10 cursor-pointer object-contain"
                onClick={() => !isLoggedIn && router.push("/signin")}
              />
              <div
                className={`absolute top-full mt-3 right-0 w-52 bg-white border border-gray-100 rounded-2xl shadow-2xl z-30 transform transition-all duration-300 ease-in-out origin-top-right ${
                  accountOpen
                    ? "opacity-100 scale-100 visible translate-y-0"
                    : "opacity-0 scale-95 invisible -translate-y-2"
                }`}
              >
                <div className="p-3">
                  {isLoggedIn ? (
                    <>
                      {userData?.role === "delivery" ? (
                        <Link
                          href="/delivery-dashboard"
                          className={`block px-4 py-2.5 rounded-xl text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all ${
                            pathname === "/delivery-dashboard" ? "bg-blue-50 text-blue-600" : ""
                          }`}
                        >
                          Dashboard
                        </Link>
                      ) : userData?.role === "vendor" ? (
                        <Link
                          href="/vendor-dashboard"
                          className={`block px-4 py-2.5 rounded-xl text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all ${
                            pathname === "/vendor-dashboard" ? "bg-blue-50 text-blue-600" : ""
                          }`}
                        >
                          Vendor Dashboard
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard"
                          className={`block px-4 py-2.5 rounded-xl text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all ${
                            pathname === "/dashboard" ? "bg-blue-50 text-blue-600" : ""
                          }`}
                        >
                          User Dashboard
                        </Link>
                      )}
                      <div className="h-px bg-gray-100 my-2" />
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2.5 rounded-xl text-base font-semibold text-red-600 hover:bg-red-50 transition-all"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-gray-500 font-medium px-2 mb-1">Welcome Guest</p>
                      <Link
                        href="/signin"
                        className="block px-4 py-2.5 bg-blue-600 text-white text-center rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="block px-4 py-2.5 bg-gray-50 text-gray-700 text-center rounded-xl text-sm font-bold hover:bg-gray-100 transition-all border border-gray-100"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ul>

        {/* Mobile / Tablet icons (0 - 1023.99px) */}
        <div className="flex items-center lg:hidden gap-4">
          <button
            onClick={handleMessageClick}
            disabled={isCreatingChat}
            className="flex relative text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
          <Image
            className="w-6 sm:w-7 cursor-pointer"
            src={assets.search_icon}
            alt="search icon"
            onClick={handleSearchIconClick}
          />
          <Link href="/wishlist" className="flex relative">
            <Image className="w-6" src={assets.heart_icon} alt="" />
            <div className="absolute -top-2 -right-2 text-xs bg-blue-500 text-white h-4 w-4 flex justify-center items-center rounded-full">
              <p>{getWishlistCount()}</p>
            </div>
          </Link>
          <Link href="/cart" className="flex relative">
            <Image className="w-6" src={assets.cart_icon} alt="" />
            <div className="absolute -top-2 -right-2 text-xs bg-blue-500 text-white h-4 w-4 flex justify-center items-center rounded-full">
              <p>{getCartCount()}</p>
            </div>
          </Link>
          <Image
            className="w-6 h-6 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
            src={assets.user_icon}
            alt="user icon"
            onClick={() => {
              if (isLoggedIn) {
                router.push(userData?.role === "vendor" ? "/vendor-dashboard" : userData?.role === "delivery" ? "/delivery-dashboard" : "/dashboard");
              } else {
                router.push("/signin");
              }
            }}
          />
          <Image
            className="w-6 h-6 cursor-pointer"
            src={assets.menu_icon}
            alt="menu icon"
            onClick={() => setIsMobileMenuOpen(true)}
          />
        </div>
      </div>

      {/* Search modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[300] flex justify-center items-start pt-20"
          onClick={() => setIsSearchOpen(false)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            onClick={() => setIsSearchOpen(false)}
          >
            <FiX className="w-8 h-8" />
          </button>

          <div
            className="relative w-11/12 md:w-1/2 lg:w-1/3"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="Search for products, brands, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-modal-input"
              className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-4 focus:ring-blue-500/30 text-lg md:text-xl shadow-2xl backdrop-blur-xl"
            />
            <div
              className={`absolute top-full mt-6 left-0 w-full bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] z-20 border border-white/20 overflow-hidden transition-all duration-500 ${
                searchQuery.trim() !== "" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
              }`}
            >
              {filteredProducts.length > 0 ? (
                <div className="p-8">
                   <div className="flex items-center justify-between mb-6 px-2">
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Results ({filteredProducts.length})</h4>
                     <button className="text-[10px] font-bold text-blue-600 hover:underline">View All Products</button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className="group p-4 bg-gray-50/50 hover:bg-white rounded-3xl cursor-pointer flex items-center gap-5 transition-all border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-gray-200/50"
                      >
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 flex-shrink-0">
                          <Image
                            src={product.images?.[0]?.url || ""}
                            alt={product.name}
                            fill
                            sizes="80px"
                            className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors">{product.name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-blue-600 font-black text-sm">
                              ₦{(product.offerPrice || product.price)?.toLocaleString()}
                            </span>
                            {product.offerPrice && product.offerPrice < product.price && (
                              <span className="text-[10px] text-gray-400 line-through">
                                ₦{product.price?.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                             <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-widest">
                               {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                             </span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                           <FaArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiSearch className="w-8 h-8 text-blue-200" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">No matches found</h3>
                  <p className="text-gray-500 font-medium max-w-xs mx-auto">Try searching for something else or browse our trending categories.</p>
                  
                  {/* Quick Discovery section */}
                  <div className="mt-12 pt-8 border-t border-gray-100 text-left">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Popular Categories</p>
                     <div className="flex flex-wrap gap-2">
                        {['Electronics', 'Fashion', 'Home Decor', 'Gadgets', 'Accessories'].map(cat => (
                          <button key={cat} className="px-5 py-2.5 rounded-full bg-gray-50 text-gray-700 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
                            {cat}
                          </button>
                        ))}
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar (slides in from RIGHT). active for <1024px (lg:hidden used above to show mobile controls) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[300] lg:hidden">
          {/* overlay */}
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-300 ${
              animate ? "bg-opacity-50" : "bg-opacity-0"
            }`}
            onClick={handleCloseMenu}
          />

          {/* panel (right) */}
          <aside
            className={`fixed top-0 right-0 h-full w-4/5 max-w-md bg-white text-gray-900 p-6 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
              animate ? "translate-x-0" : "translate-x-full"
            }`}
            aria-modal="true"
            role="dialog"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={Logo}
                  alt="logo"
                  className="w-36"
                  onClick={() => {
                    router.push("/");
                    handleCloseMenu();
                  }}
                />
              </div>
              <button onClick={handleCloseMenu} className="text-gray-700">
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
            </div>

            <nav className="mt-6">
              <ul className="flex flex-col gap-3">
                <li>
                  <Link
                    href="/"
                    onClick={handleCloseMenu}
                    className="block px-2 py-3 rounded-md hover:bg-gray-100"
                  >
                    Home
                  </Link>
                </li>

                <li>
                  <Link
                    href="/all-products"
                    onClick={handleCloseMenu}
                    className="block px-2 py-3 rounded-md hover:bg-gray-100"
                  >
                    Shop
                  </Link>
                </li>

                <li>
                  <button
                    onClick={() => toggleMobileSection("categories")}
                    className="w-full flex items-center justify-between px-2 py-3 rounded-md hover:bg-gray-100"
                  >
                    <span>Categories</span>
                    <Image
                      src={assets.arrow_icon}
                      alt="arrow"
                      className={
                        chevronClass(mobileOpenSection === "categories") +
                        " w-3 h-3"
                      }
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                      mobileOpenSection === "categories"
                        ? "max-h-[24rem]"
                        : "max-h-0"
                    }`}
                  >
                    <div className="mt-2 pb-2 border-b border-gray-200">
                      {loadingCategories ? (
                        <div className="px-2 py-2 text-sm text-gray-600">
                          Loading...
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="px-2 py-2 text-sm text-gray-600">
                          No categories
                        </div>
                      ) : (
                        categories.map((category) => (
                          <Link
                            key={category._id}
                            href={`/category/${category.name
                              .toLowerCase()
                              .replace(/ & /g, "-")
                              .replace(/ /g, "-")}`}
                            onClick={handleCloseMenu}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-md"
                          >
                            <span className="text-sm">{category.name}</span>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </li>

                <li>
                  <button
                    onClick={() => toggleMobileSection("pages")}
                    className="w-full flex items-center justify-between px-2 py-3 rounded-md hover:bg-gray-100"
                  >
                    <span>Pages</span>
                    <Image
                      src={assets.arrow_icon}
                      alt="arrow"
                      className={
                        chevronClass(mobileOpenSection === "pages") + " w-3 h-3"
                      }
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                      mobileOpenSection === "pages" ? "max-h-40" : "max-h-0"
                    }`}
                  >
                    <div className="mt-2 pb-2 border-b border-gray-200">
                      <Link
                        href="/about"
                        onClick={handleCloseMenu}
                        className="block px-3 py-2 rounded-md hover:bg-gray-50"
                      >
                        About Us
                      </Link>
                      <Link
                        href="/contact"
                        onClick={handleCloseMenu}
                        className="block px-3 py-2 rounded-md hover:bg-gray-50"
                      >
                        Contact
                      </Link>
                      <Link
                        href="/all-vendors"
                        onClick={handleCloseMenu}
                        className="block px-3 py-2 rounded-md hover:bg-gray-50"
                      >
                        All Vendors
                      </Link>
                    </div>
                  </div>
                </li>
                {/* Message Button */}
                <li>
                  <button
                    onClick={handleMessageClick}
                    disabled={isCreatingChat}
                    className="px-5 py-2.5 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 whitespace-nowrap flex items-center gap-2"
                  >
                    {isCreatingChat ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span className="">Starting...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="md:w-5 md:h-5 w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span className="">Messages</span>
                      </>
                    )}
                  </button>
                </li>
                <li>
                  {isLoggedIn && userData?.role === "vendor" ? (
                    <Link
                      href="/vendor-dashboard/add-products"
                      onClick={handleCloseMenu}
                      className="block px-2 py-3 rounded-md hover:bg-gray-100"
                    >
                      Add Products
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleMobileSection("vendor")}
                        className="w-full flex items-center justify-between px-2 py-3 rounded-md hover:bg-gray-100"
                      >
                        <span>Vendor</span>
                        <Image
                          src={assets.arrow_icon}
                          alt="arrow"
                          className={
                            chevronClass(mobileOpenSection === "vendor") +
                            " w-3 h-3"
                          }
                        />
                      </button>
                      <div
                        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                          mobileOpenSection === "vendor"
                            ? "max-h-40"
                            : "max-h-0"
                        }`}
                      >
                        <div className="mt-2 pb-2 border-b border-gray-200">
                          <Link
                            href="/vendor-signup"
                            onClick={handleCloseMenu}
                            className="block px-3 py-2 rounded-md hover:bg-gray-50"
                          >
                            Become a Vendor
                          </Link>
                          <Link
                            href="/vendor-signin"
                            onClick={handleCloseMenu}
                            className="block px-3 py-2 rounded-md hover:bg-gray-50"
                          >
                            Vendor Login
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </li>

                <li>
                  <button
                    onClick={() => toggleMobileSection("delivery")}
                    className="w-full flex items-center justify-between px-2 py-3 rounded-md hover:bg-gray-100"
                  >
                    <span>Delivery Man</span>
                    <Image
                      src={assets.arrow_icon}
                      alt="arrow"
                      className={
                        chevronClass(mobileOpenSection === "delivery") +
                        " w-3 h-3"
                      }
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                      mobileOpenSection === "delivery" ? "max-h-40" : "max-h-0"
                    }`}
                  >
                    <div className="mt-2 pb-2 border-b border-gray-200">
                      {isLoggedIn && userData?.user?.role === "delivery" ? (
                        <Link
                          href="/delivery-dashboard"
                          onClick={handleCloseMenu}
                          className="block px-3 py-2 rounded-md hover:bg-gray-50"
                        >
                          Delivery Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/delivery-signup"
                            onClick={handleCloseMenu}
                            className="block px-3 py-2 rounded-md hover:bg-gray-50"
                          >
                            Become a Delivery Man
                          </Link>
                          <Link
                            href="/delivery-signin"
                            onClick={handleCloseMenu}
                            className="block px-3 py-2 rounded-md hover:bg-gray-50"
                          >
                            Delivery Man Login
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </li>

                {/* Account */}
                <li>
                  <button
                    onClick={() => toggleMobileSection("account")}
                    className="w-full flex items-center justify-between px-2 py-3 rounded-md hover:bg-gray-100"
                  >
                    <span>Account</span>
                    <Image
                      src={assets.arrow_icon}
                      alt="arrow"
                      className={
                        chevronClass(mobileOpenSection === "account") +
                        " w-3 h-3"
                      }
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                      mobileOpenSection === "account" ? "max-h-60" : "max-h-0"
                    }`}
                  >
                    <div className="mt-2 pb-2 border-b border-gray-200">
                      {isLoggedIn ? (
                        <>
                          {userData?.role === "delivery" ? (
                            <>
                              <Link
                                href="/delivery-dashboard"
                                onClick={handleCloseMenu}
                                className="block px-3 py-2 rounded-md hover:bg-gray-50"
                              >
                                Dashboard
                              </Link>
                              <Link
                                href="/delivery-dashboard/withdraw"
                                onClick={handleCloseMenu}
                                className="block px-3 py-2 rounded-md hover:bg-gray-50"
                              >
                                Withdraw
                              </Link>
                            </>
                          ) : userData?.role === "vendor" ? (
                            <>
                              <Link
                                href="/vendor-dashboard"
                                onClick={handleCloseMenu}
                                className="block px-3 py-2 rounded-md hover:bg-gray-50"
                              >
                                Vendor Dashboard
                              </Link>
                              <Link
                                href="/vendor-dashboard/all-orders"
                                onClick={handleCloseMenu}
                                className="block px-3 py-2 rounded-md hover:bg-gray-50"
                              >
                                My Orders
                              </Link>
                            </>
                          ) : (
                            <Link
                              href="/dashboard"
                              onClick={handleCloseMenu}
                              className="block px-3 py-2 rounded-md hover:bg-gray-50"
                            >
                              Dashboard
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              logout();
                              handleCloseMenu();
                            }}
                            className="w-full text-left px-3 py-2 text-red-600"
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/signin"
                            onClick={handleCloseMenu}
                            className="block px-3 py-2 rounded-md hover:bg-gray-50"
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/signup"
                            onClick={handleCloseMenu}
                            className="block px-3 py-2 rounded-md hover:bg-gray-50"
                          >
                            Sign Up
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </li>

                {/* Extra quick links */}
                <li className="pt-2">
                  <Link
                    href="/about"
                    onClick={handleCloseMenu}
                    className="block px-2 py-3 rounded-md hover:bg-gray-100"
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    onClick={handleCloseMenu}
                    className="block px-2 py-3 rounded-md hover:bg-gray-100"
                  >
                    Contact
                  </Link>
                </li>

                {/* Sign in / out CTA */}
                <li className="mt-4">
                  {isLoggedIn ? (
                    <button
                      onClick={() => {
                        logout();
                        handleCloseMenu();
                      }}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500 transition"
                    >
                      Logout
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <Link
                        href="/signin"
                        onClick={handleCloseMenu}
                        className="flex-1"
                      >
                        <button className="w-full border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">
                          Sign in
                        </button>
                      </Link>
                      <Link
                        href="/signup"
                        onClick={handleCloseMenu}
                        className="flex-1"
                      >
                        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500">
                          Sign up
                        </button>
                      </Link>
                    </div>
                  )}
                </li>
              </ul>
            </nav>

            <div className="mt-8 text-sm text-gray-500">
              {/* Optional wallet / utility area */}
              {isLoggedIn && (
                <div>
                  Wallet: ₦
                  {walletBalance?.balance?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

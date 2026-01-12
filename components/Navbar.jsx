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
import { message as antdMessage } from "antd";
import {
  HiOutlineCpuChip,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineHome,
  HiOutlineHeart,
  HiOutlineTruck,
  HiOutlineBuildingOffice2,
  HiOutlineArchiveBox,
  HiOutlineWrenchScrewdriver,
  HiOutlineComputerDesktop,
} from "react-icons/hi2";

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

  // Icons mapping
  const iconMap = {
    Electronics: <HiOutlineCpuChip className="w-5 h-5 mr-2 text-gray-500" />,
    Fashion: <HiOutlineShoppingBag className="w-5 h-5 mr-2 text-gray-500" />,
    "Foods and Drinks": (
      <HiOutlineSparkles className="w-5 h-5 mr-2 text-gray-500" />
    ),
    Furnitures: <HiOutlineHome className="w-5 h-5 mr-2 text-gray-500" />,
    "Beauty & Health": (
      <HiOutlineHeart className="w-5 h-5 mr-2 text-gray-500" />
    ),
    Automobiles: <HiOutlineTruck className="w-5 h-5 mr-2 text-gray-500" />,
    Property: (
      <HiOutlineBuildingOffice2 className="w-5 h-5 mr-2 text-gray-500" />
    ),
    "Kitchen Utensils": (
      <HiOutlineArchiveBox className="w-5 h-5 mr-2 text-gray-500" />
    ),
    "Home appliance": <HiOutlineHome className="w-5 h-5 mr-2 text-gray-500" />,
    Agriculture: <HiOutlineSparkles className="w-5 h-5 mr-2 text-gray-500" />,
    "Industrial equipment": (
      <HiOutlineWrenchScrewdriver className="w-5 h-5 mr-2 text-gray-500" />
    ),
    "Digital products": (
      <HiOutlineComputerDesktop className="w-5 h-5 mr-2 text-gray-500" />
    ),
    default: <HiOutlineArchiveBox className="w-5 h-5 mr-2 text-gray-500" />,
  };

  const getCategoryIcon = (categoryName) => {
    return iconMap[categoryName] || iconMap.default;
  };

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
        console.error("Failed to fetch categories:", err);
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
          console.log(walletResponse.data);
          setWalletBalance(walletResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
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
      antdMessage.error("Please sign in to access messages.");
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
    <nav className="border-b border-gray-300 text-gray-700 relative bg-white shadow-md z-40">
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
                      {getCategoryIcon(category.name)}
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
        {/* Message Button */}
        <button
          onClick={handleMessageClick}
          disabled={isCreatingChat}
          className="px-3 py-1  hidden md:px-5 md:py-2.5 text-base font-bold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 whitespace-nowrap md:flex items-center gap-2"
        >
          {isCreatingChat ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span className="text-[10px] md:text-base">Starting...</span>
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
              <span className="text-[10px] md:text-base">Messages</span>
            </>
          )}
        </button>
        {/* Right side icons (desktop) */}
        <ul className="hidden lg:flex items-center gap-6 relative">
          <Image
            className="w-5 cursor-pointer"
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

          <div
            className="relative"
            onMouseEnter={() => setAccountOpen(true)}
            onMouseLeave={() => setAccountOpen(false)}
          >
            <Image
              src={assets.user_icon}
              alt="user"
              className="w-6 h-6 md:w-10 md:h-10 cursor-pointer md:mt-[-5px] md:ml-[-10px]"
            />
            <div
              className={`absolute top-full mt-3 right-0 w-48 bg-white border rounded-lg shadow-lg z-30 transform transition-all duration-200 ease-in-out origin-top-right ${
                accountOpen
                  ? "opacity-100 scale-100 visible"
                  : "opacity-0 scale-95 invisible"
              }`}
            >
              {isLoggedIn ? (
                <>
                  {userData?.role === "delivery" ? (
                    <>
                      <Link
                        href="/delivery-dashboard"
                        className={`block px-4 py-2 ${
                          pathname === "/delivery-dashboard"
                            ? "bg-gray-100 text-blue-600"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/delivery-dashboard/withdraw"
                        className={`block px-4 py-2 ${
                          pathname === "/delivery-dashboard/withdraw"
                            ? "bg-gray-100 text-blue-600"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Withdraw
                      </Link>
                    </>
                  ) : userData?.role === "vendor" ? (
                    <>
                      <Link
                        href="/vendor-dashboard"
                        className={`block px-4 py-2 ${
                          pathname === "/vendor-dashboard"
                            ? "bg-gray-100 text-blue-600"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Vendor Dashboard
                      </Link>
                      <Link
                        href="/vendor-dashboard/all-orders"
                        className={`block px-4 py-2 ${
                          pathname === "/vendor-dashboard/all-orders"
                            ? "bg-gray-100 text-blue-600"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        My Orders
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/dashboard"
                        className={`block px-4 py-2 ${
                          pathname === "/dashboard"
                            ? "bg-gray-100 text-blue-600"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        Dashboard
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setAccountOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </ul>

        {/* Mobile / Tablet icons (0 - 1023.99px) */}
        <div className="flex items-center lg:hidden gap-4">
          <Image
            className="w-5 cursor-pointer"
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
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="relative w-11/12 md:w-1/2 lg:w-1/3"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-modal-input"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div
              className={`absolute top-full mt-2 left-0 w-full bg-white border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto ${
                searchQuery.trim() !== "" ? "block" : "hidden"
              }`}
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                  >
                    <Image
                      src={product.images?.[0]?.url || ""}
                      alt={product.name}
                      width={50}
                      height={50}
                      className="rounded-md object-cover"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        ₦
                        {product.price?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500">
                  No products found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar (slides in from RIGHT). active for <1024px (lg:hidden used above to show mobile controls) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
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
                            {getCategoryIcon(category.name)}
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
                    className="px-5 py-2.5 text-base font-bold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 whitespace-nowrap flex items-center gap-2"
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

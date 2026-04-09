import { addressDummyData } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import confetti from "canvas-confetti";
import PinInput from "./PinInput";
import Swal from "sweetalert2";
import {
  FaEye,
  FaEyeSlash,
  FaMapMarkerAlt,
  FaShippingFast,
  FaTag,
  FaLock,
  FaChevronDown,
  FaCheckCircle,
  FaShieldAlt,
} from "react-icons/fa";

const OrderSummary = ({ externalState }) => {
  // Use either external state from props (for sync with parent) or local fallback
  const [_deliveryState, _setDeliveryState] = useState("");
  const [_deliveryLga, _setDeliveryLga] = useState("");
  const [_deliveryAddress, _setDeliveryAddress] = useState("");
  const [_selectedShipping, _setSelectedShipping] = useState(null);
  const [_pin, _setPin] = useState("");

  const deliveryState = externalState ? externalState.deliveryState : _deliveryState;
  const setDeliveryState = externalState ? externalState.setDeliveryState : _setDeliveryState;
  
  const deliveryLga = externalState ? externalState.deliveryLga : _deliveryLga;
  const setDeliveryLga = externalState ? externalState.setDeliveryLga : _setDeliveryLga;
  
  const deliveryAddress = externalState ? externalState.deliveryAddress : _deliveryAddress;
  const setDeliveryAddress = externalState ? externalState.setDeliveryAddress : _setDeliveryAddress;
  
  const selectedShipping = externalState ? externalState.selectedShipping : _selectedShipping;
  const setSelectedShipping = externalState ? externalState.setSelectedShipping : _setSelectedShipping;
  
  const pin = externalState ? externalState.pin : _pin;
  const setPin = externalState ? externalState.setPin : _setPin;

  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    userData,
    cartItems,
    products,
    states,
    lgas,
    fetchLgas,
  } = useAppContext();

  const [, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isInterState, setIsInterState] = useState(false);
  
  // Shipping logic states managed locally for calculation
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [deliveryFees, setDeliveryFees] = useState([]);

  const shippingConfig = {
    intraState: {
      Standard: { price: 900, days: "1-2 days" },
      Express: { price: 1500, days: "1 day" },
    },
    interState: {
      Standard: { price: 1000, days: "4-5 days" },
      Express: { price: 2000, days: "2-3 days" },
    },
    interRegional: {
      Standard: { price: 2000, days: "8-9 days" },
      Express: { price: 4000, days: "2-3 days" },
    },
  };

  const [shippingType, setShippingType] = useState(""); // 'intraState', 'interState', 'interRegional'

  // Coupon logic states
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [finalAmount, setFinalAmount] = useState(null);

  const geoPoliticalZones = {
    nc: ["Benue", "FCT", "Kogi", "Kwara", "Nasarawa", "Niger", "Plateau"],
    ne: ["Adamawa", "Bauchi", "Borno", "Gombe", "Taraba", "Yobe"],
    nw: ["Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Sokoto", "Zamfara"],
    se: ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"],
    ss: ["Akwa Ibom", "Bayelsa", "Cross River", "Delta", "Edo", "Rivers"],
    sw: ["Ekiti", "Lagos", "Ogun", "Ondo", "Osun", "Oyo"],
  };

  const getStateRegion = (state) => {
    for (const region in geoPoliticalZones) {
      if (geoPoliticalZones[region].includes(state)) return region;
    }
    return null;
  };
  const vendorShippingInfo = useMemo(() => {
    if (getCartCount() > 0) {
      const cartItemIds = Object.keys(cartItems);
      for (const itemId of cartItemIds) {
        if (cartItems[itemId] <= 0) continue;
        
        const product = products.find((p) => p._id === itemId);
        if (product) {
          return {
            businessName: product.vendor?.businessName || product.vendor?.name || "Vendor",
            shippingAddress: product.pickupAddress || product.vendor?.shippingAddress || product.vendor?.address || product.vendor?.shopAddress || product.vendor?.location || null,
            shippingState: product.pickupState || product.vendor?.shippingState || product.vendor?.state || null,
            shippingLga: product.pickupLga || null,
            zipCode: product.vendor?.zipCode || product.vendor?.zipcode || "",
          };
        }
      }
    }
    return null;
  }, [cartItems, products, getCartCount]);

  useEffect(() => {
    if (deliveryState) {
      fetchLgas(deliveryState);
      setDeliveryLga(""); // Reset LGA when state changes
    }
  }, [deliveryState, fetchLgas]);

  useEffect(() => {
    const fetchShippingFees = async () => {
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.SHIPPING_FEE.GET_ALL),
          { withCredentials: true }
        );
        setDeliveryFees(response.data.deliveryFees || []);
      } catch (error) {
        console.error("Failed to fetch shipping fees", error);
      }
    };

    fetchShippingFees();
  }, []);

  const createOrder = async () => {
    if (!pin || pin.length !== 4) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please enter your 4-digit transaction PIN.",
      });
      return;
    }
    setLoading(true);

    if (!deliveryState) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please select a delivery state.",
      });
      setLoading(false);
      return;
    }

    if (deliveryState && !deliveryAddress) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please enter the delivery address.",
      });
      setLoading(false);
      return;
    }

    const orderProducts = Object.keys(cartItems)
      .map((itemId) => {
        const product = products.find((p) => p._id === itemId);
        if (product && cartItems[itemId] > 0) {
          return {
            productId: product._id,
            name: product.name,
            quantity: cartItems[itemId],
            price: product.price,
            vendorId: product.vendor?._id,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (orderProducts.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Empty Cart",
        text: "Your cart is empty.",
      });
      setLoading(false);
      return;
    }

    const subtotal = getCartAmount();
    const tax = Math.floor(subtotal * 0.02);
    const totalAmount =
      finalAmount !== null
        ? finalAmount
        : subtotal + shippingFee + tax - couponDiscount;

    const vendorId = orderProducts[0]?.vendorId;
    const payload = {
      userId: userData?.id,
      vendorId: vendorId,
      products: orderProducts,
      deliveryAddress: deliveryAddress,
      state: deliveryState,
      lga: deliveryLga,
      zipcode: userData?.zipCode || vendorShippingInfo?.zipCode || "",
      shippingFee: shippingFee,
      tax: tax,
      phone: userData?.phone,
      pin,
      totalAmount: totalAmount,
      couponCode: couponDiscount > 0 ? couponCode : null,
      deliveryType: selectedShipping, // Express or Standard
    };

    console.log(payload);
    if (!payload.vendorId) {
      Swal.fire({
        icon: "error",
        title: "Order Error",
        text: "Could not determine vendor for this order.",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.ORDER.CREATE),
        payload,
        { withCredentials: true }
      );

      // Trigger confetti celebration
      const duration = 2 * 1000; // 2 seconds
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000,
      };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          })
        );
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          })
        );
      }, 250);

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Order placed successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      if (userData.role === "vendor") {
        router.push("/vendor-dashboard/all-orders");
      } else {
        router.push("/dashboard/all-orders");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to place order. Please try again.";
      Swal.fire({ icon: "error", title: "Order Failed", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      Swal.fire({
        icon: "error",
        title: "Input Required",
        text: "Please enter a coupon code.",
      });
      return;
    }
    setCouponLoading(true);
    try {
      const subtotal = getCartAmount();
      const tax = Math.floor(subtotal * 0.02);
      const totalOrderAmount = subtotal + shippingFee + tax;
      const payload = { code: couponCode, orderAmount: totalOrderAmount };

      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.COUPON.VALIDATE),
        payload,
        { withCredentials: true }
      );
      console.log(response.data);

      const { discountAmount, finalAmount: apiFinalAmount } =
        response.data.coupon;
      setCouponDiscount(discountAmount || 0);
      setFinalAmount(apiFinalAmount || null);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Coupon applied successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error validating coupon:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to validate coupon. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Coupon Error",
        text: errorMessage,
      });
      setCouponDiscount(0);
      setCouponCode("");
      setFinalAmount(null);
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    // Reset shipping on delivery state change
    setShippingOptions([]);
    setSelectedShipping(null);
    setShippingFee(0);
    setShippingType("");
    setIsInterState(false);
    setDeliveryAddress("");

    if (deliveryState && vendorShippingInfo?.shippingState) {
      let type = "";
      if (deliveryState === vendorShippingInfo.shippingState) {
        type = "intraState";
        setIsInterState(false);
      } else {
        setIsInterState(true);
        const vendorRegion = getStateRegion(vendorShippingInfo.shippingState);
        const deliveryRegion = getStateRegion(deliveryState);
        if (vendorRegion && deliveryRegion && vendorRegion === deliveryRegion) {
          type = "interState";
        } else {
          type = "interRegional";
        }
      }

      if (type) {
        setShippingType(type);
        const options = Object.entries(shippingConfig[type]).map(
          ([name, details]) => ({
            name,
            price: details.price,
            days: details.days,
          })
        );
        setShippingOptions(options);
        // Default to standard shipping
        if (options.length > 0) {
          const standardOption = options.find((o) => o.name === "Standard");
          if (standardOption) {
            setSelectedShipping(standardOption.name);
            setShippingFee(standardOption.price);
          }
        }
      }
    }
  }, [deliveryState, vendorShippingInfo]);

  useEffect(() => {
    if (selectedShipping && shippingType) {
      setShippingFee(
        shippingConfig[shippingType][selectedShipping]?.price || 0
      );
    }
  }, [selectedShipping, shippingType]);

  const totalAmount = finalAmount !== null
    ? finalAmount
    : getCartAmount() +
      shippingFee +
      Math.floor(getCartAmount() * 0.02) -
      couponDiscount;

  const validationErrors = useMemo(() => {
    const errors = [];
    if (!deliveryState) errors.push("Select a delivery state");
    if (deliveryState && !deliveryLga) errors.push("Select a local government area (LGA)");
    if (deliveryState && !deliveryAddress) errors.push("Enter your full delivery address");
    if (deliveryState && !selectedShipping) errors.push("Select a delivery speed");
    if (!pin || pin.length !== 4) errors.push("Enter your 4-digit transaction PIN");
    return errors;
  }, [deliveryState, deliveryLga, deliveryAddress, selectedShipping, pin]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200/70 shadow-xl shadow-slate-200/40 bg-white">

      {/* ═══════════ DARK HEADER ═══════════ */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-6 relative overflow-hidden">
        {/* Subtle pattern dots */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="relative flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-inner">
            <FaShippingFast className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Order Summary</h2>
            <p className="text-sm text-slate-400 font-medium mt-0.5">{getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} · Secure checkout</p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-0">

        {/* ═══════════ SHIPPING INFO ═══════════ */}
        <div className="pb-6 border-b border-dashed border-slate-200">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-sm shadow-rose-200">
              <FaMapMarkerAlt className="text-white text-[11px]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Shipping Info</h3>
          </div>

          <div className="space-y-3">
            {/* Shipping From */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
                Shipping from
              </label>
              <div className="px-3.5 py-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-700 line-clamp-1">
                  {vendorShippingInfo?.shippingAddress || (vendorShippingInfo?.businessName ? `Warehouse (${vendorShippingInfo.businessName})` : "No shipping origin")}
                </p>
                {(vendorShippingInfo?.shippingState || vendorShippingInfo?.shippingLga || vendorShippingInfo?.businessName) && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {[
                      vendorShippingInfo.shippingLga && `${vendorShippingInfo.shippingLga} LGA`,
                      vendorShippingInfo.shippingState && `${vendorShippingInfo.shippingState} State`,
                    ].filter(Boolean).join(', ') || "Location specified"} 
                    {vendorShippingInfo.zipCode && ` · ${vendorShippingInfo.zipCode}`}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery State */}
            <div>
              <label
                htmlFor="delivery-state"
                className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block mb-1.5"
              >
                Deliver to <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="delivery-state"
                  value={deliveryState}
                  onChange={(e) => setDeliveryState(e.target.value)}
                  className="w-full outline-none px-3.5 py-3 pr-10 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Select delivery state</option>
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
              </div>
            </div>

            {/* LGA */}
            {deliveryState && (
              <div className="animate-fadeIn">
                <label
                  htmlFor="delivery-lga"
                  className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block mb-1.5"
                >
                  Local Govt. Area <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    id="delivery-lga"
                    value={deliveryLga}
                    onChange={(e) => setDeliveryLga(e.target.value)}
                    className="w-full outline-none px-3.5 py-3 pr-10 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select LGA</option>
                    {lgas.map((lga) => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
                </div>
              </div>
            )}

            {/* Address */}
            {deliveryState && (
              <div className="animate-fadeIn">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Delivery address <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your full delivery address..."
                  className="w-full outline-none px-3.5 py-3 text-sm font-medium text-slate-700 border border-slate-200 resize-none rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white placeholder:text-slate-300"
                  rows="2"
                />
              </div>
            )}
          </div>
        </div>

        {/* ═══════════ SHIPPING METHOD ═══════════ */}
        {shippingOptions.length > 0 && (
          <div className="py-6 border-b border-dashed border-slate-200 animate-fadeIn">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-200">
                <FaShippingFast className="text-white text-[11px]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Delivery Speed</h3>
              {shippingType && (
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                  {shippingType.replace(/([A-Z])/g, " $1").trim()}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {shippingOptions.map((option) => {
                const isSelected = selectedShipping === option.name;
                return (
                  <div
                    key={option.name}
                    onClick={() => {
                      setSelectedShipping(option.name);
                      setShippingFee(option.price);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/60 shadow-sm shadow-blue-100/50"
                        : "border-transparent bg-slate-50 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Custom Radio */}
                      <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? "border-blue-500 bg-blue-500" : "border-slate-300 bg-white"
                      }`}>
                        {isSelected && (
                          <div className="w-[6px] h-[6px] rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
                          {option.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {option.days} delivery
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold tabular-nums ${isSelected ? "text-blue-600" : "text-slate-600"}`}>
                      {currency}
                      {option.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════ COST BREAKDOWN ═══════════  */}
        <div className="py-6 border-b border-dashed border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Price Details</h3>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Items ({getCartCount()})</span>
              <span className="text-sm font-semibold text-slate-700 tabular-nums">
                {currency}
                {getCartAmount().toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">
                Shipping{selectedShipping && ` · ${selectedShipping}`}
              </span>
              <span className="text-sm font-semibold text-slate-700 tabular-nums">
                {shippingFee > 0 ? (
                  <>
                    {currency}
                    {shippingFee.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </>
                ) : (
                  <span className="text-slate-400 italic font-normal">Select state</span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Tax (2%)</span>
              <span className="text-sm font-semibold text-slate-700 tabular-nums">
                {currency}
                {Math.floor(getCartAmount() * 0.02).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between items-center py-2 px-3 -mx-3 bg-emerald-50 rounded-lg border border-emerald-100 animate-fadeIn">
                <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                  <FaTag className="text-[10px]" />
                  Discount
                </span>
                <span className="text-sm font-bold text-emerald-600 tabular-nums">
                  −{currency}
                  {couponDiscount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="mt-5 p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl flex justify-between items-center">
            <span className="text-white/70 text-sm font-semibold">Total</span>
            <span className="text-white text-xl font-extrabold tabular-nums tracking-tight">
              {currency}
              {totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* ═══════════ COUPON ═══════════ */}
        <div className="py-6 border-b border-dashed border-slate-200">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shadow-emerald-200">
              <FaTag className="text-white text-[10px]" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Promo Code</h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="e.g. SAVE20"
              className="flex-1 outline-none px-3.5 py-2.5 text-sm font-mono font-semibold text-slate-700 tracking-widest border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed placeholder:text-slate-300 placeholder:font-sans placeholder:tracking-normal placeholder:font-normal"
              disabled={couponDiscount > 0}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponCode || couponDiscount > 0}
              className="bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all text-sm active:scale-[0.97]"
            >
              {couponLoading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>
          {couponDiscount > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5 text-emerald-600 animate-fadeIn">
              <FaCheckCircle className="text-xs" />
              <p className="text-xs font-semibold">
                Saved {currency}
                {couponDiscount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}!
              </p>
            </div>
          )}
        </div>

        {/* ═══════════ TRANSACTION PIN ═══════════ */}
        <div className="pt-6 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm shadow-amber-200">
                <FaLock className="text-white text-[10px]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Transaction PIN</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-50 px-2 py-1 rounded-md border border-red-100">Required</span>
          </div>

          <div className="relative">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
              <PinInput
                length={4}
                onChange={setPin}
                type={showPin ? "text" : "password"}
                className="justify-center"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute top-1/2 right-3 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow active:scale-95"
              title={showPin ? "Hide PIN" : "Show PIN"}
            >
              {showPin ? (
                <FaEyeSlash className="w-3.5 h-3.5" />
              ) : (
                <FaEye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <FaShieldAlt className="text-[10px] text-slate-300" />
            Encrypted · Never stored
          </p>
        </div>

        {/* ═══════════ VALIDATION ERRORS ═══════════ */}
        {validationErrors.length > 0 && (
          <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3 animate-fadeIn">
            <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Items needed to place order:</p>
              <ul className="space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx} className="text-xs text-amber-700/80 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ═══════════ PLACE ORDER BUTTON ═══════════ */}
        <button
          onClick={createOrder}
          disabled={loading || validationErrors.length > 0}
          className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-extrabold py-4 mt-4 rounded-xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 disabled:from-slate-200 disabled:via-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500/25 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 disabled:shadow-none group"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing Order...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <FaLock className="text-xs opacity-60" />
              <span>Place Order</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="tabular-nums">
                {currency}
                {totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <svg className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          )}
        </button>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-slate-400">
          <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>256-bit SSL secured checkout</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;

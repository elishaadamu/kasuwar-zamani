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
} from "react-icons/fa";

const OrderSummary = () => {
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
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  // Delivery logic states
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryLga, setDeliveryLga] = useState("");
  const [isInterState, setIsInterState] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // New shipping logic states
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
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
      const firstItemId = Object.keys(cartItems)[0];
      const product = products.find((p) => p._id === firstItemId);
      if (product && product.vendor) {
        return {
          shippingAddress: product.vendor.shippingAddress,
          shippingState: product.vendor.shippingState,
          zipCode: product.vendor.zipCode,
        };
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

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FaShippingFast className="text-blue-600 text-xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
      </div>

      <hr className="border-gray-200 my-6" />

      {/* Shipping Information Section */}
      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaMapMarkerAlt className="text-red-500" />
          Shipping Information
        </legend>

        <div className="space-y-4">
          {/* Shipping From */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Shipping From
            </label>
            <div className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg border border-gray-300">
              <div className="flex-1">
                <span className="block text-gray-900 font-medium line-clamp-1">
                  {vendorShippingInfo?.shippingAddress || "No shipping origin"}
                </span>
                {vendorShippingInfo?.shippingState && (
                  <span className="text-sm text-gray-500">
                    {vendorShippingInfo.shippingState} State •{" "}
                    {vendorShippingInfo.zipCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delivery State Selection */}
          <div>
            <label
              htmlFor="delivery-state"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Delivery To <span className="text-red-500">*</span>
            </label>
            <select
              id="delivery-state"
              value={deliveryState}
              onChange={(e) => setDeliveryState(e.target.value)}
              className="w-full outline-none p-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50"
              required
            >
              <option value="" disabled className="text-gray-400">
                Select delivery state
              </option>
              {states.map((s) => (
                <option key={s} value={s} className="text-gray-700">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* LGA Selection */}
          {deliveryState && (
            <div className="animate-fadeIn">
              <label
                htmlFor="delivery-lga"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Delivery LGA <span className="text-red-500">*</span>
              </label>
              <select
                id="delivery-lga"
                value={deliveryLga}
                onChange={(e) => setDeliveryLga(e.target.value)}
                className="w-full outline-none p-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50"
                required
              >
                <option value="">Select delivery LGA</option>
                {lgas.map((lga) => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Delivery Address Form */}
          {deliveryState && (
            <div className="animate-fadeIn">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter the full delivery address for the selected state..."
                className="w-full outline-none p-3 text-gray-700 border border-gray-300 resize-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50"
                rows="3"
              />
            </div>
          )}
        </div>
      </fieldset>

      <hr className="border-gray-200 my-6" />

      {/* Shipping Method Selection */}
      {shippingOptions.length > 0 && (
        <fieldset className="space-y-4 animate-fadeIn">
          <legend className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaShippingFast className="text-blue-500" />
            Shipping Method
            {shippingType && (
              <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                {shippingType.replace(/([A-Z])/g, " $1").trim()}
              </span>
            )}
          </legend>
          <div className="space-y-3">
            {shippingOptions.map((option) => (
              <div
                key={option.name}
                onClick={() => {
                  setSelectedShipping(option.name);
                  setShippingFee(option.price);
                }}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedShipping === option.name
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                    : "border-gray-300 bg-white hover:border-blue-400"
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    id={`shipping-${option.name}`}
                    name="shipping-option"
                    value={option.name}
                    checked={selectedShipping === option.name}
                    onChange={() => {
                      setSelectedShipping(option.name);
                      setShippingFee(option.price);
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`shipping-${option.name}`}
                    className="font-medium text-gray-800 cursor-pointer"
                  >
                    {option.name}{" "}
                    <span className="text-sm text-gray-500 font-normal">
                      ({option.days})
                    </span>
                  </label>
                </div>
                <p className="font-semibold text-gray-900">
                  {currency}
                  {option.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            ))}
          </div>
        </fieldset>
      )}
      {/* Cost Breakdown Section */}
      <fieldset className="space-y-4 mt-8">
        <legend className="text-lg font-semibold text-gray-800 mb-4">
          Cost Breakdown
        </legend>
        <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center py-2">
            <p className="text-gray-600">Items ({getCartCount()})</p>
            <p className="font-medium text-gray-800">
              {currency}
              {getCartAmount().toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="flex justify-between items-center py-2">
            <p className="text-gray-600">
              Shipping Fee{selectedShipping && ` (${selectedShipping})`}
            </p>
            <p className="font-medium text-gray-800">
              {currency}
              {shippingFee.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="flex justify-between items-center py-2">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">
              {currency}
              {Math.floor(getCartAmount() * 0.02).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between items-center py-2 text-green-600 bg-green-50 -mx-4 px-4 border-y border-green-100">
              <p className="font-medium">Discount Applied</p>
              <p className="font-bold">
                -{currency}
                {couponDiscount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center text-lg font-bold text-gray-900 border-t border-gray-300 pt-4 mt-2">
          <p>Order Total</p>
          <p className="text-blue-600 text-xl">
            {currency}
            {(finalAmount !== null
              ? finalAmount
              : getCartAmount() +
                shippingFee +
                Math.floor(getCartAmount() * 0.02) -
                couponDiscount
            ).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </fieldset>

      <hr className="border-gray-200 my-6" />

      {/* Coupon Section */}
      <fieldset className="space-y-3">
        <label className="text-sm font-medium text-gray-700  flex items-center gap-2">
          <FaTag className="text-green-500" />
          Have a coupon?
        </label>
        <div className="flex gap-2 w-[100%] sm:w-full flex-col sm:flex-row">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 outline-none p-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={couponDiscount > 0}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={couponLoading || !couponCode || couponDiscount > 0}
            className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all whitespace-nowrap min-w-[100px]"
          >
            {couponLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Applying
              </div>
            ) : (
              "Apply"
            )}
          </button>
        </div>
        {couponDiscount > 0 && (
          <p className="text-green-600 text-sm font-medium flex items-center gap-1">
            ✓ Coupon applied successfully! You saved {currency}
            {couponDiscount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        )}
      </fieldset>

      <hr className="border-gray-200 my-6" />

      {/* Payment Section */}
      <fieldset className="space-y-3">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FaLock className="text-red-500" />
          Transaction PIN <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
            <PinInput
              length={4}
              onChange={setPin}
              inputType={showPin ? "text" : "password"}
              className="justify-center"
            />
          </div>

          {/* Enhanced Toggle Button */}
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors bg-white rounded-full border border-gray-300 shadow-sm hover:shadow-md"
            title={showPin ? "Hide PIN" : "Show PIN"}
          >
            {showPin ? (
              <FaEyeSlash className="w-4 h-4" />
            ) : (
              <FaEye className="w-4 h-4" />
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Enter your 4-digit transaction PIN to complete the order
        </p>
      </fieldset>

      {/* Place Order Button */}
      <button
        onClick={createOrder}
        disabled={loading || !pin || pin.length !== 4 || !selectedShipping}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 mt-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Placing Order...
          </div>
        ) : (
          `Place Order • ${currency}${(finalAmount !== null
            ? finalAmount
            : getCartAmount() +
              shippingFee +
              Math.floor(getCartAmount() * 0.02) -
              couponDiscount
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        )}
      </button>
    </div>
  );
};

export default OrderSummary;

"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "@/context/AppContext";
import statesData from "@/lib/states.json";
import lgasData from "@/lib/lgas.json";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useRouter } from "next/navigation";

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  children,
}) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children || (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    )}
  </div>
);

const RequestDelivery = () => {
  const { userData } = useAppContext();
  const router = useRouter();
  const [deliveryType, setDeliveryType] = useState(""); // 'inter-state' or 'intra-state'
  const [states] = useState(statesData.state);
  const [pickupLgas, setPickupLgas] = useState([]);
  const [dropoffLgas, setDropoffLgas] = useState([]);
  const [lgaLoading, setLgaLoading] = useState({
    pickup: false,
    dropoff: false,
  });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Sender Info (Pickup)
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    senderState: "",
    senderLGA: "",
    deliveryDuration: "",
    // Recipient Info (Dropoff)
    receipientName: "",
    receipientPhone: "",
    receipientAltPhone: "",
    receipientAddress: "",
    receipientState: "",
    receipientLGA: "",
    // Backward compatibility for UI logic
    pickupState: "", // will be senderState
    dropoffState: "", // will be receipientState
    // Other details
    goodsDescription: "",
  });

  // Fetch LGAs when a state changes
  const fetchLgasForState = (state, type) => {
    if (!state) return;
    setLgaLoading((prev) => ({ ...prev, [type]: true }));
    // Simulate a short delay to allow UI to update loading state
    setTimeout(() => {
      const lgas = lgasData[state] || [];
      if (type === "pickup") {
        setPickupLgas(lgas);
        setFormData((prev) => ({ ...prev, senderLGA: "" }));
      } else {
        setDropoffLgas(lgas);
        setFormData((prev) => ({ ...prev, receipientLGA: "" }));
      }
      setLgaLoading((prev) => ({ ...prev, [type]: false }));
    }, 200); // 200ms delay
  };

  useEffect(() => {
    if (formData.pickupState) {
      fetchLgasForState(formData.senderState, "pickup");
    }
  }, [formData.senderState]);

  useEffect(() => {
    if (formData.dropoffState) {
      fetchLgasForState(formData.receipientState, "dropoff");
    }
  }, [formData.receipientState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Keep pickupState and dropoffState in sync for the useEffect hooks
    if (name === "senderState") {
      setFormData((prev) => ({ ...prev, pickupState: value }));
      if (deliveryType === "intra-state") {
        setFormData((prev) => ({ ...prev, receipientState: value }));
        fetchLgasForState(value, "dropoff");
      }
    }
    if (name === "receipientState") {
      setFormData((prev) => ({ ...prev, dropoffState: value }));
    }
  };

  const handleDeliveryTypeChange = (e) => {
    const newType = e.target.value;
    setDeliveryType(newType);
    // Reset states if delivery type changes
    setFormData((prev) => ({
      ...prev,
      senderState: "",
      senderLGA: "",
      receipientState: "",
      receipientLGA: "",
    }));
    setPickupLgas([]);
    setDropoffLgas([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      userId: userData?.id,
      requestType: deliveryType,
      senderName: formData.senderName,
      senderPhone: formData.senderPhone,
      senderAddress: formData.senderAddress,
      senderState: formData.senderState,
      senderLGA: formData.senderLGA,
      deliveryDuration: formData.deliveryDuration,
      description: formData.goodsDescription,
      receipientName: formData.receipientName,
      receipientPhone: formData.receipientPhone,
      receipientAltPhone: formData.receipientAltPhone,
      receipientAddress: formData.recipientAddress,
      receipientState:
        deliveryType === "intra-state"
          ? formData.senderState
          : formData.receipientState,
      receipientLGA: formData.receipientLGA,
    };

    console.log("Payload:", payload);

    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.DELIVERY.REQUEST_DELIVERY),
        payload,
        { withCredentials: true }
      );
      console.log("Submitting payload:", payload);
      toast.success(
        "Delivery request created successfully! Redirecting in 5 seconds..."
      );
      setTimeout(() => {
        router.push("/dashboard/delivery-payment");
      }, 5000);
    } catch (error) {
      console.error("Error creating delivery request:", error);
      toast.error(
        error.response?.data?.message || "Failed to create delivery request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Request Delivery Service</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white p-8 rounded-lg shadow-md"
      >
        <FormField label="Delivery Type" name="deliveryType" required>
          <select
            value={deliveryType}
            onChange={handleDeliveryTypeChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select Delivery Type</option>
            <option value="inter-state">Inter-state Delivery</option>
            <option value="intra-state">Intra-state Delivery</option>
          </select>
        </FormField>

        {deliveryType && (
          <>
            {/* Pickup Details */}
            <fieldset className="border p-4 rounded-md">
              <legend className="font-semibold px-2 text-lg">
                Sender Details (Pickup)
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <FormField
                  label="Sender Name"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter sender's full name"
                />
                <FormField
                  label="Sender Phone"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleInputChange}
                  required
                  type="tel"
                  placeholder="Enter sender's phone number"
                />
                <FormField
                  label="Delivery Duration"
                  name="deliveryDuration"
                  required
                >
                  <select
                    name="deliveryDuration"
                    value={formData.deliveryDuration}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select Duration</option>
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                  </select>
                </FormField>
                <FormField label="State" name="senderState" required>
                  <select
                    name="senderState"
                    value={formData.senderState}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="LGA" name="senderLGA" required>
                  <select
                    name="senderLGA"
                    value={formData.senderLGA}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.senderState || lgaLoading.pickup}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100"
                  >
                    <option value="">
                      {lgaLoading.pickup ? "Loading..." : "Select LGA"}
                    </option>
                    {pickupLgas.map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField
                  label="Address"
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter pickup address"
                />
              </div>
            </fieldset>

            {/* Dropoff Details */}
            <fieldset className="border p-4 rounded-md">
              <legend className="font-semibold px-2 text-lg">
                Recipient Details (Dropoff)
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <FormField
                  label="Recipient Name"
                  name="receipientName"
                  value={formData.receipientName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter recipient's full name"
                />
                <FormField
                  label="Recipient Phone"
                  name="receipientPhone"
                  value={formData.receipientPhone}
                  onChange={handleInputChange}
                  required
                  type="tel"
                  placeholder="Enter recipient's phone number"
                />
                <FormField
                  label="Recipient Alt. Phone"
                  name="receipientAltPhone"
                  value={formData.receipientAltPhone}
                  onChange={handleInputChange}
                  type="tel"
                  placeholder="Enter an alternative phone number"
                />

                {deliveryType === "inter-state" && (
                  <FormField label="State" name="receipientState" required>
                    <select
                      name="receipientState"
                      value={formData.receipientState}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </FormField>
                )}
                <FormField label="LGA" name="receipientLGA" required>
                  <select
                    name="receipientLGA"
                    value={formData.receipientLGA}
                    onChange={handleInputChange}
                    required
                    disabled={
                      lgaLoading.dropoff ||
                      (deliveryType === "inter-state"
                        ? !formData.receipientState
                        : !formData.senderState)
                    }
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100"
                  >
                    <option value="">
                      {lgaLoading.dropoff ? "Loading..." : "Select LGA"}
                    </option>
                    {dropoffLgas.map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField
                  label="Address"
                  name="receipientAddress"
                  value={formData.receipientAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter dropoff address"
                />
              </div>
            </fieldset>

            {/* Other Details */}
            <fieldset className="border p-4 rounded-md">
              <legend className="font-semibold px-2 text-lg">
                Other Details
              </legend>
              <FormField
                label="Goods Description"
                name="goodsDescription"
                required
              >
                <textarea
                  name="goodsDescription"
                  value={formData.goodsDescription}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Describe the item(s) being delivered"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                ></textarea>
              </FormField>
            </fieldset>
          </>
        )}

        <button
          type="submit"
          disabled={!deliveryType || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default RequestDelivery;

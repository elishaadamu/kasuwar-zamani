"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "@/context/AppContext";
import { apiUrl, API_CONFIG } from "@/configs/api";

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
  const [deliveryType, setDeliveryType] = useState(""); // 'inter-state' or 'intra-state'
  const [states, setStates] = useState([]);
  const [pickupLgas, setPickupLgas] = useState([]);
  const [dropoffLgas, setDropoffLgas] = useState([]);
  const [lgaLoading, setLgaLoading] = useState({
    pickup: false,
    dropoff: false,
  });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Pickup Info
    pickupState: "",
    pickupLga: "",
    pickupAddress: "",
    pickupNotableLocation: "",
    // Dropoff Info
    dropoffState: "",
    dropoffLga: "",
    dropoffAddress: "",
    dropoffNotableLocation: "",
    // Other details
    goodsDescription: "",
  });

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(
          "https://nga-states-lga.onrender.com/fetch"
        );
        setStates(response.data);
      } catch (error) {
        toast.error("Failed to fetch states.");
      }
    };
    fetchStates();
  }, []);

  // Fetch LGAs when a state changes
  const fetchLgasForState = async (state, type) => {
    if (!state) return;
    setLgaLoading((prev) => ({ ...prev, [type]: true }));
    if (type === "pickup") {
      setPickupLgas([]);
      setFormData((prev) => ({ ...prev, pickupLga: "" }));
    } else {
      setDropoffLgas([]);
      setFormData((prev) => ({ ...prev, dropoffLga: "" }));
    }

    try {
      const response = await axios.get(
        `https://nga-states-lga.onrender.com/?state=${state}`
      );
      if (type === "pickup") {
        setPickupLgas(response.data);
      } else {
        setDropoffLgas(response.data);
      }
    } catch (error) {
      toast.error(`Failed to fetch LGAs for ${state}.`);
    } finally {
      setLgaLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    if (formData.pickupState) {
      fetchLgasForState(formData.pickupState, "pickup");
    }
  }, [formData.pickupState]);

  useEffect(() => {
    if (formData.dropoffState) {
      fetchLgasForState(formData.dropoffState, "dropoff");
    }
  }, [formData.dropoffState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeliveryTypeChange = (e) => {
    const newType = e.target.value;
    setDeliveryType(newType);
    // Reset states if delivery type changes
    setFormData((prev) => ({
      ...prev,
      pickupState: "",
      pickupLga: "",
      dropoffState: "",
      dropoffLga: "",
    }));
    setPickupLgas([]);
    setDropoffLgas([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      deliveryType,
      pickupAddress: {
        state: formData.pickupState,
        lga: formData.pickupLga,
        address: formData.pickupAddress,
        notableLocation: formData.pickupNotableLocation,
      },
      dropoffAddress: {
        state:
          deliveryType === "intra-state"
            ? formData.pickupState
            : formData.dropoffState,
        lga: formData.dropoffLga,
        address: formData.dropoffAddress,
        notableLocation: formData.dropoffNotableLocation,
      },
      goodsDescription: formData.goodsDescription,
      // Assuming the delivery person themselves is creating this request
      deliveryPersonId: userData?.user?._id,
    };

    try {
      // Replace with your actual API endpoint for creating a delivery request
      // const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.DELIVERY.REQUEST), payload);
      toast.success("Delivery request created successfully!");
      // Optionally reset form or redirect
    } catch (error) {
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
                Pickup Details
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <FormField label="State" name="pickupState" required>
                  <select
                    name="pickupState"
                    value={formData.pickupState}
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
                <FormField label="LGA" name="pickupLga" required>
                  <select
                    name="pickupLga"
                    value={formData.pickupLga}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.pickupState || lgaLoading.pickup}
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
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter pickup address"
                />
                <FormField
                  label="Notable Location"
                  name="pickupNotableLocation"
                  value={formData.pickupNotableLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., near City Mall"
                />
              </div>
            </fieldset>

            {/* Dropoff Details */}
            <fieldset className="border p-4 rounded-md">
              <legend className="font-semibold px-2 text-lg">
                Dropoff Details
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {deliveryType === "inter-state" && (
                  <FormField label="State" name="dropoffState" required>
                    <select
                      name="dropoffState"
                      value={formData.dropoffState}
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
                <FormField label="LGA" name="dropoffLga" required>
                  <select
                    name="dropoffLga"
                    value={formData.dropoffLga}
                    onChange={handleInputChange}
                    required
                    disabled={
                      !formData.pickupState ||
                      (deliveryType === "inter-state" &&
                        !formData.dropoffState) ||
                      lgaLoading.dropoff
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
                  name="dropoffAddress"
                  value={formData.dropoffAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter dropoff address"
                />
                <FormField
                  label="Notable Location"
                  name="dropoffNotableLocation"
                  value={formData.dropoffNotableLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., opposite the stadium"
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

"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { customToast } from "@/lib/customToast";
import { useRouter } from "next/navigation";

import Logo from "@/assets/logo/logo.png";
import { assets } from "@/assets/assets";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import { encryptData } from "@/lib/encryption";

const FormField = ({
  label,
  name,
  type = "text",
  required,
  value,
  onChange,
  placeholder,
  children,
}) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={name}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children || (
      <input
        id={name}
        name={name}
        required={required}
        onChange={onChange}
        value={value}
        className="border p-2 rounded-md"
        type={type}
        placeholder={placeholder}
      />
    )}
  </div>
);

const DeliverySignupClient = () => {
  const router = useRouter();
  const { fetchUserData } = useAppContext();

  // Vehicle types state
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const availableVehicles = ["Motorcycle", "Car", "Van", "Truck"];

  // Image upload state
  const [idImage, setIdImage] = useState(null);
  const [licenseImage, setLicenseImage] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [lgaLoading, setLgaLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    officeAddress: "",
    serviceAreas: "",
    firstName: "",
    lastName: "",
    dob: "",
    residentialAddress: "",
    state: "",
    lga: "",
    email: "",
    phone: "",
    password: "",
    nin: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Determine if a driver's license is required
  const requiresLicense = vehicleTypes.some((type) => type !== "Motorcycle");

  // Fetch Nigerian states and LGAs
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get(
          "https://nga-states-lga.onrender.com/fetch"
        );

        setStates(response.data);
      } catch (error) {
        customToast.error("Failed to fetch states.");
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  // Fetch LGAs when state changes
  useEffect(() => {
    const getLgasFromApi = async () => {
      if (!formData.state) return;
      setLgaLoading(true);
      setLgas([]);
      setFormData((prev) => ({ ...prev, lga: "" }));
      try {
        const response = await axios.get(
          `https://nga-states-lga.onrender.com/?state=${formData.state}`
        );
        setLgas(response.data);
      } catch (error) {
        customToast.error("Failed to fetch LGAs for the selected state.");
        console.error("Error fetching LGAs:", error);
      } finally {
        setLgaLoading(false);
      }
    };

    getLgasFromApi();
  }, [formData.state]);

  const handleVehicleTypeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setVehicleTypes((prev) => [...prev, value]);
    } else {
      setVehicleTypes((prev) => prev.filter((type) => type !== value));
    }
  };

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (!file) return; // Handle case where user cancels file selection

    if (file.size > 50 * 1024) {
      // 50KB limit
      customToast.error("Image size must not exceed 50KB.");
      e.target.value = null; // Reset file input
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImage(reader.result); // Set base64 string
    };
    reader.onerror = (error) => {
      customToast.error("Failed to read file.");
      console.error("Error reading file:", error);
    };
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Enhanced Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.dob ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.residentialAddress ||
      !formData.state ||
      !formData.lga ||
      !formData.nin ||
      !formData.bankName ||
      !formData.accountNumber ||
      !formData.accountName
    ) {
      customToast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (vehicleTypes.length === 0) {
      customToast.error("Please select at least one vehicle type.");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      customToast.error("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (!idImage || (requiresLicense && !licenseImage)) {
      customToast.error("Please upload all required documents.");
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      localGovernment: formData.lga,
      idImage,
      drivingLicenseImage: requiresLicense ? licenseImage : null,
      vehicleTypes,
    };

    console.log("Signup payload:", payload); // Debugging line
    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.DELIVERY.CREATE), // Assuming a general signup endpoint
        payload
      );
      const { user } = response.data;

      // Encrypt and store user data
      const encryptedUser = encryptData(user);
      localStorage.setItem("user", encryptedUser);

      fetchUserData();
      customToast.success("Delivery person signup successful!");
      router.push("/delivery-signin"); // Redirect to delivery dashboard
    } catch (error) {
      console.error("Error signing up as delivery person:", error);
      customToast.error(
        error.response?.data?.message || "An error occurred during signup."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderImagePreview = (image, placeholder) => {
    return (
      <Image
        src={image || placeholder}
        alt="Upload preview"
        width={100}
        height={100}
        className="rounded-md object-cover border"
      />
    );
  };

  return (
    <div className="flex justify-center items-center my-16">
      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-6 w-[90%] max-w-[800px] text-gray-700"
      >
        <Link href={"/"}>
          <Image
            className="cursor-pointer w-[170px] md:w-[250px] mx-auto"
            src={Logo}
            alt="Kasuwar Zamani Logo"
          />
        </Link>
        <p className="text-center font-semibold text-2xl">
          Become a Delivery Partner
        </p>

        {/* Personal Information */}
        <fieldset className="border p-4 rounded-md">
          <legend className="font-semibold px-2">Personal Information</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <FormField
              label="First Name"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleFormChange}
              placeholder="Enter your first name"
            />
            <FormField
              label="Last Name"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleFormChange}
              placeholder="Enter your last name"
            />
            <FormField
              label="Date of Birth"
              name="dob"
              type="date"
              required
              value={formData.dob}
              onChange={handleFormChange}
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleFormChange}
              placeholder="Enter your email"
            />
            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleFormChange}
              placeholder="Enter your phone number"
            />
            <div className="flex flex-col gap-1 relative">
              <label>
                Password <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="password"
                onChange={handleFormChange}
                value={formData.password}
                className="border p-2 rounded-md pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />
              <Image
                onClick={() => setShowPassword(!showPassword)}
                className="w-5 cursor-pointer absolute right-3 top-10"
                src={
                  showPassword ? assets.eye_close_icon : assets.eye_open_icon
                }
                alt="Toggle password visibility"
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                label="Residential Address"
                name="residentialAddress"
                required
                value={formData.residentialAddress}
                onChange={handleFormChange}
                placeholder="Enter your full address"
              />
            </div>
            <FormField label="State" name="state" required>
              <select
                required
                name="state"
                onChange={handleFormChange}
                value={formData.state}
                className="border p-2 rounded-md bg-white"
              >
                <option value="" disabled>
                  Select State
                </option>
                {states.map((s) => (
                  <option key={s} value={s} name="state">
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="LGA" name="lga" required>
              <select
                required
                name="lga"
                onChange={handleFormChange}
                value={formData.lga}
                className="border p-2 rounded-md bg-white disabled:bg-gray-100"
                disabled={!formData.state || lgaLoading}
              >
                <option value="" disabled>
                  {lgaLoading ? "Loading LGAs..." : "Select LGA"}
                </option>
                {lgas.map((l) => (
                  <option key={l} value={l} name="lga">
                    {l}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </fieldset>

        {/* Service Information */}
        <fieldset className="border p-4 rounded-md">
          <legend className="font-semibold px-2">Service Information</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <FormField
              label="Company Name (Optional)"
              name="companyName"
              value={formData.companyName}
              onChange={handleFormChange}
              placeholder="Your delivery company name"
            />
            <FormField
              label="Office Address (Optional)"
              name="officeAddress"
              value={formData.officeAddress}
              onChange={handleFormChange}
              placeholder="Your office address"
            />
            <div className="flex flex-col gap-1 md:col-span-2">
              <label>States/LGAs you cover</label>
              <textarea
                name="serviceAreas"
                onChange={handleFormChange}
                value={formData.serviceAreas}
                className="border p-2 rounded-md"
                placeholder="e.g., Lagos (Ikeja, Surulere), Abuja (Garki, Wuse)"
              />
            </div>
          </div>
        </fieldset>

        {/* Verification */}
        <fieldset className="border p-4 rounded-md">
          <legend className="font-semibold px-2">Verification</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <FormField
              label="NIN Number"
              name="nin"
              required
              value={formData.nin}
              onChange={handleFormChange}
              placeholder="Enter your NIN"
            />
            <div className="flex flex-col gap-1">
              <label>
                Vehicle Types <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                {availableVehicles.map((vehicle) => (
                  <label
                    key={vehicle}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={vehicle}
                      checked={vehicleTypes.includes(vehicle)}
                      onChange={handleVehicleTypeChange}
                      className="h-4 w-4"
                    />
                    {vehicle}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label>
                ID Card Image (max 50KB) <span className="text-red-500">*</span>
              </label>
              {renderImagePreview(idImage, assets.upload_area)}
              <input
                required
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setIdImage)}
                className="text-sm"
              />
            </div>
            {requiresLicense && (
              <div className="flex flex-col gap-2">
                <label>
                  Driving License/Other Doc (max 50KB){" "}
                  <span className="text-red-500">*</span>
                </label>
                {renderImagePreview(licenseImage, assets.upload_area)}
                <input
                  required={requiresLicense}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setLicenseImage)}
                  className="text-sm"
                />
              </div>
            )}
          </div>
        </fieldset>

        {/* Bank Details */}
        <fieldset className="border p-4 rounded-md">
          <legend className="font-semibold px-2">Bank Details</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <FormField
              label="Bank Name"
              name="bankName"
              required
              value={formData.bankName}
              onChange={handleFormChange}
              placeholder="e.g., Guaranty Trust Bank"
            />
            <FormField
              label="Account Number"
              name="accountNumber"
              required
              value={formData.accountNumber}
              onChange={handleFormChange}
              placeholder="Enter your account number"
            />
            <div className="md:col-span-2">
              <FormField
                label="Account Name"
                name="accountName"
                required
                value={formData.accountName}
                onChange={handleFormChange}
                placeholder="Enter your full account name"
              />
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className="bg-gray-800 text-white p-3 rounded-md flex items-center justify-center w-full mt-4 text-lg"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link className="text-blue-500" href={"/delivery-signin"}>
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default DeliverySignupClient;

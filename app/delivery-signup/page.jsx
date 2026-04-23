"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

import Logo from "@/assets/logo/logo.png";
import { assets } from "@/assets/assets";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";
import { encryptData } from "@/lib/encryption";

const DeliverySignupPage = () => {
  const router = useRouter();
  const { fetchUserData } = useAppContext();

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [serviceAreas, setServiceAreas] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [lgas, setLgas] = useState([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [nin, setNin] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

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
  const [lgaLoading, setLgaLoading] = useState(false);

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
        toast.error("Failed to fetch states.");
      }
    };
    fetchStates();
  }, []);

  // Fetch LGAs when state changes
  useEffect(() => {
    const getLgasFromApi = async () => {
      if (!state) return;
      setLgaLoading(true);
      setLgas([]);
      setLga("");
      try {
        const response = await axios.get(
          `https://nga-states-lga.onrender.com/?state=${state}`
        );
        setLgas(response.data);
      } catch (error) {
        toast.error("Failed to fetch LGAs for the selected state.");
      } finally {
        setLgaLoading(false);
      }
    };

    getLgasFromApi();
  }, [state]);

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
    if (!file) return;

    if (file.size > 50 * 1024) {
      // 50KB limit
      toast.error("Image size must not exceed 50KB.");
      e.target.value = null; // Reset file input
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImage(reader.result); // Set base64 string
    };
    reader.onerror = (error) => {
      toast.error("Failed to read file.");
    };
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Enhanced Validation
    if (
      !firstName ||
      !lastName ||
      !dob ||
      !email ||
      !phone ||
      !password ||
      !residentialAddress ||
      !state ||
      !lga ||
      !nin ||
      !bankName ||
      !accountNumber ||
      !accountName
    ) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (vehicleTypes.length === 0) {
      toast.error("Please select at least one vehicle type.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (!idImage || (requiresLicense && !licenseImage)) {
      toast.error("Please upload all required documents.");
      setLoading(false);
      return;
    }

    const payload = {
      // Company Info
      companyName,
      officeAddress,
      serviceAreas,
      // Personal Info
      firstName,
      lastName,
      dob: dob,
      residentialAddress,
      state,
      localGovernment: lga,
      email,
      phone,
      password,
      // Verification
      idImage,
      drivingLicenseImage: requiresLicense ? licenseImage : null,
      vehicleTypes,
      nin,
      // Bank Info
      bankName,
      accountNumber,
      accountName,
    };

     // Debugging line
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
      toast.success("Delivery person signup successful!");
      router.push("/delivery-signin"); // Redirect to delivery dashboard
    } catch (error) {
      toast.error(
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
      <ToastContainer />
      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-6 w-[90%] max-w-[800px] text-gray-700"
      >
        <Link href={"/"}>
          <Image
            className="cursor-pointer w-[170px] md:w-[250px] mx-auto"
            src={Logo}
            alt="QuickCart Logo"
          />
        </Link>
        <p className="text-center font-semibold text-2xl">
          Become a Delivery Partner
        </p>

        {/* Personal Information */}
        <fieldset className="border p-4 rounded-md">
          <legend className="font-semibold px-2">Personal Information</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-1">
              <label>
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
                className="border p-2 rounded-md"
                type="text"
                placeholder="Enter your first name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
                className="border p-2 rounded-md"
                type="text"
                placeholder="Enter your last name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                required
                onChange={(e) => setDob(e.target.value)}
                value={dob}
                className="border p-2 rounded-md"
                type="date"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="border p-2 rounded-md"
                type="email"
                placeholder="Enter your email"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                required
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
                className="border p-2 rounded-md"
                type="tel"
                placeholder="Enter your phone number"
              />
            </div>
            <div className="flex flex-col gap-1 relative">
              <label>
                Password <span className="text-red-500">*</span>
              </label>
              <input
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="border p-2 rounded-md pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />
              <Image
                onClick={() => setShowPassword(!showPassword)}
                className="w-5 cursor-pointer absolute right-3 top-9"
                src={
                  showPassword ? assets.eye_close_icon : assets.eye_open_icon
                }
                alt="Toggle password visibility"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label>
                Residential Address <span className="text-red-500">*</span>
              </label>
              <input
                required
                onChange={(e) => setResidentialAddress(e.target.value)}
                value={residentialAddress}
                className="border p-2 rounded-md"
                type="text"
                placeholder="Enter your full address"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>
                State <span className="text-red-500">*</span>
              </label>
              <select
                required
                onChange={(e) => setState(e.target.value)}
                value={state}
                className="border p-2 rounded-md bg-white"
              >
                <option value="" disabled>
                  Select State
                </option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label>
                LGA <span className="text-red-500">*</span>
              </label>
              <select
                required
                onChange={(e) => setLga(e.target.value)}
                value={lga}
                className="border p-2 rounded-md bg-white disabled:bg-gray-100"
                disabled={!state || lgaLoading}
              >
                <option value="" disabled>
                  {lgaLoading ? "Loading LGAs..." : "Select LGA"}
                </option>
                {lgas.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Service Information */}
        <fieldset className="border p-4 rounded-md">
          <legend className="font-semibold px-2">Service Information</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-1">
              <label>Company Name (Optional)</label>
              <input
                onChange={(e) => setCompanyName(e.target.value)}
                value={companyName}
                className="border p-2 rounded-md"
                type="text"
                placeholder="Your delivery company name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>Office Address (Optional)</label>
              <input
                onChange={(e) => setOfficeAddress(e.target.value)}
                value={officeAddress}
                className="border p-2 rounded-md"
                type="text"
                placeholder="Your office address"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label>States/LGAs you cover</label>
              <textarea
                onChange={(e) => setServiceAreas(e.target.value)}
                value={serviceAreas}
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
            <div className="flex flex-col gap-1">
              <label>
                NIN Number <span className="text-red-500">*</span>
              </label>
              <input
                required
                onChange={(e) => setNin(e.target.value)}
                value={nin}
                className="border p-2 rounded-md"
                type="text"
                placeholder="Enter your NIN"
              />
            </div>
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
            <div className="flex flex-col gap-1">
              <label>
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                onChange={(e) => setBankName(e.target.value)}
                value={bankName}
                className="border p-2 rounded-md"
                type="text"
                placeholder="e.g., Guaranty Trust Bank"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label>
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                required
                onChange={(e) => setAccountNumber(e.target.value)}
                value={accountNumber}
                className="border p-2 rounded-md"
                type="text"
                placeholder="Enter your account number"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label>
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                onChange={(e) => setAccountName(e.target.value)}
                value={accountName}
                className="border p-2 rounded-md"
                type="text"
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

export default DeliverySignupPage;

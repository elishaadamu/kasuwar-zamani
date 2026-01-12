"use client";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Logo from "@/assets/logo/logo.png";

import Link from "next/link";
import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter, useSearchParams } from "next/navigation";
import { encryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";

const VendorSignupForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUserData } = useAppContext();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    newUserReferralCode: "",
    appliedReferralCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (formData.firstName.trim() && formData.phone.length >= 3) {
      const generatedCode = `${formData.firstName
        .toUpperCase()
        .trim()}${formData.phone.slice(-3)}`;
      setFormData((prev) => ({ ...prev, newUserReferralCode: generatedCode }));
    } else {
      setFormData((prev) => ({ ...prev, newUserReferralCode: "" }));
    }
  }, [formData.firstName, formData.phone]);

  // Read referral code from URL on component mount
  useEffect(() => {
    const refCodeFromUrl = searchParams.get("ref");
    if (refCodeFromUrl) {
      setFormData((prev) => ({ ...prev, appliedReferralCode: refCodeFromUrl }));
      toast.info("Referral code applied!");
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      referralCode: formData.appliedReferralCode,
      role: "vendor",
    };
    console.log("Vendor signup payload with referral code:", payload);

    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP),
        payload,
        { withCredentials: true }
      );
      const { user } = response.data;
      console.log("Signup response:", response.data);
      // Encrypt and store user data
      const encryptedUser = encryptData(user);
      localStorage.setItem("user", encryptedUser);

      fetchUserData();
      toast.success("Vendor signup successful!");
      router.push("/vendor-dashboard"); // Redirect to seller dashboard after signup
    } catch (error) {
      console.error("Error signing up as vendor:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred during vendor signup."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center my-16">
      <ToastContainer />
      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-4 w-[90%] md:w-[450px] text-gray-700"
      >
        <Link href={"/"}>
          <Image
            className="cursor-pointer w-[170px] md:w-[250px] mx-auto"
            src={Logo}
            alt=""
          />
        </Link>
        <p className="text-center font-semibold text-xl">
          Create a Vendor Account
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 w-1/2">
              <label>First Name</label>
              <input
                name="firstName"
                onChange={handleChange}
                value={formData.firstName}
                className="border p-2 rounded-md"
                type="text"
                placeholder="Enter your first name"
              />
            </div>
            <div className="flex flex-col gap-1 w-1/2">
              <label>Last Name</label>
              <input
                name="lastName"
                onChange={handleChange}
                value={formData.lastName}
                className="border p-2 rounded-md"
                type="text"
                placeholder="Enter your last name"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label>Email</label>
            <input
              name="email"
              onChange={handleChange}
              value={formData.email}
              className="border p-2 rounded-md"
              type="email"
              placeholder="Enter your email"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label>Phone Number</label>
            <input
              name="phone"
              onChange={handleChange}
              value={formData.phone}
              className="border p-2 rounded-md"
              type="tel"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label>Referral Code (Optional)</label>
            <input
              name="appliedReferralCode"
              onChange={handleChange}
              value={formData.appliedReferralCode}
              className="border p-2 rounded-md"
              type="text"
              placeholder="Enter referral code if you have one"
            />
          </div>
          <div className="flex flex-col gap-1 relative">
            <label>Password</label>
            <input
              name="password"
              onChange={handleChange}
              value={formData.password}
              className="border p-2 rounded-md pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
            />
            <Image
              onClick={() => setShowPassword(!showPassword)}
              className="w-5 cursor-pointer absolute right-3 top-9"
              src={showPassword ? assets.eye_close_icon : assets.eye_open_icon}
              alt="Toggle password visibility"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gray-800 text-white p-2 rounded-md flex items-center justify-center w-full mt-4"
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
            "Sign up as Vendor"
          )}
        </button>

        <p className="text-sm text-center">
          Already have a vendor account?{" "}
          <Link className="text-blue-500" href={"/vendor-signin"}>
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

const VendorSignupPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VendorSignupForm />
    </Suspense>
  );
};

export default VendorSignupPage;

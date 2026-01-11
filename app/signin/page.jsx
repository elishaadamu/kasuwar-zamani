"use client";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Logo from "@/assets/logo/logo.png";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { encryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "@/context/AppContext";

const page = () => {
  const router = useRouter();
  const { fetchUserData } = useAppContext();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      router.push("/");
    }
  }, [router]);

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const payload = { phone, password };

    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNIN),
        payload,
        { withCredentials: true }
      );

      console.log("Response data:", response.data);
      if (!response.data) {
        throw new Error("No data received from server");
      }

      const encryptedUser = encryptData(response.data);

      if (!encryptedUser) {
        throw new Error("Failed to encrypt user data");
      }

      // Store and verify encrypted data
      localStorage.setItem("user", encryptedUser);
      console.log(
        "Verification - Data in localStorage:",
        localStorage.getItem("user")
      );
      fetchUserData(); // Call fetchUserData to update global state
      toast.success("Signin successful!");

      const userRole = response.data?.role;
      if (userRole === "vendor") {
        router.push("/vendor-dashboard");
      } else if (userRole === "delivery") {
        router.push("/delivery-dashboard");
      } else {
        // For 'user' and 'admin'
        router.push("/");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error(
        error.response?.data?.message || "An error occurred during signin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center my-16">
      <ToastContainer />
      <form
        onSubmit={handleSignin}
        className="flex flex-col gap-4 w-[90%] md:w-[450px] text-gray-700"
      >
        <Link href={"/"}>
          <Image
            className="cursor-pointer w-[170px] md:w-[250px] mx-auto"
            src={Logo}
            alt=""
          />
        </Link>
        <p className="text-center font-semibold text-xl">Welcome back!</p>
        <div className="flex flex-col gap-1">
          <label>Phone Number</label>
          <input
            onChange={(e) => setPhone(e.target.value)}
            value={phone}
            className="border p-2 rounded-md"
            type="tel"
            placeholder="Enter your phone number"
          />
        </div>
        <div className="flex flex-col gap-1 relative">
          <label>Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
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
        <button
          disabled={loading}
          className="bg-gray-800 text-white p-2 rounded-md flex items-center justify-center"
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
            "Sign in"
          )}
        </button>
        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link className="text-blue-500" href={"/signup"}>
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default page;

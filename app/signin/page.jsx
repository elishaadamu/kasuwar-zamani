"use client";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Logo from "@/assets/logo/logo.png";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { encryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { customToast } from "@/lib/customToast";
import { useAppContext } from "@/context/AppContext";
import { Suspense } from "react";

const SigninPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { fetchUserData } = useAppContext();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      router.push(redirect || "/");
    }
  }, [router, redirect]);

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      customToast.error("Password Validation", "Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const payload = { phone, password };

    try {
      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNIN), payload, { withCredentials: true });

      if (!response.data) throw new Error("No data received from server");

      const encryptedUser = encryptData(response.data);
      if (!encryptedUser) throw new Error("Failed to encrypt user data");

      localStorage.setItem("user", encryptedUser);
      fetchUserData();
      customToast.success("Welcome Back!", "Signin successful!");

      const userRole = response.data?.role;
      if (redirect) {
        router.push(redirect);
      } else if (userRole === "vendor") {
        router.push("/vendor-dashboard");
      } else if (userRole === "delivery") {
        router.push("/delivery-dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error signing in:", error);
      customToast.error("Signin Failed", error.response?.data?.message || "An error occurred during signin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-blue-100/50 to-indigo-100/50 blur-3xl opacity-60"></div>
           <div className="absolute bottom-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-purple-100/50 to-pink-100/50 blur-3xl opacity-60"></div>
        </div>

        <div className="w-full max-w-[450px] bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-8 md:p-12 z-10 border border-white">
          <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image className="w-48 mx-auto hover:opacity-80 transition-opacity" src={Logo} alt="Kasuwar Zamani" />
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mt-6 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 font-medium mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSignin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Phone Number</label>
            <input
              required
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
              className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-900"
              type="tel"
              placeholder="e.g. 08012345678"
            />
          </div>
          
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Password</label>
            <div className="relative">
              <input
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="w-full px-5 py-4 pr-12 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-900"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                <Image src={showPassword ? assets.eye_close_icon : assets.eye_open_icon} alt="Toggle visibility" className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" />
              </button>
            </div>
             <div className="flex justify-end mt-1">
                <Link href="/forgot-password" className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider">
                  Forgot Password?
                </Link>
             </div>
          </div>

          <button
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3"
          >
            {loading ? (
               <>
                 <svg className="animate-spin h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Authenticating...
               </>
            ) : "Secure Sign In"}
          </button>
          
          <p className="text-sm font-medium text-center text-gray-600 mt-2">
            Don't have an account?{" "}
            <Link className="text-blue-600 font-bold hover:text-blue-800 transition-colors" href={`/signup${redirect ? `?redirect=${redirect}` : ""}`}>
              Create one
            </Link>
          </p>
        </form>
      </div>
      </div>

      {/* Right Side: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden">
         <div className="absolute inset-0 w-full h-full">
             <Image src={assets.girl_with_headphone_image} alt="Shopping Lifestyle" fill className="object-cover opacity-70" />
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
         </div>
         <div className="relative z-10 text-white p-12 text-center max-w-xl">
             <h2 className="text-5xl font-black mb-6 tracking-tight">Discover Premium Quality</h2>
             <p className="text-lg text-gray-300 font-medium">Log in to track your orders, manage your wishlist, and unlock exclusive marketplace deals.</p>
         </div>
      </div>
    </div>
  );
};

const SigninPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <SigninPageContent />
    </Suspense>
  );
};

export default SigninPage;

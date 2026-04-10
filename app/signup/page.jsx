"use client";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Logo from "@/assets/logo/logo.png";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { customToast } from "@/lib/customToast";
import { useRouter } from "next/navigation";
import { encryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { useAppContext } from "@/context/AppContext";

const SignupPage = () => {
  const router = useRouter();
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
      const generatedCode = `${formData.firstName.toUpperCase().trim()}${formData.phone.slice(-3)}`;
      setFormData((prev) => ({ ...prev, newUserReferralCode: generatedCode }));
    } else {
      setFormData((prev) => ({ ...prev, newUserReferralCode: "" }));
    }
  }, [formData.firstName, formData.phone]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentSearchParams = new URLSearchParams(window.location.search);
      const refCodeFromUrl = currentSearchParams.get("ref");
      if (refCodeFromUrl) {
        setFormData((prev) => ({
          ...prev,
          appliedReferralCode: refCodeFromUrl,
        }));
        // customToast.info("Referral Applied", "Referral code applied successfully!");
      }
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      router.push("/");
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const evaluatePassword = (pwd) => {
    if (!pwd) return { strength: 0, text: "", color: "bg-gray-200", border: 'border-transparent', message: "" };
    if (pwd.length < 6) return { strength: 1, text: "Weak", color: "bg-red-500", border: 'border-red-500', message: "Minimum 6 characters required." };
    if (/^[A-Za-z]+$/.test(pwd)) return { strength: 1, text: "Weak", color: "bg-red-500", border: 'border-red-500', message: "Cannot be only letters. Add numbers." };
    if (/^[0-9]+$/.test(pwd)) return { strength: 2, text: "Medium", color: "bg-amber-500", border: 'border-amber-500', message: "Numbers only is okay, but mix text for stronger security." };
    if (/[A-Za-z]/.test(pwd) && /[0-9]/.test(pwd)) return { strength: 3, text: "Strong", color: "bg-emerald-500", border: 'border-emerald-500', message: "Strong password!" };
    return { strength: 2, text: "Medium", color: "bg-amber-500", border: 'border-amber-500', message: "Good password." };
  };

  const passData = evaluatePassword(formData.password);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password.length < 6) {
      customToast.error("Password Too Short", "Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (/^[A-Za-z]+$/.test(formData.password)) {
      customToast.error("Invalid Password", "Password cannot contain only letters. Please include numbers.");
      setLoading(false);
      return;
    }

    const payload = { ...formData, referralCode: formData.appliedReferralCode };

    try {
      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP), payload, { withCredentials: true });
      const { user } = response.data;
      const encryptedUser = encryptData(user);
      localStorage.setItem("user", encryptedUser);
      fetchUserData();
      customToast.success("Welcome!", "Signup successful! Welcome to Kasuwar Zamani.");
      setTimeout(() => router.push("/"), 1500);
    } catch (error) {
      console.error("Error signing up:", error);
      customToast.error("Signup Failed", error.response?.data?.message || "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden">
         <div className="absolute inset-0 w-full h-full">
             <Image src={assets.boy_with_laptop_image} alt="E-commerce Lifestyle" fill className="object-cover opacity-70" />
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
         </div>
         <div className="relative z-10 text-white p-12 text-center max-w-xl">
             <h2 className="text-5xl font-black mb-6 tracking-tight">Your Marketplace Journey Begins</h2>
             <p className="text-lg text-gray-300 font-medium">Join Kasuwar Zamani to discover premium products, exclusive deals, and a seamless shopping experience.</p>
         </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl opacity-60"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-emerald-100/40 to-cyan-100/40 blur-3xl opacity-60"></div>
        </div>

        <div className="w-full max-w-[500px] bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-8 md:p-12 z-10 border border-white">
          <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image className="w-48 mx-auto hover:opacity-80 transition-opacity" src={Logo} alt="Kasuwar Zamani" />
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mt-6 tracking-tight">Create Account</h1>
          <p className="text-gray-500 font-medium mt-2">Join the marketplace community today</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
           <div className="flex flex-col md:flex-row gap-5">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">First Name</label>
              <input
                required
                name="firstName"
                onChange={handleChange}
                value={formData.firstName}
                className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-900"
                type="text"
                placeholder="John"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Last Name</label>
              <input
                required
                name="lastName"
                onChange={handleChange}
                value={formData.lastName}
                className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-900"
                type="text"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email</label>
            <input
              required
              name="email"
              onChange={handleChange}
              value={formData.email}
              className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-900"
              type="email"
              placeholder="john@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Phone Number</label>
            <input
              required
              name="phone"
              onChange={handleChange}
              value={formData.phone}
              className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-900"
              type="tel"
              placeholder="e.g. 08012345678"
            />
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <div className="flex justify-between items-end">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Password</label>
               {formData.password && (
                 <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white ${passData.color}`}>
                   {passData.text}
                 </span>
               )}
            </div>
            <div className="relative">
              <input
                required
                name="password"
                onChange={handleChange}
                value={formData.password}
                className={`w-full px-5 py-3.5 pr-12 bg-gray-50/50 border rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-900 ${formData.password ? passData.border : 'border-gray-200 focus:border-blue-500'}`}
                type={showPassword ? "text" : "password"}
                placeholder="Secure password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                <Image src={showPassword ? assets.eye_close_icon : assets.eye_open_icon} alt="Toggle visibility" className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" />
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
               <div className="mt-2 space-y-1.5 animate-fadeIn">
                 <div className="flex gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 w-1/3 ${passData.strength >= 1 ? passData.color : 'bg-transparent'}`}></div>
                    <div className={`h-full transition-all duration-300 w-1/3 ${passData.strength >= 2 ? passData.color : 'bg-transparent'}`}></div>
                    <div className={`h-full transition-all duration-300 w-1/3 ${passData.strength >= 3 ? passData.color : 'bg-transparent'}`}></div>
                 </div>
                 <p className={`text-[10px] font-semibold ml-2 ${passData.strength === 1 ? 'text-red-500' : 'text-gray-500'}`}>{passData.message}</p>
               </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
             <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Referral Code</label>
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Optional</span>
             </div>
            <input
              name="appliedReferralCode"
              onChange={handleChange}
              value={formData.appliedReferralCode}
              className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-900"
              type="text"
              placeholder="Got a code?"
            />
          </div>

          <button
            disabled={loading}
            className="mt-6 w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </>
            ) : "Create Account"}
          </button>
          
          <p className="text-sm font-medium text-center text-gray-600 mt-4">
            Already a member?{" "}
            <Link className="text-blue-600 font-bold hover:text-blue-800 transition-colors" href="/signin">
              Sign in
            </Link>
          </p>
        </form>
      </div>
      </div>
    </div>
  );
};

export default SignupPage;

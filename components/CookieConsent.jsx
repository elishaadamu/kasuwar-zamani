"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaCookieBite, FaTimes } from "react-icons/fa";

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Small delay before showing to ensure smooth page load
      const timer = setTimeout(() => {
        setShow(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "true");
    setShow(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9998] max-w-sm bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-[1.5rem] p-5 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="flex items-start gap-4">
        <div className="text-indigo-600 text-2xl mt-1 shrink-0">
          <FaCookieBite />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-base mb-1">Cookies & Guidelines</h4>
          <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4">
            We use cookies to improve your experience. By continuing to use our site, you accept our use of cookies and agree to our <Link href="#" className="text-indigo-600 font-bold hover:underline">Terms & Conditions</Link>.
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={acceptCookies}
              className="flex-1 bg-gray-900 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-xs"
            >
              Accept All
            </button>
            <button 
              onClick={declineCookies}
              className="flex-1 bg-gray-100 text-gray-800 font-bold py-2.5 px-4 rounded-xl hover:bg-gray-200 transition-all text-xs"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
      <button 
        onClick={declineCookies}
        className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
         <FaTimes className="w-3 h-3"/>
      </button>
    </div>
  );
};

export default CookieConsent;

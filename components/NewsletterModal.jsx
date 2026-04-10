"use client";
import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { customToast } from "@/lib/customToast";

const NewsletterModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("newsletter_subscribed") === "true") {
      setIsSubscribed(true);
      return;
    }

    const interval = setInterval(() => {
      if (localStorage.getItem("newsletter_subscribed") === "true") {
        clearInterval(interval);
        return;
      }

      // Wait until the modal is closed to track time
      if (document.getElementById("newsletter-modal-container")) return;

      const nextShowTime = localStorage.getItem("newsletter_next_show_time");
      const now = Date.now();

      if (!nextShowTime) {
         // First visit ever: set it to show 10 seconds from now
         localStorage.setItem("newsletter_next_show_time", (now + 10000).toString());
      } else {
         if (now >= parseInt(nextShowTime, 10)) {
            setIsOpen(true);
            // Push the time way into the future to pause checks while open
            localStorage.setItem("newsletter_next_show_time", (now + 86400000).toString());
         }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Show again 1 minute after being dismissed
    if (localStorage.getItem("newsletter_subscribed") !== "true") {
      localStorage.setItem("newsletter_next_show_time", (Date.now() + 60000).toString());
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    
    // Fake API call / success logic
    localStorage.setItem("newsletter_subscribed", "true");
    setIsSubscribed(true);
    setIsOpen(false);
    customToast.success("Subscribed!", "You have successfully subscribed to our newsletter.");
  };

  if (!isOpen || isSubscribed) return null;

  return (
    <div id="newsletter-modal-container" className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 overflow-hidden transform transition-all">
        {/* Decorative bg */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <FaTimes className="w-4 h-4" />
        </button>

        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
             </svg>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Join Our Newsletter</h3>
          <p className="text-gray-500 mb-6 font-medium text-sm">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
            <input 
              type="email" 
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium text-gray-700"
            />
            <button 
              type="submit"
              className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
            >
              Subscribe Now
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-4">We respect your privacy. No spam.</p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterModal;

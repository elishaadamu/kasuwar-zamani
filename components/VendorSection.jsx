"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import VendorCard from "./VendorCard";
import axios from "axios";
import { FaStore } from "react-icons/fa";
import { useAppContext } from "@/context/AppContext";
import { apiUrl, API_CONFIG } from "@/configs/api";
import Loading from "./Loading";

const VendorSection = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, authLoading } = useAppContext();





  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      setLoading(false);
      return;
    }

    if (isLoggedIn) {
      const fetchVendors = async () => {
        try {
          const response = await axios.get(
            apiUrl(API_CONFIG.ENDPOINTS.VENDOR.GET_ALL),
            { withCredentials: true }
          );
          const sortedVendors = (response.data || []).sort(
            (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
          );
          setVendors(sortedVendors);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };
      fetchVendors();
    }
  }, [isLoggedIn, authLoading]);

  return (
    // my-16 was a bit large for mobile, reducing it on smaller screens
    <div className="my-16">
      <style jsx global>{`
        @media screen and (max-width: 360px) {
          .button-see_more {
            display: flex;
            flex-direction: column;
            justify-content: start;
            align-items: baseline;
            gap: 10px;
          }
        }


        /* Premium Custom slick-dots */
        .slick-dots {
          bottom: -35px;
          display: flex !important;
          justify-content: center;
          align-items: center;
          gap: 6px;
        }
        .slick-dots li {
          margin: 0;
          width: auto;
          height: auto;
        }
        .slick-dots li button {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background-color: #d1d5db; /* gray-300 */
          padding: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .slick-dots li button:before {
          content: none !important; /* remove default dot */
        }
        .slick-dots li.slick-active button {
          width: 28px;
          background-color: #3b82f6; /* blue-500 */
        }

        /* Premium Custom slick arrows */
        .slick-prev,
        .slick-next {
          width: 44px !important;
          height: 44px !important;
          background: #ffffff !important;
          border-radius: 50% !important;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04) !important;
          z-index: 20 !important;
          transition: all 0.2s ease-in-out !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .slick-prev:hover,
        .slick-next:hover,
        .slick-prev:focus,
        .slick-next:focus {
          background: #4f46e5 !important;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4), 0 4px 6px -2px rgba(79, 70, 229, 0.2) !important;
          outline: none;
        }

        .slick-prev {
          left: -20px !important;
        }
        
        .slick-next {
          right: -20px !important;
        }

        /* Chevron drawing using border */
        .slick-prev:before,
        .slick-next:before {
          content: "" !important;
          display: inline-block;
          width: 11px;
          height: 11px;
          border-top: 2.5px solid #4f46e5;
          border-right: 2.5px solid #4f46e5;
          opacity: 1 !important;
          transition: all 0.2s ease;
        }
        
        /* Change chevron color to white on hover */
        .slick-prev:hover:before,
        .slick-next:hover:before,
        .slick-prev:focus:before,
        .slick-next:focus:before {
           border-color: #ffffff;
        }
        
        .slick-prev:before {
          transform: rotate(-135deg);
          margin-left: 4px;
        }
        
        .slick-next:before {
          transform: rotate(45deg);
          margin-right: 4px;
        }
      `}</style>
      <div className="flex  button-see_more justify-between items-center mb-8">
        <div className="">
          <h2 className=" text-xl md:text-2xl font-bold text-gray-800">
            Our Top Vendors
          </h2>
          <p className="text-gray-500 text-sm text-[18px] mt-2">
            Discover products from our most trusted sellers.
          </p>
        </div>
        <Link
          href="/all-vendors"
          className="group px-6 py-2.5 rounded-full bg-indigo-50 text-indigo-600 font-bold border border-transparent hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-sm flex items-center gap-2 whitespace-nowrap"
        >
          View All Vendors <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
      {loading || authLoading ? (
        <Loading />
      ) : !isLoggedIn ? (
        <div className="py-20 px-6 flex flex-col items-center text-center bg-gray-50 rounded-3xl border border-gray-100 shadow-inner">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
            <FaStore className="text-2xl text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Vendor Subscriptions
          </h3>
          <p className="text-gray-500 max-w-sm text-sm mb-6">
            Sign in to your account to explore our premium vendors and start shopping for exclusive items.
          </p>
          <Link
            href="/signin"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all text-sm"
          >
            Sign In to Explore
          </Link>
        </div>
      ) : (
        <div className="relative group/carousel">
          {/* Custom Horizontal Scroll Carousel */}
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-12 pt-4">
            {vendors.slice(0, 8).map((vendor) => (
              <div 
                key={vendor._id} 
                className="flex-none w-full md:w-[calc(50%-0.5rem)] snap-center px-1"
              >
                <VendorCard {...vendor} />
              </div>
            ))}
          </div>

          {/* Scroll Indicators / Dots (Simulated) */}
          <div className="flex justify-center gap-2 mt-[-2rem]">
            {vendors.slice(0, Math.ceil(vendors.length / 2)).map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === 0 ? "w-6 bg-indigo-600" : "w-1.5 bg-gray-300"}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorSection;

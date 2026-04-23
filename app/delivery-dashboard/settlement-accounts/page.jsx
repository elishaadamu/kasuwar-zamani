"use client";
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_CONFIG, apiUrl } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SettlementAccounts = () => {
  const { userData, authLoading } = useAppContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const bankAccount = userData?.user;



  if (!userData) {
    router.push("/delivery-signin");
    return null; // or a loading spinner
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <ToastContainer />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settlement Account</h1>
        <p className="mt-2 text-gray-600">View your bank account details.</p>
      </div>

      {/* Bank Account Details */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Bank Name</span>
            <span className="text-sm font-semibold text-gray-900">
              {bankAccount?.bankName}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Account Number
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {bankAccount?.accountNumber}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Account Name
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {bankAccount?.accountName}
            </span>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Update Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  To update your bank account details, please contact the
                  administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementAccounts;

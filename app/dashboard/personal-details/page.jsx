"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { decryptData, encryptData } from "@/lib/encryption";
import { ToastContainer, toast } from "react-toastify";
import { apiUrl, API_CONFIG } from "@/configs/api";
import {
  FaUserEdit,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaBuilding,
  FaCreditCard,
  FaIdCard,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaHome,
} from "react-icons/fa";
import { MdLocationOn, MdDescription } from "react-icons/md";
import { HiIdentification } from "react-icons/hi";
import { RiBankFill } from "react-icons/ri";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/Loading";
import statesData from "@/lib/states.json";

const FormField = ({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = "text",
  readOnly = false,
  icon: Icon,
  placeholder = "",
  options = [],
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="text-gray-400" size={14} />}
      {label}
    </label>
    {isEditing && !readOnly ? (
      type === "textarea" ? (
        <textarea
          name={name}
          value={value || ""}
          onChange={onChange}
          rows="3"
          placeholder={placeholder}
          className="mt-1 p-3 block w-full rounded-lg border border-gray-300 bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-opacity-50 sm:text-sm transition-all duration-200 shadow-sm"
        />
      ) : type === "select" ? (
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          className="mt-1 p-3 block w-full rounded-lg border border-gray-300 bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-opacity-50 sm:text-sm transition-all duration-200 shadow-sm"
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1 p-3 block w-full rounded-lg border border-gray-300 bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-opacity-50 sm:text-sm transition-all duration-200 shadow-sm"
        />
      )
    ) : (
      <div className="mt-1 p-3 text-gray-800 font-medium bg-gray-50 rounded-lg min-h-[42px] border border-gray-100">
        {value || <span className="text-gray-400 italic">Not provided</span>}
      </div>
    )}
  </div>
);

const SectionHeader = ({ title, icon: Icon, description }) => (
  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
    <div className="p-2 bg-blue-50 rounded-lg">
      {Icon && <Icon className="text-blue-600" size={20} />}
    </div>
    <div>
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      {description && (
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      )}
    </div>
  </div>
);

const IDTypeButton = ({ type, currentType, onClick, label }) => (
  <button
    type="button"
    onClick={() => onClick(type)}
    className={`py-3 px-4 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 font-medium ${
      currentType === type
        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-700 ring-2 ring-blue-200 ring-opacity-50 shadow-sm"
        : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
    }`}
  >
    {type === "NIN" ? (
      <HiIdentification className="text-lg" />
    ) : (
      <FaCreditCard className="text-lg" />
    )}
    {label}
  </button>
);

const PersonalDetails = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    businessName: "",
    businessDesc: "",
    avatar: null,
    banner: null,
    idType: "",
    idNumber: "",
    slip: null,
    bankName: "",
    accountNumber: "",
    accountName: "",
    shippingState: "",
    shippingAddress: "",
    zipCode: "",
    role: "",
  });

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const encryptedUser = localStorage.getItem("user");
        if (encryptedUser) {
          const userData = decryptData(encryptedUser);
          setProfile((prev) => ({ ...prev, ...userData }));
        }
      } finally {
        setPageLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024) {
        toast.error("File size too large. Please upload an image under 50KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({
          ...prev,
          slip: reader.result,
        }));
        toast.success("File uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const encryptedUser = localStorage.getItem("user");
      const userData = decryptData(encryptedUser);
      const response = await axios.get(
        `${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.GET)}/${userData.id}`
      );
      if (response.data.user) {
        setProfile((prev) => ({ ...prev, ...response.data.user }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const encryptedUser = localStorage.getItem("user");
      const userData = decryptData(encryptedUser);

      let payload;
      if (userData.role === "vendor") {
        payload = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          address: profile.address,
          businessName: profile.businessName,
          businessDesc: profile.businessDesc,
          idType: profile.idType,
          idNumber: profile.idNumber,
          ninSlip: profile.slip,
          bankName: profile.bankName,
          accNumber: profile.accountNumber,
          acctName: profile.accountName,
          shippingState: profile.shippingState,
          shippingAddress: profile.shippingAddress,
          zipCode: profile.zipCode,
        };
      } else {
        const { role, ...userPayload } = profile;
        payload = userPayload;
      }

      const response = await axios.put(
        `${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.UPDATE_USER)}/${userData.id}`,
        payload,
        { withCredentials: true }
      );

      if (response.data) {
        const updatedUser = {
          ...userData,
          ...profile,
        };
        localStorage.setItem("user", encryptData(updatedUser));
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-white">
              <h1 className="text-2xl md:text-3xl font-bold">
                Personal Details
              </h1>
              <p className="text-blue-100 mt-2">
                Manage your account information and preferences
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isEditing
                  ? "bg-white text-blue-600 hover:bg-gray-100"
                  : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              }`}
            >
              <FaUserEdit className={isEditing ? "" : "text-white"} />
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Personal Information Section */}
          <div className="mb-10">
            <SectionHeader
              title="Personal Information"
              icon={FaUser}
              description="Your basic personal details"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="First Name"
                name="firstName"
                value={profile.firstName}
                isEditing={isEditing}
                onChange={handleInputChange}
                icon={FaUser}
                placeholder="Enter your first name"
              />
              <FormField
                label="Last Name"
                name="lastName"
                value={profile.lastName}
                isEditing={isEditing}
                onChange={handleInputChange}
                icon={FaUser}
                placeholder="Enter your last name"
              />
              <FormField
                label="Email Address"
                name="email"
                value={profile.email}
                isEditing={isEditing}
                readOnly
                icon={FaEnvelope}
              />
              <FormField
                label="Phone Number"
                name="phone"
                value={profile.phone}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="tel"
                icon={FaPhone}
                readOnly
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="mb-10">
            <SectionHeader
              title="Address Information"
              icon={FaHome}
              description="Your residential and shipping addresses"
            />

            <div className="space-y-6">
              <FormField
                label="Residential Address"
                name="address"
                value={profile.address}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="textarea"
                icon={MdLocationOn}
                placeholder="Enter your full address"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  label="State"
                  name="shippingState"
                  value={profile.shippingState}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={FaMapMarkerAlt}
                  type="select"
                  options={statesData.state}
                  placeholder="Select state"
                />
                <FormField
                  label="Zip Code"
                  name="zipCode"
                  value={profile.zipCode}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={FaMapMarkerAlt}
                  placeholder="Enter zip code"
                />
              </div>

              <FormField
                label="Shipping Address"
                name="shippingAddress"
                value={profile.shippingAddress}
                isEditing={isEditing}
                onChange={handleInputChange}
                type="textarea"
                icon={MdLocationOn}
                placeholder="Enter shipping address"
              />
            </div>
          </div>

          {/* Vendor-Specific Sections */}
          {profile.role === "vendor" && (
            <>
              {/* Business Information */}
              <div className="mb-10">
                <SectionHeader
                  title="Business Information"
                  icon={FaBuilding}
                  description="Details about your business"
                />

                <div className="space-y-6">
                  <FormField
                    label="Business Name"
                    name="businessName"
                    value={profile.businessName}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    icon={FaBuilding}
                    placeholder="Enter your business name"
                  />
                  <FormField
                    label="Business Description"
                    name="businessDesc"
                    value={profile.businessDesc}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    type="textarea"
                    icon={MdDescription}
                    placeholder="Describe your business"
                  />
                </div>
              </div>

              {/* Settlement Details */}
              <div className="mb-10">
                <SectionHeader
                  title="Bank Account Details"
                  icon={RiBankFill}
                  description="Where we'll send your payments"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Bank Name"
                    name="bankName"
                    value={profile.bankName}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    icon={RiBankFill}
                    placeholder="Enter bank name"
                  />
                  <FormField
                    label="Account Number"
                    name="accountNumber"
                    value={profile.accountNumber}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    icon={FaCreditCard}
                    placeholder="Enter account number"
                  />
                  <div className="md:col-span-2">
                    <FormField
                      label="Account Name"
                      name="accountName"
                      value={profile.accountName}
                      isEditing={isEditing}
                      onChange={handleInputChange}
                      icon={FaUser}
                      placeholder="Enter account holder name"
                    />
                  </div>
                </div>
              </div>

              {/* ID Verification */}
              <div className="mb-10">
                <SectionHeader
                  title="Identity Verification"
                  icon={FaIdCard}
                  description="Verify your identity for security purposes"
                />

                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <HiIdentification className="text-gray-400" />
                        ID Type
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                        <IDTypeButton
                          type="NIN"
                          currentType={profile.idType}
                          onClick={(type) =>
                            setProfile({ ...profile, idType: type })
                          }
                          label="National ID (NIN)"
                        />
                        <IDTypeButton
                          type="BVN"
                          currentType={profile.idType}
                          onClick={(type) =>
                            setProfile({ ...profile, idType: type })
                          }
                          label="Bank Verification (BVN)"
                        />
                      </div>
                    </div>

                    {profile.idType && (
                      <FormField
                        label={`${profile.idType} Number`}
                        name="idNumber"
                        value={profile.idNumber}
                        isEditing={isEditing}
                        onChange={handleInputChange}
                        icon={FaCreditCard}
                        placeholder={`Enter your ${profile.idType} number`}
                      />
                    )}
                    {/* File Upload */}
                    {profile.idType !== "BVN" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Upload Verification Document
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors duration-300 bg-gradient-to-b from-gray-50/50 to-white hover:from-blue-50/30">
                          <div className="space-y-4">
                            {profile.slip ? (
                              <div className="flex flex-col items-center">
                                <div className="relative w-48 h-48 mx-auto border-2 border-gray-200 rounded-xl overflow-hidden bg-white p-2">
                                  <img
                                    src={profile.slip}
                                    alt="Document Preview"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <p className="text-sm text-gray-500 mt-4">
                                  Document uploaded successfully
                                  <FaCheckCircle className="inline ml-2 text-green-500" />
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    document
                                      .getElementById("file-upload")
                                      .click()
                                  }
                                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  Change document
                                </button>
                              </div>
                            ) : (
                              <>
                                <FaCloudUploadAlt className="mx-auto h-16 w-16 text-gray-400" />
                                <div className="space-y-2">
                                  <p className="font-medium text-gray-700">
                                    Drop your file here or click to browse
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Supports: JPG, PNG, PDF • Max: 50KB
                                  </p>
                                </div>
                              </>
                            )}
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              onChange={handleFileChange}
                              accept="image/*,.pdf"
                            />
                            <label
                              htmlFor="file-upload"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                            >
                              <FaCloudUploadAlt />
                              Choose File
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="ID Type"
                      value={profile.idType || "Not provided"}
                      isEditing={false}
                      icon={HiIdentification}
                    />
                    <FormField
                      label="ID Number"
                      value={profile.idNumber || "Not provided"}
                      isEditing={false}
                      icon={FaCreditCard}
                    />
                    {profile.slip && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Verification Document
                        </label>
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 border border-gray-300 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                              <img
                                src={profile.slip}
                                alt="Verification Document"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                Uploaded Document
                              </p>
                              <p className="text-sm text-gray-500">
                                Ready for verification
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Role Display */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <span className="font-medium text-gray-700">Account Role:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {profile.role?.toUpperCase() || "USER"}
              </span>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="text-lg" />
                      Save All Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;

"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { encryptData } from "@/lib/encryption"; // Keep encryptData for updating localStorage
import { ToastContainer, toast } from "react-toastify";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { FaUserEdit } from "react-icons/fa";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext"; // Import useAppContext
import { useRouter } from "next/navigation"; // Import useRouter for redirection

const FormField = ({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = "text",
  readOnly = false,
  options = [],
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-600">{label}</label>
    {isEditing && !readOnly ? (
      type === "textarea" ? (
        <textarea
          name={name}
          value={value || ""}
          onChange={onChange}
          rows="3"
          className="mt-1 p-3 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white focus:border-gray-300 focus:ring-0 sm:text-sm transition"
        />
      ) : type === "select" ? (
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          className="mt-1 p-3 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white focus:border-gray-300 focus:ring-0 sm:text-sm transition"
        >
          <option value="" disabled>
            Select {label}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option}>
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
          className="mt-1 p-3 block w-full rounded-md border border-gray-300 bg-gray-50 focus:bg-white focus:border-gray-300 focus:ring-0 sm:text-sm transition"
        />
      )
    ) : (
      <p className="mt-1 p-3 text-gray-900 font-medium  bg-gray-50 rounded-md min-h-[42px]">
        {value || <span className="text-gray-400">Not provided</span>}
      </p>
    )}
  </div>
);

const PersonalDetails = () => {
  const {
    userData,
    authLoading,
    fetchUserData: refreshAppContextUserData,
    states,
    lgas,
    fetchLgas,
  } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter(); // Initialize useRouter
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
    role: "", // Add role to profile state
    accountName: "",
    accountNumber: "",
    bankName: "",
    localGovernment: "",
    nin: "",
    officeAddress: "",
    state: "",
    dob: "", // Add date of birth
    vehicleTypes: [],
  });
  const updatedUserData = userData?.user;
  console.log(updatedUserData);

  useEffect(() => {
    if (authLoading) return; // Wait for authentication status to be determined

    if (!userData) {
      // If no user data, redirect to sign-in
      router.push("/delivery-signin"); // Assuming this is the correct sign-in page for delivery personnel
      return;
    }

    if (updatedUserData) {
      // Populate profile state from userData
      setProfile({
        firstName: updatedUserData.firstName || "",
        lastName: updatedUserData.lastName || "",
        email: updatedUserData.email || "",
        phone: updatedUserData.phone || "",
        address: updatedUserData.residentialAddress || "", // Map residentialAddress to address
        businessName: updatedUserData.companyName || "", // Map companyName to businessName
        businessDesc: updatedUserData.businessDesc || "", // Keep existing if it exists, otherwise empty
        role: updatedUserData.role || "",
        accountName: updatedUserData.accountName || "",
        accountNumber: updatedUserData.accountNumber || "",
        bankName: updatedUserData.bankName || "",
        localGovernment: updatedUserData.localGovernment || "",
        nin: updatedUserData.nin || "",
        officeAddress: updatedUserData.officeAddress || "",
        state: updatedUserData.state || "",
        dob: updatedUserData.dob
          ? new Date(updatedUserData.dob).toISOString().split("T")[0]
          : "",
        vehicleTypes: updatedUserData.vehicleTypes || [],
      });
    }
    setPageLoading(false);
  }, [userData, authLoading, router]); // Depend on userData and authLoading

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStateChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
    fetchLgas(value); // Fetch LGAs for the selected state
  };

  const handleVehicleTypeChange = (e) => {
    const { value, checked } = e.target;
    setProfile((prev) => {
      const currentVehicleTypes = prev.vehicleTypes || [];
      if (checked) {
        return { ...prev, vehicleTypes: [...currentVehicleTypes, value] };
      } else {
        return {
          ...prev,
          vehicleTypes: currentVehicleTypes.filter((type) => type !== value),
        };
      }
    });
  };
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      if (!updatedUserData?._id) {
        toast.error("User data not available for update.");
        setLoading(false);
        return;
      }

      let payload;
      // Construct payload based on profile state
      payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        residentialAddress: profile.address,
        accountName: profile.accountName,
        accountNumber: profile.accountNumber,
        bankName: profile.bankName,
        localGovernment: profile.localGovernment,
        nin: profile.nin,
        officeAddress: profile.officeAddress,
        state: profile.state,
        dob: profile.dob,
        vehicleTypes: profile.vehicleTypes,
      };

      console.log(payload);

      const response = await axios.put(
        `${apiUrl(API_CONFIG.ENDPOINTS.DELIVERY.UPDATE)}/${
          updatedUserData._id
        }`,
        payload
      );

      if (response.data) {
        // Refresh the AppContext's user data to reflect changes globally
        await refreshAppContextUserData();

        toast.success("Profile updated successfully!");
        setIsEditing(false);
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
    <div className="max-w-4xl mx-auto">
      <ToastContainer />
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Personal Details
            </h1>
            <p className="text-gray-500 mt-1 p-3">
              Manage and protect your account.
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            {isEditing ? (
              "Cancel"
            ) : (
              <>
                <FaUserEdit />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <FormField
            label="First Name"
            name="firstName"
            value={profile.firstName}
            isEditing={isEditing}
            onChange={handleInputChange}
          />
          <FormField
            label="Last Name"
            name="lastName"
            value={profile.lastName}
            isEditing={isEditing}
            onChange={handleInputChange}
          />
          <FormField
            label="Email"
            name="email"
            value={profile.email}
            isEditing={isEditing}
            readOnly
          />
          <FormField
            label="Phone Number"
            name="phone"
            value={profile.phone}
            isEditing={isEditing}
            onChange={handleInputChange}
            type="tel"
          />
          <div className="md:col-span-2">
            <FormField
              label="Address"
              name="address"
              value={profile.address}
              isEditing={isEditing}
              onChange={handleInputChange}
              type="textarea"
            />
          </div>

          <FormField
            label="Date of Birth"
            name="dob"
            value={profile.dob}
            isEditing={isEditing}
            onChange={handleInputChange}
            type="date"
          />
          <FormField
            label="State"
            name="state"
            value={profile.state}
            isEditing={isEditing}
            onChange={handleStateChange}
            type="select"
            options={states}
          />
          <FormField
            label="Local Government"
            name="localGovernment"
            value={profile.localGovernment}
            isEditing={isEditing}
            onChange={handleInputChange}
            type="select"
            options={lgas}
          />
          <FormField
            label="NIN"
            name="nin"
            value={profile.nin}
            isEditing={isEditing}
            onChange={handleInputChange}
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600">
              Vehicle Types
            </label>
            {isEditing ? (
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 p-3 rounded-md border border-gray-300 bg-gray-50">
                {["Motorcycle", "Car", "Van", "Truck"].map((vehicle) => (
                  <label
                    key={vehicle}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={vehicle}
                      checked={profile.vehicleTypes.includes(vehicle)}
                      onChange={handleVehicleTypeChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-800">{vehicle}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-1 p-3 text-gray-900 font-medium bg-gray-50 rounded-md min-h-[42px]">
                {profile.vehicleTypes && profile.vehicleTypes.length > 0 ? (
                  profile.vehicleTypes.join(", ")
                ) : (
                  <span className="text-gray-400">Not provided</span>
                )}
              </p>
            )}
          </div>

          <FormField
            label="Office Address"
            name="officeAddress"
            value={profile.officeAddress}
            isEditing={isEditing}
            onChange={handleInputChange}
            type="textarea"
          />

          {/* Bank Details */}
          <>
            <div className="md:col-span-2 pt-4 border-t mt-4">
              <h2 className="text-xl font-bold text-gray-700">
                Bank Information
              </h2>
            </div>
            <FormField
              label="Bank Name"
              name="bankName"
              value={profile.bankName}
              isEditing={isEditing}
              onChange={handleInputChange}
            />
            <FormField
              label="Account Name"
              name="accountName"
              value={profile.accountName}
              isEditing={isEditing}
              onChange={handleInputChange}
            />
            <FormField
              label="Account Number"
              name="accountNumber"
              value={profile.accountNumber}
              isEditing={isEditing}
              onChange={handleInputChange}
            />
          </>

          <div className="md:col-span-2 pt-4 border-t mt-4 -mb-2">
            <FormField
              label="Role"
              name="role"
              value={
                profile.role === "delivery" ? "Delivery Man" : profile.role
              }
              isEditing={false}
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end mt-8 pt-6 border-t">
            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalDetails;

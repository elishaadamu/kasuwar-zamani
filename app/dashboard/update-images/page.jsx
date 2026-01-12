"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { ToastContainer, toast } from "react-toastify";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { FaCamera } from "react-icons/fa";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/Loading";

const ImageField = ({ label, name, src, isEditing, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-2">
      {label}
    </label>
    <div className="relative w-full h-32 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
      {src ? (
        <Image
          src={src}
          alt={`${label} preview`}
          layout="fill"
          objectFit="cover"
        />
      ) : (
        <span className="text-gray-400">No Image</span>
      )}
      {isEditing && (
        <label
          htmlFor={name}
          className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
        >
          <FaCamera size={24} />
          <span className="text-sm mt-1 p-3">Change</span>
          <input
            id={name}
            name={name}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
          />
        </label>
      )}
    </div>
  </div>
);

const fetchAddresses = async () => {
  setPageLoading(true);
  try {
    const response = await axios.get(
      `${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.GET)}/${userData.id}`,
      { withCredentials: true }
    );
    console.log("response", response.data.user);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    toast.error("Failed to fetch shipping addresses.");
  } finally {
    setPageLoading(false);
  }
};

const UpdateImages = () => {
  const [isEditing, setIsEditing] = useState(true); // Always in editing mode for this page
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [previews, setPreviews] = useState({ avatar: null, banner: null });

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const encryptedUser = localStorage.getItem("user");

        if (encryptedUser) {
          const userData = decryptData(encryptedUser);
          console.log("My details", userData);
          setPreviews({ avatar: userData.avatar, banner: userData.banner });
        }
      } finally {
        setPageLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should not exceed 5MB.");
        return;
      }

      if (name === "avatar") {
        setAvatar(file);
      } else if (name === "banner") {
        setBanner(file);
      }

      setPreviews((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(file),
      }));
    }
  };

  const handleUpdateImages = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const encryptedUser = localStorage.getItem("user");
      const userData = decryptData(encryptedUser);
      const userId = userData?.id;

      const formData = new FormData();
      if (avatar) formData.append("avatar", avatar);
      if (banner) formData.append("banner", banner);

      // To inspect FormData, you need to iterate over its entries.
      // A direct console.log(formData) will appear empty in most browsers.
      console.log("Inspecting FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      await axios.put(
        apiUrl(API_CONFIG.ENDPOINTS.VENDOR.UPDATE_IMAGES + userId),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Images updated successfully!");
      // Optionally, you can refetch user data to update localStorage and UI
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
      <form
        onSubmit={handleUpdateImages}
        className="bg-white rounded-xl shadow-lg p-6 md:p-8"
      >
        <div className="mb-8 border-b pb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Update Business Images
          </h1>
          <p className="text-gray-500 mt-1">
            Update your business logo and banner.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ImageField
                label="Avatar (Logo)"
                name="avatar"
                src={previews.avatar}
                isEditing={isEditing}
                onChange={handleFileChange}
              />
              <ImageField
                label="Banner"
                name="banner"
                src={previews.banner}
                isEditing={isEditing}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end mt-8 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default UpdateImages;

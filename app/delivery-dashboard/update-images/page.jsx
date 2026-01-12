"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { ToastContainer, toast } from "react-toastify";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { FaCamera } from "react-icons/fa";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "@/context/AppContext";
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

const UpdateImages = () => {
  const { userData, authLoading } = useAppContext();
  const [isEditing, setIsEditing] = useState(true); // Always in editing mode for this page
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [idImage, setIdImage] = useState(null);
  const [drivingLicenseImage, setDrivingLicenseImage] = useState(null);
  const [previews, setPreviews] = useState({
    idImage: null,
    drivingLicenseImage: null,
  });

  useEffect(() => {
    if (authLoading) return;

    if (userData?.user) {
      setPreviews({
        idImage: userData.user.idImage,
        drivingLicenseImage: userData.user.drivingLicenseImage,
      });
    }
    setPageLoading(false);
  }, [userData, authLoading]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should not exceed 5MB.");
        return;
      }

      if (name === "idImage") {
        setIdImage(file);
      } else if (name === "drivingLicenseImage") {
        setDrivingLicenseImage(file);
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

    const formData = new FormData();
    if (idImage) formData.append("idImage", idImage);
    if (drivingLicenseImage)
      formData.append("drivingLicenseImage", drivingLicenseImage);

    if (!idImage && !drivingLicenseImage) {
      toast.info("Please select an image to update.");
      setLoading(false);
      return;
    }

    try {
      await axios.put(
        `${apiUrl(API_CONFIG.ENDPOINTS.DELIVERY.UPDATE)}/${userData.user._id}`,
        formData,
        {
          withCredentials: true,
        }
      );
      toast.success("Documents updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading || authLoading) {
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
            Update Verification Documents
          </h1>
          <p className="text-gray-500 mt-1">
            Update your ID card and driving license.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ImageField
                label="ID Card Image"
                name="idImage"
                src={previews.idImage}
                isEditing={isEditing}
                onChange={handleFileChange}
              />
              <ImageField
                label="Driving License"
                name="drivingLicenseImage"
                src={previews.drivingLicenseImage}
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

"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { ToastContainer, toast } from "react-toastify";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import AddressFormModal from "@/components/dashboard/AddressFormModal";

const ShippingPage = () => {
  const { userData } = useAppContext();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    if (userData) {
      fetchAddresses();
    }
  }, [userData]);

  const fetchAddresses = async () => {
    setPageLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.GET)}/${userData.id}`,
        { withCredentials: true }
      );
      console.log("response", response.data.user);
      setAddresses(response.data.user || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to fetch shipping addresses.");
    } finally {
      setPageLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (addressData) => {
    setLoading(true);
    console.log("payload", addressData);
    try {
      // Update existing address
      const response = await axios.put(
        `${apiUrl(API_CONFIG.ENDPOINTS.PROFILE.UPDATE_USER)}/${userData.id}`,
        addressData,
        { withCredentials: true }
      );
      console.log("response", response);
      toast.success("Address updated successfully!");
      setIsModalOpen(false);
      fetchAddresses(); // Refresh the list
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(error.response?.data?.message || "Failed to save address.");
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
              Shipping Addresses
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your shipping addresses for faster checkout.
            </p>
          </div>
          <button
            onClick={handleAddAddress}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <FaPlus />
            Add Address
          </button>
        </div>

        {loading && !pageLoading && <p>Saving...</p>}

        <div className="space-y-4">
          <div
            key={addresses._id}
            className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start"
          >
            <div>
              <p className="text-gray-600 text-sm">
                {addresses.shippingAddress}, {addresses.shippingState} -{" "}
                {addresses.zipCode}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleEditAddress(addresses)}
                className="text-blue-600 hover:text-blue-800"
                aria-label="Edit address"
              >
                <FaEdit size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AddressFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAddress}
          address={editingAddress}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ShippingPage;

"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const AddressFormModal = ({ isOpen, onClose, onSave, address, loading }) => {
  const [formData, setFormData] = useState({
    shippingAddress: "",
    shippingState: "",
    zipCode: "",
  });
  const [states, setStates] = useState([]);

  useEffect(() => {
    if (address) {
      setFormData({
        shippingAddress: address.shippingAddress || address.address || "",
        shippingState: address.shippingState || address.state || "",
        zipCode: address.zipCode || address.zipcode || "",
      });
    } else {
      setFormData({
        shippingAddress: "",
        shippingState: "",
        zipCode: "",
      });
    }
  }, [address]);

  useEffect(() => {
    const getStatesFromApi = async () => {
      try {
        let response = await axios.get(
          "https://nga-states-lga.onrender.com/fetch"
        );
        setStates(response.data);
      } catch (error) {
      }
    };
    getStatesFromApi();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg m-4">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {address ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            name="shippingAddress"
            value={formData.shippingAddress}
            onChange={handleChange}
            placeholder="Address (Area and Street)"
            required
            rows="3"
            className="p-2 border rounded-md w-full"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              name="shippingState"
              value={formData.shippingState}
              onChange={handleChange}
              required
              className="p-2 border rounded-md w-full bg-white"
            >
              <option value="" disabled>
                Select State
              </option>
              {states.map((stateName) => (
                <option key={stateName} value={stateName}>
                  {stateName}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="Zip Code"
              required
              className="p-2 border rounded-md w-full"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressFormModal;

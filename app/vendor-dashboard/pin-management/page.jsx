"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { decryptData } from "@/lib/encryption";

const Header = ({ title }) => (
  <div className="bg-white shadow-md p-4 mb-4">
    <h1 className="text-2xl font-bold">{title}</h1>
  </div>
);

const PinInput = ({ length, onChange }) => {
  const [pin, setPin] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === "") {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      onChange(newPin.join(""));

      if (value && index < length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    if (paste.length === length && /^[0-9]+$/.test(paste)) {
      const newPin = paste.split("");
      setPin(newPin);
      onChange(newPin.join(""));
      inputRefs.current[length - 1].focus();
    }
  };

  return (
    <div className="flex space-x-2">
      {pin.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-2xl font-bold border-gray-300 rounded-md shadow-sm focus:border-gray-500 focus:ring-gray-500"
        />
      ))}
    </div>
  );
};

const SetPinForm = () => {
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const decryptedData = decryptData(user);
      setUserId(decryptedData.id);
    }
  }, []);

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.SECURITY.SET_PIN + "/" + userId),
        {
          newPin,
        }
      );
      toast.success("PIN set successfully");
      setNewPin("");
      setConfirmPin("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to set PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Set PIN</h2>
      <form onSubmit={handleSetPin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            New PIN
          </label>
          <PinInput length={4} onChange={setNewPin} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirm PIN
          </label>
          <PinInput length={4} onChange={setConfirmPin} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Set PIN"}
        </button>
      </form>
    </div>
  );
};

const UpdatePinForm = () => {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const decryptedData = decryptData(user);
      setUserId(decryptedData.id);
    }
  }, []);

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    if (newPin.length !== 4 || oldPin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        apiUrl(API_CONFIG.ENDPOINTS.SECURITY.UPDATE_PIN + "/" + userId),
        {
          oldPin,
          newPin,
        }
      );
      toast.success("PIN updated successfully");
      setOldPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Update PIN</h2>
      <form onSubmit={handleUpdatePin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Old PIN
          </label>
          <PinInput length={4} onChange={setOldPin} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            New PIN
          </label>
          <PinInput length={4} onChange={setNewPin} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirm PIN
          </label>
          <PinInput length={4} onChange={setConfirmPin} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Update PIN"}
        </button>
      </form>
    </div>
  );
};

const PinManagementPage = () => {
  const [activeTab, setActiveTab] = useState("set-pin");

  return (
    <div>
      <Header title="PIN Management" />
      <div className="flex">
        <ToastContainer />
        <div className="w-1/4 border-r border-gray-200">
          <div className="flex flex-col space-y-2 p-4">
            <button
              onClick={() => setActiveTab("set-pin")}
              className={`px-4 py-2 text-left rounded-lg ${
                activeTab === "set-pin"
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Set PIN
            </button>
            <button
              onClick={() => setActiveTab("update-pin")}
              className={`px-4 py-2 text-left rounded-lg ${
                activeTab === "update-pin"
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Update PIN
            </button>
          </div>
        </div>
        <div className="w-3/4 p-8">
          {activeTab === "set-pin" && <SetPinForm />}
          {activeTab === "update-pin" && <UpdatePinForm />}
        </div>
      </div>
    </div>
  );
};

export default PinManagementPage;

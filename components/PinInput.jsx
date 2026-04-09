"use client";
import React, { useState, useRef } from "react";

const PinInput = ({ length, onChange, type = "password" }) => {
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
    <div className="flex space-x-2 justify-center">
      {pin.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type={type}
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-2xl font-bold border-gray-300 bg-white text-slate-800 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default PinInput;

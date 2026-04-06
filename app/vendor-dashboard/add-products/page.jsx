"use client";
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { API_CONFIG, apiUrl } from "@/configs/api";
import Loading from "@/components/Loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { decryptData } from "@/lib/encryption";
import statesData from "@/lib/states.json";
import { FaTimesCircle, FaUpload, FaTrash } from "react-icons/fa";
import axios from "axios";

const AddProduct = () => {
  const { router, userData } = useAppContext();
  const [images, setImages] = useState(new Array(4).fill(null));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [state, setState] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [condition, setCondition] = useState("NEW");
  const [stock, setStock] = useState("");
  const [commission, setCommission] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [categories, setCategories] = useState([]); // Removed duplicate state declaration if any
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState("");
  const [subscriptionInvalid, setSubscriptionInvalid] = useState(false);
  const [states] = useState(statesData.state);

  // Fetch categories & check subscription (unchanged logic)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET_ALL));
        setCategories(response.data.categories || []);
        if (response.data.categories?.length > 0) {
          setCategory(response.data.categories[0].name);
        }
      } catch (error) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!userData?.id) return;

    const checkSubscriptionStatus = async () => {
      setIsCheckingStatus(true);
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CHECK_STATUS + userData.id)
        );
        const canPost = response.data?.canPostProduct;
        setSubscriptionInvalid(!canPost);

        if (!canPost) {
          setError("Your subscription does not allow adding products. Please upgrade.");
        } else {
          try {
            const detailsResponse = await axios.get(
              apiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.GET_DETAILS + userData.id)
            );
            if (detailsResponse.data.success) {
              setSubscription(detailsResponse.data.subscription);
            }
          } catch (detailErr) {
            console.error("Failed to fetch subscription details", detailErr);
          }
        }
      } catch (err) {
        setSubscriptionInvalid(true);
        setError("Failed to verify subscription status.");
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkSubscriptionStatus();
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.filter(Boolean).length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const encryptedUser = localStorage.getItem("user");
      const userData = decryptData(encryptedUser);
      const userId = userData?.id;

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", parseFloat(price));
      formData.append("state", state);
      formData.append("minOrder", parseInt(minOrder) || 1);
      formData.append("condition", condition);
      formData.append("stock", parseInt(stock) || 0);
      formData.append("commission", parseFloat(commission) || 0);

      images.filter(Boolean).forEach((img) => formData.append("images", img));

      await axios.post(apiUrl(API_CONFIG.ENDPOINTS.PRODUCT.ADD + userId), formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product added successfully!");
      router.push("/vendor-dashboard/products-list");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add product";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  if (isCheckingStatus) return <Loading />;
  if (subscriptionInvalid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <FaTimesCircle className="mx-auto text-red-500 text-6xl mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Subscription Required</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/vendor-dashboard/subscription-plans")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-8 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <ToastContainer position="top-right" theme="light" />

      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-6">
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="opacity-90 mt-1">Fill in the details to list your product</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {subscription && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-wider mb-1">Current Plan</h3>
                  <p className="text-2xl font-bold text-indigo-700">{subscription.plan.package}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-indigo-800 font-medium mb-1">
                      Allowed Products: <span className="font-bold">{subscription.plan.products >= 1000 ? "Unlimited" : subscription.plan.products}</span>
                    </p>
                    <p className="text-xs text-indigo-500 font-medium">
                      Expires: {new Date(subscription.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/vendor-dashboard/subscription-plans")}
                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Product Images */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                Product Images <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <label
                      htmlFor={`upload-${index}`}
                      className={`block h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all
                        ${image ? "border-blue-400" : "border-gray-300 hover:border-blue-500"} 
                        ${image ? "bg-gray-50" : "bg-gray-100"}`}
                    >
                      <input
                        id={`upload-${index}`}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleFileChange(e, index)}
                      />
                      {image ? (
                        <div className="relative h-full">
                          <Image
                            src={URL.createObjectURL(image)}
                            alt={`Product ${index + 1}`}
                            fill
                            className="object-cover rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveImage(index);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <FaUpload className="text-3xl mb-2" />
                          <span className="text-xs font-medium">Image {index + 1}</span>
                          <span className="text-xs">Click to upload</span>
                        </div>
                      )}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">Max 4 images • 5MB each • First image is primary</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <InputField label="Product Name" required value={name} onChange={setName} placeholder="e.g. Premium Leather Wallet" />
                <SelectField label="Category" value={category} onChange={setCategory} options={categories.map(c => ({ value: c.name, label: c.name.charAt(0).toUpperCase() + c.name.slice(1) }))} />

                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Price (₦)" type="number" required value={price} onChange={setPrice} placeholder="25000" />
                  <InputField label="Min Order" type="number" required value={minOrder} onChange={setMinOrder} placeholder="1" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Stock Quantity" type="number" required value={stock} onChange={setStock} placeholder="50" />
                  <InputField label="Commission" type="number" required value={commission} onChange={setCommission} placeholder="e.g. 5" />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your product features, condition, materials..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="State"
                    value={state}
                    onChange={setState}
                    options={states.map(s => ({ value: s, label: s }))}
                    placeholder="Select state"
                  />
                  <SelectField
                    label="Condition"
                    value={condition}
                    onChange={setCondition}
                    options={[
                      { value: "NEW", label: "Brand New" },
                      { value: "USED", label: "Used - Like New" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding Product...
                  </>
                ) : (
                  "Publish Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reusable Input Component
const InputField = ({ label, required, type = "text", value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      required={required}
    />
  </div>
);

// Reusable Select Component
const SelectField = ({ label, value, onChange, options, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default AddProduct;
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
import axios from "axios";

const AddProduct = () => {
  const { router, userData } = useAppContext();
  const userId = userData?._id;
  const [images, setImages] = useState(new Array(4).fill(null));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [state, setState] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [condition, setCondition] = useState("NEW");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [states] = useState(statesData.state);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET_ALL)
        );
        setCategories(response.data.categories);
        if (response.data.length > 0) {
          setCategory(response.data[0].name); // Set default category
        }
      } catch (error) {
        toast.error("Failed to fetch categories.");
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
      formData.append("minOrder", parseInt(minOrder));
      formData.append("condition", condition);
      formData.append("stock", parseInt(stock));
      images.filter(Boolean).forEach((image) => {
        formData.append("images", image);
      });
      console.log("Submitting form with data:", {
        name,
        description,
        category,
        price,
        state,
        minOrder,
        condition,
        stock,
        images: images.filter(Boolean),
      });
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.PRODUCT.ADD + userId),
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Product added successfully!");
      router.push("/seller/product-list");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to add product. Please try again."
      );
      setError(
        err.response?.data?.message ||
          "Failed to add product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("Image size should be less than 5MB");
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

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <ToastContainer />
      {loading ? (
        <Loading />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="md:p-10 p-4 max-w-4xl mx-auto bg-white rounded-lg shadow-sm"
        >
          {error && (
            <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Add New Product
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Fill in the details to add a new product to your store
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-base font-medium mb-2">Product Images</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              {images.map((image, index) => (
                <label
                  key={index}
                  htmlFor={`image-upload-${index}`}
                  className="relative group cursor-pointer"
                >
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden group-hover:border-blue-500 transition-all duration-200">
                    <input
                      onChange={(e) => handleFileChange(e, index)}
                      type="file"
                      id={`image-upload-${index}`}
                      accept="image/*"
                      hidden
                    />
                    <Image
                      className={`w-full h-full object-cover ${
                        !image && "p-4 opacity-50"
                      }`}
                      src={
                        image ? URL.createObjectURL(image) : assets.upload_area
                      }
                      alt="Upload Area"
                      width={128}
                      height={128}
                    />
                  </div>
                  {image ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveImage(index);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        className="w-4 h-4"
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
                  ) : (
                    <span className="block text-xs text-center mt-1 text-gray-500">
                      {`Image ${index + 1}`}
                    </span>
                  )}
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Upload up to 4 images (max 5MB each)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="product-name"
                >
                  Product Name
                </label>
                <input
                  id="product-name"
                  type="text"
                  placeholder="Enter product name"
                  className="outline-none py-2.5 px-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="category"
                >
                  Category
                </label>
                <select
                  id="category"
                  className="outline-none py-2.5 px-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="product-price"
                  >
                    Price
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    placeholder="0"
                    className="outline-none py-2.5 px-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                    onChange={(e) => setPrice(e.target.value)}
                    value={price}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="min-order"
                  >
                    Min Order
                  </label>
                  <input
                    id="min-order"
                    type="number"
                    placeholder="0"
                    className="outline-none py-2.5 px-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                    onChange={(e) => setMinOrder(e.target.value)}
                    value={minOrder}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="stock"
                  >
                    Stock
                  </label>
                  <input
                    id="stock"
                    type="number"
                    placeholder="0"
                    className="outline-none py-2.5 px-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                    onChange={(e) => setStock(e.target.value)}
                    value={stock}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="product-description"
                >
                  Description
                </label>
                <textarea
                  id="product-description"
                  rows={4}
                  className="outline-none py-2.5 px-3 rounded-md border border-gray-300 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                  placeholder="Enter product description"
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="state"
                  >
                    State
                  </label>
                  <select
                    id="state"
                    className="outline-none py-2.5 px-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                    onChange={(e) => setState(e.target.value)}
                    value={state}
                    required
                  >
                    <option value="" disabled>
                      Select a state
                    </option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="condition"
                  >
                    Condition
                  </label>
                  <select
                    id="condition"
                    className="outline-none py-2.5 px-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                    onChange={(e) => setCondition(e.target.value)}
                    value={condition}
                  >
                    <option value="NEW">NEW</option>
                    <option value="USED">USED</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 w-full pt-6 border-t border-gray-200">
            <div className="flex items-center justify-start gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-2.5 bg-blue-600 text-white font-medium rounded-md text-sm ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddProduct;

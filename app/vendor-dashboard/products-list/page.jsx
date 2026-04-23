"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import { API_CONFIG, apiUrl } from "@/configs/api";
import axios from "axios";
import ActionMenu from "@/components/seller/ActionMenu";

const ProductList = () => {
  const { router, currency, userData, authLoading } = useAppContext();
  const userId = userData?.id;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);

  const fetchSellerProduct = async (id) => {
    try {
      if (!id) {
        throw new Error("User not authenticated");
      }
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.PRODUCT.GET_SELLER_PRODUCTS + id),
        {
          withCredentials: true,
        }
      );
      setProducts(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET_ALL),
        {
          withCredentials: true,
        }
      );
      setCategories(response.data.categories || []);
    } catch (err) {
    }
  };

  const fetchStates = async () => {
    // TODO: Replace with actual API call
    const dummyStates = [
      "Abia",
      "Adamawa",
      "Akwa Ibom",
      "Anambra",
      "Bauchi",
      "Bayelsa",
      "Benue",
      "Borno",
      "Cross River",
      "Delta",
      "Ebonyi",
      "Edo",
      "Ekiti",
      "Enugu",
      "FCT - Abuja",
      "Gombe",
      "Imo",
      "Jigawa",
      "Kaduna",
      "Kano",
      "Katsina",
      "Kebbi",
      "Kogi",
      "Kwara",
      "Lagos",
      "Nasarawa",
      "Niger",
      "Ogun",
      "Ondo",
      "Osun",
      "Oyo",
      "Plateau",
      "Rivers",
      "Sokoto",
      "Taraba",
      "Yobe",
      "Zamfara",
    ];
    setStates(dummyStates);
  };

  const handleDelete = (productId) => {
    setProducts(products.filter((p) => p._id !== productId));
  };

  const handleEdit = (updatedProduct) => {
    setProducts(
      products.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  useEffect(() => {
    if (!authLoading) {
      if (userId) {
        fetchSellerProduct(userId);
        fetchCategories();
        fetchStates();
      } else {
        setError("Please login to view your products.");
        setLoading(false);
      }
    }
  }, [userId, authLoading]);

  const openImageModal = (product) => {
    setSelectedProduct(product);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedProduct(null);
  };

  // Helper function to get stock status badge
  const getStockBadge = (stock) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Out of Stock
        </span>
      );
    } else if (stock < 10) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Low Stock ({stock})
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          In Stock ({stock})
        </span>
      );
    }
  };

  // Helper function to get condition badge
  const getConditionBadge = (condition) => {
    const isNew = condition?.toLowerCase() === "new";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isNew
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {condition}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 flex flex-col justify-start items-center">
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="w-full md:p-10 p-4">
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-full md:p-10 p-4 mx-auto">
            {/* Header Section */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Product Inventory</h2>
              <p className="text-gray-600">Manage and track all your products in one place</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <span className="text-sm text-gray-500">Total Products:</span>
                  <span className="ml-2 text-lg font-semibold text-gray-900">{products.length}</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <span className="text-sm text-gray-500">In Stock:</span>
                  <span className="ml-2 text-lg font-semibold text-green-600">
                    {products.filter(p => p.stock > 0).length}
                  </span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <span className="text-sm text-gray-500">Out of Stock:</span>
                  <span className="ml-2 text-lg font-semibold text-red-600">
                    {products.filter(p => p.stock === 0).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="w-full rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden">
              <div className="w-full overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
                    <tr>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Product
                      </th>
                      <th className="hidden md:table-cell px-4 md:px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Stock Status
                      </th>
                      <th className="hidden lg:table-cell px-4 md:px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="hidden lg:table-cell px-4 md:px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {products.length > 0 ? (
                      products.map((product, index) => (
                        <tr 
                          key={index}
                          className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                        >
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex items-center">
                              <div
                                className="flex-shrink-0 h-14 w-14 cursor-pointer group relative overflow-hidden rounded-lg"
                                onClick={() => openImageModal(product)}
                              >
                                <Image
                                  src={product.images[0]?.url}
                                  alt="product Image"
                                  className="h-14 w-14 object-cover transition-transform duration-300 group-hover:scale-110"
                                  width={56}
                                  height={56}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {product.name}
                                </div>
                                {product.description && (
                                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                                    {product.description.length > 50
                                      ? product.description.substring(0, 50) + "..."
                                      : product.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-4 md:px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700 font-medium">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">
                              {currency}{product.price?.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            {getStockBadge(product.stock)}
                          </td>
                          <td className="hidden lg:table-cell px-4 md:px-6 py-4 whitespace-nowrap">
                            {getConditionBadge(product.condition)}
                          </td>
                          <td className="hidden lg:table-cell px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-700">
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {product.state}
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap relative">
                            <ActionMenu
                              product={product}
                              onDelete={handleDelete}
                              onEdit={handleEdit}
                              categories={categories}
                              states={states}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-12 text-center"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">No products found</p>
                            <p className="text-gray-400 text-sm mt-1">Start by adding your first product</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Image Modal */}
        {isImageModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedProduct.name}</h3>
                  <p className="text-gray-300 text-sm mt-1">Product Gallery</p>
                </div>
                <button
                  onClick={closeImageModal}
                  className="text-white hover:bg-white/10 rounded-full p-2 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedProduct.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative w-full h-64 group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                    >
                      <Image
                        src={image.url}
                        alt={`${selectedProduct.name} - Image ${index + 1}`}
                        fill
                        style={{ objectFit: "cover" }}
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <p className="text-white text-sm font-medium p-3">
                          Image {index + 1} of {selectedProduct.images.length}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Product Details in Modal */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Price</p>
                      <p className="text-lg font-bold text-gray-900">{currency}{selectedProduct.price?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Category</p>
                      <p className="text-sm font-medium text-gray-900">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Condition</p>
                      <div className="mt-1">{getConditionBadge(selectedProduct.condition)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Stock</p>
                      <div className="mt-1">{getStockBadge(selectedProduct.stock)}</div>
                    </div>
                  </div>
                  {selectedProduct.description && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
                      <p className="text-sm text-gray-700">{selectedProduct.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;

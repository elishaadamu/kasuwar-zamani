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
      setCategories(response.data);
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

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col justify-start items-center">
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="w-full md:p-10 p-4">
            <div className="p-4 text-sm text-red-500 bg-red-100 rounded-md">
              {error}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-full md:p-10 p-4 mx-auto">
            <h2 className="pb-4 text-lg font-medium">All Products</h2>
            <div className="flex flex-col items-center max-w-full md:max-w-7xl w-full rounded-md bg-white border border-gray-500/20">
              <div className="w-full">
                <table className="min-w-full divide-y divide-gray-200 table-auto">
                  <thead className="bg-gray-50 text-gray-900 text-sm text-left">
                    <tr>
                      <th className="px-6 py-3 font-medium tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 font-medium tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 font-medium tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 font-medium tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 font-medium tracking-wider">
                        Condition
                      </th>
                      <th
                        className="px-6 py-3 font-medium
                       tracking-wider"
                      >
                        State
                      </th>
                      <th className="px-6 py-3 font-medium tracking-wider">
                        Approved
                      </th>
                      <th className="px-6 py-3 font-medium tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-500">
                    {products.length > 0 ? (
                      products.map((product, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="flex-shrink-0 h-10 w-10 cursor-pointer"
                                onClick={() => openImageModal(product)}
                              >
                                <Image
                                  src={product.images[0]?.url}
                                  alt="product Image"
                                  className="h-10 w-10 rounded-full"
                                  width={40}
                                  height={40}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">
                                  {product.name}
                                  {product.description && (
                                    <p className="text-xs text-gray-500">
                                      {product.description.length > 50
                                        ? product.description.substring(0, 50) +
                                          "..."
                                        : product.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {currency}
                            {product.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.condition}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.state}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                product.approved
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.approved ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap relative">
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
                          colSpan="8"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {isImageModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg max-w-3xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Product Images</h3>
                <button
                  onClick={closeImageModal}
                  className="text-gray-500 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedProduct.images.map((image, index) => (
                  <div key={index} className="relative w-full h-48">
                    <Image
                      src={image.url}
                      alt={`Product image ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;

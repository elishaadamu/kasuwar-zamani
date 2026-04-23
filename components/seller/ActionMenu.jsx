"use client";
import React, { useState } from "react";
import { MoreVertical, Edit2, Trash2, X, Save, AlertTriangle } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { API_CONFIG, apiUrl } from "@/configs/api";
import { customToast } from "@/lib/customToast";
import Modal from "../Modal";

const ActionMenu = ({ product, onDelete, onEdit, categories, states }) => {
  const { router, userData } = useAppContext();
  const userId = userData?.id;
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedProduct, setEditedProduct] = useState({ ...product });
  const [isSaving, setIsSaving] = useState(false);

  // Close menu when clicking outside could be added here, 
  // but for now we rely on the user clicking the toggle or an option.
  // Ideally, a click-outside handler would improve UX further.

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
    setIsOpen(false);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
    setIsOpen(false);
  };

  const confirmDelete = async () => {
    try {
      if (!userId) {
        customToast.error("Auth Error", "User not authenticated.");
        return;
      }
      await axios.delete(
        apiUrl(
          API_CONFIG.ENDPOINTS.PRODUCT.DELETE + product._id + "/" + userId
        ),
        {
          withCredentials: true,
        }
      );
      onDelete(product._id);
      setIsDeleteModalOpen(false);
      customToast.success("Deleted", "Product deleted successfully!");
    } catch (err) {
      customToast.error("Delete Failed", "Failed to delete product.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!userId) {
        customToast.error("Auth Error", "User not authenticated.");
        return;
      }
      await axios.put(
        apiUrl(
          API_CONFIG.ENDPOINTS.PRODUCT.UPDATE + product._id + "/" + userId
        ),
        editedProduct,
        {
          withCredentials: true,
        }
      );
      onEdit(editedProduct);
      setIsEditModalOpen(false);
      
      customToast.success("Updated", "Product has been updated!");
    } catch (err) {
      customToast.error("Update Failed", "Failed to update product.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleMenu}
        className={`p-2 rounded-full transition-all duration-200 ${
          isOpen
            ? "bg-blue-50 text-blue-600"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        }`}
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close menu when clicking outside (simple version) */}
          <div 
            className="fixed inset-0 z-10 cursor-default" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl z-20 border border-gray-100 overflow-hidden transform transition-all duration-200 origin-top-right">
            <div className="py-1">
              <button
                onClick={handleEdit}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors gap-3"
              >
                <Edit2 size={16} />
                <span>Edit Product</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors gap-3"
              >
                <Trash2 size={16} />
                <span>Delete Product</span>
              </button>
            </div>
          </div>
        </>
      )}

      {isEditModalOpen && (
        <Modal onClose={() => setIsEditModalOpen(false)}>
          <div className="mb-6 flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <form
            onSubmit={handleEditSubmit}
            className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
          >
            <div className="space-y-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  name="name"
                  value={editedProduct.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-800 placeholder-gray-400"
                  placeholder="Enter product name"
                />
              </div> */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₦</span>
                    <input
                      type="number"
                      name="price"
                      value={editedProduct.price}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={editedProduct.stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={editedProduct.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editedProduct.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                  placeholder="Product description..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    name="condition"
                    value={editedProduct.condition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    name="state"
                    value={editedProduct.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
                  >
                   <option value="" disabled>Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div> */}
            </div>

            <div className="flex justify-end items-center gap-3 mt-8 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <Save size={16} />
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isDeleteModalOpen && (
        <Modal onClose={() => setIsDeleteModalOpen(false)}>
          <div className="text-center sm:text-left">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Product</h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{product.name}"</span>? 
              This action cannot be undone and will permanently remove the product from your inventory.
            </p>
            
            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <button
                onClick={confirmDelete}
                className="inline-flex justify-center items-center px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 shadow-md hover:shadow-lg transition-all"
              >
                Yes, Delete Product
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="inline-flex justify-center items-center px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ActionMenu;

"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ApprovedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const encryptedUser = localStorage.getItem("user");
    if (encryptedUser) {
      const decryptedUser = decryptData(encryptedUser);
      setUser(decryptedUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_ALL + user.id),
        {
          withCredentials: true,
        },
        {
          params: {
            userId: user.id,
            status: "approved",
          },
        }
      );
      console.log("Approved orders response:", response.data);
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error("Failed to fetch approved orders.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "approved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <div>
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Approved Orders</h1>
      {loading ? (
        <p>Loading...</p>
      ) : orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 text-left px-4 border-b">Order ID</th>
                <th className="py-2 text-left px-4 border-b">Product(s)</th>
                <th className="py-2 text-left px-4 border-b">Quantity</th>
                <th className="py-2 text-left px-4 border-b">Date</th>
                <th className="py-2 text-left px-4 border-b">
                  Delivery Address
                </th>
                <th className="py-2 text-left px-4 border-b">Total Amount</th>
                <th className="py-2 text-left px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{order._id}</td>
                  <td className="py-2 px-4 border-b">
                    {order.products.map((p) => p.name).join(", ")}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {order.products.reduce((total, p) => total + p.quantity, 0)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {order.deliveryAddress}
                  </td>
                  <td className="py-2 px-4 border-b">
                    ₦{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No approved orders found.</p>
      )}
    </div>
  );
};

export default ApprovedOrders;

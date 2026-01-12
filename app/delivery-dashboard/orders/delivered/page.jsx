"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { decryptData } from "@/lib/encryption";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeliveredOrders = () => {
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
      fetchDeliveredOrders();
    }
  }, [user]);

  const fetchDeliveredOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.ORDER.GET_ALL),
        {
          params: {
            userId: user.id,
            status: "delivered",
          },
        },
        {
          withCredentials: true,
        }
      );
      setOrders(response.data);
    } catch (error) {
      toast.error("Failed to fetch delivered orders.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Delivered Orders</h1>
      {loading ? (
        <p>Loading...</p>
      ) : orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Order ID</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Total Amount</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-2 px-4 border-b">{order.id}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">₦{order.totalAmount}</td>
                  <td className="py-2 px-4 border-b">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No delivered orders found.</p>
      )}
    </div>
  );
};

export default DeliveredOrders;

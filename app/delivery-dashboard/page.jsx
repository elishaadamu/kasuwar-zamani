"use client";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppContext } from "@/context/AppContext";
import { AiFillBank } from "react-icons/ai";

const DashboardHome = () => {
  const { userData, authLoading } = useAppContext();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    userName: "",
    newTasks: [],
    ongoingTasks: [],
    completedTasks: [],
  });
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [hasWallet, setHasWallet] = useState(false);
  const [activeTab, setActiveTab] = useState("new");

  // Support two possible shapes: either userData is the user object or it has a `user` property
  const currentUser = userData?.user ?? userData;

  useEffect(() => {
    // Only attempt to fetch when we have a user id available
    if (!currentUser?._id) return;

    setLoading(true);
    const fetchBalance = async () => {
      try {
        const response = await axios.get(
          apiUrl(
            `${API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance}${currentUser._id}/balance`
          ),
          {
            withCredentials: true,
          }
        );
        console.log(response);
        setWalletBalance(response.data.data.balance);
        setHasWallet(true);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [currentUser]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading) return; // Wait for user data to be loaded

      if (!userData) {
        router.push("/delivery-signin");
        return;
      }

      setLoading(true);
      try {
        // Fetch tasks and wallet balance in parallel
        const [tasksResponse, walletResponse] = await Promise.all([
          axios.get(
            apiUrl(
              `${API_CONFIG.ENDPOINTS.DELIVERY.GET_TASKS_BY_DELIVERY_PERSON}/${currentUser._id}`
            )
          ),
          axios.get(
            apiUrl(
              `${API_CONFIG.ENDPOINTS.ACCOUNT.walletBalance}${currentUser._id}/balance`
            )
          ),
        ]);

        const tasks = tasksResponse.data.data || [];
        if (walletResponse.data.data.balance !== undefined) {
          setWalletBalance(walletResponse.data.data.balance);
          setHasWallet(true);
        }

        setDashboardData({
          userName: userData.firstName,
          newTasks: tasks.filter((task) => task.status === "pending"),
          ongoingTasks: tasks.filter(
            (task) =>
              task.status === "assigned" || task.status === "on delivery"
          ),
          completedTasks: tasks.filter(
            (task) => task.status === "completed" || task.status === "canceled"
          ),
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (error.response?.status === 404) {
          setHasWallet(false);
        } else {
          toast.error("Failed to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userData, authLoading, router]);

  const handleCreateWallet = async () => {
    setLoading(true);
    try {
      if (!currentUser?._id) {
        toast.error("Unable to create wallet: user not found.");
        return;
      }

      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.DELIVERY.CREATE_WALLET + currentUser._id)
      );
      console.log(response);
      toast.success("Wallet created successfully!");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to create wallet.");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId, status) => {
    try {
      await axios.put(
        apiUrl(`${API_CONFIG.ENDPOINTS.DELIVERY.UPDATE_TASK_STATUS}/${taskId}`),
        { status }
      );
      toast.success(`Task status updated to ${status}`);
      // Refetch data to update UI
      // A more optimized approach would be to update the state locally
      const refetchTasks = async () => {
        const tasksResponse = await axios.get(
          apiUrl(
            `${API_CONFIG.ENDPOINTS.DELIVERY.GET_TASKS_BY_DELIVERY_PERSON}/${userData.id}`
          )
        );
        const tasks = tasksResponse.data.data || [];
        setDashboardData((prev) => ({
          ...prev,
          newTasks: tasks.filter((task) => task.status === "pending"),
          ongoingTasks: tasks.filter(
            (task) =>
              task.status === "assigned" || task.status === "on delivery"
          ),
          completedTasks: tasks.filter(
            (task) => task.status === "completed" || task.status === "canceled"
          ),
        }));
      };
      refetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status.");
    }
  };

  const renderTaskCard = (task) => (
    <div key={task._id} className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-lg">
            Delivery ID: #{task._id.slice(-6)}
          </p>
          <p className="text-sm text-gray-500">Type: {task.deliveryType}</p>
        </div>
        <p className="font-bold text-lg text-green-600">
          ₦
          {task.price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <h4 className="font-semibold">Pickup</h4>
          <p>{task.pickupAddress.address}</p>
          <p className="text-sm text-gray-600">
            {task.pickupAddress.lga}, {task.pickupAddress.state}
          </p>
          <p className="text-sm text-gray-500">
            Notable Location: {task.pickupAddress.notableLocation}
          </p>
        </div>
        <div>
          <h4 className="font-semibold">Drop-off</h4>
          <p>{task.dropoffAddress.address}</p>
          <p className="text-sm text-gray-600">
            {task.dropoffAddress.lga}, {task.dropoffAddress.state}
          </p>
          <p className="text-sm text-gray-500">
            Notable Location: {task.dropoffAddress.notableLocation}
          </p>
        </div>
      </div>
      {(task.status === "assigned" || task.status === "on delivery") &&
        task.customerDetails && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold">Customer Details</h4>
            <p>Name: {task.customerDetails.name}</p>
            <p>Contact: {task.customerDetails.phone}</p>
          </div>
        )}
      <div className="mt-4 flex gap-2 flex-wrap">
        {task.status === "pending" && (
          <>
            <button
              onClick={() => handleTaskUpdate(task._id, "assigned")}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Accept
            </button>
            <button
              onClick={() => handleTaskUpdate(task._id, "rejected")}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Reject
            </button>
          </>
        )}
        {task.status === "assigned" && (
          <button
            onClick={() => handleTaskUpdate(task._id, "on delivery")}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Start Delivery
          </button>
        )}
        {task.status === "on delivery" && (
          <button
            onClick={() => handleTaskUpdate(task._id, "completed")}
            className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
          >
            Mark as Completed
          </button>
        )}
        {task.status !== "completed" && task.status !== "canceled" && (
          <button
            onClick={() => handleTaskUpdate(task._id, "canceled")}
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
          >
            Cancel Task
          </button>
        )}
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            task.status === "completed"
              ? "bg-green-100 text-green-800"
              : task.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {task.status}
        </span>
      </div>
    </div>
  );

  const renderTasks = (tasks) => {
    if (tasks.length === 0) {
      return (
        <p className="text-gray-500 text-center py-8">
          No tasks in this category.
        </p>
      );
    }
    return <div className="space-y-4">{tasks.map(renderTaskCard)}</div>;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <ToastContainer />
      {loading || authLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {currentUser?.firstName || ""}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening with your deliveries today.
            </p>
          </div>

          {/* Wallet Card Section */}
          <div className="mb-8">
            {/* Wallet Balance */}
            {hasWallet ? (
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full opacity-20 -mr-10 -mt-10"></div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm opacity-80 flex items-center gap-2">
                      <AiFillBank />
                      <span>Bank</span>
                    </p>
                    <h2 className="text-lg font-semibold">
                      {currentUser?.bankName || "N/A"}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-80">Wallet Balance</p>
                    <h1 className="text-3xl font-bold">
                      ₦
                      {walletBalance?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || "0.00"}
                    </h1>
                  </div>
                </div>
                <div className="mt-4 border-t border-blue-400/40 pt-4 flex justify-between text-sm">
                  <div>
                    <p className="opacity-80">Account Name</p>
                    <p className="font-medium">
                      {currentUser?.accountName || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="opacity-80">Account Number</p>
                    <p className="font-medium">
                      {currentUser?.accountNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-center items-center">
                <p className="text-center text-gray-600 mb-4">
                  You don't have a wallet yet. Create one to get started.
                </p>
                <button
                  onClick={handleCreateWallet}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {loading ? "Creating..." : "Create Wallet"}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.totalOrders}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    ></path>
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/orders/all"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  View all orders →
                </Link>
              </div>
            </div>
            {/* New Tasks */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.newTasks.length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setActiveTab("new")}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  View new tasks →
                </button>
              </div>
            </div>

            {/* Ongoing Deliveries */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Ongoing Deliveries
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.ongoingTasks.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setActiveTab("ongoing")}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  View ongoing deliveries →
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Tasks Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("new")}
                  className={`${
                    activeTab === "new"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  New Tasks
                </button>
                <button
                  onClick={() => setActiveTab("ongoing")}
                  className={`${
                    activeTab === "ongoing"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Ongoing
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`${
                    activeTab === "completed"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  History
                </button>
              </nav>
            </div>
            <div className="mt-6">
              {activeTab === "new" && renderTasks(dashboardData.newTasks)}
              {activeTab === "ongoing" &&
                renderTasks(dashboardData.ongoingTasks)}
              {activeTab === "completed" &&
                renderTasks(dashboardData.completedTasks)}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <Link
              href="/delivery-dashboard/withdraw"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-medium text-gray-900">
                Wallet & Withdrawals
              </h3>
              <p className="text-gray-600 mt-2">
                Fund wallet or request a withdrawal
              </p>
            </Link>
            <Link
              href="/delivery-dashboard/personal-details"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-medium text-gray-900">
                Update Profile
              </h3>
              <p className="text-gray-600 mt-2">Manage your personal details</p>
            </Link>
            <Link
              href="/delivery-dashboard/settlement-accounts"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-medium text-gray-900">
                Settlement Account
              </h3>
              <p className="text-gray-600 mt-2">View your bank details</p>
            </Link>
            <Link
              href="/delivery-dashboard/withdrawal-history"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-medium text-gray-900">
                Withdrawal History
              </h3>
              <p className="text-gray-600 mt-2">View your past withdrawals</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardHome;

"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Logo from "@/assets/logo/logo.png";
import { decryptData } from "@/lib/encryption";
import { FaHistory, FaTruck, FaUsers, FaLayerGroup, FaUser, FaUserTie } from "react-icons/fa";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  handleLogout,
  openOrders,
  setOpenOrders,
  openMenu,
  setOpenMenu,
  openDelivery,
  setOpenDelivery,
}) => {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [isRegionalLeader, setIsRegionalLeader] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [openTeam, setOpenTeam] = useState(false);

  useEffect(() => {
    const getUserRoleFromStorage = () => {
      try {
        const raw = localStorage.getItem("user");
        if (!raw) return null;
        const user = decryptData(raw) || null;
        setUserData(user);
        return user?.role || null;
      } catch (err) {
        return null;
      }
    };
    setUserRole(getUserRoleFromStorage());
  }, []);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!userData) return;
      try {
        let response;
        try {
          response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_TEAM_DASHBOARD), { withCredentials: true });
        } catch (error) {
          response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_TEAM), { withCredentials: true });
        }

        if (response?.data?.success) {
          const data = response.data;
          setTeamData(data);
          if (data.role === "regional-leader") {
            setIsRegionalLeader(true);
          } else if (data.role === "team-lead") {
            setIsTeamLeader(true);
          } else if (data.role === "member") {
            setIsTeamMember(true);
          }
        }
      } catch (error) {
        console.error("Sidebar Team Fetch Error:", error);
      }
    };
    fetchTeamData();
  }, [userData]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-[2000] w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Link href={"/"}>
            <Image className="w-[12rem] mx-auto" src={Logo} alt="logo" />
          </Link>
          <button
            className="p-2 rounded-md hover:bg-gray-700 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg
              className="w-6 h-6"
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
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/dashboard" ? "bg-gray-700" : ""
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Home</span>
            </Link>

            <div className="">
              <Link href="/dashboard/track-order">
                <div
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/dashboard/track-order" ? "bg-gray-700" : ""
                  }`}
                >
                  <FaTruck className="w-5 h-5" />
                  <span>Track Order</span>
                </div>
              </Link>
            </div>

            {(isRegionalLeader || isTeamLeader || isTeamMember) && (
              <div className="mt-2 mb-2 ml-4 border-l border-gray-700 pl-2">
                <p className="px-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  {isRegionalLeader ? "Region Teams" : isTeamLeader ? "Team Members" : "My Team"}
                </p>
                <div className="space-y-1">
                  {isRegionalLeader && teamData?.teams?.map((team) => (
                    <Link
                      key={team._id || team.id}
                      href={`/dashboard/team?id=${team._id || team.id}`}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors ${
                        pathname.includes("/team") && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("id") === (team._id || team.id)
                          ? "text-white bg-gray-700"
                          : ""
                      }`}
                    >
                      <FaLayerGroup className="w-4 h-4" />
                      <span>{team.name}</span>
                    </Link>
                  ))}

                  {(isTeamLeader || isTeamMember) && teamData?.members?.map((member) => (
                    <div
                      key={member.email}
                      className="flex items-center space-x-3 px-3 py-1.5 text-gray-400 hover:text-white transition-colors"
                    >
                      <FaUser className="w-3 h-3" />
                      <span className="text-xs font-medium truncate">
                        {member.firstName} {member.lastName}
                      </span>
                      {member.isTeamLead && (
                        <FaUserTie
                          className="w-3 h-3 text-indigo-400 ml-auto"
                          title="Team Lead"
                        />
                      )}
                    </div>
                  ))}
                  
                  <Link
                    href="/dashboard/team"
                    className={`block mt-2 pl-3 pr-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm text-gray-300 font-medium ${
                      pathname === "/dashboard/team" && !(typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('id')) ? "bg-gray-700 text-white" : ""
                    }`}
                  >
                    View Full Dashboard
                  </Link>
                </div>
              </div>
            )}
            <div className="space-y-1">
              <button
                onClick={() => setOpenOrders(!openOrders)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span>Orders</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openOrders ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className={`space-y-1 ${openOrders ? "block" : "hidden"}`}>
                <Link
                  href="/dashboard/all-orders"
                  className={`block pl-11 pr-4 py-2 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/dashboard/all-orders" ? "bg-gray-700" : ""
                  }`}
                >
                  All Orders
                </Link>
              </div>
            </div>
            <Link
              href="/dashboard/vendor-following"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/dashboard/vendor-following" ? "bg-gray-700" : ""
              }`}
            >
              <FaUsers className="w-5 h-5" />
              <span>Vendor am Following</span>
            </Link>

            <Link
              href="/dashboard/transaction-history"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/vendor-dashboard/transaction-history"
                  ? "bg-gray-700"
                  : ""
              }`}
            >
              <FaHistory className="w-5 h-5" />
              <span>Transaction History</span>
            </Link>
            <div className="space-y-1">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  <span>Settings</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className={`space-y-1 ${openMenu ? "block" : "hidden"}`}>
                <Link
                  href="/dashboard/personal-details"
                  className={`block pl-11 pr-4 py-2 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/dashboard/personal-details"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  Personal Details
                </Link>

                <Link
                  href="/dashboard/pin-management"
                  className={`block pl-11 pr-4 py-2 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/dashboard/pin-management"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  PIN Management
                </Link>
                <Link
                  href="/dashboard/change-password"
                  className={`block pl-11 pr-4 py-2 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/dashboard/change-password"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  Change Password
                </Link>
              </div>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setOpenDelivery(!openDelivery)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                    />
                  </svg>
                  <span>Delivery</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openDelivery ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className={`space-y-1 ${openDelivery ? "block" : "hidden"}`}>
                <Link
                  href="/dashboard/request-delivery"
                  className={`block pl-11 pr-4 py-2 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/dashboard/request-delivery"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  Delivery Request
                </Link>
                <Link
                  href="/dashboard/delivery-payment"
                  className={`block pl-11 pr-4 py-2 rounded-lg hover:bg-gray-700 transition-colors ${
                    pathname === "/dashboard/delivery-payment"
                      ? "bg-gray-700"
                      : ""
                  }`}
                >
                  Pay for Delivery
                </Link>
              </div>
            </div>
            <Link
              href="/dashboard/inbox-support"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/dashboard/inbox-support" ? "bg-gray-700" : ""
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Inbox</span>
            </Link>

            <Link
              href="/dashboard/coupons"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/dashboard/coupons" ? "bg-gray-700" : ""
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              <span>Coupons</span>
            </Link>

            <Link
              href="/dashboard/pos-sales"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/dashboard/pos-sales" ? "bg-gray-700" : ""
              }`}
            >
              <svg
                className="w-5 h-5"
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
              <span>POS Sales</span>
            </Link>

            <Link
              href="/dashboard/support-ticket"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/dashboard/support-ticket" ? "bg-gray-700" : ""
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>Support</span>
            </Link>

            <Link
              href="/dashboard/referrals"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors ${
                pathname === "/dashboard/refer-earn" ? "bg-gray-700" : ""
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Refer & Earn</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Logo from "@/assets/logo/logo.png";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import { decryptData } from "@/lib/encryption";
import {
  FaTruck,
  FaHistory,
  FaStar,
  FaUsers,
  FaLayerGroup,
  FaUser,
  FaUserTie,
  FaHome,
  FaShoppingBag,
  FaBox,
  FaMoneyBillWave,
  FaEnvelope,
  FaTag,
  FaShareAlt,
  FaChevronDown,
  FaCog,
  FaKey,
  FaImage,
  FaIdCard,
  FaLock,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaCreditCard,
  FaWallet,
} from "react-icons/fa";

const NavLink = ({ href, icon: Icon, label, isActive, onClick, indent = false }) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-200 group ${
      indent ? "ml-6" : ""
    } ${
      isActive
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`}
  >
    <span className={`w-6 h-6 flex items-center justify-center rounded-lg shrink-0 transition-all ${
      isActive ? "bg-white/20 text-white" : "bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300"
    }`}>
      <Icon className="w-3 h-3" />
    </span>
    <span className="truncate">{label}</span>
    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0"></span>}
  </Link>
);

const CollapsibleSection = ({ icon: Icon, label, isOpen, onToggle, children, isActive }) => (
  <div>
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-200 group ${
        isActive && !isOpen
          ? "bg-indigo-600/20 text-indigo-300"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className={`w-6 h-6 flex items-center justify-center rounded-lg shrink-0 transition-all ${
        isActive ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300"
      }`}>
        <Icon className="w-3 h-3" />
      </span>
      <span className="flex-1 text-left truncate">{label}</span>
      <FaChevronDown className={`w-3 h-3 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
    </button>
    {isOpen && (
      <div className="mt-1 ml-3 pl-3 border-l border-white/5 space-y-0.5 py-1">
        {children}
      </div>
    )}
  </div>
);

const SectionLabel = ({ label }) => (
  <p className="px-3 pt-4 pb-1 text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">{label}</p>
);

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
  openProducts,
  setOpenProducts,
}) => {
  const pathname = usePathname();
  const [userData, setUserData] = useState(null);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [isRegionalLeader, setIsRegionalLeader] = useState(false);
  const [teamData, setTeamData] = useState(null);

  const close = () => setIsSidebarOpen(false);
  const is = (path) => pathname === path;
  const startsWith = (path) => pathname.startsWith(path);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUserData(decryptData(raw) || null);
    } catch {}
  }, []);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!userData) return;
      try {
        let response;
        try {
          response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_TEAM_DASHBOARD), { withCredentials: true });
        } catch {
          response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.REGIONAL.GET_MY_TEAM), { withCredentials: true });
        }
        if (response?.data?.success) {
          const data = response.data;
          setTeamData(data);
          if (data.role === "regional-leader") setIsRegionalLeader(true);
          else if (data.role === "team-lead") setIsTeamLeader(true);
          else if (data.role === "member") setIsTeamMember(true);
        }
      } catch {}
    };
    fetchTeamData();
  }, [userData]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-[2000] w-64 bg-[#0f1117] border-r border-white/5 text-white transform transition-transform duration-300 ease-in-out flex flex-col ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/5 shrink-0">
        <Link href="/" onClick={close}>
          <Image className="w-36" src={Logo} alt="Kasuwar Zamani" />
        </Link>
        <button
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all md:hidden"
          onClick={close}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Vendor Profile Chip */}
      {userData && (
        <div className="mx-4 mt-4 p-3 bg-white/5 rounded-2xl border border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <FaUser className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-white truncate">{userData.name || userData.firstName || "Vendor"}</p>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Merchant Account</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.6)]"></div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <nav className="space-y-0.5">

          <SectionLabel label="Main" />
          <NavLink href="/vendor-dashboard" icon={FaHome} label="Dashboard" isActive={is("/vendor-dashboard")} onClick={close} />
          <NavLink href="/vendor-dashboard/track-order" icon={FaTruck} label="Track Order" isActive={is("/vendor-dashboard/track-order")} onClick={close} />

          {/* Team section */}
          {(isRegionalLeader || isTeamLeader || isTeamMember) && (
            <>
              <SectionLabel label={isRegionalLeader ? "Region" : "Team"} />
              <NavLink
                href="/vendor-dashboard/team"
                icon={FaLayerGroup}
                label={isRegionalLeader ? "Region Teams" : isTeamLeader ? "Team Dashboard" : "My Team"}
                isActive={startsWith("/vendor-dashboard/team")}
                onClick={close}
              />
              {isRegionalLeader && teamData?.teams?.map((team) => (
                <NavLink
                  key={team._id || team.id}
                  href={`/vendor-dashboard/team?id=${team._id || team.id}`}
                  icon={FaUsers}
                  label={team.name}
                  isActive={false}
                  onClick={close}
                  indent
                />
              ))}
            </>
          )}

          <SectionLabel label="Commerce" />
          <CollapsibleSection
            icon={FaShoppingBag}
            label="Orders"
            isOpen={openOrders}
            onToggle={() => setOpenOrders(!openOrders)}
            isActive={startsWith("/vendor-dashboard/all-orders")}
          >
            <NavLink href="/vendor-dashboard/all-orders" icon={FaBox} label="All Orders" isActive={startsWith("/vendor-dashboard/all-orders")} onClick={close} />
          </CollapsibleSection>

          <CollapsibleSection
            icon={FaBox}
            label="Products"
            isOpen={openProducts}
            onToggle={() => setOpenProducts(!openProducts)}
            isActive={startsWith("/vendor-dashboard/add-products") || startsWith("/vendor-dashboard/products-list")}
          >
            <NavLink href="/vendor-dashboard/add-products" icon={FaBox} label="Add Product" isActive={is("/vendor-dashboard/add-products")} onClick={close} />
            <NavLink href="/vendor-dashboard/products-list" icon={FaLayerGroup} label="Products List" isActive={is("/vendor-dashboard/products-list")} onClick={close} />
          </CollapsibleSection>

          <SectionLabel label="Finance" />
          <NavLink href="/vendor-dashboard/withdrawal-request" icon={FaMoneyBillWave} label="Withdrawals" isActive={is("/vendor-dashboard/withdrawal-request")} onClick={close} />
          <NavLink href="/vendor-dashboard/transaction-history" icon={FaHistory} label="Funding History" isActive={is("/vendor-dashboard/transaction-history")} onClick={close} />
          <NavLink href="/vendor-dashboard/my-subscription" icon={FaStar} label="Subscription" isActive={is("/vendor-dashboard/my-subscription")} onClick={close} />

          <SectionLabel label="Logistics" />
          <CollapsibleSection
            icon={FaTruck}
            label="Delivery"
            isOpen={openDelivery}
            onToggle={() => setOpenDelivery(!openDelivery)}
            isActive={startsWith("/vendor-dashboard/request-delivery") || startsWith("/vendor-dashboard/delivery-payment")}
          >
            <NavLink href="/vendor-dashboard/request-delivery" icon={FaMapMarkerAlt} label="Request Delivery" isActive={is("/vendor-dashboard/request-delivery")} onClick={close} />
            <NavLink href="/vendor-dashboard/delivery-payment" icon={FaCreditCard} label="Pay for Delivery" isActive={is("/vendor-dashboard/delivery-payment")} onClick={close} />
          </CollapsibleSection>

          <SectionLabel label="Growth" />
          <NavLink href="/vendor-dashboard/get-followers" icon={FaUsers} label="Get Followers" isActive={is("/vendor-dashboard/get-followers")} onClick={close} />
          <NavLink href="/vendor-dashboard/coupons" icon={FaTag} label="Coupons" isActive={is("/vendor-dashboard/coupons")} onClick={close} />
          <NavLink href="/vendor-dashboard/referrals" icon={FaShareAlt} label="Refer & Earn" isActive={is("/vendor-dashboard/referrals")} onClick={close} />

          <SectionLabel label="Support" />
          <NavLink href="/vendor-dashboard/inbox-support" icon={FaEnvelope} label="Inbox & Support" isActive={is("/vendor-dashboard/inbox-support")} onClick={close} />

          <SectionLabel label="Settings" />
          <CollapsibleSection
            icon={FaCog}
            label="Account Settings"
            isOpen={openMenu}
            onToggle={() => setOpenMenu(!openMenu)}
            isActive={
              startsWith("/vendor-dashboard/personal-details") ||
              startsWith("/vendor-dashboard/update-images") ||
              startsWith("/vendor-dashboard/pin-management") ||
              startsWith("/vendor-dashboard/change-password")
            }
          >
            <NavLink href="/vendor-dashboard/personal-details" icon={FaIdCard} label="Personal Details" isActive={is("/vendor-dashboard/personal-details")} onClick={close} />
            <NavLink href="/vendor-dashboard/update-images" icon={FaImage} label="Update Images" isActive={is("/vendor-dashboard/update-images")} onClick={close} />
            <NavLink href="/vendor-dashboard/pin-management" icon={FaKey} label="PIN Management" isActive={is("/vendor-dashboard/pin-management")} onClick={close} />
            <NavLink href="/vendor-dashboard/change-password" icon={FaLock} label="Change Password" isActive={is("/vendor-dashboard/change-password")} onClick={close} />
          </CollapsibleSection>

        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/5 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/20 text-rose-400 hover:text-rose-300 text-[10px] font-black uppercase tracking-widest transition-all duration-200"
        >
          <FaSignOutAlt className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

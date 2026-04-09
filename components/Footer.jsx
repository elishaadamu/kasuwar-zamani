"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/logo/logo.png";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaArrowRight,
  FaChevronUp,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/all-products" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
  ];

  const accountLinks = [
    { name: "My Account", href: "/dashboard" },
    { name: "Track Order", href: "/dashboard/track-order" },
    { name: "Wishlist", href: "/wishlist" },
    { name: "Cart", href: "/cart" },
  ];

  const socials = [
    { icon: FaFacebookF, href: "#", label: "Facebook", hoverBg: "hover:bg-blue-600" },
    { icon: FaTwitter, href: "#", label: "Twitter", hoverBg: "hover:bg-sky-500" },
    { icon: FaInstagram, href: "#", label: "Instagram", hoverBg: "hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600" },
  ];

  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-4">
            <div className="mb-6">
              <Image
                className="w-[200px] h-auto brightness-110"
                src={Logo}
                alt="Kasuwar Zamani Logo"
              />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-7 max-w-sm">
              Your premier online marketplace for authentic products. We bring
              you quality items at competitive prices with exceptional customer
              service.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`w-10 h-10 bg-white/[0.06] border border-white/[0.08] rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-transparent transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.hoverBg}`}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-blue-500 rounded-full" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="group text-slate-400 hover:text-white text-sm transition-all duration-200 flex items-center gap-2"
                  >
                    <FaArrowRight className="w-2.5 h-2.5 text-blue-500/60 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links Column */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-purple-500 rounded-full" />
              My Account
            </h3>
            <ul className="space-y-3">
              {accountLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="group text-slate-400 hover:text-white text-sm transition-all duration-200 flex items-center gap-2"
                  >
                    <FaArrowRight className="w-2.5 h-2.5 text-purple-500/60 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter Column */}
          <div className="lg:col-span-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-emerald-500 rounded-full" />
              Get in Touch
            </h3>

            {/* Contact Details */}
            <div className="space-y-3.5 mb-7">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaMapMarkerAlt className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  123 Business District,<br />
                  Central Area, Kano, Nigeria
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <FaPhoneAlt className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <a
                  href="tel:+2348140950947"
                  className="text-slate-400 hover:text-white text-sm transition-colors duration-200"
                >
                  +234 814 095 0947
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <a
                  href="mailto:support@kasuwarzamani.com.ng"
                  className="text-slate-400 hover:text-white text-sm transition-colors duration-200 break-all"
                >
                  support@kasuwarzamani.com.ng
                </a>
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5">
              <h4 className="text-white text-sm font-semibold mb-1.5">Stay Updated</h4>
              <p className="text-slate-500 text-xs mb-3.5">Get the latest deals and updates.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 px-4 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all duration-300"
                />
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/25 whitespace-nowrap flex-shrink-0">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs text-center sm:text-left">
              © {currentYear} Kasuwar Zamani. All rights reserved.
            </p>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              <span className="text-slate-600 text-xs mr-1">We accept:</span>
              {["Visa", "Mastercard", "Verve", "Wallet"].map((method, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-white/[0.05] border border-white/[0.08] rounded-md text-[11px] font-medium text-slate-400 tracking-wide"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 w-11 h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl hover:-translate-y-0.5 z-50 ${
          showScrollTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <FaChevronUp className="w-4 h-4" />
      </button>
    </footer>
  );
};

export default Footer;

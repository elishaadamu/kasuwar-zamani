"use client";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { ToastContainer } from "react-toastify";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Script from "next/script";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-outfit",
});

import ClientLayout from "@/components/ClientLayout";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isSpecialRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/vendor-signup") ||
    pathname.startsWith("/vendor-signin") ||
    pathname.startsWith("/delivery-signup") ||
    pathname.startsWith("/delivery-signin") ||
    pathname.startsWith("/delivery-dashboard") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/vendor-dashboard") ||
    pathname.startsWith("/chat");

  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased text-gray-700 font-sans`}>
        <ToastContainer />
        <AppContextProvider>
          <ClientLayout isSpecialRoute={isSpecialRoute}>
            {children}
          </ClientLayout>
        </AppContextProvider>
        
        <Script src="https://cdn.botpress.cloud/webchat/v3.5/inject.js" strategy="lazyOnload"></Script>
        <Script src="https://files.bpcontent.cloud/2025/12/13/16/20251213161208-0D9LWGZJ.js" strategy="lazyOnload"></Script>
      </body>
    </html>
  );
}

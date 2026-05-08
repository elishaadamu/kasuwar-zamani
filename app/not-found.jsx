"use client";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/logo/logo.png";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 px-4">

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-200/60 to-indigo-200/60 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-purple-200/60 to-pink-200/60 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-100/40 to-blue-100/40 blur-2xl" />
      </div>

      {/* Card */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center rounded-[2.5rem] border border-white bg-white/70 p-10 text-center shadow-2xl shadow-blue-900/10 backdrop-blur-xl md:p-14">

        {/* Logo */}
        <Link href="/" className="mb-8 inline-block transition-opacity hover:opacity-80">
          <Image src={Logo} alt="Kasuwar Zamani" className="mx-auto w-40" />
        </Link>

        {/* 404 number */}
        <div className="relative mb-2 select-none">
          <span
            className="block text-[9rem] font-black leading-none tracking-tighter"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </span>
          {/* Floating dot decoration */}
          <span className="absolute -top-3 -right-3 h-5 w-5 animate-bounce rounded-full bg-indigo-400/70" />
          <span className="absolute -bottom-1 -left-4 h-3 w-3 animate-pulse rounded-full bg-blue-400/60" />
        </div>

        {/* Headline */}
        <h1 className="mt-2 text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
          Page Not Found
        </h1>

        {/* Sub-text */}
        <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500 md:text-base">
          Oops! The page you're looking for doesn't exist or has been moved.
          <br />
          Let's get you back on track.
        </p>

        {/* Divider */}
        <div className="my-8 h-px w-16 rounded-full bg-gradient-to-r from-indigo-300 to-blue-300" />

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
            </svg>
            Go Home
          </Link>

          <Link
            href="/all-products"
            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-8 py-4 text-xs font-black uppercase tracking-widest text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-md active:translate-y-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-indigo-500">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
              <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            Browse Products
          </Link>
        </div>

        {/* Help link */}
        <p className="mt-8 text-xs font-medium text-gray-400">
          Need help?{" "}
          <Link href="/contact" className="font-bold text-indigo-600 transition-colors hover:text-indigo-800">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}

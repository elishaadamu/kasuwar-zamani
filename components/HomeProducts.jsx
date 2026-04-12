import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const HomeProducts = () => {
  const { products, router } = useAppContext();

  return (
    <div className="flex flex-col w-full">
      <div className="flex button-see_more flex-row justify-between items-center w-full mb-8">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center relative overflow-hidden">
             <div className="w-full h-full absolute inset-0 bg-indigo-200 animate-ping opacity-20"></div>
             <div className="w-4 h-4 bg-indigo-600 rounded-full relative z-10 shadow-lg shadow-indigo-500/50"></div>
           </div>
           <h2 className="text-3xl font-black tracking-tight text-gray-900">Trending Now</h2>
        </div>
        {products.length > 4 && (
          <button
            onClick={() => {
              router.push("/all-products");
            }}
            className="px-6 py-2.5 rounded-full bg-white border border-gray-200 text-gray-900 font-bold hover:border-gray-900 hover:shadow-md transition-all text-sm group flex items-center gap-2"
          >
            Explore All <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        )}
      </div>
      <div className="home-products grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-center justify-items-center gap-6 mt-2 pb-14 w-full">
        {products.slice(0, 8).map((product, index) => (
          <ProductCard key={product._id || index} product={product} />
        ))}
      </div>
    </div>
  );
};

export default HomeProducts;

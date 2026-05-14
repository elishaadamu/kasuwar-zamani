import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import { FaArrowRight } from "react-icons/fa";

const HomeProducts = () => {
  const { products, router } = useAppContext();

  return (
    <div className="flex flex-col w-full py-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full mb-12 gap-6 text-center md:text-left">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 bg-[#004AAD]/5 rounded-2xl flex items-center justify-center relative overflow-hidden border border-[#004AAD]/10">
             <div className="w-full h-full absolute inset-0 bg-[#004AAD]/10 animate-pulse"></div>
             <div className="w-3 h-3 bg-[#004AAD] rounded-full relative z-10 shadow-[0_0_15px_rgba(0,74,173,0.5)]"></div>
           </div>
           <div>
             <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-gray-900 leading-none">Trending <span className="text-[#004AAD]">Now</span></h2>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Our most popular selections</p>
           </div>
        </div>
        
        {products.length > 4 && (
          <button
            onClick={() => {
              router.push("/all-products");
            }}
            className="px-8 py-3 rounded-full bg-white border border-gray-200 text-[#004AAD] font-black uppercase tracking-widest text-[10px] hover:border-[#004AAD] hover:shadow-lg transition-all group flex items-center gap-3"
          >
            Explore All 
            <FaArrowRight className="group-hover:translate-x-1 transition-transform w-3 h-3" />
          </button>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 justify-items-center">
        {products.slice(0, 8).map((product, index) => (
          <ProductCard key={product._id || index} product={product} />
        ))}
      </div>
    </div>
  );
};

export default HomeProducts;

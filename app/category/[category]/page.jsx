"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import Loading from "@/components/Loading";
import CategorySidebar from "@/components/CategorySidebar";

const CategoryPage = () => {
  const params = useParams();
  const categorySlug = params.category;
  const { router, products } = useAppContext();

  const [categoryName, setCategoryName] = useState("");

  // Decode category slug and set category name
  useEffect(() => {
    if (categorySlug) {
      const decodedCategory = decodeURIComponent(categorySlug);
      setCategoryName(decodedCategory);
    }
  }, [categorySlug]);

  // Filter products by category from AppContext
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }

    return products.filter((product) => {
      if (!product.category) return false;
      // Case-insensitive comparison
      return product.category.toLowerCase() === categoryName.toLowerCase();
    });
  }, [products, categoryName]);

  const isLoading = !products || products.length === 0;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex gap-6 p-6 max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-64 sticky top-8 h-fit hidden lg:block">
          <CategorySidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Category Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {categoryName}
            </h1>
            <p className="text-gray-600 mt-2">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"} found
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No products found in this category.
              </p>
              <button
                onClick={() => router.push("/all-products")}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Browse All Products
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;

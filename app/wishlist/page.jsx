"use client";
import ProductCard from "@/components/ProductCard";
import { useAppContext } from "@/context/AppContext";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const Page = () => {
  const { products, wishlistItems, isLoggedIn } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push(`/signin?redirect=${pathname}`);
    }
  }, [isLoggedIn, router, pathname]);

  const wishlistProducts = products.filter((product) =>
    wishlistItems.includes(product._id)
  );

  if (!isLoggedIn) {
    return null; // Or a loading spinner, or a message
  }

  return (
    <div className="flex flex-col items-center gap-8 my-16 px-4 md:px-16 lg:px-32">
      <h1 className="text-3xl font-bold text-gray-800">Your Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {wishlistProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      {wishlistProducts.length === 0 && (
        <p className="text-gray-700">Your wishlist is empty.</p>
      )}
    </div>
  );
};

export default Page;

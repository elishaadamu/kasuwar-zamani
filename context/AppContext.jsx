"use client";
import { decryptData } from "@/lib/encryption";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { apiUrl, API_CONFIG } from "@/configs/api";
import statesData from "@/lib/states.json";
import { toast } from "react-toastify";
import lgasData from "@/lib/lgas.json";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const isLoggedIn = !!userData; // Derive isLoggedIn from userData
  const [states] = useState(statesData.state || []);
  const [lgas, setLgas] = useState([]);

  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== "undefined") {
      const encryptedUser = localStorage.getItem("user");
      if (encryptedUser) {
        const decryptedUser = decryptData(encryptedUser);
        if (decryptedUser && decryptedUser._id) {
          const cartStorageKey = `cartItems_storage_${decryptedUser._id}`;
          const storedCart = localStorage.getItem(cartStorageKey);
          if (storedCart) {
            try {
              const parsedCart = JSON.parse(storedCart);
              return parsedCart.data || {};
            } catch (e) {
              return {};
            }
          }
        }
      }
    }
    return {};
  });

  const [wishlistItems, setWishlistItems] = useState(() => {
    if (typeof window !== "undefined") {
      const encryptedUser = localStorage.getItem("user");
      if (encryptedUser) {
        const decryptedUser = decryptData(encryptedUser);
        if (decryptedUser && decryptedUser._id) {
          const wishlistStorageKey = `wishlistItems_storage_${decryptedUser._id}`;
          const storedWishlist = localStorage.getItem(wishlistStorageKey);
          if (storedWishlist) {
            try {
              const parsedWishlist = JSON.parse(storedWishlist);
              return parsedWishlist.data || [];
            } catch (e) {
              return [];
            }
          }
        }
      }
    }
    return [];
  });

  // Following vendors state
  const [followingList, setFollowingList] = useState([]);

  const fetchUserData = async () => {
    try {
      const encryptedUser = localStorage.getItem("user");

      if (!encryptedUser) {
        setUserData(null);
        return;
      }

      const decryptedUser = decryptData(encryptedUser);

      if (decryptedUser) {
        setUserData(decryptedUser);
      } else {
        localStorage.removeItem("user");
        setUserData(null);
      }
    } catch (error) {
      console.error("Error in fetchUserData:", {
        message: error.message,
        stack: error.stack,
      });
      localStorage.removeItem("user");
      setUserData(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchProductData = async (page = 1, reset = false) => {
    if (productsLoading || (page > 1 && !hasMoreProducts)) return;

    setProductsLoading(true);
    try {
      // Construct payload inside the function
      const payload = {
        userId: userData?.id || null, // Safely access userId
        page: page,
      };

      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.PRODUCT.GET_PRODUCT),
        payload,
        { withCredentials: true }
      );

      const newProducts = response.data.products || [];

      setProducts((prev) =>
        reset || page === 1 ? newProducts : [...prev, ...newProducts]
      );
      setHasMoreProducts(newProducts.length === 20);
      setProductPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Could not load products.");
    } finally {
      setProductsLoading(false);
    }
  };
  const logout = () => {
    localStorage.removeItem("user");
    axios.post(
      apiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
      {},
      { withCredentials: true }
    );
    setUserData(null);
    setCartItems({}); // Clear cart on logout
    setWishlistItems([]); // Clear wishlist on logout
    setFollowingList([]); // Clear following list on logout
    // It's better to show toast notifications in the component that calls logout.
    router.push("/"); // Redirect to the homepage
  };

  const fetchLgas = (stateName) => {
    if (!stateName) return;
    const lgasForState = lgasData[stateName] || [];
    setLgas(lgasForState);
  };
  const addToCart = async (itemId) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to add items to cart.");
      router.push("/signin");
      return;
    }
    setCartItems((prevCartItems) => {
      const newCartItems = { ...prevCartItems };
      newCartItems[itemId] = (newCartItems[itemId] || 0) + 1;
      return newCartItems;
    });
  };

  const updateCartQuantity = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      if (cartItems[items] > 0) {
        totalCount += cartItems[items];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (itemInfo && cartItems[items] > 0) {
        totalAmount += itemInfo.price * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  const addToWishlist = (itemId) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to add items to wishlist.");
      router.push("/signin");
      return;
    }
    let wishlistData = structuredClone(wishlistItems);
    if (wishlistData.includes(itemId)) {
      wishlistData = wishlistData.filter((id) => id !== itemId);
    } else {
      wishlistData.push(itemId);
    }
    setWishlistItems(wishlistData);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const fetchFollowingList = async (userId) => {
    if (!userId) {
      setFollowingList([]);
      return;
    }
    try {
      const response = await axios.get(
        apiUrl(API_CONFIG.ENDPOINTS.FOLLOW.GET_FOLLOWING + userId)
      );

      // Safely access the followings array
      const followingsArray = response.data?.followings;

      if (Array.isArray(followingsArray)) {
        const followingIds = followingsArray.map((following) => following._id);
        setFollowingList(followingIds);
      } else {
        setFollowingList([]); // Reset if the data is not in the expected format
      }
    } catch (error) {
      console.error("Error fetching following list:", error);
      setFollowingList([]); // Reset on error
    }
  };

  const checkIfFollowing = async (vendorId) => {
    if (!isLoggedIn || !userData?.id) {
      return false;
    }
    try {
      const payload = {
        followerId: userData.id,
        followingId: vendorId,
      };
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.FOLLOW.CHECK_FOLLOW),
        payload
      );
      // The backend should return { isFollowing: true/false }
      return response.data.isFollowing;
    } catch (error) {
      console.error("Error checking follow status:", error);
      return followingList.includes(vendorId); // Fallback to existing list on error
    }
  };

  const followVendor = async (vendorId) => {
    if (!isLoggedIn || !userData?.id) {
      toast.error("Please sign in to follow vendors.");
      router.push("/signin");
      return;
    }

    const isCurrentlyFollowing = followingList.includes(vendorId);

    try {
      const payload = {
        followerId: userData.id,
        followingId: vendorId,
      };

      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.FOLLOW.FOLLOW_VENDOR),
        payload
      );

      if (response.data.action === "follow") {
        toast.success("You are now following this vendor.");
      } else if (response.data.action === "unfollow") {
        toast.success("You have unfollowed this vendor.");
      }

      // Refetch the list to ensure it's in sync with the database
      if (userData?.id) fetchFollowingList(userData.id);
    } catch (error) {
      console.error("Error following/unfollowing vendor:", error);
      toast.error(error.response?.data?.message || "An error occurred.");
      // Revert optimistic UI by refetching
      if (userData?.id) fetchFollowingList(userData.id);
    }
  };

  useEffect(() => {
    fetchProductData(1); // Fetch initial page of products
    fetchUserData();
  }, []);

  // Effect to load cart and wishlist based on userData
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (userData && userData._id) {
        const userId = userData._id;
        const cartStorageKey = `cartItems_storage_${userId}`;
        const wishlistStorageKey = `wishlistItems_storage_${userId}`;

        // Fetch user-specific data
        if (userId) fetchFollowingList(userId);

        // Load cart items
        const storedCart = localStorage.getItem(cartStorageKey);
        if (storedCart) {
          try {
            const parsedCart = JSON.parse(storedCart);
            if (
              parsedCart.timestamp &&
              Date.now() - parsedCart.timestamp < 24 * 60 * 60 * 1000
            ) {
              setCartItems(parsedCart.data);
            } else {
              localStorage.removeItem(cartStorageKey); // Data expired
              setCartItems({});
            }
          } catch (e) {
            console.error("Error parsing cart data from localStorage", e);
            localStorage.removeItem(cartStorageKey);
            setCartItems({});
          }
        } else {
          setCartItems({});
        }

        // Load wishlist items
        const storedWishlist = localStorage.getItem(wishlistStorageKey);
        if (storedWishlist) {
          try {
            const parsedWishlist = JSON.parse(storedWishlist);
            if (
              parsedWishlist.timestamp &&
              Date.now() - parsedWishlist.timestamp < 24 * 60 * 60 * 1000
            ) {
              setWishlistItems(parsedWishlist.data);
            } else {
              localStorage.removeItem(wishlistStorageKey); // Data expired
              setWishlistItems([]);
            }
          } catch (e) {
            console.error("Error parsing wishlist data from localStorage", e);
            localStorage.removeItem(wishlistStorageKey);
            setWishlistItems([]);
          }
        } else {
          setWishlistItems([]);
        }
      } else {
        // Clear cart and wishlist if no user is logged in
        setCartItems({});
        setWishlistItems([]);
        setFollowingList([]);
      }
    }
  }, [userData]); // Re-run when userData changes

  // Save cartItems to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (typeof window !== "undefined" && userData && userData._id) {
      const userId = userData._id;
      const cartStorageKey = `cartItems_storage_${userId}`;
      localStorage.setItem(
        cartStorageKey,
        JSON.stringify({ data: cartItems, timestamp: Date.now() })
      );
    }
  }, [cartItems, userData]); // Depend on userData to get the key

  // Save wishlistItems to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (typeof window !== "undefined" && userData && userData._id) {
      const userId = userData._id;
      const wishlistStorageKey = `wishlistItems_storage_${userId}`;
      localStorage.setItem(
        wishlistStorageKey,
        JSON.stringify({ data: wishlistItems, timestamp: Date.now() })
      );
    }
  }, [wishlistItems, userData]); // Depend on userData to get the key

  const value = {
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    productPage,
    hasMoreProducts,
    productsLoading,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    wishlistItems,
    addToWishlist,
    getWishlistCount,
    isLoggedIn,
    logout,
    authLoading,
    states,
    lgas,
    fetchLgas,
    fetchLgas,
    followingList,
    followVendor,
    fetchFollowingList,
    checkIfFollowing,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl, API_CONFIG } from '../configs/api';
import { DeviceEventEmitter } from 'react-native';
import { decryptData } from '../lib/encryption';

export const AppContext = createContext<any>(null);

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const currency = '₦'; // Assuming NGN based on the web app mock
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  const [userData, setUserData] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const isLoggedIn = !!userData;
  
  const [cartItems, setCartItems] = useState<any>({});
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET_ALL));
      setCategories(response.data.categories || []);
    } catch (error: any) {
      console.log('Category Fetch Error:', error.message, 'URL:', apiUrl(API_CONFIG.ENDPOINTS.CATEGORY.GET_ALL));
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch User Data from AsyncStorage
  const fetchUserData = async () => {
    try {
      const encryptedUser = await AsyncStorage.getItem('user');
      if (encryptedUser) {
        const decryptedUser = decryptData(encryptedUser);
        if (decryptedUser) {
          setUserData(decryptedUser);
        } else {
          await AsyncStorage.removeItem('user');
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error('Error fetching user data', error);
      setUserData(null);
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch Products
  const fetchProductData = async (page = 1, reset = false) => {
    if (productsLoading || (page > 1 && !hasMoreProducts)) return;
    setProductsLoading(true);
    try {
      const payload = {
        userId: userData?.id || null,
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
    } catch (error: any) {
      console.log('Product Fetch Error:', error.message, 'URL:', apiUrl(API_CONFIG.ENDPOINTS.PRODUCT.GET_PRODUCT));
    } finally {
      setProductsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUserData(null);
    setCartItems({});
    setWishlistItems([]);
    router.replace('/(auth)/signin');
  };

  const addToWishlist = (itemId: string) => {
    if (!isLoggedIn) {
      alert('Please sign in to add items to wishlist.');
      router.push('/(auth)/signin');
      return;
    }
    let wishlistData = [...wishlistItems];
    if (wishlistData.includes(itemId)) {
      wishlistData = wishlistData.filter((id) => id !== itemId);
    } else {
      wishlistData.push(itemId);
    }
    setWishlistItems(wishlistData);
  };

  const addToCart = (itemId: string) => {
    if (!isLoggedIn) {
      alert('Please sign in to add items to cart.');
      router.push('/(auth)/signin');
      return;
    }
    setCartItems((prev: any) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  useEffect(() => {
    fetchUserData();
    fetchProductData(1);
    fetchCategories();

    const subscription = DeviceEventEmitter.addListener('session-expired', () => {
      setUserData(null);
      router.replace('/(auth)/signin');
    });

    return () => subscription.remove();
  }, []);

  const value = {
    currency,
    router,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    productPage,
    hasMoreProducts,
    productsLoading,
    categories,
    categoriesLoading,
    cartItems,
    setCartItems,
    addToCart,
    wishlistItems,
    addToWishlist,
    isLoggedIn,
    logout,
    authLoading,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

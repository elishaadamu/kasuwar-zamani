import React from "react";
import HomeClient from "@/components/HomeClient";
import { apiUrl, API_CONFIG } from "@/configs/api";
import axios from "axios";

export const metadata = {
  title: "Kasuwar Zamani - Your One-Stop Online Shop",
  description:
    "Discover a wide range of products on Kasuwar Zamani. From electronics to fashion, find everything you need with fast delivery.",
};

const fetchBanners = async () => {
  try {
    const response = await axios.get(
      apiUrl(API_CONFIG.ENDPOINTS.BANNERS.GET_ALL),
      {
        withCredentials: true,
      }
    );
    return response.data.banners || [];
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
};

const Home = async () => {
  const banners = await fetchBanners();
  return <HomeClient initialBanners={banners} />;
};

export default Home;

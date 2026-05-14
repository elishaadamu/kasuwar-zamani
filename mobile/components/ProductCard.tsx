import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 24;

export default function ProductCard({ product }: { product: any }) {
  const { currency, router, addToWishlist, wishlistItems, isLoggedIn, addToCart } = useAppContext();

  const productImage =
    (product?.image && product.image.length > 0 ? product.image[0] : null) ||
    (product?.images && product.images.length > 0 ? product.images[0]?.url : null) ||
    "https://picsum.photos/seed/product/400/400";

  const handleWishlistClick = () => {
    if (!isLoggedIn) {
      router.push('/(auth)/signin');
      return;
    }
    addToWishlist(product._id);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (!isLoggedIn) {
      router.push('/(auth)/signin');
      return;
    }
    addToCart(product._id);
  };

  const hasOffer = product.offerPrice && product.offerPrice < product.price;
  const isOutOfStock = product.stock === 0 || product.quantity === 0;
  const isFeatured = product.isFeatured || product.featured;

  return (
    <TouchableOpacity 
      className="bg-white rounded-[40px] border border-slate-100 mb-4 overflow-hidden shadow-sm"
      style={{ width: COLUMN_WIDTH }}
      onPress={() => router.push(`/product/${product._id}`)}
      activeOpacity={0.9}
    >
      <View className="w-full aspect-square p-2 relative">
        <Image 
          source={{ uri: productImage.includes("cloudinary.com") ? `${productImage}?q_auto,f_auto` : productImage }} 
          className="w-full h-full rounded-[32px]"
          resizeMode="cover"
        />
        
        {isFeatured && (
          <View className="absolute top-4 left-4 bg-indigo-600 px-2 py-1 rounded-full z-10">
            <Text className="text-white text-[8px] font-black uppercase tracking-wider">Featured</Text>
          </View>
        )}

        <TouchableOpacity 
          className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full justify-center items-center z-10 shadow-sm"
          onPress={handleWishlistClick}
        >
          <Ionicons 
            name={wishlistItems.includes(product._id) ? "heart" : "heart-outline"} 
            size={18} 
            color={wishlistItems.includes(product._id) ? "#ef4444" : "#94a3b8"} 
          />
        </TouchableOpacity>

        {isOutOfStock && (
          <View className="absolute inset-2 bg-black/40 justify-center items-center rounded-[32px]">
            <View className="bg-white/90 px-3 py-1 rounded-full">
              <Text className="text-red-600 text-[9px] font-black uppercase">Sold Out</Text>
            </View>
          </View>
        )}
      </View>

      <View className="p-4 pt-1">
        <Text className="text-sm font-black text-slate-900 mb-1" numberOfLines={1}>{product.name}</Text>
        
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-base font-black text-slate-900">
              {currency}{hasOffer ? product.offerPrice?.toLocaleString() : product.price?.toLocaleString()}
            </Text>
            {hasOffer && (
              <Text className="text-[10px] text-slate-400 line-through">
                {currency}{product.price?.toLocaleString()}
              </Text>
            )}
          </View>
          {product.condition && (
            <View className="bg-slate-50 px-2 py-0.5 rounded-md">
              <Text className="text-[8px] font-bold text-slate-500 uppercase">{product.condition}</Text>
            </View>
          )}
        </View>

        <View className="gap-y-2">
          <TouchableOpacity 
            className={`h-10 rounded-2xl justify-center items-center ${isOutOfStock ? 'bg-slate-100' : 'bg-indigo-600'}`}
            onPress={handleBuyNow}
            disabled={isOutOfStock}
          >
            <Text className={`text-[10px] font-black uppercase tracking-wider ${isOutOfStock ? 'text-slate-400' : 'text-white'}`}>Buy now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center justify-center h-10 rounded-2xl border-2 border-indigo-50"
            onPress={() => {}}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={14} color="#4f46e5" />
            <Text className="ml-2 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

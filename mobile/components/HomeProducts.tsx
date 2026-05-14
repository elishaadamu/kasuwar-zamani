import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppContext } from '../context/AppContext';
import ProductCard from './ProductCard';

export default function HomeProducts() {
  const { products, productsLoading, router } = useAppContext();

  if (productsLoading && products.length === 0) {
    return (
      <View className="py-20 items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="w-full py-4">
      <View className="flex-row justify-between items-center px-5 mb-5">
        <View className="flex-row items-center gap-x-3">
          <View className="w-8 h-8 bg-indigo-50 rounded-xl justify-center items-center">
            <View className="w-3 h-3 bg-indigo-600 rounded-full" />
          </View>
          <Text className="text-2xl font-black text-slate-900 tracking-tighter">Trending Now</Text>
        </View>
        
        {products.length > 4 && (
          <TouchableOpacity 
            onPress={() => router.push('/all-products')}
            className="px-4 py-2 rounded-full bg-white border border-slate-200"
          >
            <Text className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Explore All →</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row flex-wrap px-4 justify-between">
        {products.slice(0, 8).map((product: any, index: number) => (
          <ProductCard key={product._id || index} product={product} />
        ))}
      </View>
    </View>
  );
}

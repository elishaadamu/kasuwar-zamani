import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import HomeProducts from '../../components/HomeProducts';

export default function HomeScreen() {
  const { userData, isLoggedIn, router, categories, categoriesLoading } = useAppContext();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Search Header */}
      <View className="flex-row items-center px-5 py-3 gap-x-3 bg-white border-b border-slate-100 shadow-sm">
        <View className="flex-1 flex-row items-center bg-slate-50 rounded-2xl px-4 h-11 gap-x-2 border border-slate-200">
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput 
            placeholder="Search products..." 
            className="flex-1 text-sm text-slate-900 font-medium"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <TouchableOpacity className="w-11 h-11 bg-slate-50 rounded-2xl justify-center items-center border border-slate-200">
          <Ionicons name="notifications-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        
        {/* Welcome Section */}
        <View className="flex-row justify-between items-center px-5 py-6">
          <View>
            <Text className="text-2xl font-black text-slate-900 tracking-tighter">
              {isLoggedIn ? `Hello, ${userData?.name?.split(' ')[0] || 'User'} 👋` : 'Welcome! 👋'}
            </Text>
            <Text className="text-sm text-slate-500 font-medium mt-0.5">Find your urban lifestyle</Text>
          </View>
          {!isLoggedIn && (
            <TouchableOpacity 
              className="bg-indigo-600 px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-200"
              onPress={() => router.push('/(auth)/signin')}
            >
              <Text className="text-white text-xs font-black uppercase tracking-wider">Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hero Banner Area */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }} className="mb-6">
          <View className="w-[300px] h-48 bg-indigo-600 rounded-[40px] p-7 justify-center mr-4 relative overflow-hidden shadow-xl shadow-indigo-200">
             <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-4">
                <Text className="text-white text-[9px] font-black uppercase tracking-widest">Trending Now</Text>
             </View>
             <Text className="text-3xl font-black text-white leading-[34px] tracking-tighter mb-4">Urban{"\n"}Lifestyle</Text>
             <TouchableOpacity className="bg-white self-start px-5 py-2.5 rounded-2xl">
                <Text className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Shop Collection</Text>
             </TouchableOpacity>
          </View>

          <View className="w-[300px] h-48 bg-slate-900 rounded-[40px] p-7 justify-center mr-4 shadow-xl shadow-slate-200">
             <View className="bg-white/10 self-start px-3 py-1 rounded-full mb-4">
                <Text className="text-slate-300 text-[9px] font-black uppercase tracking-widest">Limited Offer</Text>
             </View>
             <Text className="text-3xl font-black text-white leading-[34px] tracking-tighter mb-4">Gadget{"\n"}Madness</Text>
             <TouchableOpacity className="bg-indigo-600 self-start px-5 py-2.5 rounded-2xl">
                <Text className="text-white text-[10px] font-black uppercase tracking-widest">Explore All</Text>
             </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Categories */}
        <View className="mb-6">
          <Text className="text-lg font-black text-slate-900 px-5 mb-4 tracking-tight">Browse Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}>
            <TouchableOpacity className="bg-white px-6 py-3.5 rounded-2xl mr-3 border border-indigo-100 shadow-sm">
              <Text className="text-sm font-black text-indigo-600 uppercase tracking-wider">All</Text>
            </TouchableOpacity>
            {categoriesLoading ? (
              <ActivityIndicator color="#4f46e5" className="ml-5" />
            ) : (
              categories.map((cat: any) => (
                <TouchableOpacity 
                  key={cat._id} 
                  className="bg-white px-6 py-3.5 rounded-2xl mr-3 border border-slate-100 shadow-sm"
                  onPress={() => router.push(`/category/${cat.name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`)}
                >
                  <Text className="text-sm font-black text-slate-600 uppercase tracking-wider">{cat.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Main Products Section */}
        <HomeProducts />

      </ScrollView>
    </SafeAreaView>
  );
}

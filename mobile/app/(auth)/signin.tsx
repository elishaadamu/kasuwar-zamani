import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { apiUrl, API_CONFIG } from '../../configs/api';
import { encryptData } from '../../lib/encryption';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../../context/AppContext';
import { customToast } from '../../lib/customToast';

export default function SigninScreen() {
  const router = useRouter();
  const { fetchUserData } = useAppContext();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignin = async () => {
    if (!phone || !password) {
      customToast.error("Validation Error", "Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      customToast.error("Password Validation", "Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNIN), { phone, password });

      const userRole = response.data?.role;
      const allowedRoles = ["user", "vendor", "delivery"];

      if (!userRole || !allowedRoles.includes(userRole)) {
        customToast.error("Access Denied", `The role "${userRole || "unknown"}" is not authorized.`);
        setLoading(false);
        return;
      }

      const encryptedUser = encryptData(response.data);
      if (encryptedUser) {
        await AsyncStorage.setItem('user', encryptedUser);
        await fetchUserData();
        customToast.success("Welcome Back!", "Signin successful!");
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error(error);
      customToast.error("Signin Failed", error.response?.data?.message || "An error occurred during signin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView
        className="flex-1 p-6"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-20 mb-12 items-center">
          <Text className="text-4xl font-black text-slate-900 tracking-tighter">Welcome Back</Text>
          <Text className="text-base text-slate-500 mt-2 font-medium">Sign in to your account</Text>
        </View>

        <View className="gap-y-6">
          <View className="gap-y-2">
            <Text className="text-[10px] font-black uppercase tracking-[1.5px] text-slate-400 ml-1">Phone Number</Text>
            <View className="flex-row items-center bg-white rounded-3xl border border-slate-200 h-16 px-5 shadow-sm">
              <Ionicons name="call-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-base text-slate-900 font-semibold"
                placeholder="e.g. 08012345678"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View className="gap-y-2">
            <Text className="text-[10px] font-black uppercase tracking-[1.5px] text-slate-400 ml-1">Password</Text>
            <View className="flex-row items-center bg-white rounded-3xl border border-slate-200 h-16 px-5 shadow-sm">
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-base text-slate-900 font-semibold"
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity className="self-end mt-1">
              <Text className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`bg-indigo-600 h-16 rounded-3xl justify-center items-center mt-4 shadow-lg shadow-indigo-200 ${loading ? 'opacity-70' : ''}`}
            onPress={handleSignin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-sm font-black uppercase tracking-[2px]">Secure Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-4 mb-10">
            <Text className="text-slate-500 font-medium">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text className="text-indigo-600 font-bold">Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

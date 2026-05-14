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

export default function SignupScreen() {
  const router = useRouter();
  const { fetchUserData } = useAppContext();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    appliedReferralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const evaluatePassword = (pwd: string) => {
    if (!pwd) return { strength: 0, text: "", color: "bg-slate-200", message: "" };
    if (pwd.length < 6) return { strength: 1, text: "Weak", color: "bg-red-500", border: 'border-red-500', message: "Min 6 characters required." };
    if (/^[A-Za-z]+$/.test(pwd)) return { strength: 1, text: "Weak", color: "bg-red-500", border: 'border-red-500', message: "Add numbers for security." };
    if (/^[0-9]+$/.test(pwd)) return { strength: 2, text: "Medium", color: "bg-amber-500", border: 'border-amber-500', message: "Mix text for stronger security." };
    if (/[A-Za-z]/.test(pwd) && /[0-9]/.test(pwd)) return { strength: 3, text: "Strong", color: "bg-emerald-500", border: 'border-emerald-500', message: "Strong password!" };
    return { strength: 2, text: "Medium", color: "bg-amber-500", border: 'border-amber-500', message: "Good password." };
  };

  const passData = evaluatePassword(formData.password);

  const handleSignup = async () => {
    const { firstName, lastName, email, phone, password } = formData;
    if (!firstName || !lastName || !email || !phone || !password) {
      customToast.error("Validation Error", "Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      customToast.error("Password Too Short", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, referralCode: formData.appliedReferralCode };
      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP), payload);
      
      const encryptedUser = encryptData(response.data.user);
      if (encryptedUser) {
        await AsyncStorage.setItem('user', encryptedUser);
        await fetchUserData();
        customToast.success("Welcome!", "Signup successful!");
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.log('Signup Error:', error.message, 'URL:', apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP));
      customToast.error("Signup Failed", error.response?.data?.message || "An error occurred during signup.");
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
        className="flex-1 p-6 pt-16"
        contentContainerStyle={{ flexGrow: 1 }} 
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-6 self-start">
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View className="mb-10">
          <Text className="text-4xl font-black text-slate-900 tracking-tighter">Create Account</Text>
          <Text className="text-base text-slate-500 mt-2 font-medium">Join the marketplace community</Text>
        </View>

        <View className="gap-y-5">
          <View className="flex-row gap-x-4">
            <View className="flex-1 gap-y-2">
              <Text className="text-[10px] font-black uppercase tracking-[1.5px] text-slate-400 ml-1">First Name</Text>
              <View className="bg-white rounded-3xl border border-slate-200 h-14 px-5 shadow-sm justify-center">
                <TextInput
                  className="text-base text-slate-900 font-semibold"
                  placeholder="John"
                  value={formData.firstName}
                  onChangeText={(v) => setFormData({...formData, firstName: v})}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
            <View className="flex-1 gap-y-2">
              <Text className="text-[10px] font-black uppercase tracking-[1.5px] text-slate-400 ml-1">Last Name</Text>
              <View className="bg-white rounded-3xl border border-slate-200 h-14 px-5 shadow-sm justify-center">
                <TextInput
                  className="text-base text-slate-900 font-semibold"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChangeText={(v) => setFormData({...formData, lastName: v})}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
          </View>

          <View className="gap-y-2">
            <Text className="text-[10px] font-black uppercase tracking-[1.5px] text-slate-400 ml-1">Email Address</Text>
            <View className="flex-row items-center bg-white rounded-3xl border border-slate-200 h-14 px-5 shadow-sm">
              <Ionicons name="mail-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-base text-slate-900 font-semibold"
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(v) => setFormData({...formData, email: v})}
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View className="gap-y-2">
            <Text className="text-[10px] font-black uppercase tracking-[1.5px] text-slate-400 ml-1">Phone Number</Text>
            <View className="flex-row items-center bg-white rounded-3xl border border-slate-200 h-14 px-5 shadow-sm">
              <Ionicons name="call-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-base text-slate-900 font-semibold"
                placeholder="08012345678"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(v) => setFormData({...formData, phone: v})}
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View className="gap-y-2">
            <View className="flex-row justify-between items-center px-1">
              <Text className="text-[10px] font-black uppercase tracking-[1.5px] text-slate-400">Password</Text>
              {formData.password.length > 0 && (
                <Text className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md text-white ${passData.color}`}>{passData.text}</Text>
              )}
            </View>
            <View className={`flex-row items-center bg-white rounded-3xl border h-14 px-5 shadow-sm ${formData.password ? passData.border : 'border-slate-200'}`}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-base text-slate-900 font-semibold"
                placeholder="Secure password"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(v) => setFormData({...formData, password: v})}
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            
            {formData.password.length > 0 && (
              <View className="mt-1 px-1">
                <View className="h-1 bg-slate-100 rounded-full overflow-hidden mb-1">
                  <View className={`h-full ${passData.color}`} style={{ width: `${(passData.strength / 3) * 100}%` }} />
                </View>
                <Text className="text-[10px] font-semibold text-slate-500">{passData.message}</Text>
              </View>
            )}
          </View>

          <View className="gap-y-2">
            <View className="flex-row justify-between items-center px-1">
              <Text className="text-[10px] font-black uppercase tracking-[1.5px] text-slate-400">Referral Code</Text>
              <Text className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Optional</Text>
            </View>
            <View className="flex-row items-center bg-white rounded-3xl border border-slate-200 h-14 px-5 shadow-sm">
              <Ionicons name="gift-outline" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-base text-slate-900 font-semibold"
                placeholder="Got a code?"
                value={formData.appliedReferralCode}
                onChangeText={(v) => setFormData({...formData, appliedReferralCode: v})}
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <TouchableOpacity 
            className={`bg-slate-900 h-16 rounded-3xl justify-center items-center mt-4 shadow-lg ${loading ? 'opacity-70' : ''}`}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-sm font-black uppercase tracking-[1.5px]">Create Account</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-2 mb-12">
            <Text className="text-slate-500 font-medium">Already a member? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
              <Text className="text-indigo-600 font-bold">Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

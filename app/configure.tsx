import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ShoppingBag,
  Tag,
  ArrowRight,
  Palette,
  Sliders,
  Lock,
  Sparkles,
} from 'lucide-react-native';
import { useImageStore } from '../src/store/useImageStore';
import { MARKETPLACE_PRESETS, MarketplacePreset } from '../src/presets/marketplace';
import { SKUInputModal } from '../src/components/SKUInputModal';
import { PaywallModal } from '../src/components/PaywallModal';

export default function ConfigureScreen() {
  const router = useRouter();
  const {
    images,
    selectedPreset,
    bgColor,
    skuPrefix,
    compressionQuality,
    isPro,
    setSelectedPreset,
    setBgColor,
    setCompressionQuality,
  } = useImageStore();

  const [skuModalVisible, setSkuModalVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);

  if (images.length === 0) {
    router.replace('/');
    return null;
  }

  const bgColors = [
    { label: 'Pure White (Amazon)', hex: '#FFFFFF' },
    { label: 'Soft White (Etsy)', hex: '#F8FAFC' },
    { label: 'Studio Gray', hex: '#F1F5F9' },
    { label: 'Pitch Black', hex: '#000000' },
  ];

  const qualities = [
    { label: 'Max (95%)', val: 0.95 },
    { label: 'Optimal (85%)', val: 0.85 },
    { label: 'Fast (75%)', val: 0.75 },
  ];

  const handleSelectPreset = (p: MarketplacePreset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (p.isProOnly && !isPro) {
      setPaywallVisible(true);
      return;
    }
    setSelectedPreset(p);
  };

  const handleStartProcessing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/processing');
  };

  return (
    <View className="flex-1 bg-slate-950 px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Marketplace Presets */}
        <View className="mt-4 mb-5">
          <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Target Marketplace Preset
          </Text>
          <View className="space-y-2.5">
            {MARKETPLACE_PRESETS.map((p) => {
              const isSelected = selectedPreset.id === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => handleSelectPreset(p)}
                  activeOpacity={0.8}
                  className={`p-4 rounded-2xl border mb-2.5 flex-row items-center justify-between ${
                    isSelected
                      ? 'bg-blue-950/60 border-blue-500'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center">
                      <Text className="text-white font-bold text-base mr-2">{p.name}</Text>
                      <View className="bg-slate-800 px-2 py-0.5 rounded">
                        <Text className="text-slate-300 text-xs font-mono">
                          {p.width}×{p.height} ({p.aspectRatio})
                        </Text>
                      </View>
                    </View>
                    <Text className="text-slate-400 text-xs mt-1 leading-relaxed">
                      {p.description}
                    </Text>
                  </View>

                  {p.isProOnly && !isPro && (
                    <View className="bg-amber-500/20 px-2 py-1 rounded-lg flex-row items-center">
                      <Lock size={12} color="#F59E0B" />
                      <Text className="text-amber-400 text-[10px] font-bold ml-1">PRO</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Padding Background Color */}
        <View className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4">
          <View className="flex-row items-center mb-3">
            <Palette size={16} color="#60A5FA" />
            <Text className="text-white font-bold text-sm ml-2">Canvas Padding Color</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {bgColors.map((c) => {
              const isSelected = bgColor === c.hex;
              return (
                <TouchableOpacity
                  key={c.hex}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setBgColor(c.hex);
                  }}
                  className={`flex-row items-center px-3 py-2 rounded-xl border ${
                    isSelected ? 'border-blue-500 bg-blue-950/40' : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <View
                    style={{ backgroundColor: c.hex }}
                    className="w-4 h-4 rounded-full border border-slate-700 mr-2"
                  />
                  <Text className="text-slate-300 text-xs font-medium">{c.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SKU Sequencing */}
        <TouchableOpacity
          onPress={() => setSkuModalVisible(true)}
          activeOpacity={0.8}
          className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center flex-1 mr-3">
            <View className="bg-slate-800 p-2 rounded-xl mr-3">
              <Tag size={18} color="#60A5FA" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm">SKU Naming Prefix</Text>
              <Text className="text-slate-400 text-xs mt-0.5 font-mono">
                Current: {skuPrefix}_01.jpg, {skuPrefix}_02.jpg ...
              </Text>
            </View>
          </View>
          <View className="bg-slate-800 px-3 py-1.5 rounded-lg">
            <Text className="text-blue-400 text-xs font-semibold">Change</Text>
          </View>
        </TouchableOpacity>

        {/* Compression Quality */}
        <View className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6">
          <View className="flex-row items-center mb-3">
            <Sliders size={16} color="#34D399" />
            <Text className="text-white font-bold text-sm ml-2">JPEG Compression Quality</Text>
          </View>
          <View className="flex-row justify-between">
            {qualities.map((q) => {
              const isSelected = compressionQuality === q.val;
              return (
                <TouchableOpacity
                  key={q.val}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCompressionQuality(q.val);
                  }}
                  className={`flex-1 mx-1 py-2.5 rounded-xl border items-center ${
                    isSelected ? 'border-blue-500 bg-blue-950/40' : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <Text className={`text-xs font-bold ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                    {q.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Start Action Button */}
        <TouchableOpacity
          onPress={handleStartProcessing}
          activeOpacity={0.85}
          className="bg-blue-600 active:bg-blue-500 p-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-500/20"
        >
          <ShoppingBag size={20} color="#FFFFFF" />
          <Text className="text-white font-bold text-base ml-2 mr-2">
            Process {images.length} Images ({selectedPreset.platform})
          </Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <SKUInputModal visible={skuModalVisible} onClose={() => setSkuModalVisible(false)} />
      <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </View>
  );
}

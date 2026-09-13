import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ShoppingBag,
  Tag,
  Palette,
  Sliders,
  Lock,
} from 'lucide-react-native';
import { useImageStore } from '../src/store/useImageStore';
import { MARKETPLACE_PRESETS, MarketplacePreset } from '../src/presets/marketplace';
import { SKUInputModal } from '../src/components/SKUInputModal';
import { PaywallModal } from '../src/components/PaywallModal';
import { t } from '../src/i18n';
import { ForwardArrow } from '../src/components/DirectionalIcons';
import { useTheme } from '../src/theme/useTheme';

export default function ConfigureScreen() {
  const theme = useTheme();
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
    { label: t('colorWhite'), hex: '#FFFFFF' },
    { label: t('colorSoftWhite'), hex: '#F8FAFC' },
    { label: t('colorGray'), hex: '#F1F5F9' },
    { label: t('colorBlack'), hex: '#000000' },
  ];

  const qualities = [
    { label: t('qualityMax'), val: 0.95 },
    { label: t('qualityOptimal'), val: 0.85 },
    { label: t('qualityFast'), val: 0.75 },
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
    <View className="flex-1 px-5" style={{ backgroundColor: theme.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Marketplace Presets */}
        <View className="mt-4 mb-5">
          <Text className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: theme.textSecondary }}>
            {t('targetPreset')}
          </Text>
          <View className="flex-col gap-2.5">
            {MARKETPLACE_PRESETS.map((p) => {
              const isSelected = selectedPreset.id === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => handleSelectPreset(p)}
                  activeOpacity={0.8}
                  className="p-4 rounded-2xl border mb-2.5 flex-row items-center justify-between"
                  style={{
                    backgroundColor: isSelected ? theme.primaryLight : theme.card,
                    borderColor: isSelected ? theme.primary : theme.cardBorder,
                  }}
                >
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center">
                      <Text className="font-bold text-base mr-2" style={{ color: theme.text }}>{p.name}</Text>
                      <View className="px-2 py-0.5 rounded" style={{ backgroundColor: theme.controlSurface }}>
                        <Text className="text-xs font-mono" style={{ color: theme.textSecondary }}>
                          {p.width}×{p.height} ({p.aspectRatio})
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs mt-1 leading-relaxed" style={{ color: theme.textSecondary }}>
                      {p.description}
                    </Text>
                  </View>

                  {p.isProOnly && !isPro && (
                    <View className="bg-amber-500/20 px-2 py-1 rounded-lg flex-row items-center">
                      <Lock size={12} color={theme.warning} />
                      <Text className="text-[10px] font-bold ml-1" style={{ color: theme.warning }}>{t('proBadge')}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Padding Background Color */}
        <View className="border p-4 rounded-2xl mb-4" style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}>
          <View className="flex-row items-center mb-3">
            <Palette size={16} color={theme.primary} />
            <Text className="font-bold text-sm ml-2" style={{ color: theme.text }}>{t('canvasBgColor')}</Text>
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
                  className="flex-row items-center px-3 py-2 rounded-xl border"
                  style={{
                    backgroundColor: isSelected ? theme.primaryLight : theme.background,
                    borderColor: isSelected ? theme.primary : theme.cardBorder,
                  }}
                >
                  <View
                    className="w-4 h-4 rounded-full border mr-2" style={{ borderColor: theme.cardBorder, backgroundColor: c.hex }}
                  />
                  <Text className="text-xs font-medium" style={{ color: theme.textSecondary }}>{c.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SKU Sequencing */}
        <TouchableOpacity
          onPress={() => setSkuModalVisible(true)}
          activeOpacity={0.8}
          className="border p-4 rounded-2xl mb-4 flex-row items-center justify-between" style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
        >
          <View className="flex-row items-center flex-1 mr-3">
            <View className="p-2 rounded-xl mr-3" style={{ backgroundColor: theme.controlSurface }}>
              <Tag size={18} color={theme.primary} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-sm" style={{ color: theme.text }}>{t('skuRenaming')}</Text>
              <Text className="text-xs mt-0.5 font-mono" style={{ color: theme.textSecondary }}>
                {t('skuPrefixLabel', { prefix: skuPrefix })}
              </Text>
            </View>
          </View>
          <View className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: theme.controlSurface }}>
            <Text className="text-xs font-semibold" style={{ color: theme.primary }}>{t('changePrefix')}</Text>
          </View>
        </TouchableOpacity>

        {/* Compression Quality */}
        <View className="border p-4 rounded-2xl mb-6" style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}>
          <View className="flex-row items-center mb-3">
            <Sliders size={16} color={theme.success} />
            <Text className="font-bold text-sm ml-2" style={{ color: theme.text }}>{t('compressionRatio')}</Text>
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
                  className="flex-1 mx-1 py-2.5 rounded-xl border items-center"
                  style={{
                    backgroundColor: isSelected ? theme.primaryLight : theme.background,
                    borderColor: isSelected ? theme.primary : theme.cardBorder,
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: isSelected ? theme.primary : theme.textSecondary }}
                  >
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
          <ShoppingBag size={20} color={theme.onPrimary} />
          <Text className="font-bold text-base ml-2 mr-2" style={{ color: theme.onPrimary }}>
            {t('processBatch', { count: images.length })} ({selectedPreset.platform})
          </Text>
          <ForwardArrow size={18} color={theme.onPrimary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <SKUInputModal visible={skuModalVisible} onClose={() => setSkuModalVisible(false)} />
      <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </View>
  );
}

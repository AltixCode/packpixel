import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Layers,
  ShieldCheck,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { useImageStore, ImageAsset } from '../src/store/useImageStore';
import { ImagePreviewCard } from '../src/components/ImagePreviewCard';
import { PaywallModal } from '../src/components/PaywallModal';
import { t } from '../src/i18n';

export default function HomeScreen() {
  const router = useRouter();
  const { images, isPro, addImages, removeImage, clearImages } = useImageStore();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [isPicking, setIsPicking] = useState(false);

  const FREE_LIMIT = 10;
  const isOverFreeLimit = !isPro && images.length > FREE_LIMIT;

  const handlePickImages = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsPicking(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newAssets: ImageAsset[] = result.assets.map((a, idx) => ({
          id: `img_${Date.now()}_${idx}`,
          uri: a.uri,
          width: a.width || 1200,
          height: a.height || 1200,
          fileName: a.fileName || undefined,
          fileSize: a.fileSize,
        }));

        if (!isPro && images.length + newAssets.length > FREE_LIMIT) {
          addImages(newAssets.slice(0, Math.max(0, FREE_LIMIT - images.length)));
          setPaywallVisible(true);
        } else {
          addImages(newAssets);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch {
      Alert.alert(t('selectionError'), t('selectionErrorDesc'));
    } finally {
      setIsPicking(false);
    }
  };

  const handleProceed = () => {
    if (images.length === 0) return;
    if (isOverFreeLimit) {
      setPaywallVisible(true);
      return;
    }
    router.push('/configure');
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-slate-950 px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header Hero */}
        <View className="mt-4 mb-5">
          <View className="inline-flex self-start bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full mb-3 flex-row items-center">
            <Sparkles size={12} color="#60A5FA" />
            <Text className="text-blue-400 text-xs font-semibold ml-1.5">
              {t('heroBadge')}
            </Text>
          </View>
          <Text className="text-3xl font-extrabold text-white tracking-tight">
            {t('heroTitle')}
          </Text>
          <Text className="text-slate-400 text-sm mt-1.5 leading-relaxed">
            {t('heroSubtitle')}
          </Text>
        </View>

        {/* Selected Images Grid Card */}
        {images.length > 0 ? (
          <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-5">
            <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <View className="flex-row items-center">
                <Text className="text-white font-bold text-base mr-2">
                  {t('batchQueue', { count: images.length })}
                </Text>
                {!isPro && (
                  <View className="bg-slate-800 px-2 py-0.5 rounded-md">
                    <Text className="text-slate-400 text-[10px] font-mono">
                      {t('freeLimit', { count: images.length, limit: FREE_LIMIT })}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={handlePickImages}
                  disabled={isPicking}
                  className="bg-slate-800 p-2 rounded-xl mr-2"
                >
                  <Plus size={16} color="#60A5FA" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={clearImages}
                  className="bg-slate-800 p-2 rounded-xl"
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Thumbnail Grid */}
            <View className="flex-row flex-wrap justify-between">
              {images.map((img, idx) => (
                <ImagePreviewCard
                  key={img.id}
                  image={img}
                  index={idx}
                  onRemove={removeImage}
                />
              ))}
            </View>

            {/* Proceed CTA */}
            <TouchableOpacity
              onPress={handleProceed}
              activeOpacity={0.85}
              className="mt-4 bg-blue-600 active:bg-blue-500 py-3.5 px-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-blue-500/20"
            >
              <Text className="text-white font-bold text-base mr-2">
                {t('configureBatch', { count: images.length })}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          /* Empty State / Add Photos */
          <TouchableOpacity
            onPress={handlePickImages}
            disabled={isPicking}
            activeOpacity={0.85}
            className="border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-3xl p-8 items-center justify-center my-3"
          >
            <View className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-full mb-4">
              <ShoppingBag size={36} color="#60A5FA" />
            </View>
            <Text className="text-white font-bold text-lg text-center mb-1">
              {t('selectPhotosPrompt')}
            </Text>
            <Text className="text-slate-400 text-xs text-center max-w-xs leading-relaxed">
              {t('selectPhotosDesc')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Feature Highlights */}
        <View className="mt-4 flex-col gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            {t('archGuarantees')}
          </Text>

          <View className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex-row items-start mb-3">
            <View className="bg-blue-500/10 p-2 rounded-xl mr-3">
              <Layers size={18} color="#60A5FA" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm">{t('canvasAspect')}</Text>
              <Text className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                {t('canvasAspectDesc')}
              </Text>
            </View>
          </View>

          <View className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex-row items-start mb-3">
            <View className="bg-emerald-500/10 p-2 rounded-xl mr-3">
              <ShieldCheck size={18} color="#34D399" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm">{t('exifPrivacy')}</Text>
              <Text className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                {t('exifPrivacyDesc')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Embedded Paywall Modal */}
      <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </SafeAreaView>
  );
}

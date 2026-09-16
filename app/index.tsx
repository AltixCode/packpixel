import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import {
  Sparkles,
  ShoppingBag,
  Layers,
  ShieldCheck,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { useImageStore, ImageAsset } from '../src/store/useImageStore';
import { ImagePreviewCard } from '../src/components/ImagePreviewCard';
import { PaywallModal } from '../src/components/PaywallModal';
import { t } from '../src/i18n';
import { ForwardArrow } from '../src/components/DirectionalIcons';
import { useTheme } from '../src/theme/useTheme';
import { useTabletColumn } from '../src/theme/useTabletColumn';
import { AdBanner } from '../src/components/AdBanner';
import { useAdsStore } from '../src/store/adsStore';
import { showPrivacyOptionsForm } from '../src/services/ads';

export default function HomeScreen() {
  // Google requires a persistent entry back into the consent form wherever UMP reports that
  // privacy options are available, which in practice means the EEA and the regulated US
  // states. It is absent everywhere else rather than shown as a dead control.
  const offerPrivacyOptions = useAdsStore((state) => state.consent.offerPrivacyOptions);
  const theme = useTheme();
  const tabletColumn = useTabletColumn();
  const router = useRouter();
  const { images, isPro, addImages, removeImage, clearImages } = useImageStore();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [isPicking, setIsPicking] = useState(false);

  const FREE_LIMIT = 10;
  // The picker already truncates a free user's selection to FREE_LIMIT, so this
  // is not the primary enforcement -- it catches the queue and the entitlement
  // disagreeing, which happens when a Pro user fills the queue and a later
  // entitlement refresh comes back false (an expired receipt, or a failed
  // RevenueCat call). Without it that queue would process past the free limit.
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
    <SafeAreaView edges={['bottom']} className="flex-1 px-5" style={{ backgroundColor: theme.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 , ...tabletColumn}}>
        {/* Header Hero */}
        <View className="mt-4 mb-5">
          <View className="inline-flex self-start bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full mb-3 flex-row items-center">
            <Sparkles size={12} color={theme.primary} />
            <Text className="text-xs font-semibold ml-1.5" style={{ color: theme.primary }}>
              {t('heroBadge')}
            </Text>
          </View>
          <Text className="text-3xl font-extrabold tracking-tight" style={{ color: theme.text }}>
            {t('heroTitle')}
          </Text>
          <Text className="text-sm mt-1.5 leading-relaxed" style={{ color: theme.textSecondary }}>
            {t('heroSubtitle')}
          </Text>
        </View>

        {/* Selected Images Grid Card */}
        {images.length > 0 ? (
          <View className="border rounded-3xl p-5 mb-5" style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}>
            <View className="flex-row items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: theme.cardBorder }}>
              <View className="flex-row items-center">
                <Text className="font-bold text-base mr-2" style={{ color: theme.text }}>
                  {t('batchQueue', { count: images.length })}
                </Text>
                {!isPro && (
                  <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: theme.controlSurface }}>
                    <Text className="text-[10px] font-mono" style={{ color: theme.textSecondary }}>
                      {t('freeLimit', { count: images.length, limit: FREE_LIMIT })}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={handlePickImages}
                  disabled={isPicking}
                  className="p-2 rounded-xl mr-2" style={{ backgroundColor: theme.controlSurface }}
                >
                  <Plus size={16} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={clearImages}
                  className="p-2 rounded-xl" style={{ backgroundColor: theme.controlSurface }}
                >
                  <Trash2 size={16} color={theme.danger} />
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
              <Text className="font-bold text-base mr-2" style={{ color: theme.onPrimary }}>
                {t('configureBatch', { count: images.length })}
              </Text>
              <ForwardArrow size={18} color={theme.onPrimary} />
            </TouchableOpacity>
          </View>
        ) : (
          /* Empty State / Add Photos */
          <TouchableOpacity
            onPress={handlePickImages}
            disabled={isPicking}
            activeOpacity={0.85}
            className="border-2 border-dashed rounded-3xl p-8 items-center justify-center my-3"
            style={{ borderColor: theme.cardBorder, backgroundColor: theme.surface }}
          >
            <View className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-full mb-4">
              <ShoppingBag size={36} color={theme.primary} />
            </View>
            <Text className="font-bold text-lg text-center mb-1" style={{ color: theme.text }}>
              {t('selectPhotosPrompt')}
            </Text>
            <Text className="text-xs text-center max-w-xs leading-relaxed" style={{ color: theme.textSecondary }}>
              {t('selectPhotosDesc')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Feature Highlights */}
        <View className="mt-4 flex-col gap-3">
          <Text className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: theme.textMuted }}>
            {t('archGuarantees')}
          </Text>

          <View className="border p-4 rounded-2xl flex-row items-start mb-3" style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}>
            <View className="bg-blue-500/10 p-2 rounded-xl mr-3">
              <Layers size={18} color={theme.primary} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-sm" style={{ color: theme.text }}>{t('canvasAspect')}</Text>
              <Text className="text-xs mt-0.5 leading-relaxed" style={{ color: theme.textSecondary }}>
                {t('canvasAspectDesc')}
              </Text>
            </View>
          </View>

          <View className="border p-4 rounded-2xl flex-row items-start mb-3" style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}>
            <View className="bg-emerald-500/10 p-2 rounded-xl mr-3">
              <ShieldCheck size={18} color={theme.success} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-sm" style={{ color: theme.text }}>{t('exifPrivacy')}</Text>
              <Text className="text-xs mt-0.5 leading-relaxed" style={{ color: theme.textSecondary }}>
                {t('exifPrivacyDesc')}
              </Text>
            </View>
          </View>
        </View>
        {offerPrivacyOptions ? (
          <TouchableOpacity
            onPress={() => {
              void showPrivacyOptionsForm();
            }}
            accessibilityRole="button"
            className="mt-2 py-3 items-center"
            style={{ minHeight: 44 }}
          >
            <Text className="text-xs font-semibold underline" style={{ color: theme.textSecondary }}>
              {t('adPrivacySettings')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
      {/* Anchored below the scroll area rather than inside it: a banner that scrolls with the
          content can sit under a finger reaching for the button above it. */}
      <AdBanner />

      {/* Embedded Paywall Modal */}
      <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </SafeAreaView>
  );
}

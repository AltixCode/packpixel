import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ImagePlus,
  Layers,
  ShoppingBag,
  Tag,
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  X,
} from "lucide-react-native";
import { usePaywall } from "../src/hooks/usePaywall";
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from "../src/config/legal";
import { t } from "../src/i18n";
import { useTheme } from '../src/theme/useTheme';
import { useTabletColumn } from '../src/theme/useTabletColumn';

export default function PaywallScreen() {
  const theme = useTheme();
  const tabletColumn = useTabletColumn(640);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ctaLabel, loading, errorMsg, handlePurchase, handleRestore } =
    usePaywall(() => router.back());

  const tiles = [
    { icon: <BadgeCheck size={22} color={theme.primary} />, tint: theme.primaryLight, title: t("featAdsTitle"), desc: t("featAdsDesc") },
    { icon: <Layers size={22} color={theme.accent} />, tint: theme.accentLight, title: t("feat1Title"), desc: t("feat1Desc") },
    { icon: <ShoppingBag size={22} color={theme.purple} />, tint: theme.controlSurface, title: t("feat2Title"), desc: t("feat2Desc") },
    { icon: <Tag size={22} color={theme.warning} />, tint: theme.warningLight, title: t("feat3Title"), desc: t("feat3Desc") },
    { icon: <ShieldCheck size={22} color={theme.success} />, tint: theme.successLight, title: t("feat4Title"), desc: t("feat4Desc") },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View
        className="px-6 pb-5"
        style={{ paddingTop: insets.top + 12, backgroundColor: theme.primaryLight }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t("cancel")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="absolute right-5 rounded-full p-2"
          style={{ top: insets.top + 8, backgroundColor: theme.card }}
        >
          <X size={18} color={theme.textMuted} />
        </TouchableOpacity>
        <ImagePlus size={28} color={theme.primary} />
        <Text className="mt-2 text-2xl font-extrabold" style={{ color: theme.text }}>
          {t("paywallTitle")}
        </Text>
        <Text className="mt-1 text-xs leading-relaxed" style={{ color: theme.textSecondary }}>
          {t("antiSubDesc")}
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ ...tabletColumn, paddingTop: 20 }}>
          <View className="flex-row flex-wrap px-4" style={{ gap: 12 }}>
            {tiles.map((f) => (
              <View
                key={f.title}
                className="rounded-2xl p-4"
                style={{ backgroundColor: f.tint, width: '47%' }}
              >
                <View className="mb-2.5 h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: theme.card }}>
                  {f.icon}
                </View>
                <Text className="text-sm font-bold" style={{ color: theme.text }}>{f.title}</Text>
                <Text className="mt-1 text-xs leading-relaxed" style={{ color: theme.textSecondary }}>
                  {f.desc}
                </Text>
              </View>
            ))}
          </View>

          {errorMsg ? (
            <Text
              accessibilityRole="alert"
              className="mt-4 px-4 text-center text-xs" style={{ color: theme.danger }}
            >
              {errorMsg}
            </Text>
          ) : null}
        </ScrollView>

        <View
          className="px-6 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        >
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
            accessibilityState={{ disabled: loading, busy: loading }}
            className={`min-h-[56px] flex-row items-center justify-center rounded-full p-4 ${
              loading ? "bg-blue-900" : "bg-blue-600 active:bg-blue-500"
            }`}
          >
            {loading ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <>
                <Text className="mr-2 text-base font-extrabold" style={{ color: theme.onPrimary }}>
                  {ctaLabel}
                </Text>
                <ArrowRight size={18} color={theme.onPrimary} strokeWidth={3} />
              </>
            )}
          </TouchableOpacity>

          <View className="mt-4 flex-row items-center justify-center gap-5">
            <TouchableOpacity
              onPress={handleRestore}
              disabled={loading}
              accessibilityRole="button"
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              <Text className="text-xs underline" style={{ color: theme.textSecondary }}>
                {t("restorePurchases")}
              </Text>
            </TouchableOpacity>
            <Text className="text-xs" style={{ color: theme.textMuted }}>•</Text>
            <Text className="text-xs" style={{ color: theme.textMuted }}>{t("oneTimePayment")}</Text>
          </View>

          <View className="mt-3 flex-row items-center justify-center gap-5">
            <TouchableOpacity
              onPress={() => Linking.openURL(TERMS_OF_USE_URL)}
              accessibilityRole="link"
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              <Text className="text-xs underline" style={{ color: theme.textMuted }}>
                {t("termsOfUse")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
              accessibilityRole="link"
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              <Text className="text-xs underline" style={{ color: theme.textMuted }}>
                {t("privacyPolicy")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

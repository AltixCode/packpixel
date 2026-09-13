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
  Sparkles,
  Layers,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Check,
  X,
} from "lucide-react-native";
import { usePaywall } from "../src/hooks/usePaywall";
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from "../src/config/legal";
import { t } from "../src/i18n";

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ctaLabel, loading, errorMsg, handlePurchase, handleRestore } =
    usePaywall(() => router.back());

  const features = [
    {
      icon: <Layers size={20} color="#38BDF8" />,
      title: t("feat1Title"),
      desc: t("feat1Desc"),
    },
    {
      icon: <ShoppingBag size={20} color="#A855F7" />,
      title: t("feat2Title"),
      desc: t("feat2Desc"),
    },
    {
      icon: <Tag size={20} color="#F59E0B" />,
      title: t("feat3Title"),
      desc: t("feat3Desc"),
    },
    {
      icon: <ShieldCheck size={20} color="#10B981" />,
      title: t("feat4Title"),
      desc: t("feat4Desc"),
    },
  ];

  return (
    <View className="flex-1 bg-slate-950 px-6 py-4">
      <View className="mt-2 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="mr-2.5 rounded-xl bg-blue-500/20 p-2">
            <Sparkles size={20} color="#60A5FA" />
          </View>
          <Text className="text-xl font-extrabold text-white">
            {t("paywallTitle")}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t("cancel")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="rounded-full bg-slate-900 p-2"
        >
          <X size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="mb-6 rounded-2xl border border-blue-900/60 bg-blue-950/80 p-5">
          <Text className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-400">
            {t("antiSubTitle")}
          </Text>
          <Text className="text-base font-bold leading-snug text-white">
            {t("antiSubHeadline")}
          </Text>
          <Text className="mt-2 text-xs leading-relaxed text-slate-400">
            {t("antiSubDesc")}
          </Text>
        </View>

        <View className="mb-6 gap-4">
          {features.map((f) => (
            <View key={f.title} className="flex-row items-start">
              <View className="mr-3.5 rounded-xl border border-slate-800 bg-slate-900 p-2.5">
                {f.icon}
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-white">{f.title}</Text>
                <Text className="mt-0.5 text-xs leading-relaxed text-slate-400">
                  {f.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {errorMsg ? (
          <Text
            accessibilityRole="alert"
            className="mb-3 text-center text-xs text-red-400"
          >
            {errorMsg}
          </Text>
        ) : null}
      </ScrollView>

      <View
        className="pt-2"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
      >
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={loading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
          accessibilityState={{ disabled: loading, busy: loading }}
          className={`min-h-[56px] flex-row items-center justify-center rounded-2xl p-4 ${
            loading ? "bg-blue-900" : "bg-blue-600 active:bg-blue-500"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text className="mr-2 text-base font-extrabold text-white">
                {ctaLabel}
              </Text>
              <Check size={18} color="#FFFFFF" strokeWidth={3} />
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
            <Text className="text-xs text-slate-400 underline">
              {t("restorePurchases")}
            </Text>
          </TouchableOpacity>
          <Text className="text-xs text-slate-600">•</Text>
          <Text className="text-xs text-slate-500">{t("oneTimePayment")}</Text>
        </View>

        <View className="mt-3 flex-row items-center justify-center gap-5">
          <TouchableOpacity
            onPress={() => Linking.openURL(TERMS_OF_USE_URL)}
            accessibilityRole="link"
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text className="text-xs text-slate-500 underline">
              {t("termsOfUse")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
            accessibilityRole="link"
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text className="text-xs text-slate-500 underline">
              {t("privacyPolicy")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

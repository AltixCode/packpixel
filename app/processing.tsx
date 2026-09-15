import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import {
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Share2,
} from "lucide-react-native";
import { useImageStore } from "../src/store/useImageStore";
import {
  processBatchImages,
  saveResultsToLibrary,
} from "../src/engine/imageProcessor";
import { useCanvasComposer } from "../src/engine/canvasComposer";
import { t } from "../src/i18n";
import { useTheme } from '../src/theme/useTheme';
import { useAdsStore } from '../src/store/adsStore';
import { showInterstitial } from '../src/services/ads';
import { shouldShowInterstitial } from '../src/services/adPolicy';

export default function ProcessingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    images,
    selectedPreset,
    skuPrefix,
    compressionQuality,
    bgColor,
    processingProgress,
    currentProcessIndex,
    results,
    setProcessingProgress,
    setResults,
    reset,
  } = useImageStore();

  const { ComposerPortal, compose } = useCanvasComposer();
  const composeRef = useRef(compose);
  composeRef.current = compose;

  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const isCanceledRef = useRef(false);

  useEffect(() => {
    if (images.length === 0) {
      router.replace("/");
      return;
    }

    let isMounted = true;

    const runBatch = async () => {
      try {
        setErrorMessage(null);
        setIsDone(false);

        const processed = await processBatchImages(
          images,
          selectedPreset.width,
          selectedPreset.height,
          skuPrefix,
          compressionQuality,
          (request) => composeRef.current(request),
          bgColor,
          (current, total) => {
            if (!isMounted || isCanceledRef.current) return;
            setProcessingProgress(current / total, current);
          },
          () => isCanceledRef.current,
        );

        if (!isMounted || isCanceledRef.current) return;

        // A denied photo-library permission must not be reported as success:
        // the files exist in the app sandbox but never reached the camera roll.
        const saveResult = await saveResultsToLibrary(processed);
        if (!isMounted || isCanceledRef.current) return;
        if (!saveResult.success) {
          setSaveWarning(saveResult.error ?? t("saveFailed"));
        }

        setResults(processed);
        setIsDone(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        void useAdsStore.getState().recordCompletion();
      } catch (err) {
        if (!isMounted || isCanceledRef.current) return;
        setErrorMessage(
          (err as { message?: string })?.message || t("batchError"),
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    };

    runBatch();

    return () => {
      isMounted = false;
      isCanceledRef.current = true;
    };
  }, []);

  const maybeShowInterstitial = async () => {
    const { completions, lastInterstitialAt, markInterstitialShown } = useAdsStore.getState();
    const decision = shouldShowInterstitial({
      completions,
      lastInterstitialAt,
      now: Date.now(),
      // Read at call time rather than captured: the user may have bought the upgrade from the
      // paywall between opening this screen and finishing the work.
      isPro: useImageStore.getState().isPro,
    });
    if (!decision) return;
    // Only a shown-and-dismissed ad resets the clock. Counting an unfilled request would
    // suppress the next several ads for nothing.
    if (await showInterstitial()) await markInterstitialShown();
  };

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    router.replace("/");
    // After the navigation, not before it: an ad that appears while the user is still looking
    // at their results reads as the app refusing to let them leave.
    void maybeShowInterstitial();
  };

  const handleShareFirst = async () => {
    if (results.length > 0 && results[0].outputUri) {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(results[0].outputUri);
      }
    }
  };

  const progressPercent = Math.min(100, Math.round(processingProgress * 100));

  return (
    <View className="flex-1 px-6 justify-center items-center" style={{ backgroundColor: theme.background }}>
      {ComposerPortal}
      {isDone ? (
        /* Completed State */
        <View className="w-full items-center">
          <View className="bg-emerald-500/20 p-5 rounded-full mb-5 border border-emerald-500/30">
            <CheckCircle2 size={56} color={theme.success} />
          </View>
          <Text className="text-2xl font-extrabold text-center mb-2" style={{ color: theme.text }}>
            {saveWarning ? t("batchSavedLocally") : t("allPhotosSaved")}
          </Text>
          <Text className="text-sm text-center max-w-xs leading-relaxed mb-6" style={{ color: theme.textSecondary }}>
            {t(saveWarning ? "batchSavedLocallyDesc" : "allPhotosSavedDesc", {
              count: results.length || images.length,
              platform: selectedPreset.platform,
              width: selectedPreset.width,
              height: selectedPreset.height,
            })}
          </Text>

          {saveWarning ? (
            <Text
              accessibilityRole="alert"
              className="text-xs text-center max-w-xs mb-5" style={{ color: theme.warning }}
            >
              {saveWarning}
            </Text>
          ) : null}

          <View className="border p-4 rounded-2xl w-full mb-6 flex-row items-center" style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}>
            <Sparkles size={20} color={theme.primary} />
            <Text className="text-xs ml-3 flex-1 font-mono" style={{ color: theme.textSecondary }}>
              {t("skuSequence", {
                prefix: skuPrefix,
                last: String(images.length).padStart(2, "0"),
              })}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="w-full flex-col gap-3">
            {results.length > 0 && (
              <TouchableOpacity
                onPress={handleShareFirst}
                className="w-full py-3.5 rounded-2xl flex-row items-center justify-center mb-3" style={{ backgroundColor: theme.controlSurface }}
              >
                <Share2 size={18} color={theme.text} />
                <Text className="font-semibold text-sm ml-2" style={{ color: theme.text }}>
                  {t("shareSample")}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleDone}
              activeOpacity={0.85}
              className="w-full bg-blue-600 active:bg-blue-500 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-500/20"
            >
              <RotateCcw size={18} color={theme.onPrimary} />
              <Text className="font-bold text-base ml-2" style={{ color: theme.onPrimary }}>
                {t("prepAnother")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : errorMessage ? (
        /* Error State */
        <View className="w-full items-center">
          <View className="bg-rose-500/20 p-5 rounded-full mb-5 border border-rose-500/30">
            <XCircle size={56} color={theme.danger} />
          </View>
          <Text className="text-2xl font-extrabold text-center mb-2" style={{ color: theme.text }}>
            {t("batchError")}
          </Text>
          <Text className="text-xs text-center max-w-xs mb-8" style={{ color: theme.danger }}>
            {errorMessage}
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            className="py-3.5 px-6 rounded-xl flex-row items-center justify-center" style={{ backgroundColor: theme.controlSurface }}
          >
            <ArrowLeft size={16} color={theme.text} />
            <Text className="font-semibold text-sm ml-2" style={{ color: theme.text }}>
              {t("backToSettings")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* In-Progress State */
        <View className="w-full items-center">
          <View className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-full mb-6">
            <ShoppingBag size={44} color={theme.primary} />
          </View>

          <Text className="text-xl font-bold text-center mb-1" style={{ color: theme.text }}>
            {t("formattingPhotos")}
          </Text>
          <Text className="text-xs text-center mb-8" style={{ color: theme.textSecondary }}>
            {t("conformingProgress", {
              current: currentProcessIndex || 1,
              total: images.length,
              platform: selectedPreset.platform,
            })}
          </Text>

          {/* Progress Bar */}
          <View className="w-full h-3 rounded-full overflow-hidden border mb-3" style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}>
            <View
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-blue-500 rounded-full"
            />
          </View>

          <View className="w-full flex-row justify-between mb-8">
            <Text className="text-xs font-mono" style={{ color: theme.textMuted }}>
              {t("gpuEngine")}
            </Text>
            <Text className="text-xs font-bold font-mono" style={{ color: theme.primary }}>
              {progressPercent}%
            </Text>
          </View>

          <ActivityIndicator size="small" color={theme.primary} className="mb-8" />

          <TouchableOpacity
            onPress={() => {
              isCanceledRef.current = true;
              router.back();
            }}
            className="px-6 py-2.5 rounded-full border" style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
          >
            <Text className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
              {t("cancelBatch")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

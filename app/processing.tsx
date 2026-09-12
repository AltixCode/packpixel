import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import {
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Share2,
} from 'lucide-react-native';
import { useImageStore } from '../src/store/useImageStore';
import { processBatchImages, saveResultsToLibrary } from '../src/engine/skiaProcessor';

export default function ProcessingScreen() {
  const router = useRouter();
  const {
    images,
    selectedPreset,
    skuPrefix,
    compressionQuality,
    processingProgress,
    currentProcessIndex,
    results,
    setProcessingProgress,
    setResults,
    reset,
  } = useImageStore();

  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isCanceledRef = useRef(false);

  useEffect(() => {
    if (images.length === 0) {
      router.replace('/');
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
          (current, total) => {
            if (!isMounted || isCanceledRef.current) return;
            setProcessingProgress(current / total, current);
          }
        );

        if (!isMounted || isCanceledRef.current) return;

        // Save batch to photo library
        await saveResultsToLibrary(processed);

        setResults(processed);
        setIsDone(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err: any) {
        if (!isMounted || isCanceledRef.current) return;
        setErrorMessage(err?.message || 'Batch image formatting failed.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    };

    runBatch();

    return () => {
      isMounted = false;
      isCanceledRef.current = true;
    };
  }, []);

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
    router.replace('/');
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
    <View className="flex-1 bg-slate-950 px-6 justify-center items-center">
      {isDone ? (
        /* Completed State */
        <View className="w-full items-center">
          <View className="bg-emerald-500/20 p-5 rounded-full mb-5 border border-emerald-500/30">
            <CheckCircle2 size={56} color="#34D399" />
          </View>
          <Text className="text-2xl font-extrabold text-white text-center mb-2">
            Batch Export Complete!
          </Text>
          <Text className="text-slate-400 text-sm text-center max-w-xs leading-relaxed mb-6">
            {images.length} photos conformed to {selectedPreset.platform} ({selectedPreset.width}×
            {selectedPreset.height}) with EXIF stripped and saved to your camera roll.
          </Text>

          <View className="bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full mb-6 flex-row items-center">
            <Sparkles size={20} color="#60A5FA" />
            <Text className="text-slate-300 text-xs ml-3 flex-1 font-mono">
              SKU sequence: {skuPrefix}_01.jpg through {skuPrefix}_
              {String(images.length).padStart(2, '0')}.jpg
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="w-full space-y-3">
            {results.length > 0 && (
              <TouchableOpacity
                onPress={handleShareFirst}
                className="w-full bg-slate-800 py-3.5 rounded-2xl flex-row items-center justify-center mb-3"
              >
                <Share2 size={18} color="#FFFFFF" />
                <Text className="text-white font-semibold text-sm ml-2">Share Sample File</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleDone}
              activeOpacity={0.85}
              className="w-full bg-blue-600 active:bg-blue-500 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-blue-500/20"
            >
              <RotateCcw size={18} color="#FFFFFF" />
              <Text className="text-white font-bold text-base ml-2">Prep Another Batch</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : errorMessage ? (
        /* Error State */
        <View className="w-full items-center">
          <View className="bg-rose-500/20 p-5 rounded-full mb-5 border border-rose-500/30">
            <XCircle size={56} color="#F43F5E" />
          </View>
          <Text className="text-2xl font-extrabold text-white text-center mb-2">
            Batch Processing Error
          </Text>
          <Text className="text-rose-300 text-xs text-center max-w-xs mb-8">{errorMessage}</Text>

          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-slate-800 py-3.5 px-6 rounded-xl flex-row items-center justify-center"
          >
            <ArrowLeft size={16} color="#FFFFFF" />
            <Text className="text-white font-semibold text-sm ml-2">Back to Settings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* In-Progress State */
        <View className="w-full items-center">
          <View className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-full mb-6">
            <ShoppingBag size={44} color="#60A5FA" />
          </View>

          <Text className="text-xl font-bold text-white text-center mb-1">
            Formatting E-Commerce Photos
          </Text>
          <Text className="text-slate-400 text-xs text-center mb-8">
            Conforming image {currentProcessIndex || 1} of {images.length} to{' '}
            {selectedPreset.platform}...
          </Text>

          {/* Progress Bar */}
          <View className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 mb-3">
            <View
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-blue-500 rounded-full"
            />
          </View>

          <View className="w-full flex-row justify-between mb-8">
            <Text className="text-slate-500 text-xs font-mono">GPU Canvas Resizer</Text>
            <Text className="text-blue-400 text-xs font-bold font-mono">{progressPercent}%</Text>
          </View>

          <ActivityIndicator size="small" color="#60A5FA" className="mb-8" />

          <TouchableOpacity
            onPress={() => {
              isCanceledRef.current = true;
              router.back();
            }}
            className="px-6 py-2.5 rounded-full bg-slate-900 border border-slate-800"
          >
            <Text className="text-slate-400 text-xs font-semibold">Cancel Batch</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

import { create } from 'zustand';
import { MARKETPLACE_PRESETS, MarketplacePreset } from '../presets/marketplace';

export interface ImageAsset {
  id: string;
  uri: string;
  width: number;
  height: number;
  fileName?: string;
  fileSize?: number;
}

export interface ProcessedResult {
  id: string;
  originalUri: string;
  outputUri: string;
  fileName: string;
  width: number;
  height: number;
  fileSize?: number;
}

interface ImageState {
  images: ImageAsset[];
  selectedPreset: MarketplacePreset;
  customWidth: number;
  customHeight: number;
  bgColor: string;
  skuPrefix: string;
  compressionQuality: number;
  isPro: boolean;
  isProcessing: boolean;
  processingProgress: number; // 0 to 1
  currentProcessIndex: number;
  results: ProcessedResult[];

  // Actions
  setImages: (images: ImageAsset[]) => void;
  addImages: (images: ImageAsset[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  setSelectedPreset: (preset: MarketplacePreset) => void;
  setCustomDimensions: (width: number, height: number) => void;
  setBgColor: (color: string) => void;
  setSkuPrefix: (sku: string) => void;
  setCompressionQuality: (quality: number) => void;
  setIsPro: (isPro: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setProcessingProgress: (progress: number, currentIndex: number) => void;
  setResults: (results: ProcessedResult[]) => void;
  reset: () => void;
}

export const useImageStore = create<ImageState>((set) => ({
  images: [],
  selectedPreset: MARKETPLACE_PRESETS[0],
  customWidth: 2000,
  customHeight: 2000,
  bgColor: '#FFFFFF',
  skuPrefix: 'SKU',
  compressionQuality: 0.85,
  isPro: false,
  isProcessing: false,
  processingProgress: 0,
  currentProcessIndex: 0,
  results: [],

  setImages: (images) => set({ images }),
  addImages: (newImages) =>
    set((state) => ({
      images: [...state.images, ...newImages],
    })),
  removeImage: (id) =>
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
    })),
  clearImages: () => set({ images: [], results: [] }),
  setSelectedPreset: (selectedPreset) =>
    set({
      selectedPreset,
      bgColor: selectedPreset.defaultBgColor,
    }),
  setCustomDimensions: (customWidth, customHeight) =>
    set({ customWidth, customHeight }),
  setBgColor: (bgColor) => set({ bgColor }),
  setSkuPrefix: (skuPrefix) => set({ skuPrefix: skuPrefix.trim() }),
  setCompressionQuality: (compressionQuality) => set({ compressionQuality }),
  setIsPro: (isPro) => set({ isPro }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setProcessingProgress: (processingProgress, currentProcessIndex) =>
    set({ processingProgress, currentProcessIndex }),
  setResults: (results) => set({ results }),
  reset: () =>
    set({
      images: [],
      results: [],
      isProcessing: false,
      processingProgress: 0,
      currentProcessIndex: 0,
    }),
}));

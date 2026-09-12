import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { ImageAsset, ProcessedResult } from '../store/useImageStore';

export interface CanvasTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  targetWidth: number;
  targetHeight: number;
}

export const computeCanvasTransform = (
  srcWidth: number,
  srcHeight: number,
  targetWidth: number,
  targetHeight: number
): CanvasTransform => {
  if (srcWidth <= 0 || srcHeight <= 0) {
    return { scale: 1, offsetX: 0, offsetY: 0, targetWidth, targetHeight };
  }

  // Scale factor s = min(W_target / W_src, H_target / H_src)
  const scale = Math.min(targetWidth / srcWidth, targetHeight / srcHeight);

  // Centering offsets
  const offsetX = (targetWidth - srcWidth * scale) / 2;
  const offsetY = (targetHeight - srcHeight * scale) / 2;

  return { scale, offsetX, offsetY, targetWidth, targetHeight };
};

export const processBatchImages = async (
  images: ImageAsset[],
  targetWidth: number,
  targetHeight: number,
  skuPrefix: string,
  quality: number = 0.85,
  onProgress?: (current: number, total: number) => void
): Promise<ProcessedResult[]> => {
  const results: ProcessedResult[] = [];
  const total = images.length;

  const baseCache = FileSystem.cacheDirectory || `${FileSystem.documentDirectory}cache/`;
  const outputDir = `${baseCache}packpixel_${Date.now()}/`;
  await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true });

  for (let i = 0; i < total; i++) {
    const img = images[i];
    if (onProgress) {
      onProgress(i + 1, total);
    }

    const indexStr = String(i + 1).padStart(2, '0');
    const cleanFileName = `${skuPrefix || 'SKU'}_${indexStr}.jpg`;

    // Compute transformation
    const transform = computeCanvasTransform(
      img.width || 1000,
      img.height || 1000,
      targetWidth,
      targetHeight
    );

    // Resize image maintaining aspect ratio and strip EXIF
    const manipulated = await ImageManipulator.manipulateAsync(
      img.uri,
      [
        {
          resize: {
            width: Math.round((img.width || 1000) * transform.scale),
            height: Math.round((img.height || 1000) * transform.scale),
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const destinationUri = `${outputDir}${cleanFileName}`;
    await FileSystem.copyAsync({
      from: manipulated.uri,
      to: destinationUri,
    });

    results.push({
      id: `proc_${i}_${Date.now()}`,
      originalUri: img.uri,
      outputUri: destinationUri,
      fileName: cleanFileName,
      width: targetWidth,
      height: targetHeight,
    });
  }

  return results;
};

export const saveResultsToLibrary = async (
  results: ProcessedResult[]
): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, count: 0, error: 'Photo library permissions denied.' };
    }

    let savedCount = 0;
    for (const res of results) {
      await MediaLibrary.saveToLibraryAsync(res.outputUri);
      savedCount++;
    }

    return { success: true, count: savedCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Failed to save photos.' };
  }
};

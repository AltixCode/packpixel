import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import { ImageAsset, ProcessedResult } from "../store/useImageStore";
import type { ComposeRequest } from "./canvasComposer";

export interface CanvasTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  /** Source dimensions after scaling, before padding. */
  drawWidth: number;
  drawHeight: number;
  targetWidth: number;
  targetHeight: number;
}

/**
 * Contain-fit: scale s = min(W_target / W_src, H_target / H_src), then centre
 * the scaled image inside the target canvas. Nothing is cropped or stretched.
 */
export const computeCanvasTransform = (
  srcWidth: number,
  srcHeight: number,
  targetWidth: number,
  targetHeight: number,
): CanvasTransform => {
  if (srcWidth <= 0 || srcHeight <= 0) {
    return {
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      drawWidth: targetWidth,
      drawHeight: targetHeight,
      targetWidth,
      targetHeight,
    };
  }

  const scale = Math.min(targetWidth / srcWidth, targetHeight / srcHeight);
  const drawWidth = Math.max(1, Math.round(srcWidth * scale));
  const drawHeight = Math.max(1, Math.round(srcHeight * scale));

  return {
    scale,
    offsetX: (targetWidth - drawWidth) / 2,
    offsetY: (targetHeight - drawHeight) / 2,
    drawWidth,
    drawHeight,
    targetWidth,
    targetHeight,
  };
};

export type ComposeFn = (request: ComposeRequest) => Promise<string>;

/**
 * Resizes each image to fit the preset, then pads it onto a canvas of exactly
 * the preset's dimensions. Re-encoding to JPEG drops EXIF, including GPS.
 */
export const processBatchImages = async (
  images: ImageAsset[],
  targetWidth: number,
  targetHeight: number,
  skuPrefix: string,
  quality: number,
  compose: ComposeFn,
  backgroundColor: string,
  onProgress?: (current: number, total: number) => void,
  shouldCancel?: () => boolean,
): Promise<ProcessedResult[]> => {
  const results: ProcessedResult[] = [];
  const total = images.length;

  const baseCache =
    FileSystem.cacheDirectory || `${FileSystem.documentDirectory}cache/`;
  const outputDir = `${baseCache}packpixel_${Date.now()}/`;
  await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true });

  for (let i = 0; i < total; i++) {
    if (shouldCancel?.()) break;

    const img = images[i];
    onProgress?.(i + 1, total);

    const transform = computeCanvasTransform(
      img.width,
      img.height,
      targetWidth,
      targetHeight,
    );

    const resized = await ImageManipulator.manipulateAsync(
      img.uri,
      [
        {
          resize: { width: transform.drawWidth, height: transform.drawHeight },
        },
      ],
      { compress: 1, format: ImageManipulator.SaveFormat.PNG },
    );

    const composedUri = await compose({
      uri: resized.uri,
      sourceWidth: transform.drawWidth,
      sourceHeight: transform.drawHeight,
      targetWidth,
      targetHeight,
      backgroundColor,
      quality,
    });

    const indexStr = String(i + 1).padStart(2, "0");
    const fileName = `${skuPrefix || "SKU"}_${indexStr}.jpg`;
    const destinationUri = `${outputDir}${fileName}`;
    await FileSystem.copyAsync({ from: composedUri, to: destinationUri });

    const info = await FileSystem.getInfoAsync(destinationUri);

    results.push({
      id: `proc_${i}_${Date.now()}`,
      originalUri: img.uri,
      outputUri: destinationUri,
      fileName,
      width: targetWidth,
      height: targetHeight,
      fileSize: info.exists ? info.size : undefined,
    });
  }

  return results;
};

export const saveResultsToLibrary = async (
  results: ProcessedResult[],
): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      return {
        success: false,
        count: 0,
        error: "Photo library permissions denied.",
      };
    }

    let savedCount = 0;
    for (const res of results) {
      await MediaLibrary.saveToLibraryAsync(res.outputUri);
      savedCount++;
    }

    return { success: true, count: savedCount };
  } catch (err) {
    return {
      success: false,
      count: 0,
      error: (err as { message?: string })?.message || "Failed to save photos.",
    };
  }
};

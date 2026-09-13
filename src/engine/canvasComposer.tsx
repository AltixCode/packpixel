import React, { useCallback, useRef, useState } from "react";
import { Image, PixelRatio, Platform, View } from "react-native";
import { captureRef } from "react-native-view-shot";

export interface ComposeRequest {
  /** Already resized to fit inside the target box by the caller. */
  uri: string;
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
  backgroundColor: string;
  quality: number;
}

interface ComposerState extends ComposeRequest {
  token: number;
}

/**
 * Letterboxes an image onto an exact target canvas.
 *
 * `expo-image-manipulator` only resizes, rotates, flips and crops on iOS and
 * Android — its `extent` action is web-only — so an image cannot be padded onto
 * a larger canvas through it. Compositing therefore happens in the view layer:
 * an off-screen View of exactly the target pixel size is rendered and captured.
 *
 * The box is laid out in density-independent points equal to the target divided
 * by the screen density, so the native raster lands on the requested pixel size
 * without the capture step having to upscale.
 */
export function useCanvasComposer() {
  const shotRef = useRef<View>(null);
  const resolveRef = useRef<((uri: string) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);
  const tokenRef = useRef(0);
  const [state, setState] = useState<ComposerState | null>(null);

  const density = PixelRatio.get();

  const compose = useCallback(
    (request: ComposeRequest): Promise<string> =>
      new Promise<string>((resolve, reject) => {
        resolveRef.current = resolve;
        rejectRef.current = reject;
        tokenRef.current += 1;
        setState({ ...request, token: tokenRef.current });
      }),
    [],
  );

  const handleImageLoad = useCallback(async () => {
    const resolve = resolveRef.current;
    const reject = rejectRef.current;
    if (!state || !resolve || !reject) return;

    resolveRef.current = null;
    rejectRef.current = null;

    try {
      // Two frames: one for the Image to present its decoded bitmap, one for
      // the surrounding canvas to settle before the snapshot is taken.
      await new Promise((done) =>
        requestAnimationFrame(() => requestAnimationFrame(done)),
      );

      const uri = await captureRef(shotRef, {
        width: state.targetWidth,
        height: state.targetHeight,
        format: "jpg",
        quality: state.quality,
        result: "tmpfile",
        // drawViewHierarchyInRect cannot snapshot a view parked outside the
        // window; renderInContext can.
        useRenderInContext: Platform.OS === "ios",
      });
      resolve(uri);
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setState(null);
    }
  }, [state]);

  const handleImageError = useCallback(() => {
    const reject = rejectRef.current;
    resolveRef.current = null;
    rejectRef.current = null;
    setState(null);
    reject?.(new Error("Could not decode the source image."));
  }, []);

  const ComposerPortal = state ? (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: -100000, left: 0 }}
      collapsable={false}
    >
      <View
        ref={shotRef}
        collapsable={false}
        style={{
          width: state.targetWidth / density,
          height: state.targetHeight / density,
          backgroundColor: state.backgroundColor,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Image
          // Remounts per request so onLoad fires again for a repeated URI.
          key={state.token}
          source={{ uri: state.uri }}
          style={{
            width: state.sourceWidth / density,
            height: state.sourceHeight / density,
          }}
          resizeMode="contain"
          fadeDuration={0}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </View>
    </View>
  ) : null;

  return { ComposerPortal, compose };
}

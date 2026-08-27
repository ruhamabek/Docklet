"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ListImages, 
  RemoveImage, 
  PullImages, 
  RunImage 
} from "@wailsjs/go/main/App";
import { getErrorMessage } from "@/lib/utils";
 
export function useImages() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = useCallback(() => {
    setLoading(true);
    ListImages()
      .then((data) => setImages(data || []))
      .catch((err) => console.error("Failed to load images:", err))
      .finally(() => setLoading(false));
  }, []);

  async function removeImage(id: string): Promise<ActionResult> {
    try {
      await RemoveImage(id);
      fetchImages();
      return { success: true };
    } catch (err) {
      const error = getErrorMessage(err);
      console.error("Failed to remove image:", error);
      return { success: false, error };
    }
  }

  function runImage(opts: RunImageOptions) {
    return RunImage(opts);
  }

  async function pullImage(imageName: string): Promise<ActionResult> {
    try {
      await PullImages(imageName);
      fetchImages();
      return { success: true };
    } catch (err) {
      const error = getErrorMessage(err);
      return { success: false, error };
    }
  }

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    images,
    loading,
    refresh: fetchImages,
    removeImage,
    runImage,
    pullImage,
  };
}
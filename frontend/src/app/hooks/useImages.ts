import { useState, useEffect } from "react";
import { 
  ListImages, 
  RemoveImage, 
  PullImages, 
  RunImage 
} from "@wailsjs/go/main/App";
 
export function useImages() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);

  function fetchImages() {
    setLoading(true);
    ListImages()
      .then((data) => setImages(data || []))
      .catch((err) => console.error("Failed to load images:", err))
      .finally(() => setLoading(false));
  }

  function removeImage(id: string, repo: string) {
    if (confirm(`Are you sure you want to delete image "${repo}" (${id})?`)) {
      return RemoveImage(id)
        .then(() => fetchImages())
        .catch((err) => alert("Failed to remove image: " + err));
    }
  }

  function runImage(opts: RunImageOptions) {
    return RunImage(opts);
  }

  async function pullImage(imageName: string) {
    await PullImages(imageName);
      return fetchImages();
  }

  useEffect(() => {
    fetchImages();
  }, []);

  return {
    images,
    loading,
    refresh: fetchImages,
    removeImage,
    runImage,
    pullImage,
  };
}
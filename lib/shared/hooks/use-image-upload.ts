import { useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { ProductFormValues } from "../validations/product";

interface UseImageUploadReturn {
  imagePreview: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function useImageUpload(
  initialImageUrl: string | null,
  setValue: UseFormSetValue<ProductFormValues>
): UseImageUploadReturn {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialImageUrl
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("画像のアップロードに失敗しました");
      }

      const { url } = await response.json();
      setValue("imageUrl", url);
      setImagePreview(url);
    } catch (error) {
      console.error("画像のアップロードに失敗しました:", error);
      throw error;
    }
  };

  return {
    imagePreview,
    handleImageUpload,
  };
}

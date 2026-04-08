"use client";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UploadProgress {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  url?: string;
}

export function useImageUpload() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    // Initialize progress tracking
    setUploads(
      files.map((file) => ({
        fileName: file.name,
        progress: 0,
        status: "pending",
      }))
    );

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        // Update status to uploading
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i ? { ...u, status: "uploading", progress: 10 } : u
          )
        );

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          setUploads((prev) =>
            prev.map((u, idx) =>
              idx === i
                ? { ...u, status: "error", error: error.message, progress: 100 }
                : u
            )
          );
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(data.path);

        uploadedUrls.push(urlData.publicUrl);

        // Update status to success
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i
              ? { ...u, status: "success", progress: 100, url: urlData.publicUrl }
              : u
          )
        );
      }
    } finally {
      setIsUploading(false);
    }

    return uploadedUrls;
  };

  const clearUploads = () => {
    setUploads([]);
  };

  return {
    uploads,
    isUploading,
    uploadImages,
    clearUploads,
  };
}

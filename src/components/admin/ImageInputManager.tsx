"use client";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ImageInputManagerProps {
  value: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export function ImageInputManager({
  value,
  onChange,
  disabled,
  maxImages = 6,
}: ImageInputManagerProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploads, isUploading, uploadImages, clearUploads } = useImageUpload();

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      
      // Filter valid image files
      const validFiles = fileArray.filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Fichier invalide",
            description: `${file.name} n'est pas une image`,
            variant: "destructive",
          });
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Fichier trop volumineux",
            description: `${file.name} dépasse 5 Mo`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });

      // Check max images limit
      const remaining = maxImages - value.length;
      if (validFiles.length > remaining) {
        toast({
          title: "Limite atteinte",
          description: `Vous pouvez ajouter ${remaining} image(s) de plus`,
          variant: "destructive",
        });
        validFiles.splice(remaining);
      }

      if (validFiles.length === 0) return;

      try {
        const urls = await uploadImages(validFiles);
        if (urls.length > 0) {
          onChange([...value, ...urls]);
          toast({
            title: "Images téléchargées",
            description: `${urls.length} image(s) ajoutée(s)`,
          });
        }
        clearUploads();
      } catch {
        toast({
          title: "Erreur",
          description: "Échec du téléchargement des images",
          variant: "destructive",
        });
      }
    },
    [value, maxImages, onChange, uploadImages, clearUploads]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, isUploading, handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const getImageSrc = (path: string) => {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return path.startsWith("/") ? path : `/${path}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Images ({value.length}/{maxImages}) *
        </label>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {value.map((img, index) => (
          <div
            key={`${img}-${index}`}
            className="relative group aspect-square rounded-md overflow-hidden border border-border bg-muted cursor-pointer"
            onClick={() => setPreviewImage(img)}
          >
            <img
              src={getImageSrc(img)}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(index);
              }}
              disabled={disabled}
              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Upload Zone */}
        {value.length < maxImages && (
          <div
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/50",
              (disabled || isUploading) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground text-center px-2">
                  Glisser ou cliquer
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {upload.fileName}
                </p>
                <Progress value={upload.progress} className="h-1" />
              </div>
              {upload.status === "success" && (
                <span className="text-xs text-green-500">✓</span>
              )}
              {upload.status === "error" && (
                <span className="text-xs text-destructive">✗</span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Formats acceptés : JPG, PNG, WebP, AVIF. Max 5 Mo par image.
      </p>

      {value.length === 0 && (
        <p className="text-xs text-destructive">Au moins une image requise</p>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md">
              <img
                src={getImageSrc(previewImage)}
                alt="Preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

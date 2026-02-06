import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Film, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/types/cms';
import { apiService } from '@/services/api';

interface MediaUploaderProps {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  maxFiles?: number;
  accept?: 'image' | 'video' | 'both';
  className?: string;
}

export function MediaUploader({
  value = [],
  onChange,
  maxFiles = 10,
  accept = 'both',
  className,
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const acceptedTypes = {
    image: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    video: { 'video/*': ['.mp4', '.webm', '.mov'] },
    both: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (value.length + acceptedFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setIsUploading(true);

      try {
        // Upload files to backend and Google Drive
        const uploadPromises = acceptedFiles.map(async (file) => {
          try {
            const result = await apiService.uploadMedia(file);
            return {
              id: result.id,
              url: result.driveUrl || `https://drive.google.com/file/d/${result.driveId}/view`,
              type: result.mimeType.startsWith('video') ? 'video' : 'image',
              alt: result.name,
              order: value.length,
              createdAt: result.createdAt,
              driveId: result.driveId,
            } as MediaItem;
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            throw error;
          }
        });

        const newItems = await Promise.all(uploadPromises);
        onChange([...value, ...newItems]);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [value, onChange, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes[accept],
    maxFiles: maxFiles - value.length,
    disabled: isUploading || value.length >= maxFiles,
  });

  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
          isDragActive
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-muted-foreground/50',
          (isUploading || value.length >= maxFiles) && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse ({value.length}/{maxFiles} files)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {value.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.alt || ''}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Film className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                <div className="flex items-center gap-1 text-xs text-white">
                  {item.type === 'image' ? (
                    <ImageIcon className="h-3 w-3" />
                  ) : (
                    <Film className="h-3 w-3" />
                  )}
                  <span className="truncate">{item.alt || 'No caption'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

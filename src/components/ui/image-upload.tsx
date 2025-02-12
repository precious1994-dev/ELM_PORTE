'use client';

import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onUploadError?: (error: string) => void;
  onRemove?: () => void;
  value: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onUploadError,
  onRemove,
  value,
  className
}) => {
  const [loading, setLoading] = useState(false);

  const handleRemove = () => {
    onChange('');
    onRemove?.();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setLoading(true);
    const file = acceptedFiles[0];

    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        onChange(data.url);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error uploading image';
      onUploadError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [onChange, onUploadError]);

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    disabled
  });

  return (
    <div>
      {value && (
        <div className="mb-4">
          <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={handleRemove}
                variant="destructive"
                size="sm"
              >
                Remove
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Image"
              src={value}
            />
          </div>
        </div>
      )}
      <div
        {...getRootProps({
          className: cn(
            'relative cursor-pointer rounded-lg border border-dashed border-gray-300 py-8 px-16 flex flex-col justify-center items-center gap-4 text-center',
            disabled && 'opacity-50 cursor-default',
            className
          )
        })}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {loading ? (
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          ) : (
            <Upload className="h-10 w-10 text-gray-400" />
          )}
          <div className="text-sm text-gray-500">
            Drag & drop or click to upload
          </div>
        </div>
      </div>
    </div>
  );
}; 
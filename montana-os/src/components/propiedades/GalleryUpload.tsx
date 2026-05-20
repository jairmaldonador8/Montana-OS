'use client';

import { useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface GalleryUploadProps {
  propertyId: string;
  onComplete: (urls: string[]) => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;

export function GalleryUpload({ propertyId, onComplete }: GalleryUploadProps) {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Tipo de archivo no válido: ${file.name}. Solo se aceptan JPG, PNG y WebP.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Archivo demasiado grande: ${file.name}. Máximo 10MB.`;
    }
    return null;
  };

  // Handle file selection (drag-drop or input)
  const handleFiles = useCallback(
    (files: FileList) => {
      const newFiles: UploadFile[] = [];
      let errorMessages: string[] = [];

      // Check total file count
      if (uploads.length + files.length > MAX_FILES) {
        errorMessages.push(`Máximo ${MAX_FILES} fotos permitidas. Ya tienes ${uploads.length}.`);
      }

      // Validate each file
      Array.from(files).forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errorMessages.push(error);
        } else {
          newFiles.push({
            id: `${Date.now()}-${Math.random()}`,
            file,
            progress: 0,
            status: 'pending',
          });
        }
      });

      // Show errors if any
      if (errorMessages.length > 0) {
        alert(errorMessages.join('\n'));
      }

      // Add valid files to uploads list
      if (newFiles.length > 0) {
        setUploads((prev) => [...prev, ...newFiles]);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [uploads.length]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  // Remove file from list
  const removeFile = (id: string) => {
    setUploads((prev) => prev.filter((f) => f.id !== id));
  };

  // Retry upload for failed file
  const retryUpload = useCallback(
    async (id: string) => {
      const fileToRetry = uploads.find((f) => f.id === id);
      if (!fileToRetry) return;

      await uploadFile(fileToRetry);
    },
    [uploads]
  );

  // Upload single file to Supabase
  const uploadFile = async (uploadFile: UploadFile) => {
    try {
      // Update status to uploading
      setUploads((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading' } : f))
      );

      const timestamp = Date.now();
      const fileName = uploadFile.file.name;
      const filePath = `${propertyId}/${timestamp}-${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('properties')
        .upload(filePath, uploadFile.file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('properties')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Update status to success with URL
      setUploads((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: 'success',
                progress: 100,
                url: publicUrl,
              }
            : f
        )
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido al subir el archivo';
      setUploads((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: 'error',
                error: errorMessage,
              }
            : f
        )
      );
    }
  };

  // Handle complete button - upload all pending files
  const handleComplete = async () => {
    const pendingFiles = uploads.filter((f) => f.status === 'pending');

    if (pendingFiles.length === 0 && uploads.every((f) => f.status === 'success')) {
      // All files already uploaded successfully
      const urls = uploads
        .filter((f) => f.status === 'success' && f.url)
        .map((f) => f.url!);
      onComplete(urls);
      return;
    }

    setIsUploading(true);

    try {
      // Upload all pending files
      await Promise.all(
        uploads
          .filter((f) => f.status === 'pending' || f.status === 'error')
          .map((f) => uploadFile(f))
      );

      // After all uploads, get successful URLs
      setTimeout(() => {
        const successfulUrls = uploads
          .filter((f) => f.status === 'success' && f.url)
          .map((f) => f.url!);
        onComplete(successfulUrls);
        setIsUploading(false);
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
    }
  };

  const successCount = uploads.filter((f) => f.status === 'success').length;
  const totalCount = uploads.length;
  const isComplete = uploads.length > 0 && !uploads.some((f) => f.status === 'pending' || f.status === 'uploading');

  return (
    <div className="w-full space-y-6">
      {/* Drag-drop zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-montana-gold hover:bg-opacity-5 transition-all"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">Arrastra fotos aquí</p>
          <p className="text-sm text-gray-600">Máx 10 fotos, 10MB c/u (JPG, PNG, WebP)</p>
        </div>
      </div>

      {/* Upload list */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {/* Thumbnail */}
              {upload.file && (
                <img
                  src={URL.createObjectURL(upload.file)}
                  alt={upload.file.name}
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                />
              )}

              {/* File info and progress */}
              <div className="flex-1 min-w-0">
                {/* Filename */}
                <p className="text-sm font-medium text-gray-900 truncate">
                  {upload.file.name}
                </p>

                {/* Progress bar */}
                {upload.status !== 'success' && upload.status !== 'error' && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-montana-gold h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}

                {/* Error message */}
                {upload.status === 'error' && (
                  <p className="text-xs text-red-500 mt-2">{upload.error}</p>
                )}

                {/* Success indicator */}
                {upload.status === 'success' && (
                  <p className="text-xs text-green-500 mt-2">✓ Subido correctamente</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-shrink-0">
                {/* Retry button for failed uploads */}
                {upload.status === 'error' && (
                  <button
                    onClick={() => retryUpload(upload.id)}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Reintentar
                  </button>
                )}

                {/* Remove button */}
                <button
                  onClick={() => removeFile(upload.id)}
                  className="text-gray-500 hover:text-red-500 transition-colors text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete button */}
      <button
        onClick={handleComplete}
        disabled={isUploading || uploads.length === 0 || (totalCount > 0 && successCount === 0 && uploads.some(f => f.status === 'error'))}
        className={`w-full py-3 px-4 rounded-md font-medium transition-all ${
          isUploading || uploads.length === 0 || (totalCount > 0 && successCount === 0 && uploads.some(f => f.status === 'error'))
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-montana-gold text-white hover:bg-opacity-90'
        }`}
      >
        {isUploading ? 'Subiendo...' : `Guardar fotos (${successCount}/${totalCount})`}
      </button>
    </div>
  );
}

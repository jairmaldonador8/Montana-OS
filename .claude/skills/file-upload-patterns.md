---
name: file-upload-patterns
description: Use when implementing file uploads (images, documents). Covers validation, progress tracking, error handling, retry logic, and bulk uploads to cloud storage.
---

# File Upload Patterns

## Overview

Implement robust file uploads with validation, progress indicators, error recovery, and bulk operations. Validate on client (UX) and server (security). Show progress for large files. Retry failed uploads automatically.

## When to Use

- Uploading images to cloud storage (Supabase, S3, etc.)
- Drag-drop file inputs
- Bulk uploads (multiple files)
- Showing upload progress to user
- Validating file type/size before upload
- Handling upload failures with retry logic

## Core Patterns

### 1. File Validation + Single Upload

```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface UploadState {
  isUploading: boolean;
  progress: number; // 0-100
  error: string | null;
}

export function PhotoUpload({ propertyId, onSuccess }: { propertyId: string; onSuccess: (url: string) => void }) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const validateFile = (file: File): string | null => {
    // Type validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Solo JPG, PNG o WebP permitidos';
    }

    // Size validation (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'Archivo muy grande (máx 10MB)';
    }

    return null;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setState((prev) => ({ ...prev, error: validationError }));
      return;
    }

    setState({ isUploading: true, progress: 0, error: null });

    try {
      // Create unique path
      const timestamp = Date.now();
      const path = `${propertyId}/${timestamp}-${file.name}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('properties')
        .upload(path, file, {
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setState((prev) => ({ ...prev, progress: percent }));
          },
        });

      if (error) throw error;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('properties')
        .getPublicUrl(data.path);

      setState({ isUploading: false, progress: 100, error: null });
      onSuccess(publicData.publicUrl);

      // Reset
      e.target.value = '';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={state.isUploading}
      />

      {state.isUploading && (
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Subiendo... {state.progress}%</p>
          <div className="w-full bg-gray-200 rounded h-2">
            <div
              className="bg-blue-500 h-2 rounded transition-all"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
    </div>
  );
}
```

### 2. Bulk Upload with Drag-Drop

```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface UploadedFile {
  file: File;
  url: string;
  progress: number;
  error: string | null;
}

export function GalleryUpload({ propertyId, onComplete }: { propertyId: string; onComplete: (urls: string[]) => void }) {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const maxPhotos = 10;

  const validateFiles = (files: FileList): File[] => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024;

    return Array.from(files).filter((file) => {
      if (!validTypes.includes(file.type)) return false;
      if (file.size > maxSize) return false;
      return true;
    });
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = validateFiles(e.dataTransfer.files);
    if (files.length === 0) return;

    // Check max photos limit
    if (uploads.length + files.length > maxPhotos) {
      alert(`Máximo ${maxPhotos} fotos permitidas`);
      return;
    }

    // Add to uploads list
    const newUploads = files.map((file) => ({
      file,
      url: '',
      progress: 0,
      error: null,
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    // Upload each file
    files.forEach((file, index) => {
      uploadFile(file, uploads.length + index);
    });
  };

  const uploadFile = async (file: File, index: number) => {
    try {
      const timestamp = Date.now();
      const path = `${propertyId}/${timestamp}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('properties')
        .upload(path, file, {
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploads((prev) => {
              const updated = [...prev];
              updated[index].progress = percent;
              return updated;
            });
          },
        });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('properties')
        .getPublicUrl(data.path);

      setUploads((prev) => {
        const updated = [...prev];
        updated[index].url = publicData.publicUrl;
        updated[index].progress = 100;
        return updated;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploads((prev) => {
        const updated = [...prev];
        updated[index].error = errorMessage;
        return updated;
      });
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    const successUrls = uploads.filter((u) => u.url).map((u) => u.url);
    onComplete(successUrls);
  };

  return (
    <div className="space-y-4">
      {/* Drag-drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded p-8 text-center cursor-pointer"
      >
        <p className="text-gray-500">
          Arrastra fotos aquí o haz click para seleccionar
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Máx {maxPhotos} fotos, 10MB cada una
        </p>
      </div>

      {/* Upload list */}
      <div className="space-y-2">
        {uploads.map((upload, index) => (
          <div key={index} className="flex items-center gap-2 p-2 border rounded">
            {upload.url ? (
              <img src={upload.url} alt="" className="w-12 h-12 rounded object-cover" />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded" />
            )}

            <div className="flex-1">
              <p className="text-sm font-medium truncate">{upload.file.name}</p>
              {upload.error ? (
                <p className="text-xs text-red-500">{upload.error}</p>
              ) : (
                <div className="w-full bg-gray-200 rounded h-1">
                  <div
                    className="bg-blue-500 h-1 rounded transition-all"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => handleRemovePhoto(index)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Complete button */}
      {uploads.length > 0 && (
        <button onClick={handleComplete} disabled={uploads.some((u) => !u.url && !u.error)}>
          Guardar fotos ({uploads.filter((u) => u.url).length}/{uploads.length})
        </button>
      )}
    </div>
  );
}
```

### 3. Retry Logic for Failed Uploads

```typescript
async function uploadWithRetry(
  file: File,
  propertyId: string,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const path = `${propertyId}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('properties')
        .upload(path, file);

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('properties')
        .getPublicUrl(data.path);

      return publicData.publicUrl;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on validation errors
      if (lastError.message.includes('Invalid')) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s
      if (attempt < maxRetries) {
        await new Promise((resolve) => 
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }
  }

  throw lastError;
}
```

## Common Mistakes

### ❌ Not validating file type/size on server
**Problem:** User uploads 500MB video by bypassing client validation  
**Fix:** Validate on server too:
```typescript
if (file.size > 10 * 1024 * 1024) {
  throw new Error('File too large');
}
```

### ❌ Not showing upload progress
**Problem:** User thinks upload froze  
**Fix:** Use `onUploadProgress` callback:
```typescript
upload(path, file, {
  onUploadProgress: (progress) => {
    setProgress(Math.round((progress.loaded / progress.total) * 100));
  }
})
```

### ❌ Uploading before validation
**Problem:** File fails halfway through because it's invalid  
**Fix:** Validate (type, size) BEFORE upload:
```typescript
const error = validateFile(file);
if (error) throw new Error(error);
```

### ❌ Not handling network timeouts
**Problem:** Slow network = upload hangs forever  
**Fix:** Add timeout + retry logic (see example above)

### ❌ Storing file paths instead of URLs
**Problem:** Public URL format changes, old paths break  
**Fix:** Store full public URLs, not just file paths

## Montana OS Implementation

- **Max size:** 10MB per photo
- **Valid types:** JPG, PNG, WebP
- **Max photos:** 10 per property
- **Progress:** Show percentage in real-time
- **Retry:** Automatic exponential backoff (1s, 2s, 4s)
- **Storage path:** `{propertyId}/{timestamp}-{filename}`
- **URL stored:** Full public URL from Supabase

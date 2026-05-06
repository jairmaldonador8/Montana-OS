---
name: supabase-integration-react
description: Use when integrating Supabase (PostgreSQL + Auth + Storage) into React applications. Covers client vs server setup, auth checks, Storage bucket operations, and real-time listeners.
---

# Supabase Integration in React

## Overview

Supabase provides PostgreSQL database + Auth + Storage. Use the browser client (`createClient`) for client-side operations and server client (`createClient`) for server-side (with service role). Never expose `service_role_key` to the browser.

## When to Use

- Reading/writing to Supabase PostgreSQL from React
- Uploading files to Supabase Storage
- Checking user authentication in components
- Protecting API routes with auth checks
- Real-time subscriptions to database changes

## Core Patterns

### 1. Browser Client Setup (Client Components)

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Usage in component
'use client';

import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function PropertyList() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published');

      if (error) {
        console.error('Error fetching:', error);
        return;
      }

      setProperties(data);
    }

    fetchProperties();
  }, []);

  return (
    <div>
      {properties.map((prop) => (
        <div key={prop.id}>{prop.type}</div>
      ))}
    </div>
  );
}
```

### 2. Server-Side Client (Server Components / API Routes)

```typescript
// src/lib/supabase/server.ts
import { createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const cookieStore = await cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Handle setAll errors
          }
        },
      },
    }
  );
}

// Usage in server component or API route
export async function GET(request: Request) {
  const supabase = await createServerClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Query database
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('captured_by', user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
```

### 3. File Upload to Storage

```typescript
'use client';

import { supabase } from '@/lib/supabase/client';

export async function uploadPropertyPhoto(
  propertyId: string,
  file: File
): Promise<string> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('Only images allowed');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large (max 10MB)');
  }

  // Upload to bucket
  const path = `${propertyId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('properties') // bucket name
    .upload(path, file, { upsert: false });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Return public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('properties').getPublicUrl(data.path);

  return publicUrl;
}

// Usage in component
const { onChange } = register('photos');

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const urls: string[] = [];
  for (const file of Array.from(files)) {
    try {
      const url = await uploadPropertyPhoto(propertyId, file);
      urls.push(url);
    } catch (error) {
      console.error('Photo upload failed:', error);
    }
  }

  onChange({ target: { value: urls } });
};
```

### 4. Real-Time Subscriptions

```typescript
'use client';

import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function PropertyReviewer() {
  const [pendingProperties, setPendingProperties] = useState([]);

  useEffect(() => {
    // Subscribe to changes on properties table
    const subscription = supabase
      .from('properties')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'properties',
          filter: `status=eq.pending_review`, // Only pending
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPendingProperties((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setPendingProperties((prev) =>
              prev.filter((p) => p.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      <h2>Pending Review ({pendingProperties.length})</h2>
      {pendingProperties.map((prop) => (
        <div key={prop.id}>{prop.type}</div>
      ))}
    </div>
  );
}
```

### 5. Auth Check in API Routes

```typescript
// src/app/api/properties/[id]/autosave/route.ts
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient();

  // 1. Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Parse request body
  const body = await request.json();

  // 3. Update database
  const { data, error } = await supabase
    .from('properties')
    .update(body)
    .eq('id', params.id)
    .eq('captured_by', user.id) // Ensure user owns this property
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

## Common Mistakes

### ❌ Using anon key for sensitive operations
**Problem:** Anyone can delete the whole database if you use anon key with RLS disabled  
**Fix:** Always enable RLS (Row-Level Security) on tables, use service_role_key only on server-side

### ❌ Exposing service_role_key to browser
**Problem:** Keys leak in browser console, GitHub, etc.  
**Fix:** Only use in `.env.local` (server-side), never in `NEXT_PUBLIC_` vars

### ❌ Not checking auth in API routes
**Problem:** Anyone can call your API and modify data  
**Fix:** Always check `await supabase.auth.getUser()` in API routes

### ❌ Uploading files directly to Storage from browser without validation
**Problem:** Users upload 500MB files, crashing your app  
**Fix:** Validate file size/type on client + server:
```typescript
if (file.size > 10 * 1024 * 1024) throw new Error('Too large');
```

### ❌ Forgetting to unsubscribe from real-time listeners
**Problem:** Memory leaks, duplicate listeners  
**Fix:** Return unsubscribe in useEffect cleanup:
```typescript
return () => subscription.unsubscribe();
```

## Bucket Setup for Montana OS

```sql
-- Create storage bucket for property photos
INSERT INTO storage.buckets (id, name, public) VALUES ('properties', 'properties', true);

-- Enable RLS on bucket
CREATE POLICY "Authenticated users can upload to their properties"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'properties' AND auth.uid()::text = (storage.foldername(name))[1]
);
```

Then configure in env:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service_role key]
```

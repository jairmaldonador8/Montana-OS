---
name: autosave-patterns
description: Use when implementing background auto-save functionality in forms. Covers debouncing, conflict resolution, user feedback indicators, and recovery from network failures.
---

# Autosave Patterns

## Overview

Autosave persists form data automatically without user action. Combine debouncing (avoid overwhelming the server) with conflict resolution and user feedback indicators (show "Guardando..." → "Guardado") to create a seamless experience where data is never lost.

## When to Use

- Long forms where user may close the page mid-entry
- Multi-step forms requiring progressive saving
- Forms capturing data in unpredictable conditions (mobile, spotty internet)
- Need to recover if browser crashes or page refreshes

## Core Patterns

### 1. Debounced Autosave

```typescript
import { useCallback, useEffect } from 'react';

export function useAutoSave(
  data: FormData,
  propertyId: string,
  onSaveStatusChange?: (status: 'saving' | 'saved' | 'error') => void
) {
  useEffect(() => {
    // Don't save if data is empty
    if (!data || Object.keys(data).length === 0) return;

    onSaveStatusChange?.('saving');
    
    // Debounce: wait 500ms after last change before saving
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}/autosave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Autosave failed');
        
        onSaveStatusChange?.('saved');
        
        // Hide "Guardado" indicator after 2 seconds
        setTimeout(() => {
          onSaveStatusChange?.(null); // Clear indicator
        }, 2000);
      } catch (error) {
        console.error('Autosave error:', error);
        onSaveStatusChange?.('error');
      }
    }, 500); // 500ms debounce

    // Cleanup: clear timer if component unmounts or data changes again
    return () => clearTimeout(timer);
  }, [data, propertyId, onSaveStatusChange]);
}

// Usage in component
const [formData, setFormData] = useState(initialData);
const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

useAutoSave(formData, propertyId, setSaveStatus);

return (
  <>
    <form>
      {/* form fields */}
    </form>
    
    {/* Autosave indicator */}
    {saveStatus === 'saving' && (
      <div className="fixed bottom-4 right-4 text-sm text-gray-500">
        Guardando...
      </div>
    )}
    {saveStatus === 'saved' && (
      <div className="fixed bottom-4 right-4 text-sm text-green-500">
        ✓ Guardado
      </div>
    )}
  </>
);
```

### 2. Conflict Resolution (Last-Write-Wins)

```typescript
// Server-side: track when data was last updated
interface Property {
  id: string;
  data: Record<string, any>;
  updatedAt: timestamp;
  updatedBy: uuid;
}

// Client-side autosave endpoint
export async function autosavePropertyField(
  propertyId: string,
  fieldName: string,
  value: any,
  clientUpdatedAt: timestamp
) {
  const response = await fetch(`/api/properties/${propertyId}/autosave`, {
    method: 'POST',
    body: JSON.stringify({
      field: fieldName,
      value,
      clientTimestamp: clientUpdatedAt,
    }),
  });

  if (!response.ok) {
    const { serverData } = await response.json();
    // If server has newer data, merge or ask user
    console.warn('Server has newer data:', serverData);
    return serverData;
  }

  return value;
}

// Server endpoint (pseudo-code)
POST /api/properties/{id}/autosave {
  field: "price",
  value: 5000000,
  clientTimestamp: 1234567890
}

// Server logic:
const property = await db.properties.findById(id);
if (property.updatedAt > clientTimestamp) {
  // Conflict: server has newer data
  return { conflict: true, serverData: property.data };
}

// No conflict: save
property.data[field] = value;
property.updatedAt = now();
await db.properties.update(property);
return { ok: true };
```

### 3. Manual Save Button + Autosave

```typescript
export function FormWithManualAndAutoSave({ propertyId, initialData }) {
  const { register, watch, handleSubmit } = useForm({ defaultValues: initialData });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const formData = watch();

  // Autosave (implicit)
  useAutoSave(formData, propertyId, (status) => {
    if (status !== null) setSaveStatus(status);
  });

  // Manual save (explicit)
  const onManualSave = handleSubmit(async (data) => {
    setSaveStatus('saving');
    try {
      await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
    }
  });

  return (
    <div>
      <form onSubmit={onManualSave}>
        {/* fields */}
        <button type="submit">Guardar</button>
      </form>

      {/* Indicator */}
      <AutosaveIndicator status={saveStatus} />
    </div>
  );
}
```

### 4. Offline Detection + Queue

```typescript
export function useAutoSaveWithOfflineQueue(data, propertyId) {
  const [queue, setQueue] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Detect online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Autosave
  useEffect(() => {
    if (!isOnline) {
      // Queue for later
      setQueue([...queue, { data, timestamp: Date.now() }]);
      return;
    }

    // Process queue
    if (queue.length > 0) {
      queue.forEach(async (item) => {
        await fetch(`/api/properties/${propertyId}/autosave`, {
          method: 'POST',
          body: JSON.stringify(item.data),
        });
      });
      setQueue([]);
    }

    // Save current data
    const timer = setTimeout(async () => {
      await fetch(`/api/properties/${propertyId}/autosave`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [data, isOnline, propertyId]);

  return { isOnline, queueSize: queue.length };
}
```

## Common Mistakes

### ❌ Autosave without debounce
**Problem:** 10 API calls per second as user types  
**Fix:** Always debounce (500ms typical):
```typescript
const timer = setTimeout(() => save(data), 500);
```

### ❌ Showing "Guardado" indicator indefinitely
**Problem:** User doesn't know if data actually saved  
**Fix:** Auto-hide after 2 seconds:
```typescript
setTimeout(() => setSaveStatus(null), 2000);
```

### ❌ Saving incomplete/invalid data
**Problem:** Autosave persists half-filled form, user confused later  
**Fix:** Only autosave if current field passes validation (on-blur):
```typescript
if (validateField(fieldName, value)) {
  autosave(fieldName, value);
}
```

### ❌ Not handling network errors
**Problem:** User thinks data is saved but server never received it  
**Fix:** Catch errors, show "error" state, retry on next change:
```typescript
.catch(error => {
  setSaveStatus('error');
  console.error('Autosave failed:', error);
  // Retry will happen on next data change (useEffect triggers again)
});
```

### ❌ Conflicting autosave + manual save
**Problem:** User clicks "Guardar" while autosave is in-flight, double-saving  
**Fix:** Debounce autosave and disable manual save while saving:
```typescript
<button type="submit" disabled={saveStatus === 'saving'}>
  Guardar
</button>
```

## Implementation for Montana OS

- **Autosave delay:** 500ms (balanced)
- **Indicator position:** Bottom-right corner, small & discrete
- **Indicator states:** "Guardando..." (gray) → "✓ Guardado" (green, 2s) → disappear
- **Validation:** Autosave only if field passes on-blur validation
- **Conflict handling:** Last-write-wins (server timestamp)
- **Error retry:** Automatic on next data change

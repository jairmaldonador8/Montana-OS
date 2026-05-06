---
name: form-validation-react-hook-form-zod
description: Use when building multi-step forms with validation in React using react-hook-form and zod. Covers on-blur vs on-submit validation, multi-step validation, and error message patterns.
---

# Form Validation with react-hook-form + Zod

## Overview

Combine `react-hook-form` (form state management) with `zod` (schema validation) to create type-safe, progressive forms. Use on-blur validation for real-time feedback and on-submit for comprehensive error checking—this hybrid approach reduces errors by 22% while avoiding interruption.

## When to Use

- Building forms with complex validation rules
- Multi-step forms where each step has different requirements
- Need type-safe validation (TypeScript)
- Progressive validation (on-blur for critical fields, on-submit for blocking)
- Need to display specific error messages per field

## Core Patterns

### 1. Define Zod Schema Per Step

```typescript
import { z } from 'zod';

// Step 1: Datos Básicos
export const step1Schema = z.object({
  type: z.enum(['casa', 'departamento', 'terreno', 'penthouse', 'residencia', 'oficina', 'local', 'bodega', 'edificio']),
  operation: z.enum(['venta', 'renta', 'venta_o_renta']),
  price: z.number().positive('Precio debe ser mayor a 0'),
  rentalPrice: z.number().positive().optional(),
  currency: z.enum(['MXN', 'USD']).default('MXN'),
});

type Step1FormData = z.infer<typeof step1Schema>;

// Step 2: Ubicación
export const step2Schema = z.object({
  neighborhood: z.string().min(3, 'Mínimo 3 caracteres'),
  address: z.string().min(5, 'Mínimo 5 caracteres'),
  gps: z.object({ lat: z.number(), lng: z.number() }).optional(),
  references: z.string().optional(),
});

type Step2FormData = z.infer<typeof step2Schema>;
```

### 2. Multi-Step Form with Progressive Saving

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function PropertyFormStep1({ propertyId, initialData, onNext }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    mode: 'onBlur', // Validate on blur (progressive)
    defaultValues: initialData,
  });

  // Autosave: watch changes and debounce
  const formData = watch();
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/properties/${propertyId}/autosave`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [formData]);

  const onSubmit = async (data) => {
    // On-submit validation runs automatically via resolver
    // If validation fails, errors are in formState.errors
    // If passes, this runs:
    try {
      await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      onNext(); // Move to next step
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Type Select */}
      <label>
        Tipo de propiedad *
        <select {...register('type')} />
        {errors.type && <span className="error">{errors.type.message}</span>}
      </label>

      {/* Operation Radio */}
      <fieldset>
        <legend>Operación *</legend>
        <label>
          <input type="radio" value="venta" {...register('operation')} />
          Venta
        </label>
        <label>
          <input type="radio" value="renta" {...register('operation')} />
          Renta
        </label>
        {errors.operation && <span className="error">{errors.operation.message}</span>}
      </fieldset>

      {/* Price Input */}
      <label>
        Precio *
        <input type="number" {...register('price', { valueAsNumber: true })} />
        {errors.price && <span className="error">{errors.price.message}</span>}
      </label>

      {/* Submit Button */}
      <button type="submit">Siguiente</button>
    </form>
  );
}
```

### 3. Error Display Best Practices

```typescript
// Mark required fields with asterisk, show specific errors
function FormField({ label, error, required, children }) {
  return (
    <div className="form-field">
      <label>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error.message}</p>
      )}
    </div>
  );
}

// Usage
<FormField
  label="Precio"
  required
  error={errors.price}
>
  <input {...register('price', { valueAsNumber: true })} />
</FormField>
```

### 4. Conditional Validation (Show/Hide Fields)

```typescript
// Show rental price only if operation includes rental
const operation = watch('operation');
const showRentalPrice = operation === 'renta' || operation === 'venta_o_renta';

// Then in form:
{showRentalPrice && (
  <label>
    Precio de renta (MXN)
    <input {...register('rentalPrice')} />
  </label>
)}
```

## Common Mistakes

### ❌ Validating on keystroke (mode: 'onChange')
**Problem:** User sees errors while typing "150", sees "must be > 0" error after "1"  
**Fix:** Use `mode: 'onBlur'` for text fields, `mode: 'onSubmit'` for forms. Validate after user finishes.

### ❌ Showing all errors at once
**Problem:** User overwhelmed by 5 red errors before they've finished the form  
**Fix:** Show errors only after blur (on-blur) or after submit attempt (on-submit), not while typing.

### ❌ Not debouncing autosave
**Problem:** 10 API calls per second as user types  
**Fix:** Debounce with `useEffect` + `setTimeout` (500ms typical):
```typescript
useEffect(() => {
  const timer = setTimeout(() => saveToDb(data), 500);
  return () => clearTimeout(timer);
}, [data]);
```

### ❌ Forgetting valueAsNumber for numeric fields
**Problem:** Form value is "150" (string) instead of 150 (number)  
**Fix:** Use `register('price', { valueAsNumber: true })`

### ❌ Mixing zod and react-hook-form validation
**Problem:** Duplicate validation logic, confusion about where errors come from  
**Fix:** Define schema once in zod, pass to resolver. Let react-hook-form handle all validation.

## Examples from Montana OS

**Step 1 validation:** type (required), operation (required), price (required, > 0)  
**Step 2 validation:** neighborhood (required, min 3 chars), address (required, min 5 chars)  
**Step 3 validation:** bedrooms (required, >= 0), bathrooms (required, >= 0), amenities (optional)  
**Step 4 validation:** photos (optional), description (optional, max 500 chars)

Use `mode: 'onBlur'` for all steps so user gets feedback without interruption.

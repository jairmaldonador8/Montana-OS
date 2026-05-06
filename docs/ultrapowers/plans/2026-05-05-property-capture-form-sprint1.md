# Property Capture Form Sprint 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `ultrapowers:subagent-driven-development` or `ultrapowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 4-step property capture form with progressive saving, autosave, and mobile-first UX.

**Architecture:** Form state managed via React Context, each step has its own component with react-hook-form + zod validation. Data persists to Supabase via autosave (500ms debounce) and manual saves. Navigation allows forward/backward with data preservation.

**Tech Stack:** React 18, Next.js 14, TypeScript, react-hook-form, zod, Supabase (PostgreSQL + Storage), Tailwind CSS, Radix UI

**Supporting Skills:**
- @form-validation-react-hook-form-zod
- @autosave-patterns
- @supabase-integration-react
- @file-upload-patterns
- @multi-step-form-state

---

## File Structure

```
src/
├── app/(dashboard)/propiedades/nueva/
│   ├── page.tsx              ← Entry point, FormProvider wrapper
│   └── layout.tsx            ← (already exists)
├── components/propiedades/
│   ├── FormContainer.tsx     ← Navigation, progress bar
│   ├── FormStep1.tsx         ← Datos básicos
│   ├── FormStep2.tsx         ← Ubicación
│   ├── FormStep3.tsx         ← Características + Amenidades
│   ├── FormStep4.tsx         ← Fotos + Descripción
│   ├── GalleryUpload.tsx     ← Drag-drop file upload
│   └── AutosaveIndicator.tsx ← "Guardando..." / "Guardado" indicator
├── context/
│   └── formContext.tsx       ← FormState, useForm hook, localStorage
├── lib/
│   ├── formValidation.ts     ← Zod schemas for 4 steps
│   ├── formActions.ts        ← Server actions for autosave/save
│   └── (existing files)
└── app/api/properties/
    ├── route.ts              ← POST /api/properties (create)
    ├── [id]/
    │   ├── route.ts          ← PATCH /api/properties/{id} (update)
    │   └── autosave/
    │       └── route.ts      ← POST /api/properties/{id}/autosave
```

---

## Task 1: Form Validation Schemas

**Files:**
- Create: `src/lib/formValidation.ts`
- Test: `src/lib/__tests__/formValidation.test.ts`

**Reference:** @form-validation-react-hook-form-zod

- [ ] **Step 1: Create zod schema file**

```typescript
// src/lib/formValidation.ts
import { z } from 'zod';

export const step1Schema = z.object({
  type: z.enum([
    'casa',
    'departamento',
    'terreno',
    'penthouse',
    'residencia',
    'oficina',
    'local',
    'bodega',
    'edificio',
  ]),
  operation: z.enum(['venta', 'renta', 'venta_o_renta']),
  price: z.number().positive('Precio debe ser mayor a 0'),
  rentalPrice: z.number().positive().optional(),
  currency: z.enum(['MXN', 'USD']).default('MXN'),
});

export type Step1Data = z.infer<typeof step1Schema>;

export const step2Schema = z.object({
  neighborhood: z.string().min(3, 'Mínimo 3 caracteres'),
  address: z.string().min(5, 'Mínimo 5 caracteres'),
  gps: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  references: z.string().optional(),
});

export type Step2Data = z.infer<typeof step2Schema>;

export const step3Schema = z.object({
  bedrooms: z.number().nonnegative('No puede ser negativo'),
  bathrooms: z.number().nonnegative('No puede ser negativo'),
  m2Built: z.number().positive('Debe ser mayor a 0'),
  m2Land: z.number().positive().optional(),
  floorLevel: z.number().optional(),
  amenities: z.array(z.string()).default([]),
});

export type Step3Data = z.infer<typeof step3Schema>;

export const step4Schema = z.object({
  photos: z.array(z.string()).default([]),
  description: z.string().max(500).optional(),
});

export type Step4Data = z.infer<typeof step4Schema>;

export const fullPropertySchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema);
```

- [ ] **Step 2: Write validation tests**

```typescript
// src/lib/__tests__/formValidation.test.ts
import { step1Schema, step2Schema, step3Schema, step4Schema } from '../formValidation';

describe('Form Validation', () => {
  describe('Step 1: Datos Básicos', () => {
    it('validates valid step 1 data', () => {
      const data = {
        type: 'casa',
        operation: 'venta',
        price: 5000000,
        currency: 'MXN',
      };
      expect(() => step1Schema.parse(data)).not.toThrow();
    });

    it('rejects negative price', () => {
      const data = {
        type: 'casa',
        operation: 'venta',
        price: -1000,
        currency: 'MXN',
      };
      expect(() => step1Schema.parse(data)).toThrow();
    });

    it('requires type and operation', () => {
      const data = { price: 5000000, currency: 'MXN' };
      expect(() => step1Schema.parse(data)).toThrow();
    });
  });

  describe('Step 2: Ubicación', () => {
    it('validates valid step 2 data', () => {
      const data = {
        neighborhood: 'Barrio Antiguo',
        address: 'Calle Principal 123',
      };
      expect(() => step2Schema.parse(data)).not.toThrow();
    });

    it('rejects neighborhood < 3 chars', () => {
      const data = {
        neighborhood: 'AB',
        address: 'Calle Principal 123',
      };
      expect(() => step2Schema.parse(data)).toThrow();
    });
  });

  describe('Step 3: Características', () => {
    it('validates valid step 3 data', () => {
      const data = {
        bedrooms: 3,
        bathrooms: 2,
        m2Built: 250,
        amenities: ['jardín', 'alberca'],
      };
      expect(() => step3Schema.parse(data)).not.toThrow();
    });

    it('rejects negative bedrooms', () => {
      const data = {
        bedrooms: -1,
        bathrooms: 2,
        m2Built: 250,
      };
      expect(() => step3Schema.parse(data)).toThrow();
    });
  });

  describe('Step 4: Fotos + Descripción', () => {
    it('allows empty photos and description', () => {
      const data = { photos: [], description: '' };
      expect(() => step4Schema.parse(data)).not.toThrow();
    });

    it('rejects description > 500 chars', () => {
      const data = {
        photos: [],
        description: 'a'.repeat(501),
      };
      expect(() => step4Schema.parse(data)).toThrow();
    });
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- src/lib/__tests__/formValidation.test.ts
```

Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/lib/formValidation.ts src/lib/__tests__/formValidation.test.ts
git commit -m "feat: add form validation schemas (step 1-4)"
git push origin main
```

---

## Task 2: Form Context & State Management

**Files:**
- Create: `src/context/formContext.tsx`
- Test: `src/context/__tests__/formContext.test.tsx`

**Reference:** @multi-step-form-state

- [ ] **Step 1: Create FormContext**

```typescript
// src/context/formContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Step1Data, Step2Data, Step3Data, Step4Data } from '@/lib/formValidation';

export interface FormState {
  step1: Partial<Step1Data>;
  step2: Partial<Step2Data>;
  step3: Partial<Step3Data>;
  step4: Partial<Step4Data>;
}

interface FormContextType {
  formState: FormState;
  currentStep: number;
  updateStep: (step: number, data: any) => void;
  goToStep: (step: number) => void;
  resetForm: () => void;
  getStepData: (step: number) => any;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const initialState: FormState = {
  step1: {},
  step2: {},
  step3: {},
  step4: {},
};

export function FormProvider({
  children,
  propertyId,
}: {
  children: React.ReactNode;
  propertyId?: string;
}) {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('propertyFormDraft');
    if (saved) {
      try {
        const { formState: savedState, currentStep: savedStep } = JSON.parse(saved);
        setFormState(savedState);
        setCurrentStep(savedStep);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  const updateStep = useCallback((step: number, data: any) => {
    setFormState((prev) => {
      const updated = {
        ...prev,
        [`step${step}`]: { ...prev[`step${step}` as keyof FormState], ...data },
      };
      // Persist to localStorage
      localStorage.setItem(
        'propertyFormDraft',
        JSON.stringify({ formState: updated, currentStep, propertyId })
      );
      return updated;
    });
  }, [currentStep, propertyId]);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    localStorage.setItem(
      'propertyFormDraft',
      JSON.stringify({ formState, currentStep: step, propertyId })
    );
  }, [formState, propertyId]);

  const resetForm = useCallback(() => {
    setFormState(initialState);
    setCurrentStep(1);
    localStorage.removeItem('propertyFormDraft');
  }, []);

  const getStepData = useCallback(
    (step: number) => {
      return formState[`step${step}` as keyof FormState] || {};
    },
    [formState]
  );

  if (!isHydrated) {
    return <>{children}</>;
  }

  return (
    <FormContext.Provider
      value={{ formState, currentStep, updateStep, goToStep, resetForm, getStepData }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within FormProvider');
  }
  return context;
}
```

- [ ] **Step 2: Write context tests**

```typescript
// src/context/__tests__/formContext.test.tsx
import { renderHook, act } from '@testing-library/react';
import { FormProvider, useForm } from '../formContext';

describe('FormContext', () => {
  it('initializes with empty form state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormProvider>{children}</FormProvider>
    );
    const { result } = renderHook(() => useForm(), { wrapper });

    expect(result.current.currentStep).toBe(1);
    expect(result.current.formState.step1).toEqual({});
  });

  it('updates step data', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormProvider>{children}</FormProvider>
    );
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateStep(1, { type: 'casa', operation: 'venta', price: 5000000 });
    });

    expect(result.current.formState.step1.type).toBe('casa');
  });

  it('navigates between steps', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormProvider>{children}</FormProvider>
    );
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.goToStep(3);
    });

    expect(result.current.currentStep).toBe(3);
  });

  it('resets form state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormProvider>{children}</FormProvider>
    );
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateStep(1, { type: 'casa' });
      result.current.resetForm();
    });

    expect(result.current.currentStep).toBe(1);
    expect(result.current.formState.step1).toEqual({});
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- src/context/__tests__/formContext.test.tsx
```

Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/context/formContext.tsx src/context/__tests__/formContext.test.tsx
git commit -m "feat: add form context for state management across steps"
git push origin main
```

---

## Task 3: Autosave Indicator Component

**Files:**
- Create: `src/components/propiedades/AutosaveIndicator.tsx`

**Reference:** @autosave-patterns

- [ ] **Step 1: Create component**

```typescript
// src/components/propiedades/AutosaveIndicator.tsx
'use client';

import { useEffect, useState } from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function AutosaveIndicator({ status }: { status: SaveStatus | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === null) {
      setVisible(false);
      return;
    }

    setVisible(true);

    if (status === 'saved') {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 text-sm pointer-events-none">
      {status === 'saving' && (
        <div className="text-gray-500">Guardando...</div>
      )}
      {status === 'saved' && (
        <div className="text-green-500 font-medium">✓ Guardado</div>
      )}
      {status === 'error' && (
        <div className="text-red-500">⚠ Error al guardar</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/propiedades/AutosaveIndicator.tsx
git commit -m "feat: add autosave indicator component"
git push origin main
```

---

## Task 4: FormStep1 Component (Datos Básicos)

**Files:**
- Create: `src/components/propiedades/FormStep1.tsx`

**Reference:** @form-validation-react-hook-form-zod

- [ ] **Step 1: Create component with react-hook-form**

```typescript
// src/components/propiedades/FormStep1.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema, type Step1Data } from '@/lib/formValidation';
import { useForm as useFormContext } from '@/context/formContext';
import { PROPERTY_TYPES, OPERATIONS } from '@/lib/constants';

export function FormStep1() {
  const { updateStep, goToStep } = useFormContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: 'onBlur',
    defaultValues: useFormContext().getStepData(1),
  });

  const operation = watch('operation');

  const onSubmit = (data: Step1Data) => {
    updateStep(1, data);
    goToStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium">
          Tipo de propiedad <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          {...register('type')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Selecciona...</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.type && <span className="text-sm text-red-500">{errors.type.message}</span>}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">
          Operación <span className="text-red-500">*</span>
        </legend>
        {OPERATIONS.map((op) => (
          <label key={op.id} className="flex items-center gap-2">
            <input type="radio" value={op.id} {...register('operation')} />
            <span>{op.label}</span>
          </label>
        ))}
        {errors.operation && (
          <span className="text-sm text-red-500">{errors.operation.message}</span>
        )}
      </fieldset>

      <div>
        <label htmlFor="price" className="block text-sm font-medium">
          Precio <span className="text-red-500">*</span>
        </label>
        <input
          id="price"
          type="number"
          {...register('price', { valueAsNumber: true })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        {errors.price && <span className="text-sm text-red-500">{errors.price.message}</span>}
      </div>

      {(operation === 'renta' || operation === 'venta_o_renta') && (
        <div>
          <label htmlFor="rentalPrice" className="block text-sm font-medium">
            Precio de renta
          </label>
          <input
            id="rentalPrice"
            type="number"
            {...register('rentalPrice', { valueAsNumber: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {errors.rentalPrice && (
            <span className="text-sm text-red-500">{errors.rentalPrice.message}</span>
          )}
        </div>
      )}

      <div>
        <label htmlFor="currency" className="block text-sm font-medium">
          Moneda
        </label>
        <select
          id="currency"
          {...register('currency')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="MXN">MXN</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-montana-gold text-white rounded-md font-medium hover:bg-opacity-90"
      >
        Siguiente
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/propiedades/FormStep1.tsx
git commit -m "feat: implement FormStep1 (Datos Básicos) with validation"
git push origin main
```

---

## Task 5: FormStep2 Component (Ubicación)

**Files:**
- Create: `src/components/propiedades/FormStep2.tsx`

**Reference:** @form-validation-react-hook-form-zod

- [ ] **Step 1: Create component**

```typescript
// src/components/propiedades/FormStep2.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema, type Step2Data } from '@/lib/formValidation';
import { useForm as useFormContext } from '@/context/formContext';
import { useState } from 'react';

export function FormStep2() {
  const { updateStep, goToStep, currentStep } = useFormContext();
  const [gpsLoading, setGpsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: 'onBlur',
    defaultValues: useFormContext().getStepData(2),
  });

  const handleGetGPS = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('gps', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setGpsLoading(false);
        },
        () => {
          console.error('GPS not available');
          setGpsLoading(false);
        }
      );
    }
  };

  const onSubmit = (data: Step2Data) => {
    updateStep(2, data);
    goToStep(3);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="neighborhood" className="block text-sm font-medium">
          Colonia <span className="text-red-500">*</span>
        </label>
        <input
          id="neighborhood"
          type="text"
          {...register('neighborhood')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        {errors.neighborhood && (
          <span className="text-sm text-red-500">{errors.neighborhood.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium">
          Dirección <span className="text-red-500">*</span>
        </label>
        <input
          id="address"
          type="text"
          {...register('address')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        {errors.address && (
          <span className="text-sm text-red-500">{errors.address.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Coordenadas GPS</label>
        <button
          type="button"
          onClick={handleGetGPS}
          disabled={gpsLoading}
          className="px-3 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50"
        >
          {gpsLoading ? 'Obteniendo...' : 'Capturar ubicación'}
        </button>
      </div>

      <div>
        <label htmlFor="references" className="block text-sm font-medium">
          Referencias (opcional)
        </label>
        <textarea
          id="references"
          {...register('references')}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => goToStep(currentStep - 1)}
          className="flex-1 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50"
        >
          Anterior
        </button>
        <button
          type="submit"
          className="flex-1 py-2 bg-montana-gold text-white rounded-md font-medium hover:bg-opacity-90"
        >
          Siguiente
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/propiedades/FormStep2.tsx
git commit -m "feat: implement FormStep2 (Ubicación) with GPS capture"
git push origin main
```

---

## Task 6: FormStep3 Component (Características + Amenidades)

**Files:**
- Create: `src/components/propiedades/FormStep3.tsx`

**Reference:** @form-validation-react-hook-form-zod

- [ ] **Step 1: Create component with amenities**

```typescript
// src/components/propiedades/FormStep3.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step3Schema, type Step3Data } from '@/lib/formValidation';
import { useForm as useFormContext } from '@/context/formContext';
import { AMENITIES } from '@/lib/constants';

const AMENITY_GROUPS = {
  exterior: [
    'acceso_a_la_playa',
    'frente_a_la_playa',
    'frente_al_agua',
    'garaje',
    'estacionamiento_techado',
    'facilidad_para_estacionarse',
    'jardín',
    'patio',
    'riego_por_aspersión',
    'parrilla',
    'roof_garden',
    'andén',
    'muelle_de_carga',
    'cisterna',
  ],
  interior: [
    'estudio',
    'vestidor',
    'cocina_integral',
    'cuarto_servicio',
    'cuarto_lavado',
    'bodega',
    'pozo',
    'paneles_solares',
    'smart_home',
    'aire_acondicionado',
    'calefacción',
    'chimenea',
  ],
  vistas: ['vista_panoramica', 'vista_montaña', 'vista_ciudad'],
};

export function FormStep3() {
  const { updateStep, goToStep, currentStep } = useFormContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    mode: 'onBlur',
    defaultValues: useFormContext().getStepData(3),
  });

  const amenities = watch('amenities');

  const onSubmit = (data: Step3Data) => {
    updateStep(3, data);
    goToStep(4);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium">
            Recámaras <span className="text-red-500">*</span>
          </label>
          <input
            id="bedrooms"
            type="number"
            {...register('bedrooms', { valueAsNumber: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {errors.bedrooms && (
            <span className="text-sm text-red-500">{errors.bedrooms.message}</span>
          )}
        </div>

        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium">
            Baños <span className="text-red-500">*</span>
          </label>
          <input
            id="bathrooms"
            type="number"
            {...register('bathrooms', { valueAsNumber: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {errors.bathrooms && (
            <span className="text-sm text-red-500">{errors.bathrooms.message}</span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="m2Built" className="block text-sm font-medium">
          Construcción (m²) <span className="text-red-500">*</span>
        </label>
        <input
          id="m2Built"
          type="number"
          step="0.01"
          {...register('m2Built', { valueAsNumber: true })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        {errors.m2Built && (
          <span className="text-sm text-red-500">{errors.m2Built.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="m2Land" className="block text-sm font-medium">
          Terreno (m²)
        </label>
        <input
          id="m2Land"
          type="number"
          step="0.01"
          {...register('m2Land', { valueAsNumber: true })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Amenidades</label>
        {Object.entries(AMENITY_GROUPS).map(([group, amenityIds]) => (
          <div key={group} className="mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
              {group}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {amenityIds.map((amenityId) => (
                <label key={amenityId} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={amenityId}
                    {...register('amenities')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{amenityId.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => goToStep(currentStep - 1)}
          className="flex-1 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50"
        >
          Anterior
        </button>
        <button
          type="submit"
          className="flex-1 py-2 bg-montana-gold text-white rounded-md font-medium hover:bg-opacity-90"
        >
          Siguiente
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/propiedades/FormStep3.tsx
git commit -m "feat: implement FormStep3 (Características) with amenities"
git push origin main
```

---

## Task 7: Gallery Upload Component

**Files:**
- Create: `src/components/propiedades/GalleryUpload.tsx`

**Reference:** @file-upload-patterns

- [ ] **Step 1: Create drag-drop upload component**

```typescript
// src/components/propiedades/GalleryUpload.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface UploadedFile {
  file: File;
  url: string;
  progress: number;
  error: string | null;
}

export function GalleryUpload({
  propertyId,
  onComplete,
}: {
  propertyId: string;
  onComplete: (urls: string[]) => void;
}) {
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
    if (files.length === 0) {
      alert('Solo JPG, PNG o WebP (máx 10MB)');
      return;
    }

    if (uploads.length + files.length > maxPhotos) {
      alert(`Máximo ${maxPhotos} fotos permitidas`);
      return;
    }

    const newUploads = files.map((file) => ({
      file,
      url: '',
      progress: 0,
      error: null,
    }));

    setUploads((prev) => [...prev, ...newUploads]);

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
        className="border-2 border-dashed border-gray-300 rounded p-8 text-center cursor-pointer hover:bg-gray-50"
      >
        <p className="text-gray-500 font-medium">Arrastra fotos aquí</p>
        <p className="text-xs text-gray-400 mt-2">
          Máx {maxPhotos} fotos, 10MB c/u (JPG, PNG, WebP)
        </p>
      </div>

      {/* Upload list */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded">
              {upload.url ? (
                <img
                  src={upload.url}
                  alt=""
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.file.name}</p>
                {upload.error ? (
                  <p className="text-xs text-red-500">{upload.error}</p>
                ) : (
                  <div className="w-full bg-gray-200 rounded h-1 mt-1">
                    <div
                      className="bg-blue-500 h-1 rounded transition-all"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => handleRemovePhoto(index)}
                className="text-red-500 hover:text-red-700 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Complete button */}
      {uploads.length > 0 && (
        <button
          onClick={handleComplete}
          disabled={uploads.some((u) => !u.url && !u.error)}
          className="w-full py-2 bg-montana-gold text-white rounded-md font-medium hover:bg-opacity-90 disabled:opacity-50"
        >
          Guardar fotos ({uploads.filter((u) => u.url).length}/{uploads.length})
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/propiedades/GalleryUpload.tsx
git commit -m "feat: implement GalleryUpload with drag-drop and progress"
git push origin main
```

---

## Task 8: FormStep4 Component (Fotos + Descripción)

**Files:**
- Create: `src/components/propiedades/FormStep4.tsx`

**Reference:** @file-upload-patterns

- [ ] **Step 1: Create final step component**

```typescript
// src/components/propiedades/FormStep4.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step4Schema, type Step4Data } from '@/lib/formValidation';
import { useForm as useFormContext } from '@/context/formContext';
import { GalleryUpload } from './GalleryUpload';
import { useState } from 'react';

export function FormStep4({ propertyId }: { propertyId: string }) {
  const { updateStep, goToStep, currentStep, formState, resetForm } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    mode: 'onBlur',
    defaultValues: useFormContext().getStepData(4),
  });

  const description = watch('description');

  const onPhotoComplete = (urls: string[]) => {
    setValue('photos', urls);
    updateStep(4, { photos: urls });
  };

  const onSubmit = async (data: Step4Data) => {
    setIsSubmitting(true);
    try {
      // Compile full form data from all steps
      const fullData = {
        ...formState.step1,
        ...formState.step2,
        ...formState.step3,
        ...data,
        status: 'pending_review',
      };

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData),
      });

      if (!response.ok) throw new Error('Submission failed');

      // Clear draft and redirect
      localStorage.removeItem('propertyFormDraft');
      window.location.href = '/dashboard/propiedades';
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error al enviar. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Fotos</h3>
        <GalleryUpload propertyId={propertyId} onComplete={onPhotoComplete} />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={6}
          placeholder="Describe la propiedad en tus propias palabras..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <div className="text-xs text-gray-500 mt-1">
          {description?.length || 0}/500 caracteres
        </div>
        {errors.description && (
          <span className="text-sm text-red-500">{errors.description.message}</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => goToStep(currentStep - 1)}
          className="flex-1 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('¿Descartar borrador y cancelar?')) {
              resetForm();
              window.location.href = '/dashboard/propiedades';
            }
          }}
          className="flex-1 py-2 border border-red-300 text-red-600 rounded-md font-medium hover:bg-red-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2 bg-montana-gold text-white rounded-md font-medium hover:bg-opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar a revisión'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/propiedades/FormStep4.tsx
git commit -m "feat: implement FormStep4 (Fotos + Descripción) with final submission"
git push origin main
```

---

## Task 9: FormContainer & Navigation

**Files:**
- Create: `src/components/propiedades/FormContainer.tsx`

- [ ] **Step 1: Create container with progress**

```typescript
// src/components/propiedades/FormContainer.tsx
'use client';

import { useForm } from '@/context/formContext';
import { useState, useEffect } from 'react';
import { FormStep1 } from './FormStep1';
import { FormStep2 } from './FormStep2';
import { FormStep3 } from './FormStep3';
import { FormStep4 } from './FormStep4';
import { AutosaveIndicator } from './AutosaveIndicator';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | null;

export function FormContainer({ propertyId }: { propertyId: string }) {
  const { currentStep, goToStep, formState } = useForm();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Autosave on form changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (Object.keys(formState[`step${currentStep}` as keyof typeof formState] || {}).length === 0) {
        return;
      }

      setSaveStatus('saving');
      try {
        await fetch(`/api/properties/${propertyId}/autosave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [`step${currentStep}`]: formState[`step${currentStep}` as keyof typeof formState],
          }),
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Autosave error:', error);
        setSaveStatus('error');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formState, currentStep, propertyId]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FormStep1 />;
      case 2:
        return <FormStep2 />;
      case 3:
        return <FormStep3 />;
      case 4:
        return <FormStep4 propertyId={propertyId} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded transition-all ${
                step <= currentStep ? 'bg-montana-gold' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">Paso {currentStep} de 4</p>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        {renderStep()}
      </div>

      {/* Autosave indicator */}
      <AutosaveIndicator status={saveStatus === 'idle' ? null : saveStatus} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/propiedades/FormContainer.tsx
git commit -m "feat: add FormContainer with progress bar and autosave"
git push origin main
```

---

## Task 10: Page Entry Point

**Files:**
- Modify: `src/app/(dashboard)/propiedades/nueva/page.tsx`

- [ ] **Step 1: Update page component**

```typescript
// src/app/(dashboard)/propiedades/nueva/page.tsx
import { FormProvider } from '@/context/formContext';
import { FormContainer } from '@/components/propiedades/FormContainer';
import { createServerClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid'; // Add to dependencies

export default async function NuevaPropiedadPage() {
  const supabase = await createServerClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>No autorizado</div>;
  }

  // Generate property ID or get from query
  const propertyId = nanoid();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-montana-gold">Captura</p>
        <h1 className="text-4xl font-editorial mt-2">Nueva propiedad</h1>
        <p className="text-muted-foreground mt-2 font-editorial italic">
          Llena los datos en 4 pasos · la asistente revisará y publicará.
        </p>
      </div>

      <FormProvider propertyId={propertyId}>
        <FormContainer propertyId={propertyId} />
      </FormProvider>
    </div>
  );
}
```

- [ ] **Step 2: Install nanoid**

```bash
npm install nanoid
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/propiedades/nueva/page.tsx
git commit -m "feat: wire up FormContainer to nueva/page.tsx"
git push origin main
```

---

## Task 11: API Endpoints (Autosave)

**Files:**
- Create: `src/app/api/properties/[id]/autosave/route.ts`

**Reference:** @supabase-integration-react, @autosave-patterns

- [ ] **Step 1: Create autosave endpoint**

```typescript
// src/app/api/properties/[id]/autosave/route.ts
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();

    // Extract step data
    const stepKey = Object.keys(body)[0]; // "step1", "step2", etc.
    const stepData = body[stepKey];

    if (!stepKey || !stepData) {
      return new Response(JSON.stringify({ error: 'Invalid step data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build update object based on step
    let updateData: any = {};

    if (stepKey === 'step1') {
      updateData = {
        type: stepData.type,
        operation: stepData.operation,
        price: stepData.price,
        rental_price: stepData.rentalPrice,
        currency: stepData.currency,
      };
    } else if (stepKey === 'step2') {
      updateData = {
        neighborhood: stepData.neighborhood,
        address: stepData.address,
        gps: stepData.gps ? JSON.stringify(stepData.gps) : null,
        references: stepData.references,
      };
    } else if (stepKey === 'step3') {
      updateData = {
        bedrooms: stepData.bedrooms,
        bathrooms: stepData.bathrooms,
        m2_built: stepData.m2Built,
        m2_land: stepData.m2Land,
        amenities: stepData.amenities,
      };
    } else if (stepKey === 'step4') {
      updateData = {
        media: stepData.photos, // Simplified: store URLs as array
        description: stepData.description,
      };
    }

    // Update database
    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', params.id)
      .eq('captured_by', user.id)
      .select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/properties/\[id\]/autosave/route.ts
git commit -m "feat: add autosave endpoint"
git push origin main
```

---

## Task 12: API Endpoints (Create/Update)

**Files:**
- Create: `src/app/api/properties/route.ts`
- Create: `src/app/api/properties/[id]/route.ts`

- [ ] **Step 1: Create property POST endpoint**

```typescript
// src/app/api/properties/route.ts
import { createServerClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const code = `MR-${new Date().getFullYear()}-${nanoid(4).toUpperCase()}`;
    const { data, error } = await supabase
      .from('properties')
      .insert([
        {
          code,
          captured_by: user.id,
          status: 'draft',
          type: 'casa',
          operation: 'venta',
          price: 0,
        },
      ])
      .select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

- [ ] **Step 2: Create property PATCH endpoint**

```typescript
// src/app/api/properties/[id]/route.ts
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('properties')
      .update(body)
      .eq('id', params.id)
      .eq('captured_by', user.id)
      .select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/properties/route.ts src/app/api/properties/\[id\]/route.ts
git commit -m "feat: add property create and update API endpoints"
git push origin main
```

---

## Task 13: Testing & QA

**Files:**
- Test all form steps manually
- Test autosave indicator
- Test mobile responsiveness
- Test error handling

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test Form Flow**

Open http://localhost:3000/dashboard/propiedades/nueva and:
- Fill step 1, click "Siguiente" → should move to step 2
- Go back to step 1, verify data is preserved
- Fill all steps
- Verify autosave indicator appears/disappears
- Submit form → should redirect to propiedades list

- [ ] **Step 3: Test Mobile**

Open DevTools, set to mobile view (iPhone SE 375px):
- Verify single column layout
- Verify tap targets are 44px+
- Verify inputs are readable without zoom
- Verify buttons work on touch

- [ ] **Step 4: Test Error States**

- Enter invalid price (negative) → should show error on blur
- Try submitting step 1 without type → should block and show error
- Upload file > 10MB → should reject
- Disconnect network, try autosave → should show error state

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "test: verified form flow, mobile responsiveness, and error handling"
git push origin main
```

---

## Summary

**What was built:**
- ✅ 4-step form with progressive saving
- ✅ Zod schemas + react-hook-form validation
- ✅ Form state context with localStorage persistence
- ✅ Autosave with 500ms debounce
- ✅ File upload gallery with drag-drop
- ✅ Mobile-first responsive design
- ✅ API endpoints for create/update/autosave
- ✅ Autosave indicator ("Guardando..." / "Guardado")
- ✅ Navigation between steps with data preservation

**Next steps after this plan:**
- Build review panel (Step 2 of MVP)
- Build property list view
- Set up property publishing system
- Add real-time notifications for reviewers


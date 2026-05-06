---
name: multi-step-form-state
description: Use when managing form state across multiple steps (wizards). Covers state management per step, navigation between steps, data persistence, and recovery from page refreshes.
---

# Multi-Step Form State Management

## Overview

Multi-step forms require tracking data across steps while allowing users to navigate forward/backward. Persist state in local storage or database to enable recovery if user closes the browser mid-form. Validate each step before allowing progression.

## When to Use

- Wizards with 2+ steps
- Long forms split into logical sections
- Need to allow user to save progress and return later
- User should be able to edit previous steps
- Each step has different validation requirements

## Core Patterns

### 1. Form State Context

```typescript
// src/context/formContext.tsx
'use client';

import { createContext, useContext, useState, useCallback } from 'react';

export interface FormState {
  step1: { type: string; operation: string; price: number; rentalPrice?: number };
  step2: { neighborhood: string; address: string; gps?: { lat: number; lng: number } };
  step3: { bedrooms: number; bathrooms: number; m2Built: number; amenities: string[] };
  step4: { photos: string[]; description: string };
}

interface FormContextType {
  formState: Partial<FormState>;
  currentStep: number;
  updateStep: (step: number, data: any) => void;
  goToStep: (step: number) => void;
  resetForm: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [formState, setFormState] = useState<Partial<FormState>>({});
  const [currentStep, setCurrentStep] = useState(1);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('propertyFormDraft');
    if (saved) {
      const { formState: savedState, currentStep: savedStep } = JSON.parse(saved);
      setFormState(savedState);
      setCurrentStep(savedStep);
    }
  }, []);

  const updateStep = useCallback(
    (step: number, data: any) => {
      setFormState((prev) => {
        const updated = { ...prev, [`step${step}`]: data };
        // Persist to localStorage
        localStorage.setItem(
          'propertyFormDraft',
          JSON.stringify({ formState: updated, currentStep })
        );
        return updated;
      });
    },
    [currentStep]
  );

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    // Save current step to localStorage
    localStorage.setItem(
      'propertyFormDraft',
      JSON.stringify({ formState, currentStep: step })
    );
  }, [formState]);

  const resetForm = useCallback(() => {
    setFormState({});
    setCurrentStep(1);
    localStorage.removeItem('propertyFormDraft');
  }, []);

  return (
    <FormContext.Provider value={{ formState, currentStep, updateStep, goToStep, resetForm }}>
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

### 2. Step Component with Navigation

```typescript
// src/components/propiedades/FormStep1.tsx
'use client';

import { useForm } from '@/context/formContext';
import { useFormHook } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema } from '@/lib/formValidation';

export function FormStep1() {
  const { formState, updateStep, goToStep } = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useFormHook({
    resolver: zodResolver(step1Schema),
    mode: 'onBlur',
    defaultValues: formState.step1 || {},
  });

  const onSubmit = (data: any) => {
    // Validate and save
    updateStep(1, data);
    // Navigate to next step
    goToStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Paso 1 de 4: Datos Básicos</h2>

      {/* Form fields */}
      <select {...register('type')}>
        <option>Casa</option>
        <option>Departamento</option>
        {/* ... */}
      </select>
      {errors.type && <span className="error">{errors.type.message}</span>}

      {/* Buttons */}
      <div className="flex gap-2">
        <button type="submit">Siguiente</button>
      </div>
    </form>
  );
}
```

### 3. Navigation Between Steps

```typescript
// src/components/propiedades/FormContainer.tsx
'use client';

import { useForm } from '@/context/formContext';
import { FormStep1 } from './FormStep1';
import { FormStep2 } from './FormStep2';
import { FormStep3 } from './FormStep3';
import { FormStep4 } from './FormStep4';

export function FormContainer({ propertyId }: { propertyId: string }) {
  const { currentStep, goToStep, resetForm } = useForm();

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
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex-1 h-2 rounded ${
              step <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-500">Paso {currentStep} de 4</p>

      {/* Current step */}
      {renderStep()}

      {/* Navigation buttons (inside each step component) */}
      <div className="flex gap-2 mt-8">
        <button
          onClick={() => goToStep(currentStep - 1)}
          disabled={currentStep === 1}
        >
          Anterior
        </button>
        {/* "Siguiente" is in form submit */}
        <button onClick={resetForm} className="text-red-500">
          Cancelar
        </button>
      </div>
    </div>
  );
}
```

### 4. Handling Page Refresh (Data Recovery)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@/context/formContext';

export function PropertyForm({ propertyId }: { propertyId: string }) {
  const { formState, goToStep } = useForm();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount: check if we have unsaved draft
    const hasDraft = localStorage.getItem('propertyFormDraft');

    if (hasDraft) {
      const { currentStep } = JSON.parse(hasDraft);
      // Optionally show "Resume?" dialog
      console.log(`Resume form from step ${currentStep}?`);
      goToStep(currentStep);
    } else if (propertyId) {
      // Load from database if editing existing property
      fetch(`/api/properties/${propertyId}`)
        .then((res) => res.json())
        .then((data) => {
          // Populate formState from DB
          // This assumes data has step1, step2, etc.
          Object.keys(data).forEach((key) => {
            if (key.startsWith('step')) {
              updateStep(parseInt(key.replace('step', '')), data[key]);
            }
          });
        });
    }

    setIsLoading(false);
  }, [propertyId, goToStep, updateStep]);

  if (isLoading) return <div>Cargando...</div>;

  return <FormContainer propertyId={propertyId} />;
}
```

### 5. Editing Previous Steps

```typescript
// User can click on step indicator to go back
<div className="flex gap-1">
  {[1, 2, 3, 4].map((step) => (
    <button
      key={step}
      onClick={() => goToStep(step)}
      disabled={step > currentStep} // Can't skip forward
      className={`flex-1 p-2 rounded ${
        step === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200'
      }`}
    >
      Paso {step}
    </button>
  ))}
</div>

// When user goes back:
// 1. Context restores data from formState.step{X}
// 2. User can edit
// 3. On submit, updates formState
// 4. Data persists to localStorage
// 5. User can go forward again
```

### 6. Final Submission (Mark as pending_review)

```typescript
// src/components/propiedades/FormStep4.tsx
'use client';

import { useForm } from '@/context/formContext';

export function FormStep4({ propertyId }: { propertyId: string }) {
  const { formState } = useForm();

  const onFinalSubmit = async () => {
    try {
      // Submit entire form to DB with status = pending_review
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...formState.step1,
          ...formState.step2,
          ...formState.step3,
          ...formState.step4,
          status: 'pending_review', // Mark as submitted
        }),
      });

      if (response.ok) {
        // Clear draft
        localStorage.removeItem('propertyFormDraft');
        // Redirect to list
        window.location.href = '/dashboard/propiedades';
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <div>
      <h2>Paso 4 de 4: Fotos y Descripción</h2>
      {/* Form fields */}
      <button onClick={onFinalSubmit} type="submit">
        Enviar a revisión
      </button>
    </div>
  );
}
```

## Common Mistakes

### ❌ Not persisting state to localStorage
**Problem:** User refreshes page on step 3, loses all data  
**Fix:** Save to localStorage after each step:
```typescript
localStorage.setItem('formDraft', JSON.stringify({ formState, currentStep }));
```

### ❌ Not allowing backward navigation
**Problem:** User made typo in step 1, must restart  
**Fix:** Allow clicking previous steps to edit:
```typescript
<button onClick={() => goToStep(step - 1)}>Anterior</button>
```

### ❌ Validating all steps upfront
**Problem:** User sees 50 validation errors before completing form  
**Fix:** Only validate current step, accumulate data:
```typescript
// Validate step 1 only when submitting step 1
resolver: zodResolver(step1Schema)
```

### ❌ Losing data when switching steps
**Problem:** User navigates step 1 → 2 → 1, step 1 data is empty  
**Fix:** Save to context before navigating:
```typescript
updateStep(1, data); // Save first
goToStep(2); // Then navigate
```

### ❌ Not clearing localStorage after successful submission
**Problem:** User submits form, then starts new form, old data reappears  
**Fix:** Clear after final submission:
```typescript
localStorage.removeItem('propertyFormDraft');
```

## Montana OS Implementation

- **Steps:** 4 (Datos básicos, Ubicación, Características, Fotos+Descripción)
- **State persistence:** localStorage + Supabase DB (autosave)
- **Navigation:** Allow going back to any previous step
- **Progress indicator:** Visual bar showing 1/4, 2/4, etc.
- **Data recovery:** On refresh, resume from last completed step
- **Final submission:** Sets status = 'pending_review'
- **Cleanup:** Clear localStorage after successful submission

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@/context/formContext';
import { FormStep1 } from './FormStep1';
import { FormStep2 } from './FormStep2';
import { FormStep3 } from './FormStep3';
import { FormStep4 } from './FormStep4';
import { AutosaveIndicator } from './AutosaveIndicator';

// Get form data from the form element
function getFormDataFromDOM(currentStep: number): Record<string, any> {
  const formElement = document.querySelector('form');
  if (!formElement) return {};

  const formData = new FormData(formElement);
  const data: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    if (key === 'gps.lat' || key === 'gps.lng') {
      if (!data.gps) data.gps = {};
      const [, field] = key.split('.');
      data.gps[field] = parseFloat(value as string);
    } else if (data[key] !== undefined && Array.isArray(data[key])) {
      data[key].push(value);
    } else if (data[key] !== undefined) {
      data[key] = [data[key], value];
    } else {
      data[key] = value === '' ? undefined : value;
    }
  }

  return data;
}

interface FormContainerProps {
  propertyId: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'draft_saving' | 'draft_saved';

export function FormContainer({ propertyId }: FormContainerProps) {
  const { currentStep, formState } = useForm();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle save as draft
  const handleSaveDraft = async () => {
    setIsDraftSaving(true);
    setSaveStatus('draft_saving');

    try {
      // Get data from current form (including unsaved changes)
      const currentStepData = getFormDataFromDOM(currentStep);

      // Merge current step data with saved form state
      const step1Data = currentStep === 1 ? currentStepData : (formState.step1 || {});
      const step2Data = currentStep === 2 ? currentStepData : (formState.step2 || {});
      const step3Data = currentStep === 3 ? currentStepData : (formState.step3 || {});
      const step4Data = currentStep === 4 ? currentStepData : (formState.step4 || {});

      // Check if we have minimum viable data
      const hasStep1Data = !!(step1Data.type || step1Data.operation || step1Data.price);
      const hasStep2Data = !!(step2Data.address || step2Data.neighborhood);

      if (!hasStep1Data) {
        throw new Error('Completa al menos: Tipo de propiedad, Operación y/o Precio');
      }

      if (!hasStep2Data) {
        throw new Error('Completa al menos: Dirección o Colonia');
      }

      // Compile all form data from all steps
      const draftData: any = {
        ...step1Data,
        ...step2Data,
        ...step3Data,
        ...step4Data,
        status: 'draft',
      };

      // Remove undefined, null, and empty string values
      const cleanData = Object.fromEntries(
        Object.entries(draftData).filter(([, value]) => {
          if (value === undefined || value === null || value === '') return false;
          if (Array.isArray(value) && value.length === 0) return false;
          if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
          return true;
        })
      );

      // Ensure status is always included
      cleanData.status = 'draft';

      console.log('Draft data to save:', cleanData);

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error al guardar (${response.status})`);
      }

      setSaveStatus('draft_saved');
      localStorage.removeItem('propertyFormDraft');

      setTimeout(() => {
        setSaveStatus('idle');
        window.location.href = '/dashboard/propiedades';
      }, 2000);
    } catch (error) {
      console.error('Draft save error:', error);
      setSaveStatus('error');
      setIsDraftSaving(false);

      // Show error alert
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ ${errorMsg}`);
    }
  };

  // ============ AUTOSAVE EFFECT ============
  useEffect(() => {
    // Clear existing timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    // Get current step data
    const currentStepKey = `step${currentStep}` as keyof typeof formState;
    const stepData = formState[currentStepKey];

    // Only autosave if there's data in the current step
    if (!stepData || Object.keys(stepData).length === 0) {
      return;
    }

    // Set up debounce timer (500ms)
    debounceTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving');

      try {
        // Prepare data to send: { step{N}: data }
        const dataToSave = {
          [currentStepKey]: stepData,
        };

        // POST to autosave endpoint
        const response = await fetch(`/api/properties/${propertyId}/autosave`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSave),
        });

        if (!response.ok) {
          throw new Error(`Autosave failed with status ${response.status}`);
        }

        // Successfully saved
        setSaveStatus('saved');

        // Auto-hide 'saved' indicator after 2 seconds
        hideTimerRef.current = setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('Autosave error:', error);
        setSaveStatus('error');

        // Auto-retry on next change (don't hide error status automatically)
        // This will trigger the effect again on next formState change
      }
    }, 500);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [formState, currentStep, propertyId]);

  // ============ RENDER STEP BASED ON CURRENT STEP ============
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
        return <FormStep1 />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
                step <= currentStep ? 'bg-montana-gold' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400">
          Paso {currentStep} de 4
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
        {renderStep()}
      </div>

      {/* Guardar Borrador Button - Visible in all steps */}
      {currentStep < 4 && (
        <button
          onClick={handleSaveDraft}
          disabled={isDraftSaving}
          className="w-full px-4 py-3 border border-amber-700 bg-amber-900/20 text-amber-400 rounded-lg hover:bg-amber-900/30 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDraftSaving ? 'Guardando borrador...' : '💾 Guardar propiedad como borrador'}
        </button>
      )}

      {/* Autosave Indicator */}
      <AutosaveIndicator status={saveStatus} />
    </div>
  );
}

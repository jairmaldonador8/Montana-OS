'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@/context/formContext';
import { FormStep1 } from './FormStep1';
import { FormStep2 } from './FormStep2';
import { FormStep3 } from './FormStep3';
import { FormStep4 } from './FormStep4';
import { AutosaveIndicator } from './AutosaveIndicator';

interface FormContainerProps {
  propertyId: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function FormContainer({ propertyId }: FormContainerProps) {
  const { currentStep, formState } = useForm();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Container */}
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar Section */}
        <div className="mb-8">
          {/* Visual Progress Bar */}
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-colors duration-300 ${
                  step <= currentStep ? 'bg-montana-gold' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Progress Text */}
          <p className="text-center text-sm font-medium text-gray-600">
            Paso {currentStep} de 4
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          {renderStep()}
        </div>

        {/* Autosave Indicator */}
        <AutosaveIndicator status={saveStatus} />
      </div>
    </div>
  );
}

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import type { Step1Input, Step2Input, Step3Input, Step4Input } from '@/lib/formValidation';

// ============ FORM STATE INTERFACE ============
export interface FormState {
  step1: Partial<Step1Input>;
  step2: Partial<Step2Input>;
  step3: Partial<Step3Input>;
  step4: Partial<Step4Input>;
}

// ============ FORM CONTEXT TYPE INTERFACE ============
export interface FormContextType {
  formState: FormState;
  currentStep: number;
  updateStep: (step: number, data: any) => void;
  goToStep: (step: number) => void;
  resetForm: () => void;
  getStepData: (step: number) => any;
}

// ============ CONTEXT CREATION ============
const FormContext = createContext<FormContextType | undefined>(undefined);

// ============ INITIAL STATE ============
const initialFormState: FormState = {
  step1: {},
  step2: {},
  step3: {},
  step4: {},
};

const STORAGE_KEY = 'propertyFormDraft';

interface StoredFormData {
  formState: FormState;
  currentStep: number;
  propertyId?: string;
}

// ============ FORM PROVIDER COMPONENT ============
interface FormProviderProps {
  children: ReactNode;
  propertyId?: string;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children, propertyId }) => {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Load from localStorage on mount (hydration)
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data: StoredFormData = JSON.parse(stored);
          setFormState(data.formState || initialFormState);
          setCurrentStep(data.currentStep || 1);
        }
      } catch (error) {
        console.error('Failed to load form data from localStorage:', error);
        // Reset to initial state on error
        setFormState(initialFormState);
        setCurrentStep(1);
      }
      setIsHydrated(true);
    };

    loadFromStorage();
  }, []);

  // Update step data
  const updateStep = (step: number, data: any) => {
    setFormState((prev) => {
      const updated = { ...prev };
      const stepKey = `step${step}` as keyof FormState;
      updated[stepKey] = { ...updated[stepKey], ...data };
      return updated;
    });
  };

  // Navigate to a specific step
  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormState(initialFormState);
    setCurrentStep(1);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Get data for a specific step
  const getStepData = (step: number): any => {
    const stepKey = `step${step}` as keyof FormState;
    return formState[stepKey] || {};
  };

  // Persist to localStorage whenever formState or currentStep changes
  useEffect(() => {
    if (!isHydrated) return;

    try {
      const dataToStore: StoredFormData = {
        formState,
        currentStep,
        ...(propertyId && { propertyId }),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to save form data to localStorage:', error);
    }
  }, [formState, currentStep, isHydrated, propertyId]);

  const value: FormContextType = {
    formState,
    currentStep,
    updateStep,
    goToStep,
    resetForm,
    getStepData,
  };

  // Don't render children until hydration is complete
  if (!isHydrated) {
    return null;
  }

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

// ============ USE FORM HOOK ============
export const useForm = (): FormContextType => {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error('useForm must be used within FormProvider');
  }

  return context;
};

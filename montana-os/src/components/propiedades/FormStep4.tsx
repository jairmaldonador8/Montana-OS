'use client';

import React, { useEffect, useState } from 'react';
import { useForm as useReactHookForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step4Schema, type Step4Input } from '@/lib/formValidation';
import { useForm } from '@/context/formContext';
import { GalleryUpload } from './GalleryUpload';
import { ConfirmIncompleteDialog } from './ConfirmIncompleteDialog';

interface FormStep4Props {
  propertyId: string;
}

export function FormStep4({ propertyId }: FormStep4Props) {
  const formContext = useForm();
  const stepData = formContext.getStepData(4);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showConfirmIncomplete, setShowConfirmIncomplete] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  // Initialize react-hook-form with validation
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useReactHookForm<Step4Input>({
    resolver: zodResolver(step4Schema),
    mode: 'onBlur',
    defaultValues: {
      photos: stepData?.photos || [],
      description: stepData?.description || '',
    },
  });

  // Watch the description field for character counter
  const description = watch('description') || '';
  const descriptionLength = description.length;

  // Reset form when stepData changes (on mount or when returning to this step)
  useEffect(() => {
    reset({
      photos: stepData?.photos || [],
      description: stepData?.description || '',
    });
  }, [stepData, reset]);

  // Handle photo upload completion from GalleryUpload
  const handlePhotosComplete = (urls: string[]) => {
    setValue('photos', urls, { shouldValidate: true });
  };

  // Handle cancel with confirmation
  const handleCancel = () => {
    if (showConfirmCancel) {
      formContext.resetForm();
    } else {
      setShowConfirmCancel(true);
    }
  };

  // Handle saving as draft (incomplete property)
  const handleSaveDraft = async () => {
    setIsDraftSaving(true);
    setSubmitError(null);

    try {
      // Compile form data from all steps (even if incomplete)
      const draftData: any = {
        ...formContext.formState.step1,
        ...formContext.formState.step2,
        ...formContext.formState.step3,
        status: 'draft', // Save as draft instead of pending_review
      };

      // Add description if provided
      if (description) {
        draftData.description = description;
      }

      const fullFormData = draftData;

      // PATCH /api/properties/{propertyId}
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullFormData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error al guardar la propiedad (${response.status})`
        );
      }

      // Clear localStorage
      localStorage.removeItem('propertyFormDraft');

      // Close dialog and redirect
      setShowConfirmIncomplete(false);
      window.location.href = '/dashboard/propiedades';
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido al guardar la propiedad';
      setSubmitError(errorMessage);
      setIsDraftSaving(false);
      setShowConfirmIncomplete(false);
    }
  };

  // Handle final form submission
  const onSubmit = async (data: Step4Input) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Compile full form data from all 4 steps
      const fullFormData = {
        ...formContext.formState.step1,
        ...formContext.formState.step2,
        ...formContext.formState.step3,
        ...data,
        status: 'pending_review',
      };

      // PATCH /api/properties/{propertyId}
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullFormData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error al enviar la propiedad (${response.status})`
        );
      }

      // Clear localStorage
      localStorage.removeItem('propertyFormDraft');

      // Update form context with step 4 data
      formContext.updateStep(4, data);

      // Redirect to dashboard
      window.location.href = '/dashboard/propiedades';
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido al enviar la propiedad';
      setSubmitError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Fotos Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Fotos</h2>
        <GalleryUpload propertyId={propertyId} onComplete={handlePhotosComplete} />
        {errors.photos && (
          <p className="text-sm text-red-500">{errors.photos.message}</p>
        )}
      </div>

      {/* Descripción Section */}
      <div className="space-y-3">
        <label htmlFor="description" className="block text-sm font-medium text-gray-900">
          Descripción
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              id="description"
              rows={6}
              placeholder="Describe la propiedad en tus propias palabras..."
              maxLength={500}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-montana-gold resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          )}
        />

        {/* Character counter */}
        <div className="flex justify-between items-center">
          <div>
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {descriptionLength}/500 caracteres
          </p>
        </div>
      </div>

      {/* Error message if submission fails */}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3 pt-6">
        {/* Primary action buttons row */}
        <div className="flex gap-4">
          {/* Anterior button */}
          <button
            type="button"
            onClick={() => formContext.goToStep(3)}
            disabled={isSubmitting || isDraftSaving}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {/* Cancelar button */}
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting || isDraftSaving}
            className={`flex-1 px-4 py-3 border rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              showConfirmCancel
                ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {showConfirmCancel ? '¿Confirmar?' : 'Cancelar'}
          </button>

          {/* Enviar a revisión button */}
          <button
            type="submit"
            disabled={isSubmitting || isDraftSaving}
            className="flex-1 px-4 py-3 bg-montana-gold text-white rounded-lg hover:bg-opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar a revisión'}
          </button>
        </div>

        {/* Secondary action: Save as draft */}
        <button
          type="button"
          onClick={() => setShowConfirmIncomplete(true)}
          disabled={isSubmitting || isDraftSaving}
          className="w-full px-4 py-3 border border-amber-300 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDraftSaving ? 'Guardando...' : 'Guardar propiedad incompleta'}
        </button>
      </div>

      {/* Cancel confirmation state info */}
      {showConfirmCancel && (
        <p className="text-sm text-center text-gray-600 -mt-2">
          Se descartarán todos los cambios
        </p>
      )}

      {/* Confirm Incomplete Dialog */}
      <ConfirmIncompleteDialog
        open={showConfirmIncomplete}
        onConfirm={handleSaveDraft}
        onCancel={() => setShowConfirmIncomplete(false)}
        isLoading={isDraftSaving}
      />
    </form>
  );
}

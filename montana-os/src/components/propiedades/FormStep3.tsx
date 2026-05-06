'use client';

import React, { useEffect } from 'react';
import { useForm as useReactHookForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step3Schema, type Step3Input } from '@/lib/formValidation';
import { useForm } from '@/context/formContext';

// ============ AMENITY GROUPS MAPPING ============
const AMENITY_GROUPS = {
  EXTERIOR: [
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
  INTERIOR: [
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
  VISTAS: [
    'vista_panorámica',
    'vista_montaña',
    'vista_ciudad',
  ],
};

// Helper function to format amenity label (replace underscore with space, capitalize)
const formatAmenityLabel = (amenity: string): string => {
  return amenity
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function FormStep3() {
  const { getStepData, updateStep, goToStep } = useForm();
  const defaultValues = getStepData(3) as Partial<Step3Input>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useReactHookForm<Step3Input>({
    resolver: zodResolver(step3Schema),
    mode: 'onBlur',
    defaultValues: {
      bedrooms: defaultValues?.bedrooms ?? undefined,
      bathrooms: defaultValues?.bathrooms ?? undefined,
      m2Built: defaultValues?.m2Built ?? undefined,
      m2Land: defaultValues?.m2Land ?? undefined,
      amenities: defaultValues?.amenities || [],
    },
  });

  // Reset form when stepData changes
  useEffect(() => {
    reset({
      bedrooms: defaultValues?.bedrooms ?? undefined,
      bathrooms: defaultValues?.bathrooms ?? undefined,
      m2Built: defaultValues?.m2Built ?? undefined,
      m2Land: defaultValues?.m2Land ?? undefined,
      amenities: defaultValues?.amenities || [],
    });
  }, [defaultValues, reset]);

  const onSubmit = (data: Step3Input) => {
    updateStep(3, data);
    goToStep(4);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Recámaras and Baños - Two Column Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recámaras */}
        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
            Recámaras <span className="text-red-500">*</span>
          </label>
          <input
            id="bedrooms"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            {...register('bedrooms', {
              valueAsNumber: true,
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.bedrooms ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.bedrooms && (
            <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>
          )}
        </div>

        {/* Baños */}
        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
            Baños <span className="text-red-500">*</span>
          </label>
          <input
            id="bathrooms"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            {...register('bathrooms', {
              valueAsNumber: true,
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.bathrooms ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.bathrooms && (
            <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>
          )}
        </div>
      </div>

      {/* Construcción (m²) */}
      <div>
        <label htmlFor="m2Built" className="block text-sm font-medium text-gray-700 mb-1">
          Construcción (m²) <span className="text-red-500">*</span>
        </label>
        <input
          id="m2Built"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          {...register('m2Built', {
            valueAsNumber: true,
          })}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.m2Built ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.m2Built && (
          <p className="text-red-500 text-sm mt-1">{errors.m2Built.message}</p>
        )}
      </div>

      {/* Terreno (m²) - Optional */}
      <div>
        <label htmlFor="m2Land" className="block text-sm font-medium text-gray-700 mb-1">
          Terreno (m²) <span className="text-gray-500 text-xs">(Opcional)</span>
        </label>
        <input
          id="m2Land"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          {...register('m2Land', {
            valueAsNumber: true,
          })}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.m2Land ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.m2Land && (
          <p className="text-red-500 text-sm mt-1">{errors.m2Land.message}</p>
        )}
      </div>

      {/* Amenidades */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Amenidades <span className="text-gray-500 text-xs">(Opcional)</span>
        </label>

        {/* Amenities Groups */}
        {Object.entries(AMENITY_GROUPS).map(([groupName, amenities]) => (
          <div key={groupName} className="mb-6">
            {/* Group Header */}
            <h3 className="text-xs font-semibold text-gray-600 tracking-wider uppercase mb-3">
              {groupName}
            </h3>

            {/* Grid of Checkboxes - 2 columns */}
            <div className="grid grid-cols-2 gap-3">
              {amenities.map((amenity) => (
                <div key={amenity} className="flex items-start">
                  <input
                    id={amenity}
                    type="checkbox"
                    value={amenity}
                    {...register('amenities')}
                    className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor={amenity}
                    className="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {formatAmenityLabel(amenity)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}

        {errors.amenities && (
          <p className="text-red-500 text-sm mt-2">{errors.amenities.message}</p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={() => goToStep(2)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Anterior
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Siguiente
        </button>
      </div>
    </form>
  );
}

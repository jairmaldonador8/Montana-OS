'use client';

import React, { useState } from 'react';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema, type Step2Input } from '@/lib/formValidation';
import { useForm } from '@/context/formContext';

export function FormStep2() {
  const { getStepData, updateStep, goToStep } = useForm();
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const defaultValues = getStepData(2) as Partial<Step2Input>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useReactHookForm<Step2Input>({
    resolver: zodResolver(step2Schema),
    mode: 'onBlur',
    defaultValues: {
      neighborhood: defaultValues?.neighborhood || '',
      address: defaultValues?.address || '',
      gps: defaultValues?.gps,
      references: defaultValues?.references || '',
    },
  });

  const handleCaptureGPS = () => {
    setIsLoadingGPS(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocalización no disponible en tu navegador');
      setIsLoadingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('gps', { lat: latitude, lng: longitude });
        setIsLoadingGPS(false);
      },
      (error) => {
        let errorMessage = 'Error al obtener la ubicación';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Permiso de ubicación denegado';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Ubicación no disponible';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Tiempo de espera agotado';
        }
        setGpsError(errorMessage);
        setIsLoadingGPS(false);
      }
    );
  };

  const onSubmit = (data: Step2Input) => {
    updateStep(2, data);
    goToStep(3);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Colonia (Neighborhood) */}
      <div>
        <label htmlFor="neighborhood" className="block text-sm font-medium text-white mb-1">
          Colonia <span className="text-red-500">*</span>
        </label>
        <input
          id="neighborhood"
          type="text"
          placeholder="Ej: Polanco, Condesa, Reforma..."
          {...register('neighborhood')}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-montana-gold bg-gray-800 text-white placeholder-gray-500 ${
            errors.neighborhood ? 'border-red-500' : 'border-gray-600'
          }`}
        />
        {errors.neighborhood && (
          <p className="text-red-400 text-sm mt-1">{errors.neighborhood.message}</p>
        )}
      </div>

      {/* Dirección (Address) */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-white mb-1">
          Dirección <span className="text-red-500">*</span>
        </label>
        <input
          id="address"
          type="text"
          placeholder="Ej: Calle Principal 123, Apartamento 4B"
          {...register('address')}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-montana-gold bg-gray-800 text-white placeholder-gray-500 ${
            errors.address ? 'border-red-500' : 'border-gray-600'
          }`}
        />
        {errors.address && (
          <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>

      {/* Coordenadas GPS */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Coordenadas GPS <span className="text-gray-400 text-xs">(Opcional)</span>
        </label>
        <button
          type="button"
          onClick={handleCaptureGPS}
          disabled={isLoadingGPS}
          className="w-full px-4 py-2 bg-montana-gold text-white rounded-lg hover:bg-opacity-90 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoadingGPS ? 'Obteniendo...' : 'Capturar ubicación'}
        </button>

        {gpsError && (
          <p className="text-red-400 text-sm mt-2">{gpsError}</p>
        )}

        {/* Display GPS coordinates if captured */}
        <div className="mt-2">
          {register('gps').name && (
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">
                Coordenadas capturadas en tiempo real
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Referencias (References) */}
      <div>
        <label htmlFor="references" className="block text-sm font-medium text-white mb-1">
          Referencias <span className="text-gray-400 text-xs">(Opcional)</span>
        </label>
        <textarea
          id="references"
          rows={3}
          placeholder="Ej: Cerca de Barrio Antiguo, Centro comercial X, parque principal..."
          {...register('references')}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-montana-gold bg-gray-800 text-white placeholder-gray-500 resize-none ${
            errors.references ? 'border-red-500' : 'border-gray-600'
          }`}
        />
        {errors.references && (
          <p className="text-red-400 text-sm mt-1">{errors.references.message}</p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Anterior
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-montana-gold text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
        >
          Siguiente
        </button>
      </div>
    </form>
  );
}

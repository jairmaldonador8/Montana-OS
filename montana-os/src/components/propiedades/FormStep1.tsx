'use client';

import { useEffect } from 'react';
import { useForm as useReactHookForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema, Step1Input } from '@/lib/formValidation';
import { PROPERTY_TYPES, OPERATIONS } from '@/lib/constants';
import { useForm } from '@/context/formContext';

export function FormStep1() {
  const formContext = useForm();
  const stepData = formContext.getStepData(1);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useReactHookForm<Step1Input>({
    resolver: zodResolver(step1Schema),
    mode: 'onBlur',
    defaultValues: {
      type: stepData?.type || '',
      operation: stepData?.operation || '',
      price: stepData?.price || undefined,
      rentalPrice: stepData?.rentalPrice || undefined,
      currency: stepData?.currency || 'MXN',
    },
  });

  const operation = watch('operation');
  const type = watch('type');

  useEffect(() => {
    reset({
      type: stepData?.type || '',
      operation: stepData?.operation || '',
      price: stepData?.price || undefined,
      rentalPrice: stepData?.rentalPrice || undefined,
      currency: stepData?.currency || 'MXN',
    });
  }, [stepData, reset]);

  const onSubmit = (data: Step1Input) => {
    formContext.updateStep(1, data);
    formContext.goToStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tipo de propiedad */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          Tipo de propiedad <span className="text-red-500">*</span>
        </label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
              {PROPERTY_TYPES.map((propertyType) => (
                <button
                  key={propertyType.id}
                  type="button"
                  onClick={() => field.onChange(propertyType.id)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                    field.value === propertyType.id
                      ? 'border-montana-gold bg-montana-gold/20 text-white'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-montana-gold hover:bg-gray-700'
                  }`}
                >
                  {propertyType.label}
                </button>
              ))}
            </div>
          )}
        />
        {errors.type && (
          <p className="text-sm text-red-400">{errors.type.message}</p>
        )}
      </div>

      {/* Operación */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          Operación <span className="text-red-500">*</span>
        </label>
        <Controller
          name="operation"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-2">
              {OPERATIONS.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => field.onChange(op.id)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium text-left transition-all ${
                    field.value === op.id
                      ? 'border-montana-gold bg-montana-gold/20 text-white'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-montana-gold hover:bg-gray-700'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          )}
        />
        {errors.operation && (
          <p className="text-sm text-red-400">{errors.operation.message}</p>
        )}
      </div>

      {/* Precio */}
      <div className="space-y-2">
        <label htmlFor="price" className="block text-sm font-medium text-white">
          Precio <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="price"
                type="number"
                placeholder="0.00"
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-montana-gold bg-gray-800 text-white placeholder-gray-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-600'
                }`}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
              />
            )}
          />

          {/* Moneda */}
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                {['MXN', 'USD'].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => field.onChange(curr)}
                    className={`px-4 py-2 border-2 rounded-md font-medium transition-all min-w-20 ${
                      field.value === curr
                        ? 'border-montana-gold bg-montana-gold/20 text-white'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-montana-gold hover:bg-gray-700'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            )}
          />
        </div>
        {errors.price && (
          <p className="text-sm text-red-400">{errors.price.message}</p>
        )}
      </div>

      {/* Precio de renta - Conditional */}
      {(operation === 'renta' || operation === 'venta_o_renta') && (
        <div className="space-y-2">
          <label htmlFor="rentalPrice" className="block text-sm font-medium text-white">
            Precio de renta mensual <span className="text-red-500">*</span>
          </label>
          <Controller
            name="rentalPrice"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="rentalPrice"
                type="number"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-montana-gold bg-gray-800 text-white placeholder-gray-500 ${
                  errors.rentalPrice ? 'border-red-500' : 'border-gray-600'
                }`}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
              />
            )}
          />
          {errors.rentalPrice && (
            <p className="text-sm text-red-400">{errors.rentalPrice.message}</p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full mt-8 bg-montana-gold text-white py-3 px-4 rounded-md font-medium hover:bg-opacity-90 transition-all"
      >
        Siguiente
      </button>
    </form>
  );
}

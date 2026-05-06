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

  // Initialize react-hook-form with validation
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

  // Watch the operation field to conditionally show rentalPrice
  const operation = watch('operation');

  // Reset form when stepData changes (on mount or when returning to this step)
  useEffect(() => {
    reset({
      type: stepData?.type || '',
      operation: stepData?.operation || '',
      price: stepData?.price || undefined,
      rentalPrice: stepData?.rentalPrice || undefined,
      currency: stepData?.currency || 'MXN',
    });
  }, [stepData, reset]);

  // Handle form submission
  const onSubmit = (data: Step1Input) => {
    // Update form context with step 1 data
    formContext.updateStep(1, data);
    // Navigate to step 2
    formContext.goToStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Tipo de propiedad */}
      <div className="space-y-2">
        <label htmlFor="type" className="block text-sm font-medium text-gray-900">
          Tipo de propiedad <span className="text-red-500">*</span>
        </label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              id="type"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-montana-gold ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona un tipo de propiedad</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          )}
        />
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Operación */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          Operación <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {OPERATIONS.map((op) => (
            <Controller
              key={op.id}
              name="operation"
              control={control}
              render={({ field }) => (
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...field}
                    value={op.id}
                    checked={field.value === op.id}
                    className="mr-3 h-4 w-4 text-montana-gold focus:ring-montana-gold cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{op.label}</span>
                </label>
              )}
            />
          ))}
        </div>
        {errors.operation && (
          <p className="text-sm text-red-500">{errors.operation.message}</p>
        )}
      </div>

      {/* Price fields in responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Precio */}
        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium text-gray-900">
            Precio <span className="text-red-500">*</span>
          </label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                id="price"
                type="number"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-montana-gold ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
              />
            )}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        {/* Precio de renta - Conditional */}
        {(operation === 'renta' || operation === 'venta_o_renta') && (
          <div className="space-y-2">
            <label htmlFor="rentalPrice" className="block text-sm font-medium text-gray-900">
              Precio de renta <span className="text-red-500">*</span>
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-montana-gold ${
                    errors.rentalPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                />
              )}
            />
            {errors.rentalPrice && (
              <p className="text-sm text-red-500">{errors.rentalPrice.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Moneda */}
      <div className="space-y-2">
        <label htmlFor="currency" className="block text-sm font-medium text-gray-900">
          Moneda <span className="text-red-500">*</span>
        </label>
        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              id="currency"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-montana-gold ${
                errors.currency ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="MXN">MXN (Peso Mexicano)</option>
              <option value="USD">USD (Dólar Estadounidense)</option>
            </select>
          )}
        />
        {errors.currency && (
          <p className="text-sm text-red-500">{errors.currency.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full mt-6 bg-montana-gold text-white py-2 px-4 rounded-md font-medium hover:bg-opacity-90 transition-all"
      >
        Siguiente
      </button>
    </form>
  );
}

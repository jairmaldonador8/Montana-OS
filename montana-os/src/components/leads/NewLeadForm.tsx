'use client';

import { useState, useEffect } from 'react';
import { LeadCreationSchema } from '@/lib/validation';
import type { Lead } from '@/lib/validation';

interface NewLeadFormProps {
  onSuccess?: (leadId: string) => void;
  onError?: (error: string) => void;
}

export function NewLeadForm({ onSuccess, onError }: NewLeadFormProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({
    fuente: 'manual',
    tipo_propiedad: 'Casa',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Cleanup timer for success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (field: keyof Lead, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value || undefined }));
    // Clear error for this field when user starts typing
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    try {
      // Validate before sending
      const validData = LeadCreationSchema.parse(formData);
      setLoading(true);

      const response = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData),
      });

      const result = await response.json();

      if (response.status === 409) {
        setErrors({ submit: 'Este lead ya existe en el sistema' });
        onError?.('Duplicate lead');
        return;
      }

      if (!response.ok) {
        if (result.details) {
          // Handle Zod validation errors
          const fieldErrors: Record<string, string> = {};
          result.details.forEach((error: any) => {
            const field = error.path;
            fieldErrors[field] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ submit: result.error || 'Error al crear el lead' });
        }
        onError?.(result.error || 'Lead creation failed');
        return;
      }

      // Success
      setSuccessMessage('Lead creado exitosamente');
      setFormData({ fuente: 'manual', tipo_propiedad: 'Casa' });
      onSuccess?.(result.id);
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message });
        onError?.(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ fuente: 'manual', tipo_propiedad: 'Casa' });
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Lead</h2>
        <p className="text-sm text-gray-500 mt-1">Ingresa la información del cliente interesado</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4" role="alert" aria-live="polite">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert" aria-live="polite">
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Contact Information Section */}
      <fieldset className="border border-gray-200 rounded-lg p-6">
        <legend className="text-lg font-semibold text-gray-900 px-2">Información de Contacto</legend>

        {/* Nombre */}
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            id="nombre"
            type="text"
            disabled={loading}
            value={formData.nombre || ''}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Juan García López"
            aria-invalid={!!errors.nombre}
            aria-describedby={errors.nombre ? 'nombre-error' : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.nombre && <p id="nombre-error" className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            disabled={loading}
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="juan@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && <p id="email-error" className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Teléfono */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              id="telefono"
              type="tel"
              disabled={loading}
              value={formData.telefono || ''}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="1234567890"
              aria-invalid={!!errors.telefono}
              aria-describedby={errors.telefono ? 'telefono-error' : undefined}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.telefono ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.telefono && <p id="telefono-error" className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <input
              id="whatsapp"
              type="tel"
              disabled={loading}
              value={formData.whatsapp || ''}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="1234567890"
              aria-invalid={!!errors.whatsapp}
              aria-describedby={errors.whatsapp ? 'whatsapp-error' : undefined}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.whatsapp ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.whatsapp && <p id="whatsapp-error" className="text-red-600 text-sm mt-1">{errors.whatsapp}</p>}
          </div>
        </div>
      </fieldset>

      {/* Property Information Section */}
      <fieldset className="border border-gray-200 rounded-lg p-6">
        <legend className="text-lg font-semibold text-gray-900 px-2">Información de la Propiedad</legend>

        {/* Tipo de Propiedad */}
        <div className="mb-4">
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Propiedad *
          </label>
          <select
            id="tipo"
            disabled={loading}
            value={formData.tipo_propiedad || 'Casa'}
            onChange={(e) => handleChange('tipo_propiedad', e.target.value)}
            aria-invalid={!!errors.tipo_propiedad}
            aria-describedby={errors.tipo_propiedad ? 'tipo-error' : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.tipo_propiedad ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="Casa">Casa</option>
            <option value="Departamento">Departamento</option>
            <option value="Terreno">Terreno</option>
            <option value="Comercial">Comercial</option>
          </select>
          {errors.tipo_propiedad && <p id="tipo-error" className="text-red-600 text-sm mt-1">{errors.tipo_propiedad}</p>}
        </div>

        {/* Zona */}
        <div className="mb-4">
          <label htmlFor="zona" className="block text-sm font-medium text-gray-700 mb-1">
            Zona
          </label>
          <input
            id="zona"
            type="text"
            disabled={loading}
            value={formData.zona || ''}
            onChange={(e) => handleChange('zona', e.target.value)}
            placeholder="Centro, Norte, Sur..."
            aria-invalid={!!errors.zona}
            aria-describedby={errors.zona ? 'zona-error' : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.zona ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.zona && <p id="zona-error" className="text-red-600 text-sm mt-1">{errors.zona}</p>}
        </div>

        {/* Budget Range */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="presupuesto_min" className="block text-sm font-medium text-gray-700 mb-1">
              Presupuesto Mínimo
            </label>
            <input
              id="presupuesto_min"
              type="number"
              disabled={loading}
              value={formData.presupuesto_min || ''}
              onChange={(e) => handleChange('presupuesto_min', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="100000"
              aria-invalid={!!errors.presupuesto_min}
              aria-describedby={errors.presupuesto_min ? 'presupuesto_min-error' : undefined}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.presupuesto_min ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.presupuesto_min && <p id="presupuesto_min-error" className="text-red-600 text-sm mt-1">{errors.presupuesto_min}</p>}
          </div>

          <div>
            <label htmlFor="presupuesto_max" className="block text-sm font-medium text-gray-700 mb-1">
              Presupuesto Máximo
            </label>
            <input
              id="presupuesto_max"
              type="number"
              disabled={loading}
              value={formData.presupuesto_max || ''}
              onChange={(e) => handleChange('presupuesto_max', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="500000"
              aria-invalid={!!errors.presupuesto_max}
              aria-describedby={errors.presupuesto_max ? 'presupuesto_max-error' : undefined}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
                errors.presupuesto_max ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.presupuesto_max && <p id="presupuesto_max-error" className="text-red-600 text-sm mt-1">{errors.presupuesto_max}</p>}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-4">
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
            Plazo
          </label>
          <select
            id="timeline"
            disabled={loading}
            value={formData.timeline || ''}
            onChange={(e) => handleChange('timeline', e.target.value || undefined)}
            aria-invalid={!!errors.timeline}
            aria-describedby={errors.timeline ? 'timeline-error' : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.timeline ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona un plazo</option>
            <option value="Hoy">Hoy</option>
            <option value="Este mes">Este mes</option>
            <option value="Este año">Este año</option>
            <option value="Sin prisa">Sin prisa</option>
          </select>
          {errors.timeline && <p id="timeline-error" className="text-red-600 text-sm mt-1">{errors.timeline}</p>}
        </div>
      </fieldset>

      {/* Additional Information Section */}
      <fieldset className="border border-gray-200 rounded-lg p-6">
        <legend className="text-lg font-semibold text-gray-900 px-2">Información Adicional</legend>

        {/* Recámaras */}
        <div className="mb-4">
          <label htmlFor="recamaras" className="block text-sm font-medium text-gray-700 mb-1">
            Recámaras
          </label>
          <input
            id="recamaras"
            type="number"
            disabled={loading}
            value={formData.recamaras || ''}
            onChange={(e) => handleChange('recamaras', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="3"
            aria-invalid={!!errors.recamaras}
            aria-describedby={errors.recamaras ? 'recamaras-error' : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.recamaras ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.recamaras && <p id="recamaras-error" className="text-red-600 text-sm mt-1">{errors.recamaras}</p>}
        </div>

        {/* Baños */}
        <div className="mb-4">
          <label htmlFor="banos" className="block text-sm font-medium text-gray-700 mb-1">
            Baños
          </label>
          <input
            id="banos"
            type="number"
            disabled={loading}
            value={formData.banos || ''}
            onChange={(e) => handleChange('banos', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="2"
            aria-invalid={!!errors.banos}
            aria-describedby={errors.banos ? 'banos-error' : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.banos ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.banos && <p id="banos-error" className="text-red-600 text-sm mt-1">{errors.banos}</p>}
        </div>

        {/* Financiamiento */}
        <div className="mb-4">
          <label htmlFor="financiamiento" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Financiamiento
          </label>
          <select
            id="financiamiento"
            disabled={loading}
            value={formData.financiamiento || ''}
            onChange={(e) => handleChange('financiamiento', e.target.value || undefined)}
            aria-invalid={!!errors.financiamiento}
            aria-describedby={errors.financiamiento ? 'financiamiento-error' : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.financiamiento ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona un tipo</option>
            <option value="Contado">Contado</option>
            <option value="Crédito">Crédito</option>
            <option value="Por definir">Por definir</option>
          </select>
          {errors.financiamiento && <p id="financiamiento-error" className="text-red-600 text-sm mt-1">{errors.financiamiento}</p>}
        </div>

        {/* Ubicación Actual */}
        <div className="mb-4">
          <label htmlFor="ubicacion_actual" className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación Actual
          </label>
          <input
            id="ubicacion_actual"
            type="text"
            disabled={loading}
            value={formData.ubicacion_actual || ''}
            onChange={(e) => handleChange('ubicacion_actual', e.target.value)}
            placeholder="Ciudad o colonia actual"
            aria-invalid={!!errors.ubicacion_actual}
            aria-describedby={errors.ubicacion_actual ? 'ubicacion_actual-error' : undefined}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.ubicacion_actual ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.ubicacion_actual && <p id="ubicacion_actual-error" className="text-red-600 text-sm mt-1">{errors.ubicacion_actual}</p>}
        </div>
      </fieldset>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Creando...' : 'Crear Lead'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}

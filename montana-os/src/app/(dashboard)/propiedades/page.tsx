'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, AlertCircle } from 'lucide-react';
import { PropertyCard } from '@/components/propiedades/PropertyCard';

interface Property {
  id: string;
  code: string;
  type: string;
  operation: string;
  price: number;
  address: string;
  neighborhood: string;
  status: string;
}

export default function PropiedadesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const draftCount = properties.filter((p) => p.status === 'draft').length;

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch('/api/properties');
        if (!response.ok) throw new Error('Failed to fetch properties');
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading properties');
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-montana-gold">
            Inventario
          </p>
          <h1 className="text-4xl font-editorial mt-2">Propiedades</h1>
        </div>
        <Link
          href="/propiedades/nueva"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-montana-gold text-montana-gold hover:bg-montana-gold hover:text-montana-black transition-colors text-sm uppercase tracking-widest"
        >
          <Plus className="h-4 w-4" />
          Nueva propiedad
        </Link>
      </div>

      {/* Draft Alert */}
      {draftCount > 0 && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-400">
              {draftCount} propiedad{draftCount !== 1 ? 'es' : ''} incompleta{draftCount !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-red-300/80">
              Completa estas propiedades para poder publicarlas.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Cargando propiedades...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="border border-border rounded-md p-12 text-center">
          <p className="font-editorial text-2xl mb-3">Aún no hay propiedades</p>
          <p className="text-sm text-muted-foreground">
            Empieza añadiendo la primera propiedad de Montana al sistema.
          </p>
          <Link
            href="/propiedades/nueva"
            className="inline-block mt-6 px-5 py-2 text-sm text-montana-gold border border-montana-gold/50 hover:border-montana-gold transition-colors"
          >
            Añadir primera propiedad
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      )}
    </div>
  );
}

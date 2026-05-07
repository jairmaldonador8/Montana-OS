'use client';

import Link from 'next/link';
import { AlertCircle, Home } from 'lucide-react';

interface PropertyCardProps {
  id: string;
  code: string;
  type: string;
  operation: string;
  price: number;
  address: string;
  neighborhood: string;
  status: string;
}

export function PropertyCard({
  id,
  code,
  type,
  operation,
  price,
  address,
  neighborhood,
  status,
}: PropertyCardProps) {
  const isDraft = status === 'draft';

  return (
    <Link href={`/propiedades/${id}`}>
      <div className="border border-gray-800 rounded-lg p-6 hover:border-montana-gold transition-colors cursor-pointer h-full bg-gray-900/50 relative">
        {/* Draft Alert Badge */}
        {isDraft && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-900/20 border border-red-700 rounded px-3 py-1.5">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs text-red-400 font-medium">Borrador</span>
          </div>
        )}

        {/* Property Type Icon */}
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-montana-gold/20 rounded-lg">
            <Home className="h-6 w-6 text-montana-gold" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-montana-gold font-medium uppercase tracking-widest">
              {code}
            </p>
            <h3 className="text-lg font-semibold text-white mt-1">{address}</h3>
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">Tipo:</p>
            <p className="text-sm text-white capitalize">{type}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">Operación:</p>
            <p className="text-sm text-white capitalize">{operation}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">Ubicación:</p>
            <p className="text-sm text-white">{neighborhood}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">Precio:</p>
            <p className="text-sm text-montana-gold font-medium">
              ${price.toLocaleString('es-ES')}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="pt-4 border-t border-gray-800">
          <div className="inline-block">
            <span
              className={`text-xs uppercase tracking-widest font-medium px-3 py-1 rounded ${
                isDraft
                  ? 'bg-red-900/30 text-red-400'
                  : 'bg-green-900/30 text-green-400'
              }`}
            >
              {isDraft ? 'Pendiente de completar' : status}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

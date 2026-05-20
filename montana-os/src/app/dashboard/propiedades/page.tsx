'use client';

import { PropertyCard } from '@/components/propiedades/PropertyCard';
import { MontanaButton } from '@/components/buttons/MontanaButton';

export default function PropiedadesPage() {
  const properties = Array.from({ length: 9 }).map((_, i) => ({
    id: String(i + 1),
    title: [
      'Casa Moderna en Garza García',
      'Departamento Céntrico Monterrey',
      'Villa en San Pedro',
      'Casa Clásica Barrio Antiguo',
      'Penthouse Santa Catarina',
      'Residencia Zapopan',
      'Casa de Playa Puerto Vallarta',
      'Oficina Premium Centro',
      'Casa Colonial Centro',
    ][i],
    location: [
      'San Pedro Garza García',
      'Barrio Antiguo, Monterrey',
      'San Pedro Garza García',
      'Centro, Monterrey',
      'Santa Catarina',
      'Zapopan, Jalisco',
      'Puerto Vallarta',
      'Centro, Monterrey',
      'Centro Histórico',
    ][i],
    price: `$${(Math.random() * 10 + 0.5).toFixed(1)}M`,
    rating: Math.floor(Math.random() * 2) + 4,
    favorites: Math.floor(Math.random() * 50) + 5,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Propiedades</h1>
          <p className="text-gray-600 mt-2">Gestiona todas tus inmuebles</p>
        </div>
        <MontanaButton variant="primary">
          + Agregar Propiedad
        </MontanaButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </div>
    </div>
  );
}

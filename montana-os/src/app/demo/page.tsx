'use client';

import Link from 'next/link';
// import { Navbar } from '@/components/shared/Navbar';
// import { PropertyCard } from '@/components/propiedades/PropertyCard';
// import { MontanaButton } from '@/components/buttons/MontanaButton';
import { Home, Users, TrendingUp, MessageSquare } from 'lucide-react';

export default function DemoPage() {
  const properties = Array.from({ length: 6 }).map((_, i) => ({
    id: String(i + 1),
    title: `Casa ${i + 1} - ${['Garza García', 'San Pedro', 'Monterrey', 'Santa Catarina', 'Zapopan', 'Guadalajara'][i]}`,
    location: ['San Pedro Garza García', 'Monterrey Centro', 'Barrio Antiguo', 'Santa Catarina', 'Zapopan', 'Guadalajara'][i],
    price: `$${(Math.random() * 5 + 1).toFixed(1)}M`,
    rating: 5,
    favorites: Math.floor(Math.random() * 30) + 10,
  }));

  const stats = [
    { icon: Home, label: 'Propiedades', value: '42', color: 'bg-amber-100 text-amber-600' },
    { icon: Users, label: 'Leads', value: '128', color: 'bg-blue-100 text-blue-600' },
    { icon: TrendingUp, label: 'Comisiones', value: '$142K', color: 'bg-emerald-100 text-emerald-600' },
    { icon: MessageSquare, label: 'Mensajes', value: '23', color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Demo Page</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600">Página de demo - En construcción</p>
        </div>
      </div>
    </div>
  );
}

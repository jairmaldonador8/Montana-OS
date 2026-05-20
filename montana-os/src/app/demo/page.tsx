'use client';

import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { PropertyCard } from '@/components/propiedades/PropertyCard';
import { MontanaButton } from '@/components/buttons/MontanaButton';
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
      <Navbar />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col p-6">
          <nav className="space-y-2">
            {[
              { label: 'Propiedades', active: true },
              { label: 'Leads' },
              { label: 'Pipeline' },
              { label: 'Comisiones' },
            ].map((item) => (
              <div
                key={item.label}
                className={`px-4 py-3 rounded-lg transition ${
                  item.active
                    ? 'bg-amber-50 text-amber-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
              <p className="text-gray-600 mt-2">Bienvenido a Montana OS Demo</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                      <Icon size={24} />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Properties Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Mis Propiedades</h2>
                <Link href="/login">
                  <MontanaButton variant="primary" size="sm">
                    Agregar Propiedad
                  </MontanaButton>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>
            </div>

            {/* Demo Notice */}
            <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-xl">
              <h3 className="text-lg font-bold text-amber-900 mb-2">🎨 Vista de Demostración</h3>
              <p className="text-amber-800 mb-4">
                Este es el nuevo diseño de Montana OS con el tema "Dinámico y Energético".
                Incluye colores blanco + amarillo, tipografía Poppins, y animaciones suaves.
              </p>
              <div className="flex gap-3">
                <Link href="/">
                  <MontanaButton variant="secondary" size="sm">
                    ← Volver a Inicio
                  </MontanaButton>
                </Link>
                <Link href="/login">
                  <MontanaButton variant="primary" size="sm">
                    Ir a Login
                  </MontanaButton>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

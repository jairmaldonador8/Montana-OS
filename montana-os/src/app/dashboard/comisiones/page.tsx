'use client';

// import { MontanaCard } from '@/components/cards/MontanaCard';
import { TrendingUp, Calendar, Home } from 'lucide-react';

export default function ComisionesPage() {
  const stats = [
    { label: 'Comisiones Este Mes', value: '$45,230', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Comisiones Este Año', value: '$342,150', icon: Calendar, color: 'text-blue-600' },
    { label: 'Transacciones Pendientes', value: '$128,500', icon: Home, color: 'text-amber-600' },
  ];

  const commissions = [
    {
      id: '1',
      property: 'Casa Garza García',
      price: '$2,500,000',
      rate: '2%',
      commission: '$50,000',
      date: '2026-05-15',
      status: 'Pagada',
    },
    {
      id: '2',
      property: 'Departamento Centro',
      price: '$1,200,000',
      rate: '2.5%',
      commission: '$30,000',
      date: '2026-05-10',
      status: 'Pagada',
    },
    {
      id: '3',
      property: 'Villa San Pedro',
      price: '$4,800,000',
      rate: '2%',
      commission: '$96,000',
      date: '2026-05-20',
      status: 'Pendiente',
    },
    {
      id: '4',
      property: 'Penthouse Santa Catarina',
      price: '$3,100,000',
      rate: '2.5%',
      commission: '$77,500',
      date: '2026-06-01',
      status: 'Esperada',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Comisiones</h1>
        <p className="text-gray-600 mt-2">Seguimiento de tus ingresos por comisiones</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">Sección de comisiones - En construcción</p>
      </div>
    </div>
  );
}

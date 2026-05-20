'use client';

import { MontanaCard } from '@/components/cards/MontanaCard';
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <MontanaCard key={i}>
              <MontanaCard.Content>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <Icon size={28} className={stat.color} />
                </div>
              </MontanaCard.Content>
            </MontanaCard>
          );
        })}
      </div>

      {/* Commissions Table */}
      <MontanaCard>
        <MontanaCard.Content>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Propiedad</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Precio de Venta</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Porcentaje</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Comisión</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-900 font-medium">{commission.property}</td>
                    <td className="py-4 px-4 text-gray-700">{commission.price}</td>
                    <td className="py-4 px-4 text-gray-700">{commission.rate}</td>
                    <td className="py-4 px-4 font-bold text-emerald-600">{commission.commission}</td>
                    <td className="py-4 px-4 text-gray-700">{commission.date}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          commission.status === 'Pagada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : commission.status === 'Pendiente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {commission.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MontanaCard.Content>
      </MontanaCard>
    </div>
  );
}

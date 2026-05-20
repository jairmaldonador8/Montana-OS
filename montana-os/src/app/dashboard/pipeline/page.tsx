'use client';

import { MontanaCard } from '@/components/cards/MontanaCard';
import { Home, DollarSign, Calendar } from 'lucide-react';

export default function PipelinePage() {
  const pipeline = [
    {
      id: '1',
      property: 'Casa Garza García',
      client: 'Juan García',
      price: '$2.5M',
      status: 'Oferta Enviada',
      daysLeft: 3,
      progress: 75,
    },
    {
      id: '2',
      property: 'Departamento Centro',
      client: 'María López',
      price: '$1.2M',
      status: 'En Negociación',
      daysLeft: 5,
      progress: 50,
    },
    {
      id: '3',
      property: 'Villa San Pedro',
      client: 'Carlos Rodríguez',
      price: '$4.8M',
      status: 'Documentos',
      daysLeft: 2,
      progress: 90,
    },
    {
      id: '4',
      property: 'Penthouse Santa Catarina',
      client: 'Ana Martínez',
      price: '$3.1M',
      status: 'Visita Agendada',
      daysLeft: 7,
      progress: 25,
    },
  ];

  const statusColors = {
    'Visita Agendada': 'bg-blue-100 text-blue-800',
    'En Negociación': 'bg-yellow-100 text-yellow-800',
    'Oferta Enviada': 'bg-purple-100 text-purple-800',
    'Documentos': 'bg-emerald-100 text-emerald-800',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pipeline de Transacciones</h1>
        <p className="text-gray-600 mt-2">Seguimiento de operaciones en proceso</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pipeline.map((deal) => (
          <MontanaCard key={deal.id}>
            <MontanaCard.Content>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Home size={16} className="text-amber-500" />
                      <p className="font-bold text-gray-900">{deal.property}</p>
                    </div>
                    <p className="text-sm text-gray-600">Cliente: {deal.client}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColors[deal.status as keyof typeof statusColors]
                    }`}
                  >
                    {deal.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Precio</p>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-emerald-600" />
                      <p className="font-bold text-gray-900">{deal.price}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Progreso</p>
                    <p className="font-bold text-gray-900">{deal.progress}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tiempo</p>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-blue-600" />
                      <p className="font-bold text-gray-900">{deal.daysLeft}d</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-400 h-2 rounded-full transition-all"
                      style={{ width: `${deal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </MontanaCard.Content>
          </MontanaCard>
        ))}
      </div>
    </div>
  );
}

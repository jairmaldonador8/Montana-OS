'use client';

import { MontanaCard } from '@/components/cards/MontanaCard';
import { User, Mail, Phone } from 'lucide-react';

export default function LeadsPage() {
  const leads = {
    nuevo: [
      { id: '1', name: 'Juan García', email: 'juan@example.com', phone: '+52 81 1234 5678', budget: '$1M - $2M' },
      { id: '2', name: 'María López', email: 'maria@example.com', phone: '+52 81 9876 5432', budget: '$500K - $1M' },
      { id: '3', name: 'Carlos Rodríguez', email: 'carlos@example.com', phone: '+52 81 5555 5555', budget: '$2M - $5M' },
    ],
    contactado: [
      { id: '4', name: 'Ana Martínez', email: 'ana@example.com', phone: '+52 81 4444 4444', budget: '$1M - $2M' },
      { id: '5', name: 'Roberto Silva', email: 'roberto@example.com', phone: '+52 81 3333 3333', budget: '$5M+' },
    ],
    interesado: [
      { id: '6', name: 'Patricia Gómez', email: 'patricia@example.com', phone: '+52 81 2222 2222', budget: '$2M - $5M' },
      { id: '7', name: 'David Pérez', email: 'david@example.com', phone: '+52 81 1111 1111', budget: '$1M - $2M' },
    ],
    cerrado: [
      { id: '8', name: 'Laura Hernández', email: 'laura@example.com', phone: '+52 81 6666 6666', budget: '$3M' },
    ],
  };

  const columns = [
    { id: 'nuevo', label: 'Nuevo', count: leads.nuevo.length, color: 'bg-blue-50 border-blue-200' },
    { id: 'contactado', label: 'Contactado', count: leads.contactado.length, color: 'bg-yellow-50 border-yellow-200' },
    { id: 'interesado', label: 'Interesado', count: leads.interesado.length, color: 'bg-purple-50 border-purple-200' },
    { id: 'cerrado', label: 'Cerrado', count: leads.cerrado.length, color: 'bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pipeline de Leads</h1>
        <p className="text-gray-600 mt-2">Gestiona tu embudo de ventas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">{column.label}</h2>
              <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                {column.count}
              </span>
            </div>

            <div className="space-y-3">
              {leads[column.id as keyof typeof leads].map((lead) => (
                <MontanaCard key={lead.id}>
                  <MontanaCard.Content>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <User size={16} className="text-amber-500 mt-1" />
                        <div>
                          <p className="font-semibold text-gray-900">{lead.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} />
                        <span>{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs font-semibold text-amber-600">{lead.budget}</p>
                      </div>
                    </div>
                  </MontanaCard.Content>
                </MontanaCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

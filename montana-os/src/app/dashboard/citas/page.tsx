'use client';

import { useState } from 'react';
// import { MontanaCard } from '@/components/cards/MontanaCard';
// import { MontanaButton } from '@/components/buttons/MontanaButton';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

export default function CitasPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const appointments = [
    {
      id: '1',
      property: 'Casa Garza García',
      client: 'Juan García',
      date: '2026-05-22',
      time: '10:00 AM',
      location: 'San Pedro Garza García',
      status: 'Confirmada',
    },
    {
      id: '2',
      property: 'Departamento Centro',
      client: 'María López',
      date: '2026-05-22',
      time: '2:00 PM',
      location: 'Centro, Monterrey',
      status: 'Confirmada',
    },
    {
      id: '3',
      property: 'Villa San Pedro',
      client: 'Carlos Rodríguez',
      date: '2026-05-23',
      time: '11:00 AM',
      location: 'San Pedro Garza García',
      status: 'Pendiente',
    },
    {
      id: '4',
      property: 'Penthouse Santa Catarina',
      client: 'Ana Martínez',
      date: '2026-05-24',
      time: '3:00 PM',
      location: 'Santa Catarina',
      status: 'Confirmada',
    },
  ];

  const statusColors = {
    Confirmada: 'bg-emerald-100 text-emerald-800',
    Pendiente: 'bg-yellow-100 text-yellow-800',
    Cancelada: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendario de Citas</h1>
        <p className="text-gray-600 mt-2">Gestiona tus visitas y agendamientos</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">Sección de citas - En construcción</p>
      </div>
    </div>
  );
}

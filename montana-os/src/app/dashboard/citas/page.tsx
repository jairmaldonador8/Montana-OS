'use client';

import { useState } from 'react';
import { MontanaCard } from '@/components/cards/MontanaCard';
import { MontanaButton } from '@/components/buttons/MontanaButton';
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-1">
          <MontanaCard>
            <MontanaCard.Content>
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">Mayo 2026</h3>
                <div className="grid grid-cols-7 gap-2 text-center text-xs">
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day) => (
                    <div key={day} className="font-semibold text-gray-600">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 31 }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === 20;
                    const hasAppointment = [22, 23, 24].includes(day);
                    return (
                      <button
                        key={day}
                        className={`py-2 rounded text-xs ${
                          isToday
                            ? 'bg-amber-400 text-gray-900 font-bold'
                            : hasAppointment
                              ? 'bg-blue-100 text-blue-900 font-semibold'
                              : 'hover:bg-gray-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <MontanaButton variant="primary" size="sm" className="w-full">
                  + Nueva Cita
                </MontanaButton>
              </div>
            </MontanaCard.Content>
          </MontanaCard>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-3 space-y-4">
          {appointments.map((apt) => (
            <MontanaCard key={apt.id}>
              <MontanaCard.Content>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{apt.property}</h3>

                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>{apt.client}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{apt.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{apt.location}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      statusColors[apt.status as keyof typeof statusColors]
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              </MontanaCard.Content>
            </MontanaCard>
          ))}
        </div>
      </div>
    </div>
  );
}

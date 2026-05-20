'use client';

import React from 'react';
import { Home, Users, TrendingUp, MessageSquare } from 'lucide-react';
import { MontanaCard } from '@/components/cards/MontanaCard';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    id: '1',
    icon: <Home size={32} className="text-amber-400" />,
    title: 'Gestión de Propiedades',
    description: 'Organiza y administra todas tus propiedades en un solo lugar',
  },
  {
    id: '2',
    icon: <Users size={32} className="text-blue-500" />,
    title: 'Pipeline de Leads',
    description: 'Visualiza y gestiona tu pipeline de clientes potenciales',
  },
  {
    id: '3',
    icon: <TrendingUp size={32} className="text-emerald-500" />,
    title: 'Análisis y Reportes',
    description: 'Datos en tiempo real para tomar mejores decisiones',
  },
  {
    id: '4',
    icon: <MessageSquare size={32} className="text-purple-500" />,
    title: 'Comunicación Integrada',
    description: 'Gestiona mensajes y contacto con clientes sin cambiar de plataforma',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Funcionalidades
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Todo lo que necesitas para gestionar tu inmobiliaria de manera eficiente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <MontanaCard key={feature.id}>
              <MontanaCard.Content>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </MontanaCard.Content>
            </MontanaCard>
          ))}
        </div>
      </div>
    </section>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { MontanaButton } from '@/components/buttons/MontanaButton';

export const HeroSection = () => {
  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-28 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
          Sistema de Diseño
          <br />
          <span className="text-amber-400">Dinámico y Energético</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Montana OS - CRM Inmobiliario Premium
        </p>

        <Link href="/dashboard/propiedades">
          <MontanaButton variant="primary" size="lg">
            Comienza Ahora
          </MontanaButton>
        </Link>
      </div>
    </section>
  );
};

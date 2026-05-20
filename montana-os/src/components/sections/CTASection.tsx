'use client';

import { MontanaButton } from '@/components/buttons/MontanaButton';

export const CTASection = () => {
  return (
    <section className="w-full bg-gradient-to-r from-amber-400 to-yellow-300 py-16 sm:py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 rounded-2xl p-12 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          ¿Listo para transformar tu CRM?
        </h2>
        <p className="text-lg text-gray-800 mb-8 max-w-2xl mx-auto">
          Montana OS - El sistema operativo para inmobiliarias modernas
        </p>
        <MontanaButton variant="primary" size="lg">
          Comienza Ahora
        </MontanaButton>
      </div>
    </section>
  );
};

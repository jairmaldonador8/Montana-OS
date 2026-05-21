'use client';

import Link from 'next/link';
// import { MontanaButton } from '@/components/buttons/MontanaButton';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
        <p className="text-lg text-gray-600 mb-6">No tienes acceso a esta página</p>
        <p className="text-sm text-gray-500 mb-8">
          Verifica tu rol o contacta al administrador
        </p>
        <Link href="/dashboard">
          <button className="bg-amber-400 text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-amber-500">
            Volver al Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

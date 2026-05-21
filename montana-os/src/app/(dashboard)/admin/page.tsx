'use client';

// import { TeamStats } from '@/components/admin/TeamStats';
// import { LeadsTable } from '@/components/admin/LeadsTable';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">Visión completa de tu operación inmobiliaria</p>
      </div>

      {/* Team Statistics - Placeholder */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">Estadísticas del equipo - En construcción</p>
      </div>

      {/* Global Leads Table - Placeholder */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Todos los Leads</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600">Tabla de leads - En construcción</p>
        </div>
      </div>
    </div>
  );
}

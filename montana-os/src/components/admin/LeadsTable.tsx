'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Lead = Database['public']['Tables']['leads']['Row'];

interface LeadWithAsesor extends Lead {
  asesor?: { nombre: string };
}

export function LeadsTable() {
  const [leads, setLeads] = useState<LeadWithAsesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEtapa, setFilterEtapa] = useState('');
  const [filterAsesor, setFilterAsesor] = useState('');

  useEffect(() => {
    async function fetchLeads() {
      try {
        const supabase = createClient();

        let query = supabase
          .from('leads')
          .select('*, asesor:users(nombre)');

        if (filterEtapa) {
          query = query.eq('etapa', filterEtapa);
        }

        if (filterAsesor) {
          query = query.eq('asesor_id', filterAsesor);
        }

        const { data } = await query.order('created_at', { ascending: false });
        setLeads(data || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, [filterEtapa, filterAsesor]);

  if (loading) return <div>Cargando leads...</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filterEtapa}
          onChange={(e) => setFilterEtapa(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
        >
          <option value="">Todas las etapas</option>
          <option value="Nuevo">Nuevo</option>
          <option value="Primer Contacto">Primer Contacto</option>
          <option value="Calificado">Calificado</option>
          <option value="Presentación Programada">Presentación Programada</option>
          <option value="Viendo Propiedad">Viendo Propiedad</option>
          <option value="Negociación">Negociación</option>
          <option value="Cierre">Cierre</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Teléfono</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Propiedad</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Etapa</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Asesor</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Presupuesto</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha Creación</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{lead.nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{lead.telefono || lead.whatsapp || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{lead.tipo_propiedad || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    lead.etapa === 'Cierre' ? 'bg-green-100 text-green-800' :
                    lead.etapa === 'Nuevo' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lead.etapa}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{lead.asesor?.nombre || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  ${lead.presupuesto_min?.toLocaleString('es-MX')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(lead.created_at).toLocaleDateString('es-MX')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay leads para mostrar</div>
        )}
      </div>
    </div>
  );
}

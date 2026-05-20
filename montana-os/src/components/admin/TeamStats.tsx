'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TeamStat {
  total_leads: number;
  leads_closed: number;
  asesores_count: number;
  conversion_rate: number;
}

export function TeamStats() {
  const [stats, setStats] = useState<TeamStat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return;

        // Get total leads
        const { count: totalLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        // Get closed leads (etapa = 'Cierre')
        const { count: closedLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('etapa', 'Cierre');

        // Get asesores count
        const { count: asesorCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'asesor');

        const conversionRate = totalLeads ? ((closedLeads || 0) / totalLeads) * 100 : 0;

        setStats({
          total_leads: totalLeads || 0,
          leads_closed: closedLeads || 0,
          asesores_count: asesorCount || 0,
          conversion_rate: Math.round(conversionRate),
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) return <div>Cargando estadísticas...</div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600 text-sm font-medium mb-2">Total de Leads</p>
        <p className="text-3xl font-bold text-gray-900">{stats.total_leads}</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600 text-sm font-medium mb-2">Leads Cerrados</p>
        <p className="text-3xl font-bold text-green-600">{stats.leads_closed}</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600 text-sm font-medium mb-2">Tasa Conversión</p>
        <p className="text-3xl font-bold text-blue-600">{stats.conversion_rate}%</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600 text-sm font-medium mb-2">Asesores Activos</p>
        <p className="text-3xl font-bold text-yellow-600">{stats.asesores_count}</p>
      </div>
    </div>
  );
}

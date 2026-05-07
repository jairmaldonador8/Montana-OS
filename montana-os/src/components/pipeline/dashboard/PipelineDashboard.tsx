'use client';

import { usePipelineAnalytics } from '@/hooks/usePipelineAnalytics';
import { MetricCard } from './MetricCard';

export function PipelineDashboard() {
  const { analytics, loading, error } = usePipelineAnalytics();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-border rounded-lg p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-6">
        <p className="text-red-900">
          {error || 'No se pudieron cargar las métricas'}
        </p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-montana-gold">
          Análisis
        </p>
        <h2 className="text-2xl font-editorial mt-2">Métricas del Pipeline</h2>
      </div>

      {/* First row of KPI cards (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Leads Activos"
          value={analytics.total_leads}
          subtext={`${analytics.leads_by_status.lead_nuevo} nuevos esta semana`}
          icon="📊"
        />
        <MetricCard
          label="Conversion %"
          value={`${analytics.conversion_rate}%`}
          subtext="De leads a cerrados"
          icon="📈"
        />
        <MetricCard
          label="Cycle Time Promedio"
          value={`${analytics.avg_cycle_time} días`}
          subtext="Tiempo medio a cierre"
          icon="⏱️"
        />
      </div>

      {/* Second row of KPI cards (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Revenue Pipeline"
          value={formatCurrency(analytics.revenue_pipeline)}
          subtext={`${analytics.leads_by_status.interesado + analytics.leads_by_status.pendiente_respuesta + analytics.leads_by_status.en_visita} leads activos`}
          trend={analytics.revenue_pipeline > 0 ? 'up' : 'neutral'}
          icon="💰"
        />
        <MetricCard
          label="Leads en Riesgo"
          value={analytics.leads_at_risk}
          subtext="Sin actividad 7+ días"
          trend={analytics.leads_at_risk > 0 ? 'down' : 'neutral'}
          icon="⚠️"
        />
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Estado por Etapa
            </p>
            <div className="space-y-2">
              {[
                { status: 'lead_nuevo', label: 'Nuevos', count: analytics.leads_by_status.lead_nuevo },
                { status: 'interesado', label: 'Interesados', count: analytics.leads_by_status.interesado },
                { status: 'pendiente_respuesta', label: 'Pendientes', count: analytics.leads_by_status.pendiente_respuesta },
                { status: 'en_visita', label: 'En Visita', count: analytics.leads_by_status.en_visita },
              ].map(({ label, count }) => (
                <div
                  key={label}
                  className="flex justify-between text-sm"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Agents Card */}
      <div className="bg-white border border-border rounded-lg p-6">
        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
          Top 3 Agentes
        </p>
        <div className="space-y-4">
          {analytics.top_agents.length > 0 ? (
            analytics.top_agents.map((agent, index) => (
              <div
                key={agent.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-montana-gold text-montana-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{agent.nombre}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{agent.closes}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(agent.revenue)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm py-4">
              Sin datos de cierres
            </p>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-montana-gold/10 border border-montana-gold/30 rounded-lg p-6">
        <p className="text-sm font-medium text-montana-gold mb-2">Resumen</p>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Total de leads: <span className="font-semibold">{analytics.total_leads}</span>
          </p>
          <p className="text-muted-foreground">
            Cerrados: <span className="font-semibold">{analytics.leads_by_status.cerrado}</span>
          </p>
          <p className="text-muted-foreground">
            En progreso: <span className="font-semibold">
              {analytics.leads_by_status.interesado +
                analytics.leads_by_status.pendiente_respuesta +
                analytics.leads_by_status.en_visita +
                analytics.leads_by_status.propuesta_enviada}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

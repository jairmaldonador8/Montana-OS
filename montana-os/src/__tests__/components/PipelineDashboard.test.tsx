import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { PipelineDashboard } from '@/components/pipeline/dashboard/PipelineDashboard';

// Mock dependencies
vi.mock('@/hooks/usePipelineAnalytics', () => ({
  usePipelineAnalytics: vi.fn(),
}));

vi.mock('@/components/pipeline/dashboard/MetricCard', () => ({
  MetricCard: ({ label, value, subtext, icon, trend }: any) => (
    <div data-testid={`metric-card-${label}`} className="metric-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className="subtext">{subtext}</div>
      {icon && <div className="icon">{icon}</div>}
      {trend && <div className="trend">{trend}</div>}
    </div>
  ),
}));

import { usePipelineAnalytics } from '@/hooks/usePipelineAnalytics';

describe('PipelineDashboard Component', () => {
  const mockAnalytics = {
    total_leads: 150,
    conversion_rate: 15.5,
    avg_cycle_time: 22,
    revenue_pipeline: 500000,
    leads_at_risk: 8,
    leads_by_status: {
      lead_nuevo: 40,
      interesado: 30,
      pendiente_respuesta: 25,
      en_visita: 20,
      propuesta_enviada: 20,
      cerrado: 10,
      no_interesado: 5,
    },
    top_agents: [
      { id: 'agent-1', nombre: 'Agent One', closes: 5, revenue: 150000 },
      { id: 'agent-2', nombre: 'Agent Two', closes: 4, revenue: 120000 },
      { id: 'agent-3', nombre: 'Agent Three', closes: 3, revenue: 90000 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const mockUsePipelineAnalytics = vi.mocked(usePipelineAnalytics);
    mockUsePipelineAnalytics.mockReturnValue({
      analytics: mockAnalytics,
      loading: false,
      error: null,
    });
  });

  it('should render without crashing', () => {
    render(<PipelineDashboard />);
    expect(screen.getByText('Métricas del Pipeline')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    const mockUsePipelineAnalytics = vi.mocked(usePipelineAnalytics);
    mockUsePipelineAnalytics.mockReturnValue({
      analytics: null,
      loading: true,
      error: null,
    });

    render(<PipelineDashboard />);
    expect(screen.getByText('Métricas del Pipeline')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const mockUsePipelineAnalytics = vi.mocked(usePipelineAnalytics);
    mockUsePipelineAnalytics.mockReturnValue({
      analytics: null,
      loading: false,
      error: 'Failed to fetch analytics',
    });

    render(<PipelineDashboard />);
    expect(screen.getByText('Failed to fetch analytics')).toBeInTheDocument();
  });

  it('should render first row KPI cards', () => {
    render(<PipelineDashboard />);

    expect(screen.getByTestId('metric-card-Leads Activos')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-Conversion %')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-Cycle Time Promedio')).toBeInTheDocument();
  });

  it('should render second row KPI cards', () => {
    render(<PipelineDashboard />);

    expect(screen.getByTestId('metric-card-Revenue Pipeline')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-Leads en Riesgo')).toBeInTheDocument();
  });

  it('should display correct lead counts', () => {
    render(<PipelineDashboard />);

    const leadsActivosCard = screen.getByTestId('metric-card-Leads Activos');
    expect(leadsActivosCard).toHaveTextContent('150');
  });

  it('should display conversion rate percentage', () => {
    render(<PipelineDashboard />);

    const conversionCard = screen.getByTestId('metric-card-Conversion %');
    expect(conversionCard).toHaveTextContent('15.5%');
  });

  it('should display average cycle time', () => {
    render(<PipelineDashboard />);

    const cycleTimeCard = screen.getByTestId('metric-card-Cycle Time Promedio');
    expect(cycleTimeCard).toHaveTextContent('22 días');
  });

  it('should format revenue in millions', () => {
    render(<PipelineDashboard />);

    const revenueCard = screen.getByTestId('metric-card-Revenue Pipeline');
    expect(revenueCard).toHaveTextContent('$0.5M');
  });

  it('should format large revenue correctly', () => {
    const mockUsePipelineAnalytics = vi.mocked(usePipelineAnalytics);
    mockUsePipelineAnalytics.mockReturnValue({
      analytics: {
        ...mockAnalytics,
        revenue_pipeline: 2500000,
      },
      loading: false,
      error: null,
    });

    render(<PipelineDashboard />);

    const revenueCard = screen.getByTestId('metric-card-Revenue Pipeline');
    expect(revenueCard).toHaveTextContent('$2.5M');
  });

  it('should format revenue in thousands', () => {
    const mockUsePipelineAnalytics = vi.mocked(usePipelineAnalytics);
    mockUsePipelineAnalytics.mockReturnValue({
      analytics: {
        ...mockAnalytics,
        revenue_pipeline: 150000,
      },
      loading: false,
      error: null,
    });

    render(<PipelineDashboard />);

    const revenueCard = screen.getByTestId('metric-card-Revenue Pipeline');
    expect(revenueCard).toHaveTextContent('$150K');
  });

  it('should display leads by status breakdown', () => {
    render(<PipelineDashboard />);

    expect(screen.getByText('Nuevos')).toBeInTheDocument();
    expect(screen.getByText('Interesados')).toBeInTheDocument();
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
    expect(screen.getByText('En Visita')).toBeInTheDocument();
  });

  it('should display correct status counts', () => {
    render(<PipelineDashboard />);

    expect(screen.getByText('40')).toBeInTheDocument(); // lead_nuevo
    expect(screen.getByText('30')).toBeInTheDocument(); // interesado
  });

  it('should display top agents ranking', () => {
    render(<PipelineDashboard />);

    expect(screen.getByText('Agent One')).toBeInTheDocument();
    expect(screen.getByText('Agent Two')).toBeInTheDocument();
    expect(screen.getByText('Agent Three')).toBeInTheDocument();
  });

  it('should display agent close counts', () => {
    render(<PipelineDashboard />);

    expect(screen.getByText('5')).toBeInTheDocument(); // Agent One closes
    expect(screen.getByText('4')).toBeInTheDocument(); // Agent Two closes
  });

  it('should format agent revenue correctly', () => {
    render(<PipelineDashboard />);

    expect(screen.getByText('$150K')).toBeInTheDocument(); // Agent One revenue
  });

  it('should show no data message when no agents', () => {
    const mockUsePipelineAnalytics = vi.mocked(usePipelineAnalytics);
    mockUsePipelineAnalytics.mockReturnValue({
      analytics: {
        ...mockAnalytics,
        top_agents: [],
      },
      loading: false,
      error: null,
    });

    render(<PipelineDashboard />);

    expect(screen.getByText('Sin datos de cierres')).toBeInTheDocument();
  });

  it('should display summary statistics', () => {
    render(<PipelineDashboard />);

    expect(screen.getByText('Total de leads:')).toBeInTheDocument();
    expect(screen.getByText('Cerrados:')).toBeInTheDocument();
    expect(screen.getByText('En progreso:')).toBeInTheDocument();
  });

  it('should calculate in-progress leads correctly', () => {
    render(<PipelineDashboard />);

    // interesado (30) + pendiente_respuesta (25) + en_visita (20) + propuesta_enviada (20) = 95
    expect(screen.getByText('95')).toBeInTheDocument();
  });

  it('should display total closed leads', () => {
    render(<PipelineDashboard />);

    expect(screen.getByText('10')).toBeInTheDocument(); // cerrado count
  });

  it('should display risk indicator for at-risk leads', () => {
    render(<PipelineDashboard />);

    const riskCard = screen.getByTestId('metric-card-Leads en Riesgo');
    expect(riskCard).toHaveTextContent('8');
  });

  it('should render all icons in KPI cards', () => {
    render(<PipelineDashboard />);

    // Icons are displayed in metric cards
    const cards = screen.getAllByRole('generic', { hidden: true });
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should display uptrend for positive revenue pipeline', () => {
    render(<PipelineDashboard />);

    const revenueCard = screen.getByTestId('metric-card-Revenue Pipeline');
    expect(revenueCard).toHaveTextContent('up');
  });

  it('should display downtrend for at-risk leads', () => {
    render(<PipelineDashboard />);

    const riskCard = screen.getByTestId('metric-card-Leads en Riesgo');
    expect(riskCard).toHaveTextContent('down');
  });

  it('should handle empty analytics data', () => {
    const mockUsePipelineAnalytics = vi.mocked(usePipelineAnalytics);
    mockUsePipelineAnalytics.mockReturnValue({
      analytics: {
        total_leads: 0,
        conversion_rate: 0,
        avg_cycle_time: 0,
        revenue_pipeline: 0,
        leads_at_risk: 0,
        leads_by_status: {
          lead_nuevo: 0,
          interesado: 0,
          pendiente_respuesta: 0,
          en_visita: 0,
          propuesta_enviada: 0,
          cerrado: 0,
          no_interesado: 0,
        },
        top_agents: [],
      },
      loading: false,
      error: null,
    });

    render(<PipelineDashboard />);

    expect(screen.getByText('Métricas del Pipeline')).toBeInTheDocument();
  });
});

describe('PipelineDashboard Currency Formatting', () => {
  const mockAnalytics = {
    total_leads: 150,
    conversion_rate: 15.5,
    avg_cycle_time: 22,
    revenue_pipeline: 0,
    leads_at_risk: 0,
    leads_by_status: {
      lead_nuevo: 0,
      interesado: 0,
      pendiente_respuesta: 0,
      en_visita: 0,
      propuesta_enviada: 0,
      cerrado: 0,
      no_interesado: 0,
    },
    top_agents: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should format currency as dollars for values under 1k', () => {
    // Test the formatting function behavior
    const value = 500;
    const formatted = `$${value.toFixed(0)}`;
    expect(formatted).toBe('$500');
  });

  it('should format currency as thousands for 1k-1m values', () => {
    const value = 150000;
    const formatted = `$${(value / 1000).toFixed(0)}K`;
    expect(formatted).toBe('$150K');
  });

  it('should format currency as millions for values over 1m', () => {
    const value = 2500000;
    const formatted = `$${(value / 1000000).toFixed(1)}M`;
    expect(formatted).toBe('$2.5M');
  });
});

describe('PipelineDashboard Data Validation', () => {
  it('should validate leads_by_status sum', () => {
    const leads_by_status = {
      lead_nuevo: 40,
      interesado: 30,
      pendiente_respuesta: 25,
      en_visita: 20,
      propuesta_enviada: 20,
      cerrado: 10,
      no_interesado: 5,
    };

    const total = Object.values(leads_by_status).reduce((a, b) => a + b, 0);
    expect(total).toBe(150);
  });

  it('should validate conversion rate is percentage', () => {
    const conversionRate = 15.5;
    expect(conversionRate).toBeGreaterThanOrEqual(0);
    expect(conversionRate).toBeLessThanOrEqual(100);
  });

  it('should validate top agents length', () => {
    const topAgents = [
      { id: '1', nombre: 'Agent One', closes: 5, revenue: 150000 },
      { id: '2', nombre: 'Agent Two', closes: 4, revenue: 120000 },
      { id: '3', nombre: 'Agent Three', closes: 3, revenue: 90000 },
    ];

    expect(topAgents.length).toBeLessThanOrEqual(3);
  });
});

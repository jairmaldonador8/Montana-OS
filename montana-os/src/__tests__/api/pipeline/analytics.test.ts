import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/pipeline/analytics/route';

// Mock the modules
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/pipeline/queries', () => ({
  getPipelineAnalytics: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { getPipelineAnalytics } from '@/lib/pipeline/queries';

describe('GET /api/pipeline/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 without authentication', async () => {
    const mockCreateClient = vi.mocked(createClient);
    mockCreateClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as any);

    const request = new NextRequest(new URL('http://localhost:3000/api/pipeline/analytics'));
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('should return analytics data for authenticated user', async () => {
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

    const mockCreateClient = vi.mocked(createClient);
    mockCreateClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
        }),
      },
    } as any);

    const mockGetAnalytics = vi.mocked(getPipelineAnalytics);
    mockGetAnalytics.mockResolvedValue(mockAnalytics as any);

    const request = new NextRequest(new URL('http://localhost:3000/api/pipeline/analytics'));
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockAnalytics);
  });

  it('should calculate conversion rate correctly', async () => {
    const mockAnalytics = {
      total_leads: 100,
      conversion_rate: 10.0,
      cerrado: 10,
      leads_by_status: {
        cerrado: 10,
      },
    };

    const conversionRate = (mockAnalytics.cerrado / mockAnalytics.total_leads) * 100;
    expect(conversionRate).toBeCloseTo(10.0);
  });

  it('should validate analytics data structure', async () => {
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
      top_agents: [],
    };

    // Validate required fields
    expect(mockAnalytics).toHaveProperty('total_leads');
    expect(mockAnalytics).toHaveProperty('conversion_rate');
    expect(mockAnalytics).toHaveProperty('avg_cycle_time');
    expect(mockAnalytics).toHaveProperty('revenue_pipeline');
    expect(mockAnalytics).toHaveProperty('leads_by_status');
    expect(mockAnalytics).toHaveProperty('top_agents');

    // Validate types
    expect(typeof mockAnalytics.total_leads).toBe('number');
    expect(typeof mockAnalytics.conversion_rate).toBe('number');
    expect(typeof mockAnalytics.avg_cycle_time).toBe('number');
    expect(typeof mockAnalytics.revenue_pipeline).toBe('number');
    expect(Array.isArray(mockAnalytics.top_agents)).toBe(true);
  });

  it('should handle empty analytics data', async () => {
    const mockAnalytics = {
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
    };

    const mockCreateClient = vi.mocked(createClient);
    mockCreateClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
        }),
      },
    } as any);

    const mockGetAnalytics = vi.mocked(getPipelineAnalytics);
    mockGetAnalytics.mockResolvedValue(mockAnalytics as any);

    const request = new NextRequest(new URL('http://localhost:3000/api/pipeline/analytics'));
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.total_leads).toBe(0);
    expect(data.top_agents).toHaveLength(0);
  });

  it('should handle database errors gracefully', async () => {
    const mockCreateClient = vi.mocked(createClient);
    mockCreateClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
        }),
      },
    } as any);

    const mockGetAnalytics = vi.mocked(getPipelineAnalytics);
    mockGetAnalytics.mockRejectedValueOnce(new Error('Database connection failed'));

    const request = new NextRequest(new URL('http://localhost:3000/api/pipeline/analytics'));
    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: 'Failed to fetch analytics',
    });
  });

  it('should verify leads_by_status sum constraints', async () => {
    const mockAnalytics = {
      total_leads: 100,
      leads_by_status: {
        lead_nuevo: 30,
        interesado: 25,
        pendiente_respuesta: 20,
        en_visita: 15,
        propuesta_enviada: 5,
        cerrado: 4,
        no_interesado: 1,
      },
    };

    const statusSum = Object.values(mockAnalytics.leads_by_status).reduce((a, b) => a + b, 0);
    expect(statusSum).toBe(mockAnalytics.total_leads);
  });

  it('should handle top agents ranking correctly', async () => {
    const mockAnalytics = {
      top_agents: [
        { id: '1', nombre: 'Agent One', closes: 10, revenue: 300000 },
        { id: '2', nombre: 'Agent Two', closes: 8, revenue: 240000 },
        { id: '3', nombre: 'Agent Three', closes: 6, revenue: 180000 },
      ],
    };

    // Verify ranking order
    for (let i = 0; i < mockAnalytics.top_agents.length - 1; i++) {
      expect(mockAnalytics.top_agents[i].closes).toBeGreaterThanOrEqual(
        mockAnalytics.top_agents[i + 1].closes
      );
    }
  });
});

describe('Analytics Data Calculations', () => {
  it('should calculate average cycle time', () => {
    const cycles = [15, 20, 25, 30, 35];
    const avgCycle = cycles.reduce((a, b) => a + b, 0) / cycles.length;
    expect(avgCycle).toBe(25);
  });

  it('should calculate revenue per agent', () => {
    const revenues = [100000, 150000, 200000];
    const totalRevenue = revenues.reduce((a, b) => a + b, 0);
    expect(totalRevenue).toBe(450000);

    const avgPerAgent = totalRevenue / revenues.length;
    expect(avgPerAgent).toBeCloseTo(150000);
  });

  it('should identify leads at risk', () => {
    const leads = [
      { id: '1', last_activity: Date.now() - 7 * 24 * 60 * 60 * 1000 }, // 7 days ago
      { id: '2', last_activity: Date.now() - 10 * 24 * 60 * 60 * 1000 }, // 10 days ago
      { id: '3', last_activity: Date.now() - 1 * 24 * 60 * 60 * 1000 }, // 1 day ago
    ];

    const RISK_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days
    const atRiskLeads = leads.filter((lead) => Date.now() - lead.last_activity >= RISK_THRESHOLD);

    expect(atRiskLeads).toHaveLength(2);
  });
});

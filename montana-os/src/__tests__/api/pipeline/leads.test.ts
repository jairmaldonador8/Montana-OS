import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/pipeline/leads/route';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/pipeline/leads', () => ({
  getLeads: vi.fn(),
  createLead: vi.fn(),
}));

vi.mock('@/lib/validators/pipeline', () => ({
  CreateLeadSchema: {
    parse: (data: any) => {
      if (!data.property_id || !data.nombre) {
        throw new Error('Validation failed');
      }
      return data;
    },
  },
}));

import { createClient } from '@/lib/supabase/server';
import { getLeads, createLead } from '@/lib/pipeline/leads';

describe('GET /api/pipeline/leads', () => {
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

    const request = new NextRequest(new URL('http://localhost:3000/api/pipeline/leads'));
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('should return leads for authenticated user', async () => {
    const mockLeads = [
      {
        id: '1',
        property_id: 'prop-1',
        nombre: 'John Doe',
        status: 'lead_nuevo',
      },
      {
        id: '2',
        property_id: 'prop-2',
        nombre: 'Jane Smith',
        status: 'interesado',
      },
    ];

    const mockCreateClient = vi.mocked(createClient);
    mockCreateClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
        }),
      },
    } as any);

    const mockGetLeads = vi.mocked(getLeads);
    mockGetLeads.mockResolvedValue(mockLeads as any);

    const request = new NextRequest(new URL('http://localhost:3000/api/pipeline/leads'));
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toEqual(mockLeads);
    expect(data.total).toBe(2);
  });

  it('should filter leads by status', async () => {
    const filteredLeads = [
      {
        id: '1',
        property_id: 'prop-1',
        nombre: 'John Doe',
        status: 'interesado',
      },
    ];

    const mockCreateClient = vi.mocked(createClient);
    mockCreateClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
        }),
      },
    } as any);

    const mockGetLeads = vi.mocked(getLeads);
    mockGetLeads.mockResolvedValue(filteredLeads as any);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/pipeline/leads?status=interesado')
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(mockGetLeads).toHaveBeenCalledWith({
      status: 'interesado',
      assigned_to: undefined,
      limit: 50,
      offset: 0,
    });
  });

  it('should handle pagination parameters', async () => {
    const mockLeads = [{ id: '1', property_id: 'prop-1', nombre: 'John Doe' }];

    const mockCreateClient = vi.mocked(createClient);
    mockCreateClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
        }),
      },
    } as any);

    const mockGetLeads = vi.mocked(getLeads);
    mockGetLeads.mockResolvedValue(mockLeads as any);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/pipeline/leads?limit=10&offset=20')
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(mockGetLeads).toHaveBeenCalledWith({
      status: undefined,
      assigned_to: undefined,
      limit: 10,
      offset: 20,
    });
    expect(data.page).toBe(3); // offset 20 / limit 10 + 1
  });

  it('should handle errors gracefully', async () => {
    const mockCreateClient = vi.mocked(createClient);
    mockCreateClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
        }),
      },
    } as any);

    const mockGetLeads = vi.mocked(getLeads);
    mockGetLeads.mockRejectedValueOnce(new Error('Database error'));

    const request = new NextRequest(new URL('http://localhost:3000/api/pipeline/leads'));
    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Failed to fetch leads' });
  });
});

describe('POST /api/pipeline/leads', () => {
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

    const requestBody = {
      property_id: 'prop-1',
      nombre: 'John Doe',
    };

    const request = new NextRequest(new URL('http://localhost:3000/api/pipeline/leads'), {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('should create a lead with valid input', async () => {
    const newLead = {
      id: 'lead-1',
      property_id: 'prop-1',
      nombre: 'John Doe',
      email: 'john@example.com',
      status: 'lead_nuevo',
    };

    const mockCreateClient = vi.mocked(createClient);
    mockCreateClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
        }),
      },
    } as any);

    const mockCreateLead = vi.mocked(createLead);
    mockCreateLead.mockResolvedValue(newLead as any);

    const requestBody = {
      property_id: 'prop-1',
      nombre: 'John Doe',
      email: 'john@example.com',
    };

    const request = new NextRequest(new URL('http://localhost:3000/api/pipeline/leads'), {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toEqual(newLead);
  });

  it('should return 400 for invalid input', async () => {
    const mockCreateClient = vi.mocked(createClient);
    mockCreateClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
        }),
      },
    } as any);

    // Missing required property_id
    const requestBody = {
      nombre: 'John Doe',
    };

    const request = new NextRequest(new URL('http://localhost:3000/api/pipeline/leads'), {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should handle creation errors', async () => {
    const mockCreateClient = vi.mocked(createClient);
    mockCreateClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
        }),
      },
    } as any);

    const mockCreateLead = vi.mocked(createLead);
    mockCreateLead.mockRejectedValueOnce(new Error('Database error'));

    const requestBody = {
      property_id: 'prop-1',
      nombre: 'John Doe',
    };

    const request = new NextRequest(new URL('http://localhost:3000/api/pipeline/leads'), {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: 'Failed to create lead',
    });
  });

  it('should handle invalid email format', async () => {
    const mockCreateClient = vi.mocked(createClient);
    mockCreateClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'test@example.com' } },
        }),
      },
    } as any);

    const requestBody = {
      property_id: 'prop-1',
      nombre: 'John Doe',
      email: 'invalid-email',
    };

    const request = new NextRequest(new URL('http://localhost:3000/api/pipeline/leads'), {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);

    expect([400, 500]).toContain(response.status);
  });
});

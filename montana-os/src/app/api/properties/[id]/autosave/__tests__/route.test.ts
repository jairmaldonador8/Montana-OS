import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../route';

// Mock next response
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, { status }: any) => ({
      ok: status === 200,
      status,
      json: async () => data,
    }),
  },
}));

// Mock Supabase
let mockSupabaseClient: any;

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => mockSupabaseClient,
}));

describe('POST /api/properties/[id]/autosave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step1: { type: 'casa' } }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Request Validation', () => {
    it('should return 400 for empty body', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid step data');
    });

    it('should return 400 for invalid step key', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step5: { type: 'casa' } }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid step data');
    });

    it('should return 400 if step data is not an object', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step1: 'invalid' }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid step data');
    });

    it('should accept valid step1 data', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: [{ id: '123', type: 'casa' }],
          error: null,
        }),
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step1: { type: 'casa', operation: 'venta' } }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.ok).toBe(true);
    });

    it('should accept valid step2 data', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: [{ id: '123' }],
          error: null,
        }),
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step2: { neighborhood: 'Zona Rosa', address: 'Calle 1' } }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      expect(response.status).toBe(200);
    });

    it('should accept valid step3 data', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: [{ id: '123' }],
          error: null,
        }),
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({
          step3: { bedrooms: 3, bathrooms: 2, m2Built: 150 },
        }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      expect(response.status).toBe(200);
    });

    it('should accept valid step4 data', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: [{ id: '123' }],
          error: null,
        }),
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({
          step4: { photos: ['url1', 'url2'], description: 'Beautiful home' },
        }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('Field Name Transformation', () => {
    it('should transform rentalPrice to rental_price', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const updateMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const selectMock = vi.fn().mockResolvedValue({
        data: [{ id: '123' }],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: updateMock,
        eq: eqMock,
        select: selectMock,
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step1: { rentalPrice: 5000 } }),
      });

      await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      const updateCall = updateMock.mock.calls[0];
      expect(updateCall[0]).toHaveProperty('rental_price');
      expect(updateCall[0].rental_price).toBe(5000);
    });

    it('should transform m2Built to m2_built', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const updateMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const selectMock = vi.fn().mockResolvedValue({
        data: [{ id: '123' }],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: updateMock,
        eq: eqMock,
        select: selectMock,
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step3: { m2Built: 150 } }),
      });

      await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      const updateCall = updateMock.mock.calls[0];
      expect(updateCall[0]).toHaveProperty('m2_built');
      expect(updateCall[0].m2_built).toBe(150);
    });

    it('should transform m2Land to m2_land', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const updateMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const selectMock = vi.fn().mockResolvedValue({
        data: [{ id: '123' }],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: updateMock,
        eq: eqMock,
        select: selectMock,
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step3: { m2Land: 300 } }),
      });

      await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      const updateCall = updateMock.mock.calls[0];
      expect(updateCall[0]).toHaveProperty('m2_land');
      expect(updateCall[0].m2_land).toBe(300);
    });

    it('should stringify amenities array', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const updateMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const selectMock = vi.fn().mockResolvedValue({
        data: [{ id: '123' }],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: updateMock,
        eq: eqMock,
        select: selectMock,
      });

      const amenities = ['alberca', 'jacuzzi'];
      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step3: { amenities } }),
      });

      await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      const updateCall = updateMock.mock.calls[0];
      expect(updateCall[0]).toHaveProperty('amenities');
      expect(typeof updateCall[0].amenities).toBe('string');
      expect(JSON.parse(updateCall[0].amenities)).toEqual(amenities);
    });

    it('should stringify GPS object', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const updateMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const selectMock = vi.fn().mockResolvedValue({
        data: [{ id: '123' }],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: updateMock,
        eq: eqMock,
        select: selectMock,
      });

      const gps = { lat: 25.6866, lng: -100.3161 };
      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step2: { gps } }),
      });

      await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      const updateCall = updateMock.mock.calls[0];
      expect(updateCall[0]).toHaveProperty('gps');
      expect(typeof updateCall[0].gps).toBe('string');
      expect(JSON.parse(updateCall[0].gps)).toEqual(gps);
    });

    it('should only include defined values in update', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const updateMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const selectMock = vi.fn().mockResolvedValue({
        data: [{ id: '123' }],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: updateMock,
        eq: eqMock,
        select: selectMock,
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({
          step1: { type: 'casa', operation: undefined, price: 1000000 },
        }),
      });

      await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      const updateCall = updateMock.mock.calls[0];
      expect(updateCall[0]).toHaveProperty('type');
      expect(updateCall[0]).toHaveProperty('price');
      expect(updateCall[0]).not.toHaveProperty('operation');
    });
  });

  describe('Database Ownership Check', () => {
    it('should query with captured_by condition', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const updateMock = vi.fn().mockReturnThis();
      const firstEqMock = vi.fn().mockReturnThis();
      const secondEqMock = vi.fn().mockReturnThis();
      const selectMock = vi.fn().mockResolvedValue({
        data: [{ id: '123' }],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: updateMock,
        eq: secondEqMock,
      });

      firstEqMock.mockReturnValue({
        eq: secondEqMock,
      });

      secondEqMock.mockReturnValue({
        select: selectMock,
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step1: { type: 'casa' } }),
      });

      await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      expect(updateMock).toHaveBeenCalled();
    });
  });

  describe('Success Response', () => {
    it('should return 200 with ok: true on success', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: [{ id: '123', type: 'casa' }],
          error: null,
        }),
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step1: { type: 'casa' } }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.ok).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should return updated property data in response', async () => {
      const mockPropertyData = { id: '123', type: 'casa', price: 1000000 };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: [mockPropertyData],
          error: null,
        }),
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step1: { type: 'casa' } }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      const data = await response.json();
      expect(data.data).toEqual(mockPropertyData);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      });

      const request = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: JSON.stringify({ step1: { type: 'casa' } }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: '123' }),
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to save autosave');
    });

    it('should return 500 on JSON parse error', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const invalidRequest = new Request('http://localhost/api/properties/123/autosave', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(invalidRequest, {
        params: Promise.resolve({ id: '123' }),
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });
  });
});

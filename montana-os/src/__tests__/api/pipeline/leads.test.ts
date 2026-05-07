import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/pipeline/leads/route';
import { NextRequest } from 'next/server';

describe('GET /api/pipeline/leads', () => {
  it('should return unauthorized without auth', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/api/pipeline/leads'));
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return leads for authenticated user', async () => {
    // Mock authenticated request
    // This requires test setup with Supabase mock
    // Placeholder: implement with proper test harness
  });
});

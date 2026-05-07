import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLeads, createLead } from '@/lib/pipeline/leads';
import { CreateLeadSchema } from '@/lib/validators/pipeline';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const assigned_to = searchParams.get('assigned_to') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const leads = await getLeads({ status, assigned_to, limit, offset });

    return NextResponse.json({
      data: leads,
      total: leads.length,
      page: Math.floor(offset / limit) + 1,
    });
  } catch (error) {
    console.error('GET /api/pipeline/leads error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = CreateLeadSchema.parse(body);

    const lead = await createLead(validated);

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('POST /api/pipeline/leads error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

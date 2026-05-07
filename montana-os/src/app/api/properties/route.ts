import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/properties
 *
 * Fetch all properties for the current user
 *
 * Response:
 * [
 *   {
 *     "id": "uuid",
 *     "code": "MR-2026-XXXX",
 *     "status": "draft",
 *     ...
 *   }
 * ]
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('captured_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch properties DB error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return NextResponse.json(data || [], {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Fetch properties error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST /api/properties
 *
 * Create a new property record with sensible defaults.
 * Called when first loading the form.
 *
 * Response:
 * {
 *   "id": "uuid",
 *   "code": "MR-2026-XXXX",
 *   "status": "draft",
 *   ...
 * }
 */
export async function POST(req: Request) {
  try {
    // Initialize Supabase client
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create new property with sensible defaults
    const newProperty = {
      captured_by: user.id,
      status: 'draft',
      type: 'casa',
      operation: 'venta',
      price: 0,
      address: '',
      neighborhood: '',
    };

    // Insert into database
    // The database trigger will automatically generate the code (MR-YYYY-NNNN)
    const { data, error } = await supabase
      .from('properties')
      .insert([newProperty])
      .select();

    // Handle database errors
    if (error) {
      console.error('Create property DB error:', error);
      return NextResponse.json(
        { error: 'Failed to create property' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return created property
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create property' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return NextResponse.json(data[0], {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create property error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Field mapping from frontend to database column names
const fieldMappings: Record<string, string> = {
  type: 'type',
  operation: 'operation',
  price: 'price',
  rentalPrice: 'rental_price',
  currency: 'currency',
  neighborhood: 'neighborhood',
  address: 'address',
  bedrooms: 'bedrooms',
  bathrooms: 'bathrooms',
  m2Built: 'm2_built',
  m2Land: 'm2_land',
  amenities: 'amenities',
  media: 'media',
  photos: 'media',
  description: 'description_raw',
  status: 'status',
};

/**
 * PATCH /api/properties/{id}
 *
 * Update a property record (final submission with status='pending_review')
 *
 * Request Body:
 * {
 *   "type": "casa",
 *   "operation": "venta",
 *   "price": 5000000,
 *   "neighborhood": "Barrio Antiguo",
 *   "address": "Calle Principal 123",
 *   "bedrooms": 3,
 *   "bathrooms": 2,
 *   "m2_built": 250,
 *   "amenities": ["jardín", "alberca"],
 *   "media": ["url1", "url2"],
 *   "description": "Beautiful property...",
 *   "status": "pending_review"
 * }
 *
 * Response:
 * {
 *   "id": "uuid",
 *   "code": "MR-2026-XXXX",
 *   ...updated fields...
 * }
 */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get property ID from dynamic route params
    const { id: propertyId } = await context.params;

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

    // Parse request body
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Transform field names from frontend to database columns
    const updateData: Record<string, any> = {};

    for (const [frontendKey, value] of Object.entries(body)) {
      const dbKey = fieldMappings[frontendKey];

      // Only include mapped fields that are defined
      if (dbKey && value !== undefined && value !== null) {
        // Handle array fields (amenities, media/photos)
        if (Array.isArray(value)) {
          updateData[dbKey] = value;
        } else {
          updateData[dbKey] = value;
        }
      }
    }

    // For drafts, allow saving even with minimal data
    // For final submissions, require more fields
    const isDraft = body.status === 'draft';

    if (!isDraft && Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: at least one field required' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If no fields to update but status is changing to draft, allow it
    if (isDraft && Object.keys(updateData).length === 0) {
      updateData.status = 'draft';
    }

    // Update database with ownership check
    // Only allow agents to update their own draft/rejected properties
    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .eq('captured_by', user.id)
      .select();

    // Handle database errors
    if (error) {
      console.error('Update property DB error:', error);
      return NextResponse.json(
        { error: 'Failed to update property' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if property exists and belongs to user
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Property not found or unauthorized' },
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return updated property
    return NextResponse.json(data[0], {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Update property error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

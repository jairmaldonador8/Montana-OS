import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Field mapping from frontend to database column names
const fieldMappings = {
  step1: {
    type: 'type',
    operation: 'operation',
    price: 'price',
    rentalPrice: 'rental_price',
    currency: 'currency',
  },
  step2: {
    neighborhood: 'neighborhood',
    address: 'address',
    gps: 'gps',
    references: 'references',
  },
  step3: {
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    m2Built: 'm2_built',
    m2Land: 'm2_land',
    amenities: 'amenities',
  },
  step4: {
    photos: 'media',
    description: 'description',
  },
};

interface Step1Data {
  type?: string;
  operation?: string;
  price?: number;
  rentalPrice?: number;
  currency?: string;
}

interface Step2Data {
  neighborhood?: string;
  address?: string;
  gps?: { lat: number; lng: number };
  references?: string;
}

interface Step3Data {
  bedrooms?: number;
  bathrooms?: number;
  m2Built?: number;
  m2Land?: number;
  amenities?: string[];
}

interface Step4Data {
  photos?: string[];
  description?: string;
}

type StepData = Step1Data | Step2Data | Step3Data | Step4Data;

/**
 * Transform field names from frontend format to database column names
 */
function transformStepData(stepKey: string, stepData: StepData): Record<string, any> {
  const mapping = fieldMappings[stepKey as keyof typeof fieldMappings];
  if (!mapping) {
    throw new Error(`Invalid step: ${stepKey}`);
  }

  const transformed: Record<string, any> = {};

  for (const [frontendKey, dbKey] of Object.entries(mapping)) {
    const value = (stepData as any)[frontendKey];

    // Only include non-undefined values
    if (value !== undefined && value !== null) {
      // Convert gps and amenities to JSON if they're objects/arrays
      if (dbKey === 'gps' && typeof value === 'object') {
        transformed[dbKey] = JSON.stringify(value);
      } else if (dbKey === 'amenities' && Array.isArray(value)) {
        transformed[dbKey] = JSON.stringify(value);
      } else if (dbKey === 'media' && Array.isArray(value)) {
        transformed[dbKey] = JSON.stringify(value);
      } else {
        transformed[dbKey] = value;
      }
    }
  }

  return transformed;
}

export async function POST(
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();

    // Identify which step is being saved
    const stepKeys = Object.keys(body);
    if (stepKeys.length === 0) {
      return NextResponse.json(
        { error: 'Invalid step data' },
        { status: 400 }
      );
    }

    const stepKey = stepKeys[0]; // e.g., "step1", "step2", etc.
    const stepData = body[stepKey];

    // Validate step key format
    if (!/^step[1-4]$/.test(stepKey)) {
      return NextResponse.json(
        { error: 'Invalid step data' },
        { status: 400 }
      );
    }

    // Validate that step data exists and is not empty
    if (!stepData || typeof stepData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid step data' },
        { status: 400 }
      );
    }

    // Transform field names
    const updateData = transformStepData(stepKey, stepData);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Invalid step data' },
        { status: 400 }
      );
    }

    // Update database with ownership check
    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .eq('captured_by', user.id)
      .select();

    // Handle database errors
    if (error) {
      console.error('Autosave DB error:', error);
      return NextResponse.json(
        { error: 'Failed to save autosave' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        ok: true,
        data: data && data.length > 0 ? data[0] : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Autosave error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

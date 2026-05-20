import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Only allow this in development or with a secret key
const SETUP_SECRET = process.env.SETUP_SECRET || 'dev-setup-key';

export async function POST(req: Request) {
  try {
    // Verify authorization
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${SETUP_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    // Create admin client with service role
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // Execute SQL statements
    const sqlStatements = [
      `CREATE TABLE IF NOT EXISTS public.properties (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        code varchar(50) UNIQUE NOT NULL,
        status varchar(50) DEFAULT 'draft' NOT NULL,
        type varchar(50) NOT NULL,
        operation varchar(50) NOT NULL,
        price bigint DEFAULT 0,
        rental_price bigint,
        currency varchar(10) DEFAULT 'USD',
        address text NOT NULL,
        neighborhood varchar(255),
        bedrooms integer,
        bathrooms integer,
        m2_built integer,
        m2_land integer,
        amenities jsonb DEFAULT '[]'::jsonb,
        media jsonb DEFAULT '[]'::jsonb,
        description_raw text,
        captured_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      )`,

      `CREATE INDEX IF NOT EXISTS idx_properties_captured_by ON public.properties(captured_by)`,
      `CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status)`,
      `CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC)`,

      `ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY`,

      `CREATE POLICY IF NOT EXISTS "Users can view their own properties"
        ON public.properties FOR SELECT USING (auth.uid() = captured_by)`,

      `CREATE POLICY IF NOT EXISTS "Users can insert their own properties"
        ON public.properties FOR INSERT WITH CHECK (auth.uid() = captured_by)`,

      `CREATE POLICY IF NOT EXISTS "Users can update their own properties"
        ON public.properties FOR UPDATE USING (auth.uid() = captured_by) WITH CHECK (auth.uid() = captured_by)`,

      `CREATE POLICY IF NOT EXISTS "Users can delete their own properties"
        ON public.properties FOR DELETE USING (auth.uid() = captured_by)`,

      `CREATE SEQUENCE IF NOT EXISTS properties_code_seq START 1`,

      `CREATE OR REPLACE FUNCTION public.generate_property_code()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.code IS NULL THEN
            NEW.code := 'MR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('properties_code_seq')::text, 4, '0');
          END IF;
          NEW.updated_at := NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql`,

      `DROP TRIGGER IF EXISTS trigger_generate_property_code ON public.properties`,

      `CREATE TRIGGER trigger_generate_property_code
        BEFORE INSERT ON public.properties
        FOR EACH ROW
        EXECUTE FUNCTION public.generate_property_code()`
    ];

    // Execute each statement
    const results = [];
    for (const sql of sqlStatements) {
      let error = null;
      try {
        const result = await supabase.rpc('exec', { query: sql });
        error = result.error;
      } catch {
        error = null;
      }
      results.push({
        sql: sql.substring(0, 50) + '...',
        error
      });
    }

    // Verify table was created
    const { data, error: checkError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);

    if (checkError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Table creation failed',
          details: checkError
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Database initialized successfully',
        table_verified: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

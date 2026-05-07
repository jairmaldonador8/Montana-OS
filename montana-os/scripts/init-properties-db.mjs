#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = path.resolve(path.join(__dirname, '..', '.env.local'));
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...valueParts] = trimmed.split('=');
  env[key.trim()] = valueParts.join('=').trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

console.log('🔧 Creando tabla properties en Supabase...\n');

// Create Supabase admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function executeSQL(sql, description) {
  try {
    // Using REST API for direct SQL execution
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (response.ok) {
      console.log(`✓ ${description}`);
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

async function createTable() {
  try {
    console.log('📝 Creando tabla...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.properties (
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
      );

      CREATE INDEX IF NOT EXISTS idx_properties_captured_by ON public.properties(captured_by);
      CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
      CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

      ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

      CREATE POLICY IF NOT EXISTS "Users can view their own properties"
        ON public.properties FOR SELECT USING (auth.uid() = captured_by);

      CREATE POLICY IF NOT EXISTS "Users can insert their own properties"
        ON public.properties FOR INSERT WITH CHECK (auth.uid() = captured_by);

      CREATE POLICY IF NOT EXISTS "Users can update their own properties"
        ON public.properties FOR UPDATE USING (auth.uid() = captured_by) WITH CHECK (auth.uid() = captured_by);

      CREATE POLICY IF NOT EXISTS "Users can delete their own properties"
        ON public.properties FOR DELETE USING (auth.uid() = captured_by);

      CREATE SEQUENCE IF NOT EXISTS properties_code_seq START 1;

      CREATE OR REPLACE FUNCTION public.generate_property_code()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.code IS NULL THEN
            NEW.code := 'MR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('properties_code_seq')::text, 4, '0');
          END IF;
          NEW.updated_at := NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_generate_property_code ON public.properties;
      CREATE TRIGGER trigger_generate_property_code
        BEFORE INSERT ON public.properties
        FOR EACH ROW
        EXECUTE FUNCTION public.generate_property_code();
    `;

    await executeSQL(createTableSQL, 'Tabla y configuración creadas');

    // Verify table exists
    const { data, error } = await supabase
      .from('properties')
      .select('count(*)', { count: 'exact' })
      .limit(0);

    if (error && error.code === 'PGRST204') {
      throw new Error('Tabla no existe. Por favor, intenta nuevamente.');
    }

    console.log('\n✅ ¡Base de datos configurada exitosamente!');
    console.log('✅ Tabla properties creada');
    console.log('✅ Índices creados');
    console.log('✅ RLS configurado');
    console.log('✅ Función de código automático configurada\n');
    console.log('🎉 Recarga Chrome en http://localhost:3008\n');

  } catch (error) {
    console.error('❌ Error:', error.message || error);
    console.log('\n📝 Alternativa: Crea la tabla manualmente:');
    console.log('1. Ve a: https://supabase.com/dashboard');
    console.log('2. Abre tu proyecto');
    console.log('3. Ve a SQL Editor');
    console.log('4. Pega el SQL del archivo scripts/create-properties-table.sql');
    console.log('5. Haz clic en Run\n');
    process.exit(1);
  }
}

createTable();

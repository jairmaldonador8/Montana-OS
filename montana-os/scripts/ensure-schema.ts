import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureSchema() {
  try {
    console.log('🔍 Checking database schema...\n');

    // Get current user
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    if (!authUsers?.users?.length) {
      console.error('❌ No authenticated users found');
      process.exit(1);
    }

    const userId = authUsers.users[0].id;
    console.log(`✅ User: ${authUsers.users[0].email}\n`);

    // Check for propiedades table
    console.log('📋 Checking tables...');
    const { error: propError } = await supabase
      .from('propiedades')
      .select('*')
      .limit(1);

    if (propError?.code === 'PGRST205') {
      console.log('❌ propiedades table not found');
      console.log('❌ Pipeline tables not initialized\n');

      const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

      console.log('📌 MIGRATION REQUIRED\n');
      console.log('To set up the database, you need to apply these migrations:');
      files.forEach(f => console.log(`   - ${f}`));

      console.log('\n📖 HOW TO APPLY MIGRATIONS:\n');
      console.log('Option 1: Supabase Dashboard (Easiest)');
      console.log('  1. Go to: https://app.supabase.com/');
      console.log('  2. Select your project (ixrpqwffjmzfhwvukeou)');
      console.log('  3. Go to SQL Editor');
      console.log(`  4. Copy and run each migration file from: supabase/migrations/\n`);

      console.log('Option 2: Supabase CLI');
      console.log('  1. Install: npm install -g @supabase/cli');
      console.log('  2. Login: npx supabase login');
      console.log('  3. Link: npx supabase link --project-ref ixrpqwffjmzfhwvukeou');
      console.log('  4. Push: npx supabase db push\n');

      console.log('Option 3: Manual SQL Import');
      const firstMigration = path.join(migrationsDir, files[0]);
      const sql = fs.readFileSync(firstMigration, 'utf-8');
      console.log(`  Copy this SQL to dashboard (first migration):\n`);
      console.log('  ' + sql.substring(0, 100) + '...\n');

      process.exit(1);
    }

    console.log('✅ propiedades table found');

    // Check for leads table
    const { error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (leadsError?.code === 'PGRST205') {
      console.log('⚠️  leads table not found - migrations incomplete');
      process.exit(1);
    }

    console.log('✅ leads table found');

    // Check for example data
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (!leads?.length) {
      console.log('⏳ No example data found - seeding...\n');

      // Get or create property
      const { data: props } = await supabase
        .from('propiedades')
        .select('*')
        .limit(1);

      let propertyId: string;

      if (props?.length) {
        propertyId = props[0].id;
        console.log(`✅ Using existing property: ${props[0].nombre}`);
      } else {
        const { data: newProp, error: createError } = await supabase
          .from('propiedades')
          .insert({
            nombre: 'Penthouse Luxury - Centro Histórico',
            descripcion: 'Hermoso penthouse con vista panorámica',
            direccion: 'Calle Principal 123',
            ciudad: 'Centro',
            precio: 450000,
            metros_cuadrados: 280,
            habitaciones: 4,
            banos: 3,
            created_by: userId,
          })
          .select()
          .single();

        if (createError) {
          console.log(`⚠️  Could not create property: ${createError.message}`);
          process.exit(1);
        }

        propertyId = newProp.id;
        console.log(`✅ Created property: ${newProp.nombre}`);
      }

      // Create sample leads
      const leadsData = [
        {
          property_id: propertyId,
          assigned_to: userId,
          status: 'lead_nuevo',
          nombre: 'Juan Pérez García',
          email: 'juan@example.com',
          whatsapp: '+34 123 456 789',
          fuente: 'facebook',
          created_by: userId,
          notas: 'Contacto inicial desde Facebook',
        },
        {
          property_id: propertyId,
          assigned_to: userId,
          status: 'interesado',
          nombre: 'María López Rodríguez',
          email: 'maria@example.com',
          whatsapp: '+34 234 567 890',
          fuente: 'form',
          created_by: userId,
          notas: 'Mostró interés en la propiedad',
        },
        {
          property_id: propertyId,
          assigned_to: userId,
          status: 'pendiente_respuesta',
          nombre: 'Carlos Sánchez Flores',
          email: 'carlos@example.com',
          whatsapp: '+34 345 678 901',
          fuente: 'whatsapp_directo',
          created_by: userId,
          notas: 'Envié propuesta inicial',
        },
        {
          property_id: propertyId,
          assigned_to: userId,
          status: 'en_visita',
          nombre: 'Ana Martínez Ruiz',
          email: 'ana@example.com',
          whatsapp: '+34 456 789 012',
          fuente: 'form',
          created_by: userId,
          notas: 'Visitó la propiedad, muy interesada',
        },
        {
          property_id: propertyId,
          assigned_to: userId,
          status: 'propuesta_enviada',
          nombre: 'Diego Fernández Gómez',
          email: 'diego@example.com',
          whatsapp: '+34 567 890 123',
          fuente: 'facebook',
          created_by: userId,
          notas: 'Negociación en progreso',
        },
        {
          property_id: propertyId,
          assigned_to: userId,
          status: 'cerrado',
          nombre: 'Sofía Romero Castro',
          email: 'sofia@example.com',
          whatsapp: '+34 678 901 234',
          fuente: 'form',
          created_by: userId,
          notas: 'Venta completada',
        },
      ];

      const { data: createdLeads, error: leadsCreateError } = await supabase
        .from('leads')
        .insert(leadsData)
        .select();

      if (leadsCreateError) {
        console.log(`❌ Could not create leads: ${leadsCreateError.message}`);
        process.exit(1);
      }

      console.log(`✅ Created ${createdLeads?.length || 0} sample leads`);
      createdLeads?.forEach(lead => {
        console.log(`   ✓ ${lead.nombre} (${lead.status})`);
      });
    } else {
      console.log(`✅ Found ${leads.length} leads in database`);
    }

    console.log('\n✨ All systems ready!');
    console.log('🎯 Visit: http://localhost:3001/pipeline\n');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

ensureSchema();

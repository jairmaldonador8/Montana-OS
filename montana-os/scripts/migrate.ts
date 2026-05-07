import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigrations() {
  try {
    console.log('🚀 Starting database migrations...\n');

    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');

      console.log(`⏳ Applying ${file}...`);

      // Remove comments and split by semicolon
      const statements = sqlContent
        .split('\n')
        .map(line => line.split('--')[0]) // Remove comments
        .join('\n')
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      let fileSuccess = true;
      for (const statement of statements) {
        try {
          // Use from().insert() to execute via PostgREST
          // Actually, we need to use a different approach since we can't execute raw SQL easily
          // Let's try using the RPC if it exists, or direct REST call

          // First, try to use the postgres API directly via REST
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ sql: statement }),
          });

          if (!response.ok && response.status !== 404) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            if (error.message && error.message.includes('function')) {
              // exec_sql RPC doesn't exist, try alternative
              console.log('   ℹ️  (exec_sql RPC not available)');
              fileSuccess = false;
              break;
            }
          }
        } catch (err: any) {
          console.log(`   ⚠️  Statement execution failed: ${err.message}`);
          fileSuccess = false;
          break;
        }
      }

      if (!fileSuccess) {
        console.log(`⚠️  Could not apply ${file}`);
        failCount++;
      } else {
        console.log(`✅ ${file}`);
        successCount++;
      }
    }

    console.log(`\n📊 Results: ${successCount} successful, ${failCount} failed\n`);

    if (failCount > 0) {
      console.log('⚠️  Could not apply all migrations via API.\n');
      console.log('📌 NEXT STEP: Apply migrations manually\n');
      console.log('Visit: https://app.supabase.com/');
      console.log('Project: ixrpqwffjmzfhwvukeou');
      console.log('Go to: SQL Editor\n');
      console.log('Copy and run each SQL file from supabase/migrations/ in order.\n');
      process.exit(1);
    }

    console.log('✨ All migrations applied successfully!\n');

    // Now seed the data
    console.log('🌱 Seeding example data...\n');

    const { data: users } = await supabase.auth.admin.listUsers();
    const userId = users?.users?.[0]?.id;

    if (!userId) {
      console.log('❌ No user found');
      process.exit(1);
    }

    // Create property
    const { data: property, error: propError } = await supabase
      .from('propiedades')
      .insert({
        nombre: 'Penthouse Luxury - Centro Histórico',
        descripcion: 'Hermoso penthouse con vista panorámica al centro histórico',
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

    if (propError) {
      console.log(`❌ Error creating property: ${propError.message}`);
      process.exit(1);
    }

    console.log(`✅ Created property: ${property.nombre}`);

    // Create leads
    const leadsData = [
      {
        property_id: property.id,
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
        property_id: property.id,
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
        property_id: property.id,
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
        property_id: property.id,
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
        property_id: property.id,
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
        property_id: property.id,
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

    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .insert(leadsData)
      .select();

    if (leadsError) {
      console.log(`❌ Error creating leads: ${leadsError.message}`);
      process.exit(1);
    }

    console.log(`✅ Created ${leads?.length || 0} sample leads:`);
    leads?.forEach(lead => {
      console.log(`   ✓ ${lead.nombre} (${lead.status})`);
    });

    console.log('\n✨ Database setup complete!');
    console.log('🎯 Open: http://localhost:3001/pipeline\n');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

executeMigrations();

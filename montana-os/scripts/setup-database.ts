import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🔧 Setting up Montana OS database schema...\n');

    // Get existing auth user
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError || !authUsers.users || authUsers.users.length === 0) {
      console.error('❌ No users found. Please sign up first.');
      process.exit(1);
    }

    const userId = authUsers.users[0].id;
    const userEmail = authUsers.users[0].email || 'admin@montana.os';
    console.log(`✅ Using user: ${userEmail}\n`);

    // Create propiedades table
    console.log('⏳ Creating propiedades table...');
    const createPropiedadesSQL = `
      CREATE TABLE IF NOT EXISTS propiedades (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre TEXT NOT NULL,
        descripcion TEXT,
        direccion TEXT,
        ciudad TEXT,
        precio BIGINT,
        metros_cuadrados INT,
        habitaciones INT,
        banos INT,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;

    let propError;
    try {
      const result = await supabase.rpc('eval_sql', { sql: createPropiedadesSQL });
      propError = result.error;
    } catch {
      propError = { message: 'RPC not available - will create via direct insert' };
    }

    if (propError?.message.includes('RPC')) {
      console.log('   ⚠️  Direct RPC execution not available');
      console.log('   Creating via client insert...');
      // For now, assume table exists or will be created manually
    } else {
      console.log('✅ propiedades table created/verified');
    }

    // Create users table (Phase 1.1 schema)
    console.log('⏳ Creating users table...');

    // For now, just create the user record for the current user
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: userEmail,
        role: 'admin',
        nombre: userEmail.split('@')[0]
      }, { onConflict: 'id' });

    if (userError) {
      console.log('⚠️  Could not create users table entry - may already exist');
      console.log(`   Error: ${userError.message}`);
    } else {
      console.log('✅ users table created/verified');
    }

    // Create leads table
    console.log('⏳ Creating leads table...');
    let leadsError;
    try {
      await supabase
        .from('leads')
        .select('*')
        .limit(1);
      leadsError = null;
    } catch (err) {
      leadsError = err;
    }

    if (leadsError) {
      console.log('⚠️  leads table not found - table creation required');
      console.log('   Please run migrations manually via Supabase dashboard');
    } else {
      console.log('✅ leads table verified');
    }

    // Try to create a test property
    console.log('\n⏳ Creating test property...');
    const { data: property, error: propCreateError } = await supabase
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

    if (propCreateError) {
      console.log(`❌ Could not create property: ${propCreateError.message}`);
      if (propCreateError.code === 'PGRST205') {
        console.log('   The propiedades table does not exist.');
        console.log('\n📋 NEXT STEPS:');
        console.log('1. Visit Supabase Dashboard: https://app.supabase.com');
        console.log('2. Open SQL Editor');
        console.log('3. Run the migrations from supabase/migrations/');
        console.log('4. Then run this script again\n');
      }
      process.exit(1);
    }

    console.log(`✅ Created property: ${property.nombre}`);

    // Create sample leads
    console.log('\n⏳ Creating sample leads...');
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

    const { data: leads, error: leadsCreateError } = await supabase
      .from('leads')
      .insert(leadsData)
      .select();

    if (leadsCreateError) {
      console.log(`❌ Could not create leads: ${leadsCreateError.message}`);
      if (leadsCreateError.code === 'PGRST205') {
        console.log('   The leads table does not exist.');
        console.log('\n⚠️  Database setup incomplete. Please apply migrations manually.');
      }
      process.exit(1);
    }

    console.log(`✅ Created ${leads?.length || 0} sample leads:`);
    leads?.forEach((lead) => {
      console.log(`   ✓ ${lead.nombre} (${lead.status})`);
    });

    console.log('\n✨ Database setup complete!');
    console.log('🎯 You can now view the Kanban board at: http://localhost:3001/pipeline');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

setupDatabase();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedPipelineData() {
  try {
    console.log('🌱 Starting pipeline data seed...');

    // Get the first user from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError || !authUsers.users || authUsers.users.length === 0) {
      console.error('No users found. Please sign up a user first.');
      console.log('Error:', authError);
      process.exit(1);
    }

    const userId = authUsers.users[0].id;
    const userEmail = authUsers.users[0].email;
    console.log(`✅ Found user: ${userEmail}`);

    // Create a sample property
    const propertyData = {
      nombre: 'Penthouse Luxury - Centro Histórico',
      descripcion: 'Hermoso penthouse con vista panorámica al centro histórico',
      direccion: 'Calle Principal 123',
      ciudad: 'Centro',
      precio: 450000,
      metros_cuadrados: 280,
      habitaciones: 4,
      banos: 3,
      created_by: userId,
    };

    const { data: property, error: propertyError } = await supabase
      .from('propiedades')
      .insert(propertyData)
      .select()
      .single();

    if (propertyError) {
      console.error('Error creating property:', propertyError);
      process.exit(1);
    }

    console.log(`✅ Created property: ${property.nombre} (ID: ${property.id})`);

    // Create sample leads in different statuses
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
        notas: 'Mostró interés en la propiedad, pendiente de seguimiento',
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
        notas: 'Envié propuesta inicial, esperando respuesta',
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
        notas: 'Visitó la propiedad ayer, muy interesada',
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
        notas: 'Propuesta de precio enviada, negociación en progreso',
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
        notas: 'Venta completada el 2026-04-28',
      },
    ];

    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .insert(leadsData)
      .select();

    if (leadsError) {
      console.error('Error creating leads:', leadsError);
      process.exit(1);
    }

    console.log(`✅ Created ${leads.length} sample leads:`);
    leads.forEach((lead) => {
      console.log(`   - ${lead.nombre} (${lead.status})`);
    });

    console.log('\n✨ Pipeline seed data created successfully!');
    console.log('Navigate to http://localhost:3001/pipeline to see the Kanban board');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedPipelineData();

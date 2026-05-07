import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    const email = 'asesor@montanaos.com';
    const password = 'Montana2025!';

    console.log('🔧 Creando usuario de prueba...\n');

    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: 'Asesor Demo',
      },
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);
      process.exit(1);
    }

    console.log('✅ Usuario creado exitosamente!\n');
    console.log('📧 Email: ' + email);
    console.log('🔑 Contraseña: ' + password);
    console.log('\n🔗 Accede en: http://localhost:3005');

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createTestUser();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    console.log('🔍 Checking database structure...\n');

    // Try querying specific tables
    const tables = ['propiedades', 'leads', 'usuarios', 'properties', 'lead_activities'];

    for (const table of tables) {
      const { error: err } = await supabase.from(table).select('*').limit(1);
      if (!err) {
        console.log(`✅ ${table} - EXISTS`);
      } else if (err.code === 'PGRST205') {
        console.log(`❌ ${table} - NOT FOUND`);
      } else {
        console.log(`⚠️  ${table} - Error: ${err.message}`);
      }
    }

    // Check auth users
    console.log('\n👤 Checking auth users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (!usersError && users.users) {
      console.log(`Found ${users.users.length} user(s):`);
      users.users.forEach(user => {
        console.log(`  - ${user.email} (${user.id})`);
      });
    } else {
      console.log('Error listing users:', usersError?.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase();

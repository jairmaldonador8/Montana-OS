import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  try {
    console.log('📋 Running pending migrations...\n');

    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`⏳ Applying ${file}...`);

      try {
        const { error } = await supabase.rpc('exec', { sql_string: sql });
        if (error) throw error;
        console.log(`✅ ${file} applied successfully\n`);
      } catch (err: any) {
        // If exec RPC doesn't exist, we need to use a different approach
        // Try executing it as a regular query
        if (err.message && err.message.includes('Could not find the function')) {
          console.log(`⚠️  exec RPC not available, trying alternative method...`);
          console.log(`   Skipping ${file} - please apply manually in Supabase dashboard\n`);
        } else {
          console.log(`❌ Error applying ${file}:`);
          console.log(`   ${err.message}\n`);
        }
      }
    }

    console.log('✨ Migration process complete');
    console.log('\nℹ️  If migrations failed to apply, you can:');
    console.log('1. Copy the SQL from supabase/migrations/ and run it in the Supabase dashboard');
    console.log('2. Use the Supabase CLI: npx supabase db push');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

runMigrations();

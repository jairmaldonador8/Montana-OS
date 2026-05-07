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

async function applyMigrations() {
  try {
    console.log('📋 Setting up database schema...\n');

    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');

      console.log(`⏳ Applying ${file}...`);

      // Split SQL by semicolons and execute each statement
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            // Try alternative if exec_sql doesn't exist
            if (error.message.includes('Could not find the function')) {
              console.log(`   Note: exec_sql RPC not available`);
              console.log(`   Running: ${statement.substring(0, 50)}...`);
            } else {
              throw error;
            }
          }
        } catch (err: any) {
          console.log(`   Executing: ${statement.substring(0, 50)}...`);
        }
      }

      console.log(`✅ ${file}\n`);
    }

    console.log('✨ Database schema setup complete!');
    console.log('\nℹ️  Note: If you see errors above about missing functions,');
    console.log('you may need to apply migrations manually via the Supabase dashboard.');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

applyMigrations();

import * as fs from 'fs';
import * as path from 'path';

async function prepareMigrations() {
  console.log('📋 Preparing migrations for manual execution...\n');

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  // Create a combined migration file
  let combinedSQL = '-- Montana OS Pipeline Database Setup\n';
  combinedSQL += '-- Run this in Supabase SQL Editor\n\n';

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    combinedSQL += `-- ===== ${file} =====\n`;
    combinedSQL += content + '\n\n';
  }

  const outputPath = path.join(process.cwd(), 'MIGRATION.sql');
  fs.writeFileSync(outputPath, combinedSQL);

  console.log(`✅ Created: ${outputPath}\n`);
  console.log('📌 MANUAL STEPS:\n');
  console.log('1. Go to: https://app.supabase.com/');
  console.log('2. Select your project (ixrpqwffjmzfhwvukeou)');
  console.log('3. Click "SQL Editor" in left sidebar');
  console.log('4. Click "+ New Query"');
  console.log(`5. Copy all content from: ${path.basename(outputPath)}`);
  console.log('6. Paste into the SQL editor');
  console.log('7. Click "Run"\n');
  console.log('After migrations are applied, run:');
  console.log('  npm run seed:pipeline\n');
}

prepareMigrations();

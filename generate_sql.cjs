const fs = require('fs');
const path = require('path');
const files = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort();
console.log(`Total SQL files: ${files.length}`);
const pending = files.slice(-26);
console.log('Pending files:');
pending.forEach(f => console.log(f));
let sql = '';
pending.forEach(f => {
  sql += `-- Migration: ${f}\n`;
  sql += fs.readFileSync(path.join('supabase/migrations', f), 'utf8') + '\n\n';
  const version = f.split('_')[0];
  sql += `INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('${version}') ON CONFLICT DO NOTHING;\n\n`;
});
fs.writeFileSync('pending_migrations.sql', sql);
console.log('Wrote pending_migrations.sql');

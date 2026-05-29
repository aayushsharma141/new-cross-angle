import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://iuuivmwqodefdrrrewol.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nFloBfKOfoRMtDV0K90b6A_oVxQXUfQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadDirectory(sourceDir, bucket, basePath = '') {
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    const fullPath = path.join(sourceDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await uploadDirectory(fullPath, bucket, path.posix.join(basePath, file));
    } else {
      const remotePath = path.posix.join(basePath, file);
      console.log(`Uploading ${remotePath}...`);
      const fileBuffer = fs.readFileSync(fullPath);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(remotePath, fileBuffer, {
          upsert: true,
          contentType: getContentType(file)
        });

      if (error) {
        console.error(`Error uploading ${remotePath}:`, error.message);
      } else {
        console.log(`Success: ${remotePath}`);
      }
    }
  }
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  return map[ext] || 'application/octet-stream';
}

const sourceDir = path.join(process.cwd(), 'apps', 'web', 'public', 'images', 'projects');
uploadDirectory(sourceDir, 'media', 'projects').then(() => {
  console.log('Done uploading images');
}).catch(err => {
  console.error('Error:', err);
});

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found. Run build first.');
  process.exit(1);
}

const projectsFile = path.resolve(__dirname, '..', 'src', 'data', 'projects.ts');
let projectSlugs = [];
try {
  const txt = fs.readFileSync(projectsFile, 'utf8');
  const m = txt.matchAll(/slug:\s*"([^"]+)"/g);
  projectSlugs = Array.from(m, (r) => r[1]);
} catch (e) {
  projectSlugs = [];
}

const routes = [
  '/',
  '/about-us',
  '/services',
  '/gallery',
  '/blog',
  '/contact-us',
  '/quiz',
  '/discovery',
  '/estimate',
  ...projectSlugs.map(s => `/portfolio/${s}`),
];

const indexHtml = fs.readFileSync(indexPath, 'utf8');

// Write 200.html for Surge SPA support
fs.writeFileSync(path.join(distDir, '200.html'), indexHtml, 'utf8');
console.log('Wrote 200.html for Surge SPA support');

routes.forEach((r) => {
  const targetDir = path.join(distDir, r.replace(/^\//, ''));
  fs.mkdirSync(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, 'index.html');
  fs.writeFileSync(targetPath, indexHtml, 'utf8');
  console.log('Wrote', targetPath);
});

console.log('Copied index.html to routes:', routes.length);

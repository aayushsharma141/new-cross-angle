import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appDistDir = path.resolve(__dirname, '..', 'dist');
const rootDistDir = path.resolve(__dirname, '..', '..', '..', 'dist');
let distDir = appDistDir;

const appIndexPath = path.join(appDistDir, 'index.html');
const rootIndexPath = path.join(rootDistDir, 'index.html');

if (!fs.existsSync(appIndexPath) && fs.existsSync(rootIndexPath)) {
  distDir = rootDistDir;
  console.log('Using root dist directory:', distDir);
} else if (!fs.existsSync(appIndexPath) && !fs.existsSync(rootIndexPath)) {
  console.error('dist/index.html not found in', appDistDir, 'or', rootDistDir);
  process.exit(1);
}

const indexPathToUse = path.join(distDir, 'index.html');

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
  '/admin',
  '/admin/auth',
  '/admin/login',
  '/admin/reset-password',
  '/admin/dashboard',
  '/admin/projects',
  '/admin/leads',
  '/admin/settings',
  ...projectSlugs.map(s => `/portfolio/${s}`),
];

const indexHtml = fs.readFileSync(indexPathToUse, 'utf8');

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

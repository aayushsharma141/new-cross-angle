import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://crossangleinterior.com";

const staticRoutes = [
    "",
    "/about-us",
    "/services",
    "/gallery",
    "/blog",
    "/contact-us",
];

const serviceCategories = [
    "residential",
    "commercial",
    "specialized"
];

const services = [
    { slug: "living-room", category: "residential" },
    { slug: "bedroom", category: "residential" },
    { slug: "kitchen", category: "residential" },
    { slug: "office", category: "commercial" },
    { slug: "retail", category: "commercial" },
    { slug: "modular-kitchens", category: "specialized" },
    { slug: "ceilings", category: "specialized" }
];

const generateSitemap = () => {
    const currentDate = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static Routes
    staticRoutes.forEach(route => {
        xml += `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === "" ? "1.0" : "0.8"}</priority>
  </url>`;
    });

    // Category Routes
    serviceCategories.forEach(slug => {
        xml += `
  <url>
    <loc>${BASE_URL}/services/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Service Detail Routes
    services.forEach(service => {
        xml += `
  <url>
    <loc>${BASE_URL}/services/${service.category}/${service.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
    console.log('✅ Sitemap generated successfully at public/sitemap.xml');
};

generateSitemap();

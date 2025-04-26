const fs = require('fs');
const path = require('path');

// Base URL of the website - use environment variable with fallback
const BASE_URL = process.env.REACT_APP_SITE_URL || 'https://toolwebsite.vercel.app';

// List of all tools
const tools = [
  { slug: 'pdf-merger', priority: 0.9 },
  { slug: 'image-bg-remover', priority: 0.9 },
  { slug: 'html-to-react', priority: 0.9 },
  { slug: 'media-compressor', priority: 0.9 }
];

// List of static pages
const staticPages = [
  { path: '/', priority: 1.0 },
  { path: '/about', priority: 0.8 },
  { path: '/contact', priority: 0.8 }
];

// Current date in YYYY-MM-DD format
const currentDate = new Date().toISOString().split('T')[0];

// Generate sitemap XML
const generateSitemap = () => {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static pages
  staticPages.forEach(page => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}${page.path}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += `    <priority>${page.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });
  
  // Add tool pages
  tools.forEach(tool => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${BASE_URL}/tool/${tool.slug}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += `    <priority>${tool.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });
  
  sitemap += '</urlset>';
  
  return sitemap;
};

// Write sitemap to file
const sitemapPath = path.join(__dirname, '../../public/sitemap.xml');
fs.writeFileSync(sitemapPath, generateSitemap());

console.log(`Sitemap generated at ${sitemapPath}`);

// How to use this script:
// 1. Add to package.json scripts: "generate-sitemap": "node src/scripts/generateSitemap.js"
// 2. Run with npm run generate-sitemap
// 3. Run before builds or on a schedule to keep sitemap up-to-date 
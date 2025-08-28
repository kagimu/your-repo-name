import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';

const hostname = 'https://www.edumallug.com';
const sitemap = new SitemapStream({ hostname });

// Categories (can be expanded later)
const categories = [
    'apparatus',
    'specimen',
    'chemical',
    'textbooks',
    'stationery',
    'school-accessories'
];

// Helper: convert name to URL-friendly slug
const slugify = (text) =>
    text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -

async function generateSitemap() {
    try {
        // Fetch products from your Laravel API
        const res = await fetch('https://edumall-main-khkttx.laravel.cloud/api/labs');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        const products = json.data || [];


        // Product routes
        const productRoutes = products.map(prod => `/products/${slugify(prod.name)}`);

        // Category routes
        const categoryRoutes = categories.map(cat => `/categories/${slugify(cat)}`);

        // Base routes
        const routes = [
            '/',
            '/categories',
            ...categoryRoutes,
            ...productRoutes
        ];

        // Write sitemap to public folder
        const writeStream = createWriteStream('./public/sitemap.xml');
        sitemap.pipe(writeStream);

        routes.forEach(route => {
            sitemap.write({ url: route, changefreq: 'weekly', priority: 0.8 });
        });

        sitemap.end();

        await streamToPromise(sitemap);
        console.log('✅ Sitemap created at ./public/sitemap.xml');
    } catch (err) {
        console.error('❌ Error generating sitemap:', err);
    }
}

// Run the generator
generateSitemap();
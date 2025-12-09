/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    generateRobotsTxt: false, // We will use app/robots.ts for more control
    generateIndexSitemap: false,
    sitemapSize: 7000,
}

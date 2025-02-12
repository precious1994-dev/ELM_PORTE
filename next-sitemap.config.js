/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://your-domain.com', // Replace with your actual domain
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/admin',
    '/admin/*',
    '/api',
    '/api/*',
    '/login',
    '/404',
    '/500'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api',
          '/api/*',
          '/login',
          '/404',
          '/500'
        ],
      },
    ],
  },
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  transform: async (config, path) => {
    // Custom transform function to exclude dynamic routes that shouldn't be in sitemap
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return null;
    }
    
    // Return default transformation for all other routes
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs ?? [],
    }
  },
} 
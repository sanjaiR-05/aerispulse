import { MetadataRoute } from 'next';

/**
 * Standard Next.js robots.txt handler.
 * Disallows search engine crawlers from indexing serverless API routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: 'https://project-kappa-ten-61.vercel.app/sitemap.xml',
  };
}

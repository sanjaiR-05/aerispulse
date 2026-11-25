import { MetadataRoute } from 'next';

/**
 * Standard Next.js XML sitemap generator.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://project-kappa-ten-61.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
  ];
}

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moments.studioclicked.lk';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/portal/',
          '/api/',
          '/login/',
          '/v/*', // Protects private guest tokens from being indexed by search bots
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
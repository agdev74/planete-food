import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // On cache l'administration aux moteurs de recherche
    },
    sitemap: 'https://kabuki-sushi.ch/sitemap.xml',
  };
}
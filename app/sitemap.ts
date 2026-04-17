import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kabukisushi.ch';
  const languages = ['fr', 'en', 'es'];
  
  // 1. Pages Statiques
  const staticPages = ['', '/menu', '/contact'];
  
  const staticUrls = languages.flatMap((lang) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${lang}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  );

  // 2. Pages Dynamiques (Vos 97 Produits)
  // Même si vous n'avez pas encore de pages de détails individuelles par produit,
  // il est bon de préparer la structure si vous décidez d'en créer.
  // Pour l'instant, nous nous assurons que les menus par langue sont bien indexés.
  
  /* Si vous aviez des pages /menu/nom-du-sushi, on ferait ceci :
     const { data: items } = await supabase.from('menu_items').select('id');
     const dynamicUrls = languages.flatMap((lang) => ... )
  */

  return [...staticUrls];
}
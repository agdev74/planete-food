import { Metadata } from "next";
import MenuClient from "./MenuClient";
// ✅ CORRECTION : Utilisation du client SERVEUR
import { createClient } from "@/utils/supabase/server";

// ✅ OPTIMISATION PERF : Mise en cache du menu côté serveur
export const revalidate = 3600;

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || "fr";

  const titles: Record<string, string> = {
    fr: "Notre Carte | 97 Créations Originales",
    en: "Our Menu | 97 Original Sushi Creations",
    es: "Nuestra Carta | 97 Creaciones de Sushi",
  };

  const descriptions: Record<string, string> = {
    fr: "Découvrez nos 97 produits : Nigiris, Makis, Signatures et Box à partager. À emporter ou en livraison.",
    en: "Explore our 97 products: Nigiris, Makis, Signatures, and Boxes to share. Takeaway or delivery.",
    es: "Descubre nuestros 97 produits: Nigiris, Makis, Signatures y Boxes para compartir. Para llevar o a domicilio.",
  };

  return {
    title: titles[lang] || titles.fr,
    description: descriptions[lang] || descriptions.fr,
  };
}

export default async function MenuPage({ params }: Props) {
  // On attend la résolution des params pour Next.js 15+
  await params; 

  // ✅ INITIALISATION DU CLIENT SUPABASE SERVEUR
  const supabase = await createClient();

  const { data } = await supabase
    .from("menu_items")
    .select("id, name_fr, name_en, name_es, description_fr, description_en, description_es, price, image_url, category, is_available") 
    .eq("is_available", true)
    .order("id", { ascending: true });

  // ✅ CORRECTION TS : On formate les données pour le contexte du panier
  const formattedData = (data || []).map((item) => ({
    ...item,
    name: item.name_fr 
  }));

  // ✅ FIX : On ne passe QUE initialItems car MenuClient ne gère pas la prop 'lang'
  return <MenuClient initialItems={formattedData} />;
}
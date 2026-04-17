import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "../globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext"; 
import LayoutClient from "@/components/LayoutClient"; 
import ActiveOrderButton from "@/components/ActiveOrderButton";

// Définition des polices
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

const oswald = Oswald({ 
  subsets: ["latin"], 
  variable: "--font-oswald",
  display: 'swap',
  weight: ['400', '700'], 
});

// Utilisation correcte de Metadata pour le SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'fr';
  const siteUrl = 'https://kabuki-sushi.ch';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      template: '%s | Kabuki Sushi Genève',
      default: lang === 'en' ? 'Kabuki Sushi | Premium Japanese Restaurant in Geneva' : 'Kabuki Sushi | Restaurant Japonais de Prestige à Genève',
    },
    description: lang === 'en' 
      ? "Excellence in sushi in Geneva (Plainpalais). Enjoy our signature creations dining in, takeaway, or through our exceptional catering service."
      : "L'excellence du sushi à Genève (Plainpalais). Savourez nos créations signatures sur place, à emporter ou via notre service traiteur d'exception.",
    keywords: ["Sushi Genève", "Traiteur Japonais Genève", "Restaurant Japonais Plainpalais", "Livraison Sushi Genève", "Sushi Delivery Geneva"],
    authors: [{ name: "Kabuki Sushi" }],
    alternates: {
      canonical: `${siteUrl}/${lang}`,
      languages: {
        'fr-CH': `${siteUrl}/fr`,
        'en-CH': `${siteUrl}/en`,
        'es-CH': `${siteUrl}/es`,
      },
    },
    openGraph: {
      type: "website",
      locale: lang === 'fr' ? 'fr_CH' : lang === 'en' ? 'en_CH' : 'es_CH',
      url: `${siteUrl}/${lang}`,
      title: "Kabuki Sushi | L'Art du Sushi à Genève",
      images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
    },
    icons: { icon: "/images/logo.png" },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'fr';

  // ✅ SÉCURITÉ #7 : Récupération du numéro via variable d'environnement
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";

  return (
    <html lang={lang} className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen bg-[#080808] text-white">
        <UserProvider>
          <LanguageProvider>
            <CartProvider>
              <LayoutClient>
                {children}
              </LayoutClient>
              <ActiveOrderButton />

              {/* Schéma JSON-LD pour le SEO */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Restaurant",
                    "name": "Kabuki Sushi Genève",
                    "address": {
                      "@type": "PostalAddress",
                      "streetAddress": "1 Boulevard de la Tour",
                      "addressLocality": "Genève",
                      "postalCode": "1205",
                      "addressCountry": "CH"
                    },
                    "telephone": contactPhone, // ✅ SÉCURITÉ #7 : Plus de numéro hardcodé
                    "priceRange": "$$",
                    "servesCuisine": "Japanese, Sushi"
                  })
                }}
              />
            </CartProvider>
          </LanguageProvider>
        </UserProvider>
      </body>
    </html>
  );
}
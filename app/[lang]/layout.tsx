import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "../globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";
import LayoutClient from "@/components/LayoutClient";
import FloatingTracker from "@/components/FloatingTracker";

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

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams.lang || 'fr';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://planet-food.example.com';
  const restaurantName = process.env.NEXT_PUBLIC_RESTAURANT_NAME ?? 'Planet Food';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      template: `%s | ${restaurantName}`,
      default: lang === 'en'
        ? `${restaurantName} | Online Ordering & Catering`
        : `${restaurantName} | Commande en Ligne & Traiteur`,
    },
    description: lang === 'en'
      ? "Order online, takeaway or delivery. Discover our menu and premium catering service."
      : "Commandez en ligne, à emporter ou en livraison. Découvrez notre carte et notre service traiteur d'exception.",
    keywords: ["restaurant", "commande en ligne", "livraison", "traiteur", "catering"],
    authors: [{ name: restaurantName }],
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
      locale: lang === 'fr' ? 'fr_FR' : lang === 'en' ? 'en_US' : 'es_ES',
      url: `${siteUrl}/${lang}`,
      title: restaurantName,
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

  const restaurantName = process.env.NEXT_PUBLIC_RESTAURANT_NAME ?? "Planet Food";
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "";
  const restaurantAddress = process.env.NEXT_PUBLIC_RESTAURANT_ADDRESS ?? "";
  const cuisine = process.env.NEXT_PUBLIC_RESTAURANT_CUISINE ?? "Restauration";

  return (
    <html lang={lang} className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen bg-[#080808] text-white">
        <UserProvider>
          <LanguageProvider>
            <CartProvider>
              <LayoutClient>
                {children}
              </LayoutClient>
              <FloatingTracker />

              {/* Schéma JSON-LD pour le SEO */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Restaurant",
                    "name": restaurantName,
                    "address": {
                      "@type": "PostalAddress",
                      "streetAddress": restaurantAddress
                    },
                    "telephone": contactPhone,
                    "priceRange": "$$",
                    "servesCuisine": cuisine
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

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import RestaurantBanner from "@/components/RestaurantBanner";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Nos Restaurants | Planet Food",
  description: "Découvrez tous les restaurants de la plateforme Planet Food.",
};

type Props = { params: Promise<{ lang: string }> };

export default async function RestaurantsPage({ params }: Props) {
  const { lang } = await params;
  const supabase = await createClient();

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="bg-[#080808] min-h-screen pb-32 pt-20">

      {/* Sticky restaurant selector — sticks below the fixed navbar (h-20) */}
      <div className="sticky top-20 z-30 bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-900">
        <RestaurantBanner />
      </div>

      <div className="bg-black text-white py-12 md:py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-kimono.png')] opacity-5 z-0" aria-hidden="true" />
        <p className="text-brand-primary font-bold tracking-[0.3em] uppercase mb-3 text-sm relative z-10">
          Planet Food
        </p>
        <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-widest relative z-10">
          Nos Restaurants
        </h1>
        <div className="w-12 h-1 bg-brand-primary mx-auto mt-6 relative z-10" />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(restaurants ?? []).map((r) => (
            <Link key={r.id} href={`/${lang}/restaurant/${r.slug}`}>
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden hover:border-brand-primary transition-all duration-300 group cursor-pointer h-full flex flex-col">
                <div className="relative aspect-video bg-neutral-950 shrink-0">
                  {r.image_url ? (
                    <Image
                      src={r.image_url}
                      alt={r.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-neutral-700 font-display text-6xl uppercase tracking-widest">
                      {r.name[0]}
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col grow">
                  {r.category && (
                    <span className="text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                      {r.category}
                    </span>
                  )}
                  <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">
                    {r.name}
                  </h2>
                  {r.description && (
                    <p className="text-neutral-400 text-sm mt-2 line-clamp-2 grow">{r.description}</p>
                  )}
                  <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-brand-primary group-hover:underline">
                    Voir la carte →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

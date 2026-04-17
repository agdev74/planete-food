"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useTranslation } from "@/context/LanguageContext";
import type { Restaurant } from "@/types";

export default function RestaurantBanner() {
  const { lang } = useTranslation();
  const params = useParams();
  const currentSlug = params.slug;
  const [restaurants, setRestaurants] = useState<Pick<Restaurant, "id" | "name" | "slug" | "image_url">[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("restaurants")
      .select("id, name, slug, image_url")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        if (data) setRestaurants(data);
      });
  }, []);

  return (
    <div className="w-full bg-[#080808] py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
          
          {/* Option "Tous" */}
          <Link href={`/${lang}/restaurant`}>
            <div className={`relative shrink-0 w-32 h-20 rounded-2xl overflow-hidden border-2 transition-all ${!currentSlug ? 'border-brand-primary shadow-glow' : 'border-neutral-800 opacity-60'}`}>
              <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white z-10">
                Tous
              </div>
            </div>
          </Link>

          {/* Liste des Enseignes */}
          {restaurants.map((r) => (
            <Link key={r.id} href={`/${lang}/restaurant/${r.slug}`}>
              <div className={`relative shrink-0 w-40 h-20 rounded-2xl overflow-hidden border-2 transition-all group ${currentSlug === r.slug ? 'border-brand-primary shadow-glow' : 'border-neutral-800 hover:border-neutral-600'}`}>
                
                {r.image_url ? (
                  <Image 
                    src={r.image_url} 
                    alt={r.name} 
                    fill 
                    className={`object-cover transition-transform duration-500 group-hover:scale-110 ${currentSlug === r.slug ? 'opacity-100' : 'opacity-40 group-hover:opacity-60'}`}
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-800" />
                )}
                
                {/* Tailwind v4 : bg-linear-to-t au lieu de bg-gradient-to-t */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10" />
                
                <div className="absolute inset-0 flex items-center justify-center p-2 z-20">
                  <span className="text-white text-[10px] font-black uppercase tracking-tighter text-center leading-tight">
                    {r.name}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
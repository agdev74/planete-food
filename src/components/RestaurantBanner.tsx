"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useTranslation } from "@/context/LanguageContext";
import TransitionLink from "./TransitionLink";
import type { Restaurant } from "@/types";

export default function RestaurantBanner() {
  const { lang } = useTranslation();
  const pathname = usePathname();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const segments = pathname.split("/");
  const restaurantIdx = segments.indexOf("restaurant");
  const currentSlug = restaurantIdx !== -1 ? segments[restaurantIdx + 1] : undefined;

  useEffect(() => {
    createClient()
      .from("restaurants")
      .select("id, name, slug, category, is_active")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        if (data) setRestaurants(data as Restaurant[]);
      });
  }, []);

  useEffect(() => {
    if (!currentSlug) return;
    const el = document.getElementById(`rb-${currentSlug}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [restaurants, currentSlug]);

  if (restaurants.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2">
      {restaurants.map((r) => {
        const isActive = r.slug === currentSlug;
        return (
          <div key={r.id} id={`rb-${r.slug}`} className="shrink-0">
            <TransitionLink
              href={`/${lang}/restaurant/${r.slug}`}
              className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl border text-center transition-all min-w-20 block ${
                isActive
                  ? "bg-brand-primary/10 border-brand-primary shadow-glow"
                  : "bg-neutral-900/50 border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-white"
              }`}
            >
              <span
                className={`text-[10px] font-black uppercase tracking-tight leading-tight ${
                  isActive ? "text-white" : "text-neutral-400"
                }`}
              >
                {r.name}
              </span>
              {r.category && (
                <span
                  className={`text-[8px] uppercase tracking-widest leading-none ${
                    isActive ? "text-brand-primary" : "text-neutral-600"
                  }`}
                >
                  {r.category}
                </span>
              )}
            </TransitionLink>
          </div>
        );
      })}
    </div>
  );
}

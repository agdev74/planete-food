"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { m, LayoutGroup } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useTranslation } from "@/context/LanguageContext";
import type { Restaurant } from "@/types";

interface Props {
  current: Restaurant;
}

export default function DynamicRestaurantGrid({ current }: Props) {
  const { lang } = useTranslation();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeSlug, setActiveSlug] = useState(current.slug);
  const activeRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createClient()
      .from("restaurants")
      .select("id, name, slug, image_url, is_active")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        if (data) setRestaurants(data as Restaurant[]);
      });
  }, []);

  // Rotate array so active card always sits at the DOM center index
  const centeredList = useMemo<Restaurant[]>(() => {
    if (!restaurants.length) return [];
    const activeIdx = restaurants.findIndex((r) => r.slug === activeSlug);
    if (activeIdx === -1) return restaurants;
    const total = restaurants.length;
    const center = Math.floor(total / 2);
    const result: Restaurant[] = new Array(total);
    for (let i = 0; i < total; i++) {
      result[(center + i - activeIdx + total) % total] = restaurants[i];
    }
    return result;
  }, [restaurants, activeSlug]);

  // Scroll active card into view on mobile after each rotation
  useEffect(() => {
    const el = activeRef.current;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [centeredList]);

  const handleSelect = (r: Restaurant) => {
    if (r.slug === activeSlug) return;
    setActiveSlug(r.slug);
    setTimeout(() => router.push(`/${lang}/restaurant/${r.slug}`), 380);
  };

  return (
    <section className="bg-neutral-950 pt-24 pb-8 border-b border-neutral-900">
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar px-8 py-8 snap-x snap-mandatory scroll-smooth items-center md:justify-center"
      >
        <LayoutGroup>
          {centeredList.map((r) => {
            const isActive = r.slug === activeSlug;
            return (
              <m.div
                key={r.id}
                layout
                ref={isActive ? activeRef : undefined}
                onClick={() => handleSelect(r)}
                animate={{
                  scale: isActive ? 1.1 : 0.82,
                  opacity: isActive ? 1 : 0.5,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className={`snap-center shrink-0 w-40 cursor-pointer rounded-2xl overflow-hidden border-2 flex flex-col ${
                  isActive
                    ? "border-brand-primary shadow-glow"
                    : "border-neutral-800"
                }`}
              >
                <div className="relative w-full aspect-square bg-neutral-900">
                  {r.image_url ? (
                    <Image
                      src={r.image_url}
                      alt={r.name}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display font-bold text-5xl text-neutral-500 uppercase select-none">
                        {r.name[0]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-neutral-900 px-3 py-2 text-center border-t border-neutral-800">
                  <span
                    className={`text-xs font-black uppercase tracking-tight leading-tight block ${
                      isActive ? "text-white" : "text-neutral-400"
                    }`}
                  >
                    {r.name}
                  </span>
                </div>
              </m.div>
            );
          })}
        </LayoutGroup>
      </div>
    </section>
  );
}

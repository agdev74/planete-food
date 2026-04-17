"use client";

import { useEffect, useState, useRef } from "react";
import { m } from "framer-motion";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useTranslation } from "@/context/LanguageContext";
import TransitionLink from "./TransitionLink";
import type { Restaurant } from "@/types";

interface Props {
  current: Restaurant;
}

export default function IntegratedRestaurantBanner({ current }: Props) {
  const { lang } = useTranslation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createClient()
      .from("restaurants")
      .select("id, name, slug, category, image_url, is_active")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        if (data) setRestaurants(data as Restaurant[]);
      });
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    const active = activeRef.current;
    if (!container || !active) return;
    const left = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
    container.scrollTo({ left, behavior: "smooth" });
  }, [restaurants]);

  return (
    <section className="bg-neutral-950 pt-24 pb-8 border-b border-neutral-900">
      <div
        ref={scrollRef}
        className="flex gap-12 overflow-x-auto no-scrollbar px-10 py-6 snap-x snap-mandatory scroll-smooth md:justify-center items-center"
      >
        {restaurants.map((r) => {
          const isActive = r.slug === current.slug;
          return (
            <div
              key={r.id}
              ref={isActive ? activeRef : undefined}
              className="snap-center shrink-0"
            >
              <TransitionLink
                href={`/${lang}/restaurant/${r.slug}`}
                className="flex flex-col items-center gap-3"
              >
                <m.div
                  animate={{
                    scale: isActive ? 1.25 : 1,
                    opacity: isActive ? 1 : 0.4,
                  }}
                  whileHover={{ opacity: 1, scale: isActive ? 1.25 : 1.08 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 relative overflow-hidden ${
                    isActive
                      ? "bg-brand-primary/10 border-brand-primary shadow-glow"
                      : "bg-neutral-900 border-neutral-800"
                  }`}
                >
                  {r.image_url ? (
                    <Image
                      src={r.image_url}
                      alt={r.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <span
                      className={`font-display font-bold text-3xl uppercase select-none ${
                        isActive ? "text-brand-primary" : "text-neutral-500"
                      }`}
                    >
                      {r.name[0]}
                    </span>
                  )}
                </m.div>

                <m.span
                  animate={{ opacity: isActive ? 1 : 0.4 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`text-xs font-black uppercase tracking-tight text-center leading-tight w-20 ${
                    isActive ? "text-white" : "text-neutral-500"
                  }`}
                >
                  {r.name.split(" ")[0]}
                </m.span>
              </TransitionLink>
            </div>
          );
        })}
      </div>
    </section>
  );
}

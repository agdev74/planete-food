"use client";

import { useEffect, useState, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useTranslation } from "@/context/LanguageContext";
import TransitionLink from "./TransitionLink";
import type { Restaurant } from "@/types";

interface Props {
  current: Restaurant;
}

export default function UnifiedRestaurantHeader({ current }: Props) {
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
    <section className="bg-neutral-950 pt-24 pb-16 border-b border-neutral-900">

      {/* ── NAVIGATION ROW ── */}
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto no-scrollbar px-8 pb-8 snap-x snap-mandatory scroll-smooth md:justify-center"
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
                className="flex flex-col items-center gap-2"
              >
                <m.div
                  animate={{
                    scale: isActive ? 1.25 : 1,
                    opacity: isActive ? 1 : 0.4,
                  }}
                  whileHover={{ opacity: 1, scale: isActive ? 1.25 : 1.05 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 relative overflow-hidden ${
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
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span
                      className={`font-display font-bold text-2xl uppercase select-none ${
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
                  className={`text-[9px] font-black uppercase tracking-tight text-center leading-tight w-16 ${
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

      {/* ── ACTIVE RESTAURANT IDENTITY ── */}
      <AnimatePresence mode="wait">
        <m.div
          key={current.slug}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          className="text-center px-6 mt-4"
        >
          {current.category && (
            <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.4em] mb-3">
              {current.category}
            </p>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white uppercase tracking-tighter leading-none mb-4">
            {current.name}
          </h1>

          {current.description && (
            <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed italic">
              {current.description}
            </p>
          )}

          <div className="w-12 h-1 bg-brand-primary mx-auto mt-8 shadow-glow" />
        </m.div>
      </AnimatePresence>
    </section>
  );
}

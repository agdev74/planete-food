"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import TransitionLink from "@/components/TransitionLink";
import { useTranslation } from "@/context/LanguageContext";
import { createClient } from "@/utils/supabase/client";
import type { Restaurant } from "@/types";
import {
  ShoppingBag,
  Wallet,
  Timer,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Store,
} from "lucide-react";

// ── Static trust indicators ───────────────────────────────────────────────────
const TRUST_ITEMS = [
  { value: "3+", label: "Enseignes" },
  { value: "4.8★", label: "Note Google" },
  { value: "< 30 min", label: "Livraison" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function HomeClient() {
  const { t, lang } = useTranslation();
  const supabase = useMemo(() => createClient(), []);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    supabase
      .from("restaurants")
      .select("id, name, slug, description, image_url, category, is_active")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        if (data) setRestaurants(data as Restaurant[]);
      });
  }, [supabase]);

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">

        {/* Ambient layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-b from-violet-950/30 via-black to-black" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-900/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center gap-8 py-32">

          {/* Badge */}
          <Reveal delay={0.05}>
            <span className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full">
              <Sparkles size={12} />
              {t.hero.badge}
            </span>
          </Reveal>

          {/* Headline — 3 lines, third in gradient */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold uppercase leading-none tracking-tighter">
            <span className="text-white block">LE PREMIER</span>
            <span className="text-white block">FOOD COURT</span>
            <span className="block text-transparent bg-clip-text bg-linear-to-br from-brand-primary to-violet-300">
              LIVRÉ CHEZ VOUS
            </span>
          </h1>

          {/* Tagline */}
          <Reveal delay={0.15}>
            <p className="text-white/80 font-bold text-lg md:text-2xl tracking-tight max-w-lg">
              {t.hero.tagline}
            </p>
          </Reveal>

          {/* Description */}
          <Reveal delay={0.2}>
            <p className="text-neutral-400 text-base md:text-lg max-w-xl leading-relaxed">
              {t.hero.desc}
            </p>
          </Reveal>

          {/* ── CTA block ── */}
          <Reveal delay={0.3} y={20}>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">

              {/* Primary — dominant, glowing */}
              <Link
                href={`/${lang}/restaurant`}
                className="group inline-flex items-center gap-3 px-12 py-5 bg-brand-primary text-white font-black rounded-2xl hover:bg-violet-600 hover:scale-105 active:scale-100 transition-all duration-300 uppercase tracking-widest shadow-glow text-sm md:text-base"
              >
                Commander Maintenant
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </Link>

              {/* Secondary */}
              <Link
                href={`/${lang}/traiteur`}
                className="inline-flex items-center gap-2 px-8 py-5 border border-white/10 text-white/60 font-bold rounded-2xl hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-300 uppercase tracking-widest text-sm"
              >
                {t.hero.btnTraiteur}
              </Link>
            </div>
          </Reveal>

          {/* Trust bar */}
          <Reveal delay={0.45}>
            <div className="flex items-center gap-8 md:gap-12 pt-6 border-t border-white/5">
              {TRUST_ITEMS.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1">
                  <span className="text-white font-black text-xl">{item.value}</span>
                  <span className="text-neutral-600 text-xs uppercase tracking-widest font-bold">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-700 animate-bounce">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ── NOS ENSEIGNES STARS ──────────────────────────────────────────── */}
      {restaurants.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-6">

            <Reveal>
              <div className="text-center mb-16">
                <span className="text-brand-primary font-bold tracking-widest uppercase text-xs">
                  Nos Partenaires
                </span>
                <h2 className="text-3xl md:text-5xl font-display font-bold text-white mt-3 uppercase tracking-tight">
                  Nos Enseignes Stars
                </h2>
                <p className="text-neutral-400 text-base mt-4 max-w-lg mx-auto">
                  Chaque enseigne, un univers culinaire. Un seul panier pour tout commander.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant, i) => (
                <Reveal key={restaurant.id} delay={i * 0.08} y={24}>
                  <div className="group flex flex-col h-full rounded-3xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 transition-all duration-300">

                    {/* Image */}
                    <div className="relative w-full aspect-video bg-neutral-900 overflow-hidden">
                      {restaurant.image_url ? (
                        <Image
                          src={restaurant.image_url}
                          alt={restaurant.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store size={40} className="text-neutral-700" />
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-neutral-900/70 to-transparent" />
                      {/* Category badge */}
                      {restaurant.category && (
                        <span className="absolute bottom-3 left-3 bg-brand-primary text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                          {restaurant.category}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-4 p-6 flex-1">
                      <h3 className="text-white font-display font-bold text-xl uppercase tracking-tight">
                        {restaurant.name}
                      </h3>
                      {restaurant.description && (
                        <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2">
                          {restaurant.description}
                        </p>
                      )}
                      <TransitionLink
                        href={`/${lang}/restaurant/${restaurant.slug}`}
                        className="mt-auto inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-neutral-700 text-white/70 text-xs font-black uppercase tracking-widest hover:bg-brand-primary hover:border-brand-primary hover:text-white hover:shadow-glow transition-all duration-300 group/btn"
                      >
                        Découvrir le Menu
                        <ChevronRight
                          size={14}
                          className="group-hover/btn:translate-x-0.5 transition-transform"
                        />
                      </TransitionLink>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── POURQUOI PLANET FOOD ? (BENTO) ──────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-6">

          <Reveal>
            <div className="text-center mb-16">
              <span className="text-brand-primary font-bold tracking-widest uppercase text-xs">
                {t.values.subtitle}
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mt-3 uppercase tracking-tight">
                {t.values.title}
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* ① Le Panier Food Court — wide, violet */}
            <Reveal delay={0.05} y={24} className="md:col-span-2">
              <div className="group relative flex flex-col gap-6 h-full p-8 md:p-10 rounded-3xl border border-brand-primary/20 bg-brand-primary/5 overflow-hidden hover:border-brand-primary/40 transition-all duration-500">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl group-hover:bg-brand-primary/20 transition-colors duration-700" />

                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-primary/20 shrink-0">
                  <ShoppingBag size={22} className="text-brand-primary" />
                </div>

                <span className="text-brand-primary text-xs font-black uppercase tracking-widest">
                  Le Panier Food Court
                </span>

                <div className="flex flex-col gap-3">
                  <h3 className="text-white font-display font-bold text-2xl md:text-3xl uppercase tracking-tight leading-tight">
                    Un seul panier.<br />Tous vos restaurants.
                  </h3>
                  <p className="text-neutral-300 leading-relaxed max-w-md">
                    Une pizza pour vous, des tacos pour lui, des mochis pour les enfants.
                    Commandez depuis plusieurs enseignes — un seul livreur, une seule livraison.
                  </p>
                </div>

                <Link
                  href={`/${lang}/restaurant`}
                  className="mt-auto inline-flex items-center gap-2 text-brand-primary font-bold text-sm uppercase tracking-widest hover:gap-4 transition-all duration-200"
                >
                  Commander maintenant <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>

            {/* ② Votre Cagnotte Fidélité — vert */}
            <Reveal delay={0.12} y={24} className="md:col-span-1">
              <div className="group relative flex flex-col gap-5 h-full p-7 rounded-3xl border border-neutral-800 bg-neutral-900/50 overflow-hidden hover:border-emerald-500/30 transition-all duration-500">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-700" />

                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 shrink-0">
                  <Wallet size={22} className="text-emerald-400" />
                </div>

                <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">
                  Votre Cagnotte Fidélité
                </span>

                <div className="flex flex-col gap-3">
                  <h3 className="text-white font-display font-bold text-xl uppercase tracking-tight">
                    Chaque commande vous rapporte
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Vos achats alimentent une cagnotte déductible sur vos prochaines commandes.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* ③ La Livraison Express — bleu */}
            <Reveal delay={0.18} y={24} className="md:col-span-1">
              <div className="group relative flex flex-col gap-5 h-full p-7 rounded-3xl border border-neutral-800 bg-neutral-900/50 overflow-hidden hover:border-blue-500/30 transition-all duration-500">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-700" />

                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 shrink-0">
                  <Timer size={22} className="text-blue-400" />
                </div>

                <span className="text-blue-400 text-xs font-black uppercase tracking-widest">
                  La Livraison Express
                </span>

                <div className="flex flex-col gap-3">
                  <h3 className="text-white font-display font-bold text-xl uppercase tracking-tight">
                    Livré en moins de 30 min
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Logistique unifiée partout à Genève. Click &amp; Collect disponible dans toutes nos enseignes.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* ④ CTA final puissant — wide */}
            <Reveal delay={0.25} y={24} className="md:col-span-2">
              <Link
                href={`/${lang}/restaurant`}
                className="group relative flex flex-col md:flex-row items-center justify-between gap-6 h-full p-8 rounded-3xl border border-brand-primary/20 bg-linear-to-br from-brand-primary/10 to-transparent hover:from-brand-primary/15 hover:border-brand-primary/40 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative text-center md:text-left">
                  <p className="text-brand-primary font-black text-xs uppercase tracking-widest mb-2">
                    Votre première commande
                  </p>
                  <h3 className="text-white font-display font-bold text-2xl md:text-3xl uppercase tracking-tight">
                    Lancez votre première commande
                  </h3>
                  <p className="text-neutral-400 text-sm mt-2 max-w-xs">
                    Rejoignez la communauté Planet Food. Livraison partout à Genève.
                  </p>
                </div>

                <div className="relative shrink-0">
                  <span className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white font-black rounded-2xl uppercase tracking-widest text-sm shadow-glow group-hover:bg-violet-600 transition-colors duration-300">
                    Commander Maintenant
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform duration-200"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>

          </div>
        </div>
      </section>
    </div>
  );
}

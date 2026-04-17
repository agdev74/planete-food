"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import RestaurantBanner from "@/components/RestaurantBanner";
import { useTranslation } from "@/context/LanguageContext";
import {
  ShoppingBag,
  Wallet,
  Bike,
  ArrowRight,
  ChevronDown,
  Sparkles,
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

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">

        {/* Ambient layers — no arbitrary values, pure Tailwind utilities */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-b from-violet-950/30 via-black to-black" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
          {/* Soft glow orb */}
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

          {/* Main headline */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold uppercase leading-none tracking-tighter">
            <span className="text-white">{t.hero.title_top}</span>
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-br from-brand-primary to-violet-300">
              {t.hero.title_bottom}
            </span>
          </h1>

          {/* Tagline */}
          <Reveal delay={0.15}>
            <p className="text-white font-bold text-xl md:text-2xl tracking-tight max-w-lg">
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

              {/* Primary — massive, glowing */}
              <Link
                href={`/${lang}/restaurant`}
                className="group relative inline-flex items-center gap-3 px-12 py-5 bg-brand-primary text-white font-black rounded-2xl hover:bg-violet-600 hover:scale-105 active:scale-100 transition-all duration-300 uppercase tracking-widest shadow-glow text-base"
              >
                {t.hero.btnRestaurants}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </Link>

              {/* Secondary */}
              <Link
                href={`/${lang}/traiteur`}
                className="inline-flex items-center gap-2 px-8 py-5 border border-white/10 text-white/70 font-bold rounded-2xl hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-300 uppercase tracking-widest text-sm"
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-neutral-700 animate-bounce">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ── RESTAURANT BANNER ────────────────────────────────────────────── */}
      <section className="py-12 border-y border-neutral-900">
        <Reveal>
          <p className="text-center text-xs font-black text-neutral-600 uppercase tracking-widest mb-8">
            {t.restaurants.banner}
          </p>
        </Reveal>
        <RestaurantBanner />
      </section>

      {/* ── BENTO AVANTAGES ──────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-6">

          {/* Section header */}
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

          {/* Bento grid: 3 columns on md+, 1 column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* ① Panier Commun — wide hero card */}
            <Reveal delay={0.05} y={24} className="md:col-span-2">
              <div className="group relative flex flex-col gap-6 h-full p-8 md:p-10 rounded-3xl border border-neutral-800 bg-neutral-900/50 overflow-hidden hover:border-brand-primary/30 transition-all duration-500">
                {/* Ambient glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-colors duration-700" />

                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-primary/10 shrink-0">
                  <ShoppingBag size={22} className="text-brand-primary" />
                </div>

                <span className="text-brand-primary text-xs font-black uppercase tracking-widest opacity-60">
                  Fonctionnalité phare
                </span>

                <div className="flex flex-col gap-3">
                  <h3 className="text-white font-display font-bold text-2xl md:text-3xl uppercase tracking-tight leading-tight">
                    Un seul panier.<br />Tous vos restaurants.
                  </h3>
                  <p className="text-neutral-400 leading-relaxed max-w-md">
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

            {/* ② Fidélité & Cashback */}
            <Reveal delay={0.12} y={24} className="md:col-span-1">
              <div className="group relative flex flex-col gap-5 h-full p-7 rounded-3xl border border-neutral-800 bg-neutral-900/50 overflow-hidden hover:border-emerald-500/20 transition-all duration-500">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-700" />

                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 shrink-0">
                  <Wallet size={22} className="text-emerald-400" />
                </div>

                <span className="text-emerald-400 text-xs font-black uppercase tracking-widest opacity-60">
                  Fidélité
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

            {/* ③ Livraison Express */}
            <Reveal delay={0.18} y={24} className="md:col-span-1">
              <div className="group relative flex flex-col gap-5 h-full p-7 rounded-3xl border border-neutral-800 bg-neutral-900/50 overflow-hidden hover:border-amber-500/20 transition-all duration-500">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors duration-700" />

                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 shrink-0">
                  <Bike size={22} className="text-amber-400" />
                </div>

                <span className="text-amber-400 text-xs font-black uppercase tracking-widest opacity-60">
                  Logistique
                </span>

                <div className="flex flex-col gap-3">
                  <h3 className="text-white font-display font-bold text-xl uppercase tracking-tight">
                    Livraison express
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Moins de 30 minutes dans tout Genève. Click &amp; Collect disponible.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* ④ CTA banner card */}
            <Reveal delay={0.25} y={24} className="md:col-span-2">
              <Link
                href={`/${lang}/restaurant`}
                className="group relative flex flex-col md:flex-row items-center justify-between gap-6 h-full p-8 rounded-3xl border border-brand-primary/20 bg-linear-to-br from-brand-primary/10 to-transparent hover:from-brand-primary/15 hover:border-brand-primary/40 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative text-center md:text-left">
                  <p className="text-brand-primary font-black text-xs uppercase tracking-widest mb-2">
                    Prêt à commander ?
                  </p>
                  <h3 className="text-white font-display font-bold text-2xl uppercase tracking-tight">
                    {t.cta.title}
                  </h3>
                  <p className="text-neutral-400 text-sm mt-2 max-w-xs">{t.cta.desc}</p>
                </div>

                <div className="relative shrink-0">
                  <span className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white font-black rounded-2xl uppercase tracking-widest text-sm shadow-glow group-hover:bg-violet-600 transition-colors duration-300">
                    Voir les restaurants
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

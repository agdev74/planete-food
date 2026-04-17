"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import RestaurantBanner from "@/components/RestaurantBanner";
import { useTranslation } from "@/context/LanguageContext";
import { Zap, ShieldCheck, Smartphone, ShoppingCart } from "lucide-react";
import type { ElementType } from "react";

const ICON_MAP: Record<string, ElementType> = {
  speed: Zap,
  payment: ShieldCheck,
  mobile: Smartphone,
  shared: ShoppingCart,
};

const COLOR_MAP: Record<string, string> = {
  speed: "text-yellow-400",
  payment: "text-green-400",
  mobile: "text-blue-400",
  shared: "text-brand-primary",
};

export default function HomeClient() {
  const { t, lang } = useTranslation();

  return (
    <div className="min-h-screen bg-[#080808]">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a0a2e_0%,#000000_100%)]" />
          <div className="absolute inset-0 bg-[url('/pattern-kimono.png')] opacity-[0.02] pointer-events-none" />
          <div className="absolute inset-0 bg-linear-to-t from-[#080808] via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <Reveal delay={0.05}>
            <span className="inline-block bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full mb-6">
              {t.hero.badge}
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-brand-primary font-bold tracking-[0.3em] uppercase mb-4 text-sm md:text-base">
              {t.hero.subtitle}
            </p>
          </Reveal>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-4 uppercase leading-none tracking-tighter">
            {t.hero.title_top} <br />
            <span className="text-gray-500">{t.hero.title_bottom}</span>
          </h1>

          <Reveal delay={0.15}>
            <p className="text-white font-bold text-xl md:text-2xl mb-4 tracking-tight">
              {t.hero.tagline}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-light italic">
              {t.hero.desc}
            </p>
          </Reveal>

          <Reveal delay={0.3} y={20}>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href={`/${lang}/restaurant`}
                className="px-10 py-5 bg-brand-primary text-white font-bold rounded-2xl hover:bg-violet-700 transition-all uppercase tracking-widest shadow-glow"
              >
                {t.hero.btnRestaurants}
              </Link>
              <Link
                href={`/${lang}/traiteur`}
                className="px-10 py-5 bg-transparent border border-white/10 text-white font-bold rounded-2xl hover:bg-white hover:text-black transition-all uppercase tracking-widest backdrop-blur-sm"
              >
                {t.hero.btnTraiteur}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── RESTAURANT QUICK-LINKS BANNER ── */}
      <section className="py-10 bg-[#080808]">
        <Reveal>
          <p className="text-center text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-6">
            {t.restaurants.banner}
          </p>
        </Reveal>
        <RestaurantBanner />
      </section>

      {/* ── VALUE PROPOSITIONS ── */}
      <section className="py-24 bg-[#080808]">
        <div className="container mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-brand-primary font-bold tracking-widest uppercase text-sm">
                {t.values.subtitle}
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mt-2">
                {t.values.title}
              </h2>
              <div className="w-20 h-1 bg-neutral-800 mx-auto mt-6" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.values.items.map((item, index) => {
              const Icon = ICON_MAP[item.icon] ?? Zap;
              const color = COLOR_MAP[item.icon] ?? "text-brand-primary";
              return (
                <Reveal key={item.icon} delay={index * 0.1} y={20}>
                  <div className="bg-neutral-900/40 backdrop-blur-md p-8 rounded-3xl border border-neutral-800 hover:border-brand-primary/50 transition-all duration-500 h-full flex flex-col gap-4">
                    <div className={color}>
                      <Icon size={32} aria-hidden="true" />
                    </div>
                    <h3 className="text-white font-bold font-display text-lg uppercase tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed grow">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

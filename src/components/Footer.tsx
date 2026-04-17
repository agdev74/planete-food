"use client";

import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { Instagram, Facebook, MapPin, Phone, Globe, Rocket } from "lucide-react";
import { restaurantConfig } from "@/config/restaurant";

export default function Footer() {
  const { t, lang } = useTranslation();

  const days = {
    fr: { mon: "Lundi", tueFri: "Mardi - Vendredi", satSun: "Samedi - Dimanche", closed: "Fermé", midi: "Midi", soir: "Soir" },
    en: { mon: "Monday", tueFri: "Tuesday - Friday", satSun: "Saturday - Sunday", closed: "Closed", midi: "Lunch", soir: "Dinner" },
    es: { mon: "Lunes", tueFri: "Martes - Viernes", satSun: "Sábado - Domingo", closed: "Cerrado", midi: "Mediodía", soir: "Noche" }
  }[lang as "fr" | "en" | "es"] || { mon: "Lundi", tueFri: "Mardi - Vendredi", satSun: "Samedi - Dimanche", closed: "Fermé", midi: "Midi", soir: "Soir" };

  const socialLinks = [
    ...(restaurantConfig.instagramUrl ? [{ icon: <Instagram size={18} />, href: restaurantConfig.instagramUrl, label: "Instagram" }] : []),
    ...(restaurantConfig.facebookUrl ? [{ icon: <Facebook size={18} />, href: restaurantConfig.facebookUrl, label: "Facebook" }] : []),
    { icon: <Globe size={18} />, href: restaurantConfig.tripadvisorUrl, label: "TripAdvisor" },
  ];

  return (
    <footer className="bg-brand-black text-white border-t border-neutral-800 pt-16 pb-8">
      <div className="container mx-auto px-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* COLONNE 1 : LOGO & RÉSEAUX */}
          <div className="space-y-6">
            <Link href={`/${lang}`} className="flex items-center gap-3 group" aria-label="Retour à l'accueil">
              <Rocket size={32} className="text-brand-primary drop-shadow-[0_0_10px_var(--color-brand-primary)] group-hover:scale-110 transition-transform" />
              <span className="font-display font-bold text-white text-xl uppercase tracking-tight leading-none">
                {restaurantConfig.name}
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t.footer.desc}
            </p>
            <div className="flex space-x-4 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400 hover:bg-brand-primary hover:text-white transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* COLONNE 2 : LIENS RAPIDES */}
          <div>
            <h3 className="text-lg font-display font-bold uppercase tracking-widest mb-6 border-l-4 border-brand-primary pl-3">
              {t.footer.linksTitle}
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link href={`/${lang}`} className="hover:text-violet-400 transition">{t.nav.home}</Link></li>
              <li><Link href={`/${lang}/menu`} className="hover:text-violet-400 transition">{t.nav.menu}</Link></li>
              <li><Link href={`/${lang}/traiteur`} className="hover:text-violet-400 transition">{t.nav.catering}</Link></li>
              <li><Link href={`/${lang}/contact`} className="hover:text-violet-400 transition">{t.nav.contact}</Link></li>
            </ul>
          </div>

          {/* COLONNE 3 : CONTACT */}
          <div>
            <h3 className="text-lg font-display font-bold uppercase tracking-widest mb-6 border-l-4 border-brand-primary pl-3">
              {t.footer.contactTitle}
            </h3>
            <ul className="space-y-4 text-gray-400">
              {restaurantConfig.address && (
                <li className="flex items-start group">
                  <MapPin size={18} className="text-red-400 mr-3 shrink-0" />
                  <a
                    href={restaurantConfig.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition leading-snug"
                  >
                    {restaurantConfig.address}
                  </a>
                </li>
              )}
              {restaurantConfig.phone && (
                <li className="flex items-center group">
                  <Phone size={18} className="text-red-400 mr-3 shrink-0" />
                  <a href={`tel:${restaurantConfig.phone}`} className="hover:text-white transition font-bold tracking-tighter">
                    {restaurantConfig.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* COLONNE 4 : HORAIRES */}
          <div>
            <h3 className="text-lg font-display font-bold uppercase tracking-widest mb-6 border-l-4 border-brand-primary pl-3">
              {t.contact.opening}
            </h3>
            <ul className="space-y-4 text-gray-400 text-[10px] uppercase tracking-widest">
              <li className="flex flex-col gap-1">
                <span className="text-white font-bold">{days.tueFri}</span>
                <div className="flex justify-between">
                  <span>{days.midi}</span>
                  <span className="text-white">{restaurantConfig.hours.weekday.lunch}</span>
                </div>
                <div className="flex justify-between">
                  <span>{days.soir}</span>
                  <span className="text-white">{restaurantConfig.hours.weekday.dinner}</span>
                </div>
              </li>

              <li className="flex flex-col gap-1 border-t border-neutral-800 pt-3">
                <span className="text-white font-bold">{days.satSun}</span>
                <div className="flex justify-between">
                  <span>{days.soir}</span>
                  <span className="text-white">{restaurantConfig.hours.weekend.dinner}</span>
                </div>
              </li>

              <li className="flex justify-between border-t border-neutral-800 pt-3 text-red-400 font-bold">
                <span>{days.mon}</span>
                <span>{days.closed}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* COPYRIGHT & LÉGAL */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest">
          <p>{t.footer.rights}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href={`/${lang}/mentions-legales`}
              className="text-gray-300 hover:text-white transition font-bold"
            >
              {lang === "fr" ? "Mentions Légales" : lang === "en" ? "Legal Notice" : "Aviso Legal"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

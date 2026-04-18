"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { Truck } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

const STORAGE_KEY = "planet_food_last_order";

export default function FloatingTracker() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const pathname = usePathname();
  const { lang } = useTranslation();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setOrderId(saved);
  }, [pathname]);

  // Masqué sur la page de suivi et l'admin
  if (pathname.includes("/track") || pathname.includes("/admin")) return null;

  return (
    <AnimatePresence>
      {orderId && (
        <m.div
          initial={{ opacity: 0, y: 50, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-24 right-4 md:bottom-10 md:right-10 z-60"
        >
          <Link
            href={`/${lang}/track?order_id=${orderId}`}
            className="flex items-center gap-3 bg-brand-primary text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:scale-105 transition-transform border border-violet-400"
          >
            <Truck size={18} className="animate-pulse" />
            <span>🚚 Suivre ma commande en cours</span>
          </Link>
        </m.div>
      )}
    </AnimatePresence>
  );
}

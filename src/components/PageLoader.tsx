"use client";

import { m, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstMount = useRef(true);

  useEffect(() => {
    // 1. On ignore toujours le tout premier montage pour PageSpeed
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // ✅ FIX : On utilise un timeout de 0 pour éviter le "cascading render"
    // Cela déplace le setState dans la file d'attente des tâches suivante.
    const startTimer = setTimeout(() => {
      setIsLoading(true);
    }, 0);

    // 2. On ferme le loader après un délai court pour l'effet visuel
    const stopTimer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(stopTimer);
    };
  }, [pathname, searchParams]);

  // Écouteurs pour déclenchement manuel (Admin, etc.)
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleStop = () => setIsLoading(false);
    window.addEventListener("start-loader", handleStart);
    window.addEventListener("stop-loader", handleStop);
    return () => {
      window.removeEventListener("start-loader", handleStart);
      window.removeEventListener("stop-loader", handleStop);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ willChange: "opacity" }}
          className="fixed inset-0 z-[9999] bg-[#080808]/90 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none"
        >
          <div className="relative w-48 h-48 flex items-center justify-center">
            
            {/* --- CERCLE TOURNANT --- */}
            <m.svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <circle
                cx="50" cy="50" r="42"
                stroke="white" strokeWidth="0.5" fill="none" opacity="0.1"
              />
              <m.circle
                cx="50" cy="50" r="42"
                stroke="#E60012"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="120 300"
              />
            </m.svg>

            {/* --- LOGO CENTRAL --- */}
            <m.div 
              animate={{ scale: [0.98, 1.02, 0.98] }} 
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="relative z-10"
            >
              <Image 
                src="/images/logo.png" 
                alt="Kabuki" 
                width={100} 
                height={100} 
                priority
                className="object-contain"
              />
            </m.div>
          </div>

          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/60 font-display uppercase tracking-[0.3em] mt-8 text-[10px] font-bold"
          >
            Kabuki Sushi
          </m.p>
        </m.div>
      )}
    </AnimatePresence>
  );
}
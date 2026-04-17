"use client";

import { m, useReducedMotion } from "framer-motion"; // ✅ Utilisation de 'm' pour le Lazy Loading
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  y?: number;
  x?: number;
  className?: string; // ✅ Ajout pour plus de flexibilité
}

export default function Reveal({ 
  children, 
  width = "100%", 
  delay = 0.2, 
  y = 20, // ✅ Réduit de 30 à 20 pour un mouvement plus subtil et rapide
  x = 0,
  className = ""
}: Props) {
  const shouldReduceMotion = useReducedMotion();

  // ✅ 1. Si l'utilisateur préfère moins de mouvement, on annule les offsets
  const initialY = shouldReduceMotion ? 0 : y;
  const initialX = shouldReduceMotion ? 0 : x;

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={{ width }}
    >
      <m.div
        variants={{
          hidden: { 
            opacity: 0, 
            y: initialY, 
            x: initialX,
          },
          visible: { 
            opacity: 1, 
            y: 0, 
            x: 0,
          },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ 
          once: true, 
          margin: "-20px", // ✅ Réduit pour déclencher l'animation plus tôt sur mobile
          amount: "some" 
        }}
        transition={{ 
          duration: 0.4, // ✅ Un peu plus rapide (0.4s au lieu de 0.5s) pour une sensation de réactivité
          delay: shouldReduceMotion ? 0 : delay, 
          ease: [0.25, 1, 0.5, 1], // ✅ Circ out : très fluide et pro
        }}
        style={{ 
          willChange: "opacity, transform" // ✅ Optimisation GPU cruciale
        }}
      >
        {children}
      </m.div>
    </div>
  );
}
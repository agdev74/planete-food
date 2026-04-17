"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { translations } from "@/constants/translations";

// --- TYPAGE ---
export type Language = "fr" | "en" | "es";

// ✅ On définit le type des traductions basé sur la structure réelle de ton fichier FR
type TranslationSchema = typeof translations.fr;

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void; 
  t: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Initialisation basée sur l'URL
  const [lang, setLang] = useState<Language>((params?.lang as Language) || "fr");

  // Synchronisation si l'URL change
  useEffect(() => {
    const urlLang = params?.lang as string;
    if (urlLang && (urlLang === "fr" || urlLang === "en" || urlLang === "es")) {
      const timer = setTimeout(() => {
        setLang(urlLang as Language);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [params?.lang]);

  const handleSetLang = (newLang: Language) => {
    if (!pathname) return;

    const segments = pathname.split("/");
    
    // Si l'URL commence par une langue connue, on la remplace
    if (segments[1] === "fr" || segments[1] === "en" || segments[1] === "es") {
      segments[1] = newLang;
    } else {
      // Cas de secours : on insère la langue au début
      segments.splice(1, 0, newLang);
    }

    const newPath = segments.join("/") || "/";
    router.push(newPath);
  };

  return (
    <LanguageContext.Provider value={{ 
      lang, 
      setLang: handleSetLang, 
      t: translations[lang] || translations["fr"] 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
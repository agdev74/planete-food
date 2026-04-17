"use client";

import { useTranslation } from "@/context/LanguageContext";
import { usePathname, useRouter } from "next/navigation";
import { m } from "framer-motion"; 

export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  // ✅ On utilise 'typeof lang' pour récupérer le type exact ('fr'|'en'|'es') 
  // sans même avoir besoin d'importer explicitement le type Language.
  const languages: { code: typeof lang; label: string }[] = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
  ];

  const handleLanguageChange = (newLang: typeof lang) => {
    const segments = pathname.split("/");
    segments[1] = newLang;
    const newPath = segments.join("/");
    
    setLang(newLang);
    router.push(newPath);
  };

  return (
    <div className="flex gap-3">
      {languages.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => handleLanguageChange(l.code)}
          className={`text-[10px] font-bold tracking-widest transition-colors p-1 ${
            lang === l.code ? "text-kabuki-red" : "text-gray-400 hover:text-white"
          }`}
        >
          <m.span 
            whileTap={{ scale: 0.9 }}
            style={{ display: "inline-block", willChange: "transform" }}
          >
            {l.label}
          </m.span>
        </button>
      ))}
    </div>
  );
}
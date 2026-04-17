"use client";

import { useState } from "react";
import Image from "next/image";
import { m } from "framer-motion";
import { useTranslation } from "@/context/LanguageContext"; 
import { z } from "zod";
import { Camera, CheckCircle2, Utensils, Star } from "lucide-react"; 

const cateringSchema = z.object({
  name: z.string().min(2, "Le nom est trop court").max(50),
  email: z.string().email("Format d'email invalide"),
  type: z.string().min(1, "Veuillez choisir un type"),
  guests: z.preprocess(
    (val) => Number(val), 
    z.number().min(1, "Minimum 1 personne").max(1000)
  ),
  vision: z.string().min(10, "Détaillez un peu plus votre projet (min. 10 caract.)").max(2000),
});

interface CateringBloc {
  tag: string;
  title: string;
  desc: string;
}

export default function TraiteurPage() {
  const { t } = useTranslation(); 
  
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      type: formData.get("type"),
      guests: formData.get("guests"),
      vision: formData.get("vision"),
    };

    const result = cateringSchema.safeParse(data);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = String(issue.path[0]);
        formattedErrors[fieldName] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setFormStatus("submitting");
    setTimeout(() => {
      setFormStatus("success");
      window.location.href = "#devis"; 
    }, 2000);
  }

  const experienceImages = [
    "/images/plateau-sushi-2.png",
    "/images/plateau-sushi.png",
    "/images/plateau-sushi-1.jpg"
  ];

  // Doublé pour le défilement infini
  const galleryImages = [
    "/images/catering-1.jpg", "/images/catering-2.jpg", "/images/catering-3.jpg",
    "/images/catering-4.jpg", "/images/catering-5.jpg", "/images/catering-6.jpg",
    "/images/catering-7.jpg", "/images/catering-8.jpg", "/images/catering-9.jpg",
    "/images/catering-1.jpg", "/images/catering-2.jpg", "/images/catering-3.jpg"
  ];

  return (
    <div className="bg-white min-h-screen pb-0">
      
      {/* --- HERO TRAITEUR --- */}
      <section className="relative h-[80vh] flex items-center justify-center text-white overflow-hidden bg-kabuki-black">
        <div className="absolute inset-0 z-0">
            <Image 
                src="/images/traiteur-hero-bg.jpg"
                alt="Traiteur événementiel Kabuki"
                fill
                className="object-cover opacity-40 scale-105"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-kabuki-black/60 to-kabuki-black"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <span className="text-kabuki-red font-display font-bold uppercase tracking-[0.4em] text-sm mb-4 block">
              Prestations d&apos;Exception
            </span>
            <h1 className="text-5xl lg:text-8xl font-display font-bold uppercase leading-tight mb-8">
              {t.catering.title.split(' ')[0]} <br/> 
              <span className="text-kabuki-red">
                {t.catering.title.split(' ').slice(1).join(' ')}
              </span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              {t.catering.subtitle}. {t.catering.desc}
            </p>
            <a href="#devis" className="inline-flex items-center gap-3 bg-kabuki-red text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-kabuki-black transition-all transform hover:scale-105 shadow-xl">
              {t.catering.btnHero}
              <Utensils size={18} />
            </a>
          </m.div>
        </div>
      </section>

      {/* --- L'EXPÉRIENCE KABUKI --- */}
      <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-kabuki-red/5 text-[10rem] font-display font-bold whitespace-nowrap select-none z-0">
          KABUKI CATERING
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold font-display uppercase tracking-wider">{t.catering.experienceTitle}</h2>
            <div className="w-24 h-1 bg-kabuki-red mx-auto mt-6"></div>
          </m.div>

          <div className="space-y-24">
            {t.catering.blocs.map((bloc: CateringBloc, index: number) => (
              <m.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                {/* FIX IMAGE : Utilisation de aspect-square et object-cover pour éviter le vide ou la troncature excessive */}
                <div className={`relative aspect-square md:h-[550px] rounded-2xl overflow-hidden shadow-2xl transition duration-500 border border-neutral-800 
                  ${index % 2 === 0 ? "md:-rotate-2 hover:rotate-0" : "order-1 md:order-2 md:rotate-2 hover:rotate-0"}`}
                >
                  <Image 
                    src={experienceImages[index] || experienceImages[0]} 
                    alt={bloc.title} 
                    fill 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-kabuki-black/80 via-transparent to-transparent"></div>
                </div>
                <div className={`space-y-6 ${index % 2 === 0 ? "md:pl-12" : "md:pr-12 order-2 md:order-1"}`}>
                  <div className="text-kabuki-red font-display text-2xl font-bold">{bloc.tag}</div>
                  <h3 className="text-3xl font-bold">{bloc.title}</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{bloc.desc}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 font-bold uppercase tracking-widest">
                    <CheckCircle2 size={16} className="text-kabuki-red" /> Excellence Garantie
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- GALERIE AUTO-SCROLL (DÉFILEMENT INFINI) --- */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 mb-12">
            <h2 className="text-4xl font-display font-bold uppercase text-kabuki-black mb-4 flex items-center gap-4">
                <Camera className="text-kabuki-red" /> Instantanés Kabuki
            </h2>
            <div className="w-16 h-1 bg-kabuki-red"></div>
        </div>

        <div className="flex w-full">
          <m.div 
            className="flex flex-nowrap gap-6 px-6"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          >
            {galleryImages.map((img, i) => (
              <div key={i} className="relative w-[300px] h-[400px] md:w-[450px] md:h-[550px] rounded-2xl overflow-hidden shrink-0 shadow-xl border border-neutral-100">
                <Image src={img} alt={`Gallery ${i}`} fill className="object-cover" />
              </div>
            ))}
          </m.div>
        </div>
      </section>

      {/* --- FORMULAIRE DEVIS COMPLET --- */}
      <section id="devis" className="bg-kabuki-black py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-kimono.png')] opacity-5 z-0"></div>

        <div className="container mx-auto px-6 relative z-10 max-w-5xl">
          <m.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-neutral-900/80 backdrop-blur-md p-10 md:p-16 rounded-[3rem] shadow-2xl border border-neutral-800">
            {formStatus === "success" ? (
              <div className="text-center py-10">
                <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-8">
                  <Image src="/images/success-man.png" alt="Succès" fill className="object-contain drop-shadow-2xl" priority />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">{t.catering.formSection.successTitle}</h2>
                <p className="text-gray-300 text-lg max-w-xl mx-auto mb-8">{t.catering.formSection.successDesc}</p>
                <button onClick={() => setFormStatus("idle")} className="bg-kabuki-red text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-kabuki-red transition-all">Nouveau Devis</button>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-5xl font-bold text-white font-display uppercase tracking-wider mb-4">{t.catering.formSection.title}</h2>
                  <div className="w-16 h-1 bg-kabuki-red mx-auto"></div>
                  <p className="text-gray-400 mt-6 text-lg">{t.catering.formSection.subtitle}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-kabuki-red tracking-widest uppercase">Nom Complet</label>
                      <input name="name" type="text" className={`w-full bg-neutral-800/50 text-white border-b-2 ${errors.name ? 'border-kabuki-red' : 'border-neutral-700'} focus:border-kabuki-red px-4 py-3 rounded-t-lg outline-none transition-all placeholder-gray-500`} placeholder="Votre nom..." />
                      {errors.name && <p className="text-kabuki-red text-[10px] font-bold uppercase mt-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-kabuki-red tracking-widest uppercase">Email</label>
                      <input name="email" type="email" className={`w-full bg-neutral-800/50 text-white border-b-2 ${errors.email ? 'border-kabuki-red' : 'border-neutral-700'} focus:border-kabuki-red px-4 py-3 rounded-t-lg outline-none transition-all placeholder-gray-500`} placeholder="Email de contact..." />
                      {errors.email && <p className="text-kabuki-red text-[10px] font-bold uppercase mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-kabuki-red tracking-widest uppercase">Type d&apos;Événement</label>
                      <select name="type" className="w-full bg-neutral-800/50 text-white border-b-2 border-neutral-700 focus:border-kabuki-red px-4 py-3 rounded-t-lg outline-none appearance-none cursor-pointer">
                        {t.catering.formSection.types.map((type: string) => (
                          <option key={type} value={type} className="bg-neutral-900">{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-kabuki-red tracking-widest uppercase">Nombre d&apos;Invités</label>
                      <input name="guests" type="number" className={`w-full bg-neutral-800/50 text-white border-b-2 ${errors.guests ? 'border-kabuki-red' : 'border-neutral-700'} focus:border-kabuki-red px-4 py-3 rounded-t-lg outline-none transition-all placeholder-gray-500`} placeholder="Ex: 50" />
                      {errors.guests && <p className="text-kabuki-red text-[10px] font-bold uppercase mt-1">{errors.guests}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-kabuki-red tracking-widest uppercase">Votre Vision</label>
                    <textarea name="vision" rows={5} className={`w-full bg-neutral-800/50 text-white border-b-2 ${errors.vision ? 'border-kabuki-red' : 'border-neutral-700'} focus:border-kabuki-red px-4 py-3 rounded-t-lg outline-none transition-all placeholder-gray-500 resize-none`} placeholder="Détaillez vos besoins..."></textarea>
                    {errors.vision && <p className="text-kabuki-red text-[10px] font-bold uppercase mt-1">{errors.vision}</p>}
                  </div>

                  <div className="text-center pt-6">
                    <button type="submit" disabled={formStatus === "submitting"} className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-kabuki-red px-16 py-5 font-bold text-white transition-all hover:scale-105 shadow-xl hover:shadow-red-900/50 disabled:opacity-50">
                      {formStatus === "submitting" ? (
                        <span className="flex items-center gap-3">
                           <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                           {t.catering.formSection.sending}
                        </span>
                      ) : (
                        <span className="relative tracking-widest uppercase text-lg">{t.catering.formSection.submit}</span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </m.div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <footer className="bg-kabuki-black py-20 border-t border-neutral-900 text-center">
          <div className="container mx-auto px-6">
              <div className="flex flex-wrap justify-center gap-12 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">
                  <div className="flex items-center gap-2"><Star size={14} className="text-kabuki-red" /> Ingrédients Ultra-Frais</div>
                  <div className="flex items-center gap-2"><Star size={14} className="text-kabuki-red" /> Chefs Maîtres Sushis</div>
                  <div className="flex items-center gap-2"><Star size={14} className="text-kabuki-red" /> Service Clé en Main</div>
              </div>
          </div>
      </footer>
    </div>
  );
}
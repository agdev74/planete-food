"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { ArrowLeft, CheckCircle, AlertTriangle, Save, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";

export default function SettingsPage() {
  const { user, profile } = useUser();
  const params = useParams();
  const lang = typeof params?.lang === 'string' ? params.lang : 'fr';

  const isProcessing = useRef(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setZipCode(profile.zip_code || ""); 
      setCity(profile.city || "");
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); 
    
    if (isProcessing.current || isUpdating) return;
    if (!user) {
      setErrorMsg("Session introuvable. Veuillez recharger la page.");
      return;
    }
    
    isProcessing.current = true;
    setIsUpdating(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ On envoie la langue (lang) pour que l'API puisse vider le bon cache
        body: JSON.stringify({ fullName, phone, address, zipCode, city, lang }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Échec de la sauvegarde réseau.");
      }

      // On met à jour les champs visuels IMMÉDIATEMENT
      if (data.profile) {
        setFullName(data.profile.full_name || "");
        setPhone(data.profile.phone || "");
        setAddress(data.profile.address || "");
        setZipCode(data.profile.zip_code || "");
        setCity(data.profile.city || "");
      }

      setShowSuccess(true);
      
      // ✅ SOLUTION RADICALE : On attend 1.5s pour que l'utilisateur voie le message vert,
      // puis on redirige brutalement vers le profil. Cela force le navigateur à télécharger
      // les données fraîches validées par l'API.
      setTimeout(() => {
        window.location.href = `/${lang}/profile`;
      }, 1500);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      console.error("[SETTINGS_ERROR]:", errorMessage);
      setErrorMsg(errorMessage);
      isProcessing.current = false;
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 text-white">
      <div className="max-w-2xl mx-auto">
        <TransitionLink href={`/${lang}/profile`} className="mb-8 inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors">
          <ArrowLeft size={20} /> <span className="text-xs font-bold uppercase tracking-widest">Retour au profil</span>
        </TransitionLink>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-8">
          <h1 className="text-2xl font-display font-bold uppercase tracking-widest">Mon Profil</h1>
          
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Nom complet</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-brand-primary outline-none transition-all text-sm text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Téléphone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-brand-primary outline-none transition-all text-sm text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Adresse</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-brand-primary outline-none transition-all text-sm text-white" />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
               <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="Code Postal" className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-brand-primary outline-none transition-all text-sm text-white" />
               <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" className="w-full bg-black border border-neutral-800 p-4 rounded-xl focus:border-brand-primary outline-none transition-all text-sm text-white" />
            </div>

            {errorMsg && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-2 text-xs font-bold uppercase animate-pulse">
                <AlertTriangle size={16} className="shrink-0" /> <span className="flex-1 wrap-break-word">{errorMsg}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={isUpdating} 
              className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? <><Loader2 size={18} className="animate-spin" /> Traitement...</> : <><Save size={18} /> Sauvegarder</>}
            </button>
          </form>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle size={20} /> <span className="text-xs font-bold uppercase tracking-widest">Profil mis à jour</span>
        </div>
      )}
    </div>
  );
}
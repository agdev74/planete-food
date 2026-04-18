"use client";

import { useEffect, useState, useMemo } from "react";
import { m } from "framer-motion";
import { X, Minus, Plus, ShoppingCart, Maximize2, Info } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import { useCart, MenuItem as ContextMenuItem, type Variant, type Addon } from "@/context/CartContext";
import TacosBuilder from "@/components/TacosBuilder";
import type { TacosSelection } from "@/types";
import { createClient } from "@/utils/supabase/client";

export interface MenuItem extends ContextMenuItem {
  name_fr: string;
  name_en?: string;
  name_es?: string;
  description_fr: string;
  description_en?: string;
  description_es?: string;
}

interface ProductModalProps {
  item: MenuItem;
  onClose: () => void;
}

const MOCHI_FLAVORS = ["Mangue", "Matcha", "Fleur de cerisier", "Passion"];
const MEAT_QUOTA: Record<"M" | "L" | "XL", number> = { M: 1, L: 2, XL: 3 };

export default function ProductModal({ item, onClose }: ProductModalProps) {
  const { lang } = useTranslation();
  const { addToCart } = useCart();
  const supabase = useMemo(() => createClient(), []);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    item.variants?.[0]
  );
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [tacosSelection, setTacosSelection] = useState<TacosSelection>({ size: null, meats: [], sauces: [], gratin: null, extras: [], friesOnSide: false });
  const [fetchedAddons, setFetchedAddons] = useState<Addon[]>([]);
  const [isLoadingAddons, setIsLoadingAddons] = useState(true);

  // Tableau stockant les parfums pour chaque portion sélectionnée
  const [mochiSelections, setMochiSelections] = useState<[string, string][]>([
    [MOCHI_FLAVORS[0], MOCHI_FLAVORS[0]]
  ]);

  const effectivePrice = selectedVariant ? selectedVariant.price : item.price;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons(prev =>
      prev.find(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const { name, desc } = useMemo(() => {
    const currentLang = lang.toLowerCase();
    const n = currentLang === "es" ? item.name_es : currentLang === "en" ? item.name_en : item.name_fr;
    const d = currentLang === "es" ? item.description_es : currentLang === "en" ? item.description_en : item.description_fr;
    return {
      name: n?.trim() ? n : item.name_fr,
      desc: d?.trim() ? d : item.description_fr
    };
  }, [lang, item]);

  // ✅ DÉTECTION INDESTRUCTIBLE : ID + Nom sans accents
  const isMochi = useMemo(() => {
    if (String(item.id) === "4") return true;
    
    // Fonction pour retirer les accents et passer en minuscules
    const normalize = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
    
    const safeNameFr = normalize(item.name_fr);
    const safeName = normalize(name);
    
    return safeNameFr.includes("mochi") || safeName.includes("mochi");
  }, [item.id, item.name_fr, name]);

 // ✅ DÉTECTION BLINDÉE (ÉLARGIE) POUR LE TACOS
  const isTacos = useMemo(() => {
    // On passe le nom en minuscules pour comparer facilement
    const safeName = name ? name.toLowerCase() : "";
    
    // Si le mot "tacos" est n'importe où dans le nom, c'est gagné !
    if (safeName.includes("tacos")) return true;

    // Sécurité de secours : on vérifie les catégories des addons
    return item.addons?.some((a) => a.category === "meat" || a.category === "viande") ?? false;
  }, [name, item.addons]);

  const isTacosValid = useMemo(() => {
    if (!isTacos) return true;
    if (!tacosSelection.size) return false;
    return tacosSelection.meats.length === MEAT_QUOTA[tacosSelection.size];
  }, [isTacos, tacosSelection.size, tacosSelection.meats]);

  useEffect(() => {
    console.log("[ProductModal] item.restaurant_id =", item.restaurant_id, "| item.id =", item.id);

    if (!item.restaurant_id) {
      console.warn("[ProductModal] Pas de restaurant_id — fetch annulé.");
      setIsLoadingAddons(false);
      return;
    }

    let cancelled = false;
    setIsLoadingAddons(true);

    (async () => {
      try {
        console.log("[ProductModal] Lancement du fetch addons pour restaurant_id:", item.restaurant_id);
        const { data, error } = await supabase
          .from("addons")
          .select("*")
          .eq("restaurant_id", item.restaurant_id);

        if (cancelled) return;

        console.log("Supabase FETCH result:", data);
        if (error) console.error("Supabase FETCH error:", error);

        setFetchedAddons(
          (data ?? []).map((a: Record<string, unknown>) => ({ ...a, id: String(a.id) })) as Addon[]
        );
      } catch (err) {
        if (!cancelled) console.error("Supabase FETCH error:", err);
      } finally {
        if (!cancelled) setIsLoadingAddons(false);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.restaurant_id]);

  // Unified display price: tacos total (base variant + meat surcharges + options) or pizza/generic (variant + addons)
  const displayPrice = useMemo(() => {
    if (isTacos) {
      const sizeVariant = item.variants?.find((v) => v.size === tacosSelection.size);
      const base = sizeVariant ? sizeVariant.price : item.price;
      return base
        + tacosSelection.meats.reduce((s, a) => s + a.price, 0)
        + tacosSelection.sauces.reduce((s, a) => s + a.price, 0)
        + (tacosSelection.gratin?.price ?? 0)
        + tacosSelection.extras.reduce((s, a) => s + a.price, 0);
    }
    return effectivePrice + addonsTotal;
  }, [isTacos, item.price, item.variants, effectivePrice, addonsTotal, tacosSelection]);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1 || newQty > 20) return;
    
    setQuantity(newQty);
    
    if (isMochi) {
      setMochiSelections(prev => {
        const newSelections = [...prev];
        if (newQty > prev.length) {
          for (let i = prev.length; i < newQty; i++) {
            newSelections.push([MOCHI_FLAVORS[0], MOCHI_FLAVORS[0]]);
          }
        } 
        else if (newQty < prev.length) {
          newSelections.splice(newQty);
        }
        return newSelections;
      });
    }
  };

  const updateMochiFlavor = (portionIndex: number, mochiIndex: 0 | 1, flavor: string) => {
    setMochiSelections(prev => {
      const newSelections = [...prev];
      newSelections[portionIndex][mochiIndex] = flavor;
      return newSelections;
    });
  };

  const handleAddToCart = () => {
    const base = {
      id: item.id,
      image_url: item.image_url,
      category: item.category,
      restaurant_id: item.restaurant_id,
      restaurant_name: item.restaurant_name,
    };

    if (isTacos) {
      if (!isTacosValid || !tacosSelection.size) return;
      const allAddons = [
        ...tacosSelection.meats,
        ...tacosSelection.sauces,
        tacosSelection.gratin,
        ...tacosSelection.extras,
      ].filter(Boolean) as Addon[];
      const configKey = `${tacosSelection.size}-${allAddons.map((a) => a.id).join("-")}`;
      const label = [
        `${tacosSelection.size}`,
        tacosSelection.meats.map((m) => m.name).join("+"),
        tacosSelection.sauces.length > 0 ? tacosSelection.sauces.map((s) => s.name).join("+") : null,
        tacosSelection.gratin?.name,
        tacosSelection.extras.length > 0 ? tacosSelection.extras.map((e) => e.name).join("+") : null,
        tacosSelection.friesOnSide ? "Frites à part" : null,
      ].filter(Boolean).join(" | ");
      const pseudoVariant: Variant = { size: configKey, price: displayPrice, label };
      for (let i = 0; i < quantity; i++) {
        addToCart({ ...base, name, price: displayPrice }, { variant: pseudoVariant, addons: allAddons });
      }
      onClose();
      return;
    }

    if (isMochi) {
      mochiSelections.forEach(selection => {
        addToCart({ ...base, name: `${name} (${selection[0]} & ${selection[1]})`, price: item.price });
      });
    } else {
      const variantLabel = selectedVariant?.label ?? selectedVariant?.size;
      const cartName = variantLabel ? `${name} (${variantLabel})` : name;
      const options = {
        variant: selectedVariant,
        addons: selectedAddons.length > 0 ? selectedAddons : undefined,
      };
      for (let i = 0; i < quantity; i++) {
        addToCart({ ...base, name: cartName, price: effectivePrice }, options);
      }
    }
    onClose();
  };

  return (
    <m.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center p-2 md:p-4 bg-black/95 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
    >
      <m.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{ willChange: "transform, opacity" }}
        className="bg-neutral-950 border border-neutral-800 rounded-4xl md:rounded-[3rem] overflow-hidden max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[95vh]"
      >
        <button 
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-6 right-6 z-30 bg-white/10 hover:bg-brand-primary text-white p-3 rounded-full backdrop-blur-md transition-all active:scale-90"
        >
          <X size={24} />
        </button>

        <div className="relative w-full bg-[#050505] h-[40vh] md:h-[45vh] shrink-0 group overflow-hidden border-b border-neutral-900/50">
          {item.image_url ? (
            <Image 
              src={item.image_url} 
              alt={name} 
              fill
              quality={95}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-contain p-4 md:p-10 transition-transform duration-700 group-hover:scale-105"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-800 font-display text-5xl uppercase opacity-10 tracking-[0.4em]">
              [Photo]
            </div>
          )}

          <div className="absolute bottom-4 left-6 flex items-center gap-2 text-white/20 uppercase text-[8px] tracking-[0.3em] font-bold pointer-events-none">
            <Maximize2 size={10} />
            Définition Optimale
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col grow overflow-y-auto no-scrollbar">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-tighter leading-none mb-2">
                {name}
              </h2>
              <span className="text-brand-primary text-[10px] uppercase font-black tracking-[0.4em]">Signature</span>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white whitespace-nowrap">
              {Number(displayPrice).toFixed(2)} <span className="text-xs text-neutral-500 uppercase ml-1">chf</span>
            </div>
          </div>
          
          <div className="mb-8 shrink-0">
            <h4 className="text-neutral-600 text-[10px] uppercase font-black tracking-[0.3em] mb-4">Description de la création</h4>
            <p className="text-neutral-400 text-sm md:text-lg leading-relaxed italic font-light max-w-2xl">
              {desc || "Préparé avec passion et précision."}
            </p>
          </div>

          {/* VARIANT SELECTOR (pizza sizes) */}
          {!isTacos && item.variants && item.variants.length > 0 && (
            <div className="mb-6">
              <h4 className="text-neutral-600 text-[10px] uppercase font-black tracking-[0.3em] mb-3">Taille</h4>
              <div className="grid grid-cols-4 gap-2">
                {item.variants.map((v, idx) => (
                  <button
                    key={v.size || `variant-${idx}`}
                    onClick={() => setSelectedVariant(v)}
                    className={`py-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                      selectedVariant?.size === v.size
                        ? "bg-brand-primary border-brand-primary text-white shadow-glow"
                        : "bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600"
                    }`}
                  >
                    <span className="font-display text-base">{v.size}</span>
                    <span className="text-[9px] opacity-80">{v.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TACOS BUILDER (multi-step stepper) */}
          {isTacos && (
            <div className="mb-6">
              <h4 className="text-neutral-600 text-xs uppercase font-black tracking-widest mb-4">Composition du Tacos</h4>
              {isLoadingAddons ? (
                <p className="text-neutral-400 text-sm py-6 text-center">Chargement des options...</p>
              ) : (
                <TacosBuilder
                  addons={fetchedAddons}
                  variants={item.variants}
                  selection={tacosSelection}
                  onChange={setTacosSelection}
                />
              )}
            </div>
          )}

          {/* ADDON SELECTOR (composable items) */}
          {!isTacos && item.addons && item.addons.length > 0 && (
            <div className="mb-6">
              <h4 className="text-neutral-600 text-[10px] uppercase font-black tracking-[0.3em] mb-3">Garnitures</h4>
              <div className="space-y-2">
                {item.addons.map((addon, idx) => {
                  const isSelected = selectedAddons.some(a => a.id === addon.id);
                  return (
                    <button
                      key={addon.id || `addon-${idx}`}
                      onClick={() => toggleAddon(addon)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition ${
                        isSelected
                          ? "bg-brand-primary/10 border-brand-primary text-white"
                          : "bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600"
                      }`}
                    >
                      <span>{addon.name}</span>
                      <span className={`text-xs ${isSelected ? "text-brand-primary" : "text-neutral-500"}`}>
                        +{addon.price.toFixed(2)} CHF
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DYNAMIC MOCHI SELECTION */}
          {isMochi && (
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                <Info size={14} className="shrink-0" /> Chaque portion contient 2 pièces. Choisissez vos parfums ci-dessous.
              </div>
              
              {mochiSelections.map((selection, idx) => (
                <div key={idx} className="bg-neutral-900 border border-neutral-800 p-4 md:p-5 rounded-2xl">
                  <h5 className="text-[10px] text-brand-primary uppercase font-black tracking-widest mb-4">
                    Portion {idx + 1}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Mochi 1</label>
                      <select 
                        value={selection[0]} 
                        onChange={(e) => updateMochiFlavor(idx, 0, e.target.value)}
                        className="w-full bg-black border border-neutral-800 p-3 md:p-4 rounded-xl outline-none focus:border-brand-primary transition text-white font-bold text-sm appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                      >
                        {MOCHI_FLAVORS.map(flavor => (
                          <option key={`p${idx}-m1-${flavor}`} value={flavor}>{flavor}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Mochi 2</label>
                      <select 
                        value={selection[1]} 
                        onChange={(e) => updateMochiFlavor(idx, 1, e.target.value)}
                        className="w-full bg-black border border-neutral-800 p-3 md:p-4 rounded-xl outline-none focus:border-brand-primary transition text-white font-bold text-sm appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                      >
                        {MOCHI_FLAVORS.map(flavor => (
                          <option key={`p${idx}-m2-${flavor}`} value={flavor}>{flavor}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4 flex flex-col gap-4 w-full shrink-0 border-t border-neutral-900/50">
            <div className="flex items-center justify-between bg-white/5 border border-neutral-800 rounded-2xl min-h-16 h-16 w-full px-4 shrink-0 mt-2">
              <button 
                onClick={() => handleQuantityChange(quantity - 1)}
                className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-white transition-colors active:bg-neutral-800 rounded-xl"
              >
                <Minus size={20} />
              </button>
              
              <span className="font-bold text-white text-xl">
                {quantity}
              </span>
              
              <button 
                onClick={() => handleQuantityChange(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-white transition-colors active:bg-neutral-800 rounded-xl"
              >
                <Plus size={20} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isTacos && !isTacosValid}
              className={`w-full text-white font-bold min-h-16 h-16 rounded-2xl uppercase tracking-[0.15em] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-4 shrink-0 ${
                isTacos && !isTacosValid
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  : "bg-brand-primary hover:bg-violet-700 shadow-glow"
              }`}
            >
              <ShoppingCart size={20} />
              <span>AJOUTER AU PANIER • {(displayPrice * quantity).toFixed(2)} CHF</span>
            </button>
          </div>
        </div>
      </m.div>
    </m.div>
  );
}
"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Flame, Loader2 } from "lucide-react";
import type { Addon, TacosSelection, Variant } from "@/types";

interface TacosBuilderProps {
  addons: Addon[];
  variants?: Variant[];
  selection: TacosSelection;
  onChange: (selection: TacosSelection) => void;
  isLoading?: boolean;
}

const STEP_LABELS = ["Taille", "Viandes", "Sauces", "Gratiné", "Extras"] as const;
const MAX_SAUCES = 2;
const MEAT_QUOTA: Record<"M" | "L" | "XL", number> = { M: 1, L: 2, XL: 3 };

export default function TacosBuilder({ addons, variants, selection, onChange, isLoading = false }: TacosBuilderProps) {
  const [step, setStep] = useState(1);

  const meats   = addons.filter((a) => ["meat", "viande"].includes(a.category?.toLowerCase() ?? ""));
  const sauces  = addons.filter((a) => a.category?.toLowerCase() === "sauce");
  const gratins = addons.filter((a) => a.category?.toLowerCase() === "gratin");
  const extras  = addons.filter((a) => a.category?.toLowerCase() === "extra");

  const quota = selection.size ? MEAT_QUOTA[selection.size] : 0;

  const canAdvance = (() => {
    if (step === 1) return selection.size !== null;
    if (step === 2) return selection.meats.length === quota;
    return true;
  })();

  const handleSize = (size: "M" | "L" | "XL") => {
    onChange({ ...selection, size, meats: [] });
  };

  const handleMeat = (addon: Addon) => {
    const alreadyPicked = selection.meats.some((m) => m.id === addon.id);
    if (alreadyPicked) {
      onChange({ ...selection, meats: selection.meats.filter((m) => m.id !== addon.id) });
    } else if (selection.meats.length < quota) {
      onChange({ ...selection, meats: [...selection.meats, addon] });
    }
  };

  const handleSauce = (addon: Addon) => {
    const picked = selection.sauces.some((s) => s.id === addon.id);
    if (picked) {
      onChange({ ...selection, sauces: selection.sauces.filter((s) => s.id !== addon.id) });
    } else if (selection.sauces.length < MAX_SAUCES) {
      onChange({ ...selection, sauces: [...selection.sauces, addon] });
    }
  };

  const handleGratin = (addon: Addon) => {
    if (selection.gratin?.id === addon.id) {
      onChange({ ...selection, gratin: null });
    } else {
      onChange({ ...selection, gratin: addon });
    }
  };

  const handleExtra = (addon: Addon) => {
    const picked = selection.extras.some((e) => e.id === addon.id);
    if (picked) {
      onChange({ ...selection, extras: selection.extras.filter((e) => e.id !== addon.id) });
    } else {
      onChange({ ...selection, extras: [...selection.extras, addon] });
    }
  };

  const LAST_STEP = 5;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-neutral-500">
        <Loader2 size={28} className="animate-spin text-brand-primary" />
        <span className="text-xs uppercase font-black tracking-widest">Chargement des options…</span>
      </div>
    );
  }

  if (!isLoading && addons.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-neutral-600 text-sm italic">
        Aucune option disponible pour ce restaurant.
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Step indicator ── */}
      <div className="flex items-center justify-center gap-1 flex-wrap">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < step;
          const isCurrent = stepNum === step;
          return (
            <div key={i} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { if (isDone) setStep(stepNum); }}
                disabled={!isDone && !isCurrent}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase transition-all ${
                  isCurrent
                    ? "bg-brand-primary text-white shadow-glow"
                    : isDone
                    ? "bg-brand-primary/20 text-brand-primary cursor-pointer"
                    : "bg-neutral-800 text-neutral-500 cursor-default"
                }`}
              >
                {isDone
                  ? <Check size={10} strokeWidth={3} />
                  : <span className="w-3 text-center leading-none">{stepNum}</span>
                }
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEP_LABELS.length - 1 && (
                <div className={`w-4 h-px transition-colors ${isDone ? "bg-brand-primary" : "bg-neutral-700"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step content ── */}
      <AnimatePresence mode="wait">
        <m.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18 }}
          className="space-y-2"
        >

          {/* STEP 1 — Taille */}
          {step === 1 && (
            <>
              <p className="text-neutral-500 text-xs uppercase font-black tracking-widest mb-3">
                Choix obligatoire
              </p>
              {(["M", "L", "XL"] as const).map((size) => {
                const variant = variants?.find((v) => v.size === size);
                const active = selection.size === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSize(size)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      active
                        ? "bg-brand-primary/10 border-brand-primary text-white shadow-glow"
                        : "bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xl w-8">{size}</span>
                      <span className="text-xs font-normal text-neutral-400">
                        {MEAT_QUOTA[size]} viande{MEAT_QUOTA[size] > 1 ? "s" : ""}
                      </span>
                    </div>
                    {variant && (
                      <span className={`text-xs font-bold ${active ? "text-brand-primary" : "text-neutral-500"}`}>
                        {variant.price.toFixed(2)} CHF
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {/* STEP 2 — Viandes */}
          {step === 2 && (
            <>
              <p className="text-neutral-500 text-xs uppercase font-black tracking-widest mb-3">
                {selection.meats.length}/{quota} viande{quota > 1 ? "s" : ""}
                {selection.meats.length === quota && (
                  <span className="ml-2 text-brand-primary">✓ Complet</span>
                )}
              </p>
              {meats.map((meat) => {
                const active = selection.meats.some((m) => m.id === meat.id);
                const locked = !active && selection.meats.length >= quota;
                return (
                  <button
                    key={meat.id}
                    type="button"
                    onClick={() => handleMeat(meat)}
                    disabled={locked}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      active
                        ? "bg-brand-primary/10 border-brand-primary text-white shadow-glow"
                        : locked
                        ? "bg-neutral-900/40 border-neutral-800/40 text-neutral-600 cursor-not-allowed"
                        : "bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Flame size={14} className={active ? "text-brand-primary" : "text-neutral-600"} />
                      <span>{meat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {meat.price > 0 && (
                        <span className={`text-xs ${active ? "text-brand-primary" : "text-neutral-500"}`}>
                          +{meat.price.toFixed(2)} CHF
                        </span>
                      )}
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        active ? "bg-brand-primary border-brand-primary" : "border-neutral-600"
                      }`}>
                        {active && <Check size={10} strokeWidth={3} className="text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* STEP 3 — Sauces */}
          {step === 3 && (
            <>
              <p className="text-neutral-500 text-xs uppercase font-black tracking-widest mb-3">
                {selection.sauces.length}/{MAX_SAUCES} sauces — Optionnel
              </p>
              {sauces.map((sauce) => {
                const active = selection.sauces.some((s) => s.id === sauce.id);
                const locked = !active && selection.sauces.length >= MAX_SAUCES;
                return (
                  <button
                    key={sauce.id}
                    type="button"
                    onClick={() => handleSauce(sauce)}
                    disabled={locked}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      active
                        ? "bg-brand-primary/10 border-brand-primary text-white shadow-glow"
                        : locked
                        ? "bg-neutral-900/40 border-neutral-800/40 text-neutral-600 cursor-not-allowed"
                        : "bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600"
                    }`}
                  >
                    <span>{sauce.name}</span>
                    <div className="flex items-center gap-2">
                      {sauce.price > 0 && (
                        <span className={`text-xs ${active ? "text-brand-primary" : "text-neutral-500"}`}>
                          +{sauce.price.toFixed(2)} CHF
                        </span>
                      )}
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        active ? "bg-brand-primary border-brand-primary" : "border-neutral-600"
                      }`}>
                        {active && <Check size={10} strokeWidth={3} className="text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* STEP 4 — Gratiné */}
          {step === 4 && (
            <>
              <p className="text-neutral-500 text-xs uppercase font-black tracking-widest mb-3">
                Optionnel — 1 choix max
              </p>
              {gratins.map((gratin) => {
                const active = selection.gratin?.id === gratin.id;
                return (
                  <button
                    key={gratin.id}
                    type="button"
                    onClick={() => handleGratin(gratin)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      active
                        ? "bg-brand-primary/10 border-brand-primary text-white shadow-glow"
                        : "bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600"
                    }`}
                  >
                    <span>{gratin.name}</span>
                    <div className="flex items-center gap-2">
                      {gratin.price > 0 && (
                        <span className={`text-xs ${active ? "text-brand-primary" : "text-neutral-500"}`}>
                          +{gratin.price.toFixed(2)} CHF
                        </span>
                      )}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        active ? "bg-brand-primary border-brand-primary" : "border-neutral-600"
                      }`}>
                        {active && <Check size={10} strokeWidth={3} className="text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
              {gratins.length === 0 && (
                <p className="text-neutral-600 text-sm italic px-1">Aucun gratiné disponible.</p>
              )}
            </>
          )}

          {/* STEP 5 — Extras + Frites + Récap */}
          {step === 5 && (
            <>
              {extras.length > 0 && (
                <>
                  <p className="text-neutral-500 text-xs uppercase font-black tracking-widest mb-3">
                    Extras — Optionnel
                  </p>
                  {extras.map((extra) => {
                    const active = selection.extras.some((e) => e.id === extra.id);
                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => handleExtra(extra)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                          active
                            ? "bg-brand-primary/10 border-brand-primary text-white shadow-glow"
                            : "bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600"
                        }`}
                      >
                        <span>{extra.name}</span>
                        <div className="flex items-center gap-2">
                          {extra.price > 0 && (
                            <span className={`text-xs ${active ? "text-brand-primary" : "text-neutral-500"}`}>
                              +{extra.price.toFixed(2)} CHF
                            </span>
                          )}
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            active ? "bg-brand-primary border-brand-primary" : "border-neutral-600"
                          }`}>
                            {active && <Check size={10} strokeWidth={3} className="text-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}

              {/* Frites à part */}
              <button
                type="button"
                onClick={() => onChange({ ...selection, friesOnSide: !selection.friesOnSide })}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all ${extras.length > 0 ? "mt-2" : ""} ${
                  selection.friesOnSide
                    ? "bg-brand-primary/10 border-brand-primary text-white shadow-glow"
                    : "bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600"
                }`}
              >
                <span>Frites à part</span>
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  selection.friesOnSide ? "bg-brand-primary border-brand-primary" : "border-neutral-600"
                }`}>
                  {selection.friesOnSide && <Check size={10} strokeWidth={3} className="text-white" />}
                </div>
              </button>

              {/* Récap */}
              <div className="mt-4 p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs text-neutral-400 space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-neutral-600 mb-2">Récapitulatif</p>
                <p><span className="text-white font-bold">Taille :</span> {selection.size}</p>
                <p><span className="text-white font-bold">Viandes :</span> {selection.meats.map((m) => m.name).join(", ")}</p>
                {selection.sauces.length > 0 && (
                  <p><span className="text-white font-bold">Sauces :</span> {selection.sauces.map((s) => s.name).join(", ")}</p>
                )}
                {selection.gratin && (
                  <p><span className="text-white font-bold">Gratiné :</span> {selection.gratin.name}</p>
                )}
                {selection.extras.length > 0 && (
                  <p><span className="text-white font-bold">Extras :</span> {selection.extras.map((e) => e.name).join(", ")}</p>
                )}
                {selection.friesOnSide && (
                  <p><span className="text-white font-bold">+ Frites à part</span></p>
                )}
              </div>
            </>
          )}

        </m.div>
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div className="flex gap-3 pt-1">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-black uppercase text-neutral-300 hover:text-white transition-colors"
          >
            <ChevronLeft size={14} /> Retour
          </button>
        )}
        {step < LAST_STEP && (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
              canAdvance
                ? "bg-brand-primary text-white hover:bg-violet-700"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
            }`}
          >
            Suivant <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import type { Addon, TacosSelection } from "@/types";

interface TacosBuilderProps {
  addons: Addon[];
  selection: TacosSelection;
  onChange: (selection: TacosSelection) => void;
}

const STEP_LABELS = ["Viande", "Sauces", "Gratiné"] as const;
const MAX_SAUCES = 2;

export default function TacosBuilder({ addons, selection, onChange }: TacosBuilderProps) {
  const [step, setStep] = useState(0);

  const meats   = addons.filter((a) => a.category === "meat");
  const sauces  = addons.filter((a) => a.category === "sauce");
  const gratins = addons.filter((a) => a.category === "gratin");

  const canAdvance = step === 0 ? selection.meat !== null : true;

  const handleMeat = (addon: Addon) => onChange({ ...selection, meat: addon });

  const handleSauce = (addon: Addon) => {
    const picked = selection.sauces.some((s) => s.id === addon.id);
    if (picked) {
      onChange({ ...selection, sauces: selection.sauces.filter((s) => s.id !== addon.id) });
    } else if (selection.sauces.length < MAX_SAUCES) {
      onChange({ ...selection, sauces: [...selection.sauces, addon] });
    }
  };

  const handleGratin = (addon: Addon | null) => onChange({ ...selection, gratin: addon });

  return (
    <div className="space-y-5">

      {/* ── Step indicator ── */}
      <div className="flex items-center justify-center gap-1">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => { if (i < step || (i === step + 1 && canAdvance)) setStep(i); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase transition-all ${
                i === step
                  ? "bg-brand-primary text-white shadow-glow"
                  : i < step
                  ? "bg-brand-primary/20 text-brand-primary cursor-pointer"
                  : "bg-neutral-800 text-neutral-500 cursor-default"
              }`}
            >
              {i < step
                ? <Check size={10} strokeWidth={3} />
                : <span className="w-3 text-center leading-none">{i + 1}</span>
              }
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-5 h-px transition-colors ${i < step ? "bg-brand-primary" : "bg-neutral-700"}`} />
            )}
          </div>
        ))}
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
          {step === 0 && (
            <>
              <p className="text-neutral-500 text-xs uppercase font-black tracking-widest mb-3">
                Choix obligatoire
              </p>
              {meats.map((meat) => {
                const active = selection.meat?.id === meat.id;
                return (
                  <button
                    key={meat.id}
                    type="button"
                    onClick={() => handleMeat(meat)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      active
                        ? "bg-brand-primary/10 border-brand-primary text-white"
                        : "bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600"
                    }`}
                  >
                    <span>{meat.name}</span>
                    {meat.price > 0 && (
                      <span className={`text-xs ${active ? "text-brand-primary" : "text-neutral-500"}`}>
                        +{meat.price.toFixed(2)} CHF
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-neutral-500 text-xs uppercase font-black tracking-widest mb-3">
                {selection.sauces.length}/{MAX_SAUCES} sauces
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
                        ? "bg-brand-primary/10 border-brand-primary text-white"
                        : locked
                        ? "bg-neutral-900/40 border-neutral-800/40 text-neutral-600 cursor-not-allowed"
                        : "bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600"
                    }`}
                  >
                    <span>{sauce.name}</span>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      active ? "bg-brand-primary border-brand-primary" : "border-neutral-600"
                    }`}>
                      {active && <Check size={10} strokeWidth={3} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-neutral-500 text-xs uppercase font-black tracking-widest mb-3">
                Optionnel
              </p>
              <button
                type="button"
                onClick={() => handleGratin(null)}
                className={`w-full flex items-center px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                  selection.gratin === null
                    ? "bg-brand-primary/10 border-brand-primary text-white"
                    : "bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600"
                }`}
              >
                Sans gratiné
              </button>
              {gratins.map((gratin) => {
                const active = selection.gratin?.id === gratin.id;
                return (
                  <button
                    key={gratin.id}
                    type="button"
                    onClick={() => handleGratin(gratin)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      active
                        ? "bg-brand-primary/10 border-brand-primary text-white"
                        : "bg-neutral-900 border-neutral-800 text-gray-400 hover:border-neutral-600"
                    }`}
                  >
                    <span>{gratin.name}</span>
                    {gratin.price > 0 && (
                      <span className={`text-xs ${active ? "text-brand-primary" : "text-neutral-500"}`}>
                        +{gratin.price.toFixed(2)} CHF
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Recap */}
              {selection.meat && (
                <div className="mt-4 p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs text-neutral-400 space-y-0.5">
                  <p><span className="text-white font-bold">Viande :</span> {selection.meat.name}</p>
                  {selection.sauces.length > 0 && (
                    <p><span className="text-white font-bold">Sauces :</span> {selection.sauces.map(s => s.name).join(", ")}</p>
                  )}
                  {selection.gratin && (
                    <p><span className="text-white font-bold">Gratiné :</span> {selection.gratin.name}</p>
                  )}
                </div>
              )}
            </>
          )}
        </m.div>
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div className="flex gap-3 pt-1">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-black uppercase text-neutral-300 hover:text-white transition-colors"
          >
            <ChevronLeft size={14} /> Retour
          </button>
        )}
        {step < 2 && (
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

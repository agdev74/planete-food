"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import OrderTracker from "@/components/OrderTracker";
import { Loader2 } from "lucide-react";

const STORAGE_KEY = "planet_food_last_order";

function TrackContent() {
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("order_id");

  const [orderId, setOrderId] = useState<number | null>(
    urlOrderId ? Number(urlOrderId) : null
  );

  useEffect(() => {
    if (urlOrderId) {
      localStorage.setItem(STORAGE_KEY, urlOrderId);
    } else {
      const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("pf_active_order");
      if (saved) setOrderId(Number(saved));
    }
  }, [urlOrderId]);

  const handleDelivered = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("pf_active_order");
  }, []);

  return (
    <div className="container mx-auto">
      {orderId ? (
        <OrderTracker orderId={orderId} onDelivered={handleDelivered} />
      ) : (
        <div className="text-center text-gray-500 font-bold uppercase tracking-widest mt-20">
          <Loader2 className="animate-spin mx-auto mb-4" />
          Recherche de votre commande...
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4">
      <Suspense
        fallback={
          <div className="flex flex-col items-center mt-20 text-brand-primary">
            <Loader2 className="animate-spin mb-4" size={32} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Chargement...</span>
          </div>
        }
      >
        <TrackContent />
      </Suspense>
    </div>
  );
}

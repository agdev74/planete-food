"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  ChefHat, Clock, Loader2, Volume2, VolumeX, RefreshCw,
  Truck, ShoppingBag, CheckCircle2, Flame,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

interface OrderItem {
  id?: number | string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  pickup_time: string;
  order_type: string;
  total_amount: number;
  items: OrderItem[];
  status: string;
  restaurant_id: number | null;
  comments?: string;
}

interface RestaurantOption {
  id: number;
  name: string;
}

const COLUMNS = [
  {
    status: "Payé",
    label: "Nouvelles",
    nextStatus: "En préparation",
    btnLabel: "Lancer la prépa",
    colBorder: "border-amber-500/20",
    colBg: "bg-amber-500/5",
    headerBg: "bg-amber-500/10",
    headerText: "text-amber-400",
    headerBorder: "border-amber-500/30",
    cardBorder: "border-amber-500/40",
    hasRing: true,
    btnClass: "bg-amber-500 hover:bg-amber-600 text-black",
    BtnIcon: Flame,
  },
  {
    status: "En préparation",
    label: "En Préparation",
    nextStatus: "Prête",
    btnLabel: "Marquer Prête",
    colBorder: "border-blue-500/20",
    colBg: "bg-blue-500/5",
    headerBg: "bg-blue-500/10",
    headerText: "text-blue-400",
    headerBorder: "border-blue-500/30",
    cardBorder: "border-blue-500/30",
    hasRing: false,
    btnClass: "bg-blue-500 hover:bg-blue-600 text-white",
    BtnIcon: CheckCircle2,
  },
  {
    status: "Prête",
    label: "Prêtes",
    nextStatus: "Livrée",
    btnLabel: "Livrée ✓",
    colBorder: "border-green-500/20",
    colBg: "bg-green-500/5",
    headerBg: "bg-green-500/10",
    headerText: "text-green-400",
    headerBorder: "border-green-500/30",
    cardBorder: "border-green-500/30",
    hasRing: false,
    btnClass: "bg-green-500 hover:bg-green-600 text-white",
    BtnIcon: CheckCircle2,
  },
] as const;

function timeAgo(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (diff < 1) return "À l'instant";
  if (diff === 1) return "Il y a 1 min";
  return `Il y a ${diff} min`;
}

export default function KitchenPage() {
  const supabase = useMemo(() => createClient(), []);
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.wav");
    audioRef.current.load();
    const saved = localStorage.getItem("pf_kds_sound");
    if (saved !== null) setIsSoundEnabled(saved === "true");
  }, []);

  const playNotification = useCallback(() => {
    if (isSoundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [isSoundEnabled]);

  const toggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    localStorage.setItem("pf_kds_sound", String(next));
    if (audioRef.current) audioRef.current.play().catch(() => {});
  };

  // Fetch restaurants once
  useEffect(() => {
    supabase
      .from("restaurants")
      .select("id, name")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setRestaurants(data as RestaurantOption[]);
          setActiveRestaurantId((data as RestaurantOption[])[0].id);
        }
      });
  }, [supabase]);

  // Fetch active orders for today
  const fetchOrders = useCallback(async () => {
    if (activeRestaurantId === null) return;
    setLoading(true);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", activeRestaurantId)
      .in("status", ["Payé", "En préparation", "Prête"])
      .gte("created_at", todayStart.toISOString())
      .order("created_at", { ascending: true });
    if (data) setOrders(data as Order[]);
    if (error) console.error("KDS fetch:", error);
    setLoading(false);
  }, [supabase, activeRestaurantId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Realtime subscription — unsubscribed on restaurant change or unmount
  useEffect(() => {
    if (activeRestaurantId === null) return;

    const channel = supabase
      .channel(`kds-${activeRestaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${activeRestaurantId}`,
        },
        (payload) => {
          const order = payload.new as Order;
          if (["Payé", "En préparation", "Prête"].includes(order.status)) {
            setOrders((prev) => [...prev, order]);
            playNotification();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${activeRestaurantId}`,
        },
        (payload) => {
          const updated = payload.new as Order;
          if (["Livrée", "Annulée"].includes(updated.status)) {
            setOrders((prev) => prev.filter((o) => o.id !== updated.id));
          } else {
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, activeRestaurantId, playNotification]);

  const updateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    // Optimistic update (Realtime will confirm)
    if (["Livrée", "Annulée"].includes(newStatus)) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
    setUpdatingId(null);
  };

  const ordersByStatus = useMemo(() => {
    const map: Record<string, Order[]> = {
      "Payé": [],
      "En préparation": [],
      "Prête": [],
    };
    orders.forEach((o) => {
      if (o.status in map) map[o.status].push(o);
    });
    return map;
  }, [orders]);

  const newCount = ordersByStatus["Payé"].length;
  const totalActive = orders.length;

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 md:px-6">

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white flex items-center gap-3">
            <ChefHat className="text-brand-primary" size={28} />
            Kitchen Display
          </h1>
          {totalActive > 0 && (
            <span className="bg-neutral-800 border border-neutral-700 text-white text-xs font-black px-3 py-1 rounded-full uppercase">
              {totalActive} actif{totalActive > 1 ? "s" : ""}
            </span>
          )}
          {newCount > 0 && (
            <span className="bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-full uppercase animate-pulse">
              {newCount} nouveau{newCount > 1 ? "x" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all border ${
              isSoundEnabled
                ? "bg-green-500/10 border-green-500/30 text-green-500"
                : "bg-neutral-900 border-neutral-800 text-neutral-500"
            }`}
          >
            {isSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {isSoundEnabled ? "Son ON" : "Son OFF"}
          </button>
          <button
            onClick={() => fetchOrders()}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <RefreshCw size={14} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Restaurant tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {restaurants.length === 0 ? (
          <div className="flex items-center gap-2 text-neutral-600 text-xs uppercase font-bold tracking-widest">
            <Loader2 size={14} className="animate-spin" /> Chargement des enseignes…
          </div>
        ) : (
          restaurants.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveRestaurantId(r.id)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                activeRestaurantId === r.id
                  ? "bg-brand-primary border-brand-primary text-white shadow-glow"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
              }`}
            >
              {r.name}
            </button>
          ))
        )}
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-neutral-600">
          <Loader2 size={36} className="animate-spin text-brand-primary" />
          <p className="text-xs uppercase font-bold tracking-widest">Chargement des tickets…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {COLUMNS.map((col) => {
            const colOrders = ordersByStatus[col.status] ?? [];
            return (
              <div
                key={col.status}
                className={`rounded-2xl border ${col.colBorder} ${col.colBg} flex flex-col`}
              >
                {/* Column header */}
                <div
                  className={`flex items-center justify-between px-4 py-3 rounded-t-2xl border-b ${col.headerBorder} ${col.headerBg}`}
                >
                  <span className={`text-xs font-black uppercase tracking-widest ${col.headerText}`}>
                    {col.label}
                  </span>
                  <span
                    className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full border ${col.headerBg} ${col.headerText} ${col.headerBorder}`}
                  >
                    {colOrders.length}
                  </span>
                </div>

                {/* Ticket list */}
                <div className="flex flex-col gap-3 p-3 min-h-48">
                  <AnimatePresence mode="popLayout">
                    {colOrders.length === 0 && (
                      <m.p
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-10 text-neutral-700 text-xs uppercase font-bold tracking-widest"
                      >
                        Aucun ticket
                      </m.p>
                    )}
                    {colOrders.map((order) => (
                      <m.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.18 }}
                        className="relative"
                      >
                        {/* Pulsing amber ring on new orders */}
                        {col.hasRing && (
                          <div className="absolute inset-0 rounded-2xl ring-1 ring-amber-500/60 animate-pulse pointer-events-none" />
                        )}

                        <div className={`bg-neutral-900 border rounded-2xl p-4 space-y-3 ${col.cardBorder}`}>

                          {/* Header row */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="bg-brand-primary text-white text-sm font-black px-2.5 py-0.5 rounded-lg italic shrink-0">
                              #KBK-{order.id}
                            </span>
                            <span
                              className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg border shrink-0 ${
                                order.order_type === "Livraison"
                                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              }`}
                            >
                              {order.order_type === "Livraison" ? (
                                <Truck size={10} />
                              ) : (
                                <ShoppingBag size={10} />
                              )}
                              {order.order_type}
                            </span>
                          </div>

                          {/* Customer + time */}
                          <div>
                            <p className="text-white font-black text-base uppercase leading-tight truncate">
                              {order.customer_name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-neutral-500 text-xs">
                              <Clock size={10} />
                              <span>{timeAgo(order.created_at)}</span>
                              {order.pickup_time && (
                                <>
                                  <span>·</span>
                                  <span className="text-white font-bold">{order.pickup_time}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Items */}
                          <ul className="space-y-1 border-t border-neutral-800 pt-2">
                            {(order.items ?? []).map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                                <span className="w-5 h-5 bg-neutral-800 rounded-md flex items-center justify-center font-black text-brand-primary shrink-0">
                                  {item.quantity}
                                </span>
                                <span className="font-bold truncate">{item.name}</span>
                              </li>
                            ))}
                          </ul>

                          {/* Chef note / allergy */}
                          {order.comments && (
                            <p className="text-xs text-amber-400 italic border-l-2 border-amber-500/50 pl-2 leading-relaxed">
                              {order.comments}
                            </p>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
                            <span className="text-white font-black text-sm">
                              {Number(order.total_amount).toFixed(2)}{" "}
                              <span className="text-brand-primary text-xs">CHF</span>
                            </span>
                            <button
                              onClick={() => updateStatus(order.id, col.nextStatus)}
                              disabled={updatingId === order.id}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all active:scale-95 disabled:opacity-50 ${col.btnClass}`}
                            >
                              {updatingId === order.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <col.BtnIcon size={12} />
                              )}
                              {col.btnLabel}
                            </button>
                          </div>
                        </div>
                      </m.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

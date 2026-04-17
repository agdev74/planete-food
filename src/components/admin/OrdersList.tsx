"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Package, User, MapPin, Eye, XCircle, Calendar, CheckCircle2,
  AlertCircle, ChefHat, Truck, Loader2, RefreshCw, Clock,
  MessageSquare, Volume2, VolumeX, ShoppingBag, Flame,
  LayoutDashboard, List,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
  id?: number | string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  pickup_date: string;
  pickup_time: string;
  order_type: string;
  total_amount: number;
  items: OrderItem[];
  status: string;
  delivery_address?: string;
  delivery_zip?: string;
  comments?: string;
  restaurant_id?: number | null;
}

interface RestaurantOption {
  id: number;
  name: string;
}

// ─── Kanban column definitions ────────────────────────────────────────────────

const KANBAN_COLS = [
  {
    status: "Payé" as const,
    label: "Nouvelles",
    nextStatus: "En préparation",
    btnLabel: "Lancer la prépa",
    colBorder: "border-amber-500/20",
    colBg: "bg-amber-500/5",
    headerBg: "bg-amber-500/10",
    headerText: "text-amber-400",
    headerBorder: "border-amber-500/30",
    cardBorder: "border-amber-500/40",
    hasRing: true as const,
    btnCls: "bg-amber-500 hover:bg-amber-600 text-black",
    BtnIcon: Flame,
  },
  {
    status: "En préparation" as const,
    label: "En Préparation",
    nextStatus: "Prête",
    btnLabel: "Marquer Prête",
    colBorder: "border-blue-500/20",
    colBg: "bg-blue-500/5",
    headerBg: "bg-blue-500/10",
    headerText: "text-blue-400",
    headerBorder: "border-blue-500/30",
    cardBorder: "border-blue-500/30",
    hasRing: false as const,
    btnCls: "bg-blue-500 hover:bg-blue-600 text-white",
    BtnIcon: CheckCircle2,
  },
  {
    status: "Prête" as const,
    label: "Prêtes",
    nextStatus: "Livrée",
    btnLabel: "Livrée ✓",
    colBorder: "border-green-500/20",
    colBg: "bg-green-500/5",
    headerBg: "bg-green-500/10",
    headerText: "text-green-400",
    headerBorder: "border-green-500/30",
    cardBorder: "border-green-500/30",
    hasRing: false as const,
    btnCls: "bg-green-500 hover:bg-green-600 text-white",
    BtnIcon: CheckCircle2,
  },
] as const;

type KanbanStatus = (typeof KANBAN_COLS)[number]["status"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "À l'instant";
  if (min === 1) return "Il y a 1 min";
  return `Il y a ${min} min`;
}

function getListStyle(status: string) {
  switch (status) {
    case "Payé":
      return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: <AlertCircle size={10} />, next: "En préparation", btnLabel: "Accepter", btnIcon: <ChefHat size={14} /> };
    case "En préparation":
      return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", icon: <ChefHat size={10} />, next: "Prête", btnLabel: "Prête", btnIcon: <CheckCircle2 size={14} /> };
    case "Prête":
      return { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", icon: <Truck size={10} />, next: "Livrée", btnLabel: "Livrée", btnIcon: <Package size={14} /> };
    case "Livrée":
      return { bg: "bg-neutral-800/50", text: "text-gray-500", border: "border-neutral-800", icon: <CheckCircle2 size={10} />, next: null, btnLabel: "", btnIcon: null };
    case "Annulée":
      return { bg: "bg-red-900/20", text: "text-red-500", border: "border-red-900/30", icon: <XCircle size={10} />, next: null, btnLabel: "", btnIcon: null };
    default:
      return { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/20", icon: <Clock size={10} />, next: null, btnLabel: "", btnIcon: null };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrdersList() {
  const supabase = useMemo(() => createClient(), []);

  // View state
  const [activeView, setActiveView] = useState<"kanban" | "list">("kanban");

  // Restaurant tabs (kanban)
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [restaurantsLoaded, setRestaurantsLoaded] = useState(false);
  const [activeRestaurantId, setActiveRestaurantId] = useState<number | null>(null);

  // Shared orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // List-only
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Kanban-only
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // ── Sound (ref pattern keeps playNotification stable so it never invalidates effects) ──
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSoundRef = useRef(isSoundEnabled);
  useEffect(() => { isSoundRef.current = isSoundEnabled; }, [isSoundEnabled]);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.wav");
    audioRef.current.load();
    const saved = localStorage.getItem("pf_admin_sound");
    if (saved !== null) setIsSoundEnabled(saved === "true");
  }, []);

  // Stable forever — reads through ref, never listed as effect dep
  const playNotification = useCallback(() => {
    if (isSoundRef.current && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const toggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    localStorage.setItem("pf_admin_sound", String(next));
    if (audioRef.current) audioRef.current.play().catch(() => {});
  };

  // ── Fetch restaurants once ──────────────────────────────────────────────────
  useEffect(() => {
    // Safety: if fetch hangs for any reason, unblock the UI after 5 s
    const safetyTimer = setTimeout(() => {
      console.warn("[SAFETY] Restaurant fetch timeout after 5s (commandes) — UI unblocked");
      setRestaurantsLoaded(true);
    }, 5000);

    (async () => {
      try {
        console.log("[DIAG] Début fetch restaurants (commandes)…");
        const { data, error } = await supabase
          .from("restaurants")
          .select("id, name")
          .order("name");
        if (error) console.error("[DIAG] Erreur fetch restaurants (commandes):", error);
        console.log("[DIAG] Restaurants chargés (commandes):", data);
        if (data && data.length > 0) {
          setRestaurants(data as RestaurantOption[]);
          setActiveRestaurantId((data as RestaurantOption[])[0].id);
        }
      } finally {
        clearTimeout(safetyTimer);
        setRestaurantsLoaded(true);
      }
    })();

    return () => clearTimeout(safetyTimer);
  }, [supabase]);

  // ── Data fetch functions ────────────────────────────────────────────────────

  // List: global, all statuses — stable (supabase never changes)
  const fetchListOrders = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .neq("status", "Paiement en cours")
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  }, [supabase]);

  // Receives restaurantId as a parameter — stable forever, deps: [supabase] only.
  const fetchKanbanOrders = useCallback(async (restaurantId: number) => {
    setLoading(true);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .in("status", ["Payé", "En préparation", "Prête"])
      .gte("created_at", todayStart.toISOString())
      .order("created_at", { ascending: true });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  }, [supabase]);

  // ── Fetch effects ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (activeView !== "list") return;
    fetchListOrders(true);
  }, [activeView, fetchListOrders]);

  // Single kanban effect: runs when view switches to kanban OR restaurant changes.
  // fetchKanbanOrders is stable so this never fires spuriously.
  useEffect(() => {
    if (activeView !== "kanban" || !activeRestaurantId) return;
    fetchKanbanOrders(activeRestaurantId);
  }, [activeView, activeRestaurantId, fetchKanbanOrders]);

  // ── List Realtime — re-fetches on events (manager global view) ───────────────
  // Deps: [supabase, activeView, fetchListOrders, playNotification] — all stable
  useEffect(() => {
    if (activeView !== "list") return;
    const channel = supabase
      .channel("admin-list-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        if (payload.new?.status === "Payé") playNotification();
        fetchListOrders();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        if (payload.new?.status === "Payé" && payload.old?.status !== "Payé") playNotification();
        fetchListOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, activeView, fetchListOrders, playNotification]);

  // ── Kanban Realtime — direct state mutations, no re-fetch ────────────────────
  // Recreates only when restaurant changes; playNotification is stable
  useEffect(() => {
    if (activeView !== "kanban" || !activeRestaurantId) return;
    const channel = supabase
      .channel(`kanban-orders-${activeRestaurantId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `restaurant_id=eq.${activeRestaurantId}` },
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
        { event: "UPDATE", schema: "public", table: "orders", filter: `restaurant_id=eq.${activeRestaurantId}` },
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
    return () => { supabase.removeChannel(channel); };
  }, [supabase, activeView, activeRestaurantId, playNotification]);

  // ── Update status ────────────────────────────────────────────────────────────

  const updateStatus = async (orderId: number, newStatus: string) => {
    if (activeView === "kanban") setUpdatingId(orderId);
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) { console.error("updateStatus:", error); setUpdatingId(null); return; }

    if (activeView === "kanban") {
      // Optimistic — Realtime echo will be a no-op since state already matches
      if (["Livrée", "Annulée"].includes(newStatus)) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      }
      setUpdatingId(null);
    } else {
      // List: update open modal optimistically; Realtime will re-fetch orders[]
      setSelectedOrder((prev) => (prev?.id === orderId ? { ...prev, status: newStatus } : prev));
    }
  };

  const handleRefund = async (orderId: number) => {
    if (!window.confirm("Annuler et rembourser cette commande ?")) return;
    try {
      const res = await fetch("/api/refund-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) throw new Error("Erreur");
      await updateStatus(orderId, "Annulée");
      setSelectedOrder(null);
    } catch {
      alert("Erreur lors de l'annulation");
    }
  };

  // ── Computed ─────────────────────────────────────────────────────────────────

  const kanbanByStatus = useMemo<Record<KanbanStatus, Order[]>>(() => ({
    "Payé": orders.filter((o) => o.status === "Payé"),
    "En préparation": orders.filter((o) => o.status === "En préparation"),
    "Prête": orders.filter((o) => o.status === "Prête"),
  }), [orders]);

  const newCount = kanbanByStatus["Payé"].length;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest flex items-center gap-3">
            <ChefHat className="text-brand-primary" /> Commandes
          </h2>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-black rounded-xl p-1 border border-neutral-800">
            <button
              type="button"
              onClick={() => setActiveView("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeView === "kanban" ? "bg-brand-primary text-white" : "text-neutral-500 hover:text-white"
              }`}
            >
              <LayoutDashboard size={13} /> Cuisine
            </button>
            <button
              type="button"
              onClick={() => setActiveView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                activeView === "list" ? "bg-brand-primary text-white" : "text-neutral-500 hover:text-white"
              }`}
            >
              <List size={13} /> Manager
            </button>
          </div>

          {activeView === "kanban" && newCount > 0 && (
            <span className="bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-full animate-pulse uppercase">
              {newCount} nouveau{newCount > 1 ? "x" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all border ${
              isSoundEnabled
                ? "bg-green-500/10 border-green-500/30 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {isSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {isSoundEnabled ? "Alertes ON" : "Alertes OFF"}
          </button>
          <button
            onClick={() => activeView === "kanban" && activeRestaurantId ? fetchKanbanOrders(activeRestaurantId) : fetchListOrders(true)}
            className="flex items-center gap-2 text-xs bg-neutral-800 hover:bg-neutral-700 text-gray-400 px-4 py-2 rounded-full uppercase font-bold transition border border-neutral-700"
          >
            <RefreshCw size={12} /> Actualiser
          </button>
        </div>
      </div>

      {/* ── Restaurant tabs (kanban only) ── */}
      {activeView === "kanban" && (
        <div className="flex flex-wrap gap-2">
          {!restaurantsLoaded ? (
            <span className="flex items-center gap-2 text-neutral-600 text-xs uppercase font-bold tracking-widest">
              <Loader2 size={12} className="animate-spin" /> Chargement des enseignes…
            </span>
          ) : restaurants.length === 0 ? (
            <span className="text-neutral-600 text-xs uppercase font-bold tracking-widest">Aucune enseigne trouvée.</span>
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
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-neutral-600">
          <Loader2 size={32} className="animate-spin text-brand-primary" />
          <p className="text-xs uppercase font-bold tracking-widest">Synchronisation…</p>
        </div>
      )}

      {/* ── Kanban view ── */}
      {!loading && activeView === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {KANBAN_COLS.map((col) => {
            const colOrders = kanbanByStatus[col.status];
            return (
              <div
                key={col.status}
                className={`rounded-2xl border ${col.colBorder} ${col.colBg} flex flex-col`}
              >
                {/* Column header */}
                <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl border-b ${col.headerBorder} ${col.headerBg}`}>
                  <span className={`text-xs font-black uppercase tracking-widest ${col.headerText}`}>{col.label}</span>
                  <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full border ${col.headerBg} ${col.headerText} ${col.headerBorder}`}>
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3 p-3 min-h-48">
                  <AnimatePresence mode="popLayout">
                    {colOrders.length === 0 && (
                      <m.p
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8 text-neutral-700 text-xs uppercase font-bold tracking-widest"
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
                        {col.hasRing && (
                          <div className="absolute inset-0 rounded-2xl ring-1 ring-amber-500/60 animate-pulse pointer-events-none" />
                        )}
                        <div className={`bg-neutral-900 border rounded-2xl p-4 space-y-3 ${col.cardBorder}`}>
                          {/* Header row */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="bg-brand-primary text-white text-sm font-black px-2.5 py-0.5 rounded-lg italic shrink-0">
                              #KBK-{order.id}
                            </span>
                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg border shrink-0 ${
                              order.order_type === "Livraison"
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}>
                              {order.order_type === "Livraison" ? <Truck size={10} /> : <ShoppingBag size={10} />}
                              {order.order_type}
                            </span>
                          </div>

                          {/* Customer */}
                          <div>
                            <p className="text-white font-black text-base uppercase leading-tight truncate">
                              {order.customer_name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-neutral-500 text-xs">
                              <Clock size={10} />
                              <span>{timeAgo(order.created_at)}</span>
                              {order.pickup_time && (
                                <><span>·</span><span className="text-white font-bold">{order.pickup_time}</span></>
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

                          {/* Chef note */}
                          {order.comments && (
                            <p className="text-xs text-amber-400 italic border-l-2 border-amber-500/50 pl-2">
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
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all active:scale-95 disabled:opacity-50 ${col.btnCls}`}
                            >
                              {updatingId === order.id
                                ? <Loader2 size={12} className="animate-spin" />
                                : <col.BtnIcon size={12} />
                              }
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

      {/* ── List / Manager view ── */}
      {!loading && activeView === "list" && (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => {
              const style = getListStyle(order.status);
              const isDelivery = order.order_type === "Livraison";
              return (
                <m.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-wrap md:flex-nowrap items-center justify-between gap-6 hover:border-neutral-700 transition shadow-xl ${
                    (order.status === "Livrée" || order.status === "Annulée") ? "opacity-40 grayscale" : ""
                  }`}
                >
                  {/* Client */}
                  <div className="flex flex-col gap-2 min-w-44">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-brand-primary text-white text-sm font-black px-3 py-1 rounded-md shadow-lg italic">
                        #KBK-{order.id}
                      </span>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black uppercase border ${
                        isDelivery
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      }`}>
                        {isDelivery ? <Truck size={12} /> : <ShoppingBag size={12} />}
                        {order.order_type}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg uppercase leading-tight tracking-tight">
                        {order.customer_name}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono tracking-widest mt-1 bg-white/5 w-fit px-2 rounded">
                        {order.customer_phone}
                      </p>
                    </div>
                  </div>

                  {/* Delivery address */}
                  {isDelivery && (
                    <div className="flex-1 min-w-44 max-w-xs bg-blue-500/5 px-4 py-3 rounded-xl border border-blue-500/10">
                      <span className="text-xs text-blue-400/60 font-black uppercase tracking-widest mb-1 block">Destination</span>
                      <p className="text-white text-xs font-bold leading-tight">{order.delivery_address}</p>
                      <p className="text-blue-400 text-xs font-black mt-1 font-mono">{order.delivery_zip}</p>
                    </div>
                  )}

                  {/* Time slot */}
                  <div className="flex flex-col bg-black/40 px-4 py-2 rounded-xl border border-neutral-800/50">
                    <span className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1">Prévu pour</span>
                    <div className="flex items-center gap-2 text-white font-black text-base">
                      <Clock size={16} className="text-brand-primary" />
                      {order.pickup_time}
                    </div>
                  </div>

                  {/* Status + action */}
                  <div className="flex items-center gap-4">
                    <div className={`text-xs font-black px-4 py-2 rounded-xl uppercase flex items-center gap-2 border shadow-inner ${style.bg} ${style.text} ${style.border}`}>
                      {style.icon} {order.status}
                    </div>
                    {style.next && (
                      <button
                        onClick={() => updateStatus(order.id, style.next!)}
                        className="bg-white text-black hover:bg-brand-primary hover:text-white px-5 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-lg active:scale-95 flex items-center gap-2"
                      >
                        {style.btnIcon} {style.btnLabel}
                      </button>
                    )}
                  </div>

                  {/* Total + eye */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-xs text-gray-500 font-bold uppercase tracking-widest">Total</span>
                      <span className="text-base font-black text-white">
                        {Number(order.total_amount).toFixed(2)}{" "}
                        <span className="text-xs text-brand-primary">CHF</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition border border-neutral-700 shadow-lg"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </m.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Order detail modal (list mode) ── */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-neutral-900 border border-neutral-800 w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-8 border-b border-neutral-800 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-4">
                  <span className="bg-brand-primary text-white text-lg font-black px-4 py-1 rounded-lg italic">
                    #KBK-{selectedOrder.id}
                  </span>
                  <span className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-black uppercase border ${
                    selectedOrder.order_type === "Livraison"
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  }`}>
                    {selectedOrder.order_type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-neutral-800 p-3 rounded-full text-gray-500 hover:text-white transition"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-bold flex items-center gap-2">
                      <User size={12} /> Client
                    </span>
                    <p className="text-white text-lg font-bold uppercase">{selectedOrder.customer_name}</p>
                    <p className="text-gray-400 text-sm font-mono tracking-wider">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-bold flex items-center gap-2">
                      <Calendar size={12} /> Créneau
                    </span>
                    <p className="text-white text-lg font-bold">{selectedOrder.pickup_time}</p>
                  </div>
                </div>

                {selectedOrder.order_type === "Livraison" && (
                  <div className="bg-blue-500/5 p-5 rounded-3xl border border-blue-500/10 text-white">
                    <span className="text-xs text-blue-400 uppercase font-bold flex items-center gap-2 mb-2">
                      <MapPin size={12} /> Destination
                    </span>
                    <p className="text-base font-bold leading-relaxed">
                      {selectedOrder.delivery_address}, {selectedOrder.delivery_zip}
                    </p>
                  </div>
                )}

                {selectedOrder.comments && (
                  <div className="bg-amber-500/5 p-5 rounded-3xl border border-amber-500/10">
                    <span className="text-xs text-amber-500 uppercase font-bold flex items-center gap-2 mb-2">
                      <MessageSquare size={12} /> Instructions & Allergies
                    </span>
                    <p className="text-white text-sm italic leading-relaxed">&ldquo;{selectedOrder.comments}&rdquo;</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-xs text-gray-500 uppercase font-bold">
                    <span className="flex items-center gap-2"><Package size={12} /> Contenu</span>
                    <span>{selectedOrder.items?.length ?? 0} articles</span>
                  </div>
                  {(selectedOrder.items ?? []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 text-sm">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center font-black text-brand-primary">
                          {item.quantity}
                        </span>
                        <span className="text-white font-bold uppercase tracking-tight">{item.name}</span>
                      </div>
                      <span className="text-gray-500 font-bold italic">
                        {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-neutral-800 flex flex-col gap-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-gray-500 font-bold uppercase text-xs">Total</span>
                    <span className="text-3xl font-display font-bold text-white">
                      {Number(selectedOrder.total_amount).toFixed(2)}{" "}
                      <span className="text-brand-primary text-sm uppercase">CHF</span>
                    </span>
                  </div>
                  {getListStyle(selectedOrder.status).next && (
                    <button
                      onClick={() => updateStatus(selectedOrder.id, getListStyle(selectedOrder.status).next!)}
                      className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-primary hover:text-white transition-all shadow-2xl"
                    >
                      {getListStyle(selectedOrder.status).btnIcon}
                      {getListStyle(selectedOrder.status).btnLabel}
                    </button>
                  )}
                  {selectedOrder.status !== "Livrée" && selectedOrder.status !== "Annulée" && (
                    <button
                      onClick={() => handleRefund(selectedOrder.id)}
                      className="w-full text-gray-500 hover:text-red-500 py-3 font-bold uppercase text-xs flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-red-900/50 rounded-xl"
                    >
                      <XCircle size={14} /> Annuler et rembourser
                    </button>
                  )}
                </div>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

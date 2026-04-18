"use server";

import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface RestaurantRow {
  id: number;
  name: string;
}

export interface OrderRow {
  id: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  pickup_date: string;
  pickup_time: string;
  order_type: string;
  total_amount: number;
  items: unknown;
  status: string;
  delivery_address?: string;
  delivery_zip?: string;
  comments?: string;
  restaurant_id?: number | null;
}

// ── Actions ────────────────────────────────────────────────────────────────────

export async function getRestaurantsAdmin(): Promise<RestaurantRow[]> {
  const { data, error } = await getAdmin()
    .from("restaurants")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("[admin-action] restaurants fetch error:", error.message, error.hint);
  }
  return (data as RestaurantRow[]) ?? [];
}

export async function getKanbanOrdersAdmin(restaurantId: number): Promise<OrderRow[]> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await getAdmin()
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .in("status", ["Payé", "En préparation", "Prête"])
    .gte("created_at", todayStart.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[admin-action] kanban orders error:", error.message, error.hint);
  }
  return (data as OrderRow[]) ?? [];
}

export async function getListOrdersAdmin(): Promise<OrderRow[]> {
  const { data, error } = await getAdmin()
    .from("orders")
    .select("*")
    .neq("status", "Paiement en cours")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin-action] list orders error:", error.message, error.hint);
  }
  return (data as OrderRow[]) ?? [];
}

export async function updateOrderStatusAdmin(
  orderId: number,
  newStatus: string
): Promise<boolean> {
  const { error } = await getAdmin()
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    console.error("[admin-action] updateStatus error:", error.message, error.hint);
    return false;
  }
  return true;
}

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

// Définition d'un type strict pour les mises à jour de commande
type OrderUpdatePayload = {
  status?: string;
  driver_lat?: number | null;
  driver_lng?: number | null;
};

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_STATUSES = ["En livraison", "Livrée"];

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_livreur")
      .eq("id", user.id)
      .single();

    if (!profile?.is_livreur) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { orderId, status, lat, lng } = await request.json();

    if (!orderId) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    // ✅ ÉTAPE 1 : Typage strict au lieu de 'any'
    const updatePayload: OrderUpdatePayload = {};

    if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Statut non autorisé" }, { status: 400 });
      }
      updatePayload.status = status;
    }

    if (lat !== undefined && lng !== undefined) {
      updatePayload.driver_lat = lat;
      updatePayload.driver_lng = lng;
    } else if (status === "Livrée") {
      updatePayload.driver_lat = null;
      updatePayload.driver_lng = null;
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: unknown) { // ✅ ÉTAPE 2 : Utilisation de 'unknown' pour les erreurs
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[DRIVER_API_ERROR]:", errorMessage);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
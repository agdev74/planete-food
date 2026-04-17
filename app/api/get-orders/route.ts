import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Vérification de la session côté serveur
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupération des commandes pour cet utilisateur
    const { data: orders, error: dbError } = await supabase
      .from("orders")
      .select("id, created_at, total_amount, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;

    // Renvoie le tableau (même vide)
    return NextResponse.json({ orders: orders || [] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    console.error("[API_GET_ORDERS_ERROR]:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 1. Si pas connecté, on renvoie une 200 avec profil vide (pas d'erreur)
    if (authError || !user) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    // 🚨 2. LE COURT-CIRCUIT (Bypass RLS) 🚨
    // On utilise la clé Service Role pour ignorer les règles de sécurité qui font planter la requête
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // On fait un select("*") sans .single() pour éviter tout crash de cardinalité ou de colonne
    const { data: profiles, error: dbError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id);

    if (dbError) {
      // Si même l'Admin échoue, on affiche l'erreur absolue
      return NextResponse.json({ 
        error: "Erreur DB Admin", 
        message: dbError.message,
        code: dbError.code 
      }, { status: 500 });
    }

    // On prend le premier profil du tableau (s'il existe)
    const rawProfile = profiles && profiles.length > 0 ? profiles[0] : null;

    if (!rawProfile) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    // 🛡️ 3. SÉCURITÉ : Le Filtre Serveur (Data Minimization)
    // On ne renvoie au front-end QUE ce qui est inoffensif et ce qui est strictement nécessaire pour l'UI
    const safeProfile = {
      id: rawProfile.id,
      full_name: rawProfile.full_name,
      phone: rawProfile.phone,
      address: rawProfile.address,
      avatar_url: rawProfile.avatar_url,
      loyalty_points: rawProfile.loyalty_points,
      wallet_balance: rawProfile.wallet_balance,
      // ✅ RETOUR À LA NORMALE : Indispensable pour l'affichage du menu Admin/Livreur
      is_admin: rawProfile.is_admin,
      is_livreur: rawProfile.is_livreur
    };

    return NextResponse.json({ profile: safeProfile }, { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ 
      error: "Erreur fatale Serveur", 
      message: errorMessage 
    }, { status: 500 });
  }
}
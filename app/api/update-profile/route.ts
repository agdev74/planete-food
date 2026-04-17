import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache"; 

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // ✅ SÉCURITÉ #7 : Vérification d'identité stricte avant modification
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, address, zipCode, city, lang } = body;

    // ✅ Remplacement de upsert() par update() pour éviter les conflits RLS/Triggers
    const { data: updatedProfile, error: dbError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        address,
        zip_code: zipCode,
        city,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id) // 🔒 Sécurité : on cible uniquement la ligne du user connecté
      .select()
      .single(); 

    if (dbError) throw dbError;

    // ✅ On invalide le cache pour que les changements soient visibles immédiatement
    if (lang) {
      revalidatePath(`/${lang}/profile`);
      revalidatePath(`/${lang}/profile/settings`);
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    console.error("[API] update-profile error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
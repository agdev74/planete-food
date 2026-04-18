import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server"; 

interface CartItem {
  menuItemId: string;
  quantity: number;
  name?: string;
}

interface RequestBody {
  items: CartItem[];
  couponCode?: string;
  useWallet?: boolean;
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  pickupTime: string;
  orderType: string;
  deliveryAddress?: string;
  deliveryZip?: string | number;
  comments?: string;
  lang?: string;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
});

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const body = await request.json() as RequestBody;

    const { 
        couponCode, useWallet, items, customerName, customerPhone, 
        pickupDate, pickupTime, orderType, deliveryAddress, deliveryZip, comments 
    } = body;

    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    // --- 🛡️ SÉCURITÉ #6 : VALIDATION DU TYPE DE COMMANDE (insensible casse/accents) ---
    const normalizedOrderType = orderType.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const validTypes = ["livraison", "a emporter"];
    if (!validTypes.includes(normalizedOrderType)) {
      return NextResponse.json({ error: "Type de commande invalide." }, { status: 400 });
    }

    // --- 🛡️ SÉCURITÉ #6 : VALIDATION ROBUSTE DU NPA (GENÈVE UNIQUEMENT) ---
    if (normalizedOrderType === "livraison") {
      // On évite le cast String() aveugle pour empêcher les contournements via objets/tableaux
      const zipStr = typeof deliveryZip === 'string' ? deliveryZip.trim() : 
                     typeof deliveryZip === 'number' ? String(deliveryZip) : '';

      if (!/^12\d{2}$/.test(zipStr)) {
        return NextResponse.json(
          { error: "La livraison est restreinte au canton de Genève (NPA 12xx)." }, 
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Le panier est vide." }, { status: 400 });
    }

    // Recalcul du montant via la DB (Sécurité #1 déjà appliquée)
    const menuItemIds = items.map((i) => i.menuItemId);
    const { data: dbItems, error: dbError } = await supabaseAdmin
      .from("menu_items")
      .select("id, price_cents, is_available")
      .in("id", menuItemIds);

    if (dbError || !dbItems) {
      throw new Error("Impossible de vérifier les prix en base de données.");
    }

    let serverBaseAmount = 0;
    for (const clientItem of items) {
      const dbItem = dbItems.find(d => d.id === clientItem.menuItemId);
      if (!dbItem || !dbItem.is_available) {
        return NextResponse.json({ error: "Un article n'est plus disponible." }, { status: 400 });
      }
      serverBaseAmount += (dbItem.price_cents * (clientItem.quantity || 1)) / 100;
    }

    let finalAmount = serverBaseAmount;
    let discountApplied = 0;

    // Logique Coupon
    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (coupon) {
        const now = new Date();
        const isExpired = coupon.expiration_date && new Date(coupon.expiration_date) < now;

        if (!isExpired && serverBaseAmount >= (coupon.min_order_amount || 0)) {
          if (coupon.discount_type === "percentage") {
            discountApplied = (serverBaseAmount * coupon.discount_value) / 100;
          } else {
            discountApplied = coupon.discount_value;
          }
          finalAmount = Math.max(0, serverBaseAmount - discountApplied);
        }
      }
    }

    // Logique Wallet
    let walletUsed = 0;
    if (useWallet && user) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (profile && profile.wallet_balance > 0) {
        const maxWalletAllowed = Math.max(0, finalAmount - 0.50);
        walletUsed = Math.min(maxWalletAllowed, Number(profile.wallet_balance));
        finalAmount = finalAmount - walletUsed;

        if (walletUsed > 0) {
          await supabaseAdmin.from("loyalty_transactions").insert([{
            user_id: user.id,
            amount: -walletUsed,
            description: "Utilisation cagnotte (Paiement en cours)"
          }]);
        }
      }
    }

    const amountInCents = Math.round(finalAmount * 100);

    if (amountInCents < 50) {
      return NextResponse.json({ error: "Montant trop faible (Min 0.50 CHF)." }, { status: 400 });
    }

    const finalComments = walletUsed > 0 
      ? `[Cagnotte déduite: -${walletUsed.toFixed(2)} CHF]\n${comments || ""}` 
      : comments;

    // Création de la commande
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        user_id: user?.id || null,
        customer_name: customerName, 
        customer_phone: customerPhone, 
        pickup_date: pickupDate,
        pickup_time: pickupTime, 
        order_type: orderType, 
        delivery_address: deliveryAddress, 
        delivery_zip: deliveryZip, 
        total_amount: finalAmount, 
        discount_amount: discountApplied, 
        coupon_code: couponCode || null, 
        items: items, 
        status: "Paiement en cours",
        comments: finalComments 
      }])
      .select('id')
      .single();

    if (orderError || !orderData) {
      return NextResponse.json({ error: "Erreur création commande" }, { status: 500 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "chf",
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: String(orderData.id),
        userId: user?.id || "guest",
        couponUsed: couponCode || "none",
        discountAmount: discountApplied.toFixed(2),
        walletUsed: walletUsed.toFixed(2),
        originalAmount: serverBaseAmount.toFixed(2),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: orderData.id
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    console.error("❌ Erreur API Stripe/Supabase:", errorMessage);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
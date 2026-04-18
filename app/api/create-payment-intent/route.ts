import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

interface CartItem {
  menuItemId: string;
  quantity: number;
  name?: string;
  price?: number;
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
    console.log("[DEBUG] ① Body reçu:", JSON.stringify(body, null, 2));

    const {
      couponCode, useWallet, items, customerName, customerPhone,
      pickupDate, pickupTime, orderType, deliveryAddress, deliveryZip, comments,
    } = body;

    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    console.log("[DEBUG] ② User:", user?.id ?? "guest");

    // ── Validation orderType (null-safe) ──────────────────────────────────────
    const rawOrderType = typeof orderType === "string" ? orderType : "";
    const normalizedOrderType = rawOrderType
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const validTypes = ["livraison", "a emporter", "delivery", "pickup", "takeaway", "click & collect"];
    console.log("[DEBUG] ③ normalizedOrderType:", normalizedOrderType);

    if (!validTypes.includes(normalizedOrderType)) {
      console.error("[DEBUG] ③ Type de commande invalide:", orderType);
      return NextResponse.json({ error: "Type de commande invalide." }, { status: 400 });
    }

    // ── Validation NPA ────────────────────────────────────────────────────────
    if (normalizedOrderType === "livraison") {
      const zipStr =
        typeof deliveryZip === "string" ? deliveryZip.trim() :
        typeof deliveryZip === "number" ? String(deliveryZip) : "";
      if (!/^12\d{2}$/.test(zipStr)) {
        return NextResponse.json(
          { error: "La livraison est restreinte au canton de Genève (NPA 12xx)." },
          { status: 400 }
        );
      }
    }

    // ── Validation panier ─────────────────────────────────────────────────────
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Le panier est vide." }, { status: 400 });
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    console.log("[DEBUG] ④ menuItemIds envoyés:", menuItemIds);

    // ── Fetch prix depuis la DB ───────────────────────────────────────────────
    const { data: dbItems, error: dbError } = await supabaseAdmin
      .from("menu_items")
      .select("id, price")
      .in("id", menuItemIds);

    console.log("[DEBUG] ⑤ dbItems:", JSON.stringify(dbItems));
    if (dbError) {
      console.error("🚨 ERREUR SQL EXACTE (menu_items) :", dbError.message, dbError.details, dbError.hint);
      throw new Error("Impossible de vérifier les prix en base de données.");
    }
    if (!dbItems || dbItems.length === 0) {
      console.error("[DEBUG] ⑤ Aucun article trouvé pour les IDs:", menuItemIds);
      throw new Error("Aucun article trouvé en base de données.");
    }

    // ── Calcul du montant ─────────────────────────────────────────────────────
    let serverBaseAmount = 0;
    for (const clientItem of items) {
      const dbItem = dbItems.find(
        (d) => String(d.id) === String(clientItem.menuItemId)
      );
      console.log("[DEBUG] ⑥ clientItem:", clientItem.menuItemId, "→ dbItem:", JSON.stringify(dbItem));

      if (!dbItem) {
        console.error("[DEBUG] ⑥ Article introuvable en DB:", clientItem.menuItemId);
        return NextResponse.json({ error: "Un article n'est plus disponible." }, { status: 400 });
      }

      const dbPrice = typeof dbItem.price === "number" ? dbItem.price : parseFloat(String(dbItem.price ?? "0"));
      const clientPrice = typeof clientItem.price === "number" && clientItem.price > 0 ? clientItem.price : 0;
      // Accepte le prix client uniquement s'il est supérieur au prix DB (suppléments Tacos)
      const itemPrice = clientPrice > dbPrice ? clientPrice : dbPrice;
      console.log("[DEBUG] ⑥ dbPrice:", dbPrice, "| clientPrice:", clientPrice, "| itemPrice retenu:", itemPrice);

      serverBaseAmount += itemPrice * (clientItem.quantity || 1);
    }
    console.log("[DEBUG] ⑦ serverBaseAmount:", serverBaseAmount);

    // ── Coupon ────────────────────────────────────────────────────────────────
    let finalAmount = serverBaseAmount;
    let discountApplied = 0;

    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (coupon) {
        const isExpired = coupon.expiration_date && new Date(coupon.expiration_date) < new Date();
        if (!isExpired && serverBaseAmount >= (coupon.min_order_amount || 0)) {
          discountApplied = coupon.discount_type === "percentage"
            ? (serverBaseAmount * coupon.discount_value) / 100
            : coupon.discount_value;
          finalAmount = Math.max(0, serverBaseAmount - discountApplied);
        }
      }
    }

    // ── Wallet ────────────────────────────────────────────────────────────────
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
        finalAmount -= walletUsed;

        if (walletUsed > 0) {
          await supabaseAdmin.from("loyalty_transactions").insert([{
            user_id: user.id,
            amount: -walletUsed,
            description: "Utilisation cagnotte (Paiement en cours)",
          }]);
        }
      }
    }

    const amountInCents = Math.round(finalAmount * 100);
    console.log("[DEBUG] ⑧ amountInCents:", amountInCents, "| finalAmount:", finalAmount);

    if (!Number.isFinite(amountInCents) || amountInCents < 50) {
      console.error("[DEBUG] ⑧ Montant invalide ou trop faible:", amountInCents);
      return NextResponse.json({ error: "Montant trop faible ou invalide (Min 0.50 CHF)." }, { status: 400 });
    }

    const finalComments = walletUsed > 0
      ? `[Cagnotte déduite: -${walletUsed.toFixed(2)} CHF]\n${comments || ""}`
      : (comments || null);

    // ── INSERT commande ───────────────────────────────────────────────────────
    const orderPayload = {
      user_id: user?.id || null,
      customer_name: customerName,
      customer_phone: customerPhone,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      order_type: rawOrderType,
      delivery_address: deliveryAddress || null,
      delivery_zip: deliveryZip || null,
      total_amount: finalAmount,
      discount_amount: discountApplied,
      coupon_code: couponCode || null,
      items: items,
      status: "Paiement en cours",
      comments: finalComments,
    };
    console.log("[DEBUG] ⑨ orderPayload:", JSON.stringify(orderPayload, null, 2));

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([orderPayload])
      .select("id")
      .single();

    if (orderError || !orderData) {
      console.error("🚨 ERREUR SQL EXACTE (orders) :", orderError?.message, orderError?.details, orderError?.hint);
      return NextResponse.json({ error: "Erreur création commande" }, { status: 500 });
    }
    console.log("[DEBUG] ⑩ Commande créée, id:", orderData.id);

    // ── Stripe PaymentIntent ──────────────────────────────────────────────────
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "chf",
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: String(orderData.id),
        userId: user?.id ?? "guest",
        couponUsed: couponCode ?? "none",
        discountAmount: discountApplied.toFixed(2),
        walletUsed: walletUsed.toFixed(2),
        originalAmount: serverBaseAmount.toFixed(2),
      },
    });
    console.log("[DEBUG] ⑪ PaymentIntent créé:", paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: orderData.id,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Erreur API Stripe/Supabase:", errorMessage);
    if (error instanceof Error) console.error("❌ Stack:", error.stack);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

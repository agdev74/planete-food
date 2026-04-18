/**
 * 🔒 WEBHOOK STRIPE SÉCURISÉ — Planet Food
 *
 * Architecture : create-payment-intent crée la commande (status "Paiement en cours")
 * et attache orderId dans metadata. Ce webhook fait uniquement des UPDATE de statut.
 */

import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// ─── Clients ──────────────────────────────────────────────────────────────────

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ─── Idempotence (Anti-Replay) ─────────────────────────────────────────────────

async function isAlreadyProcessed(eventId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('processed_webhook_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .maybeSingle();

  if (error) {
    console.error('[webhook] Erreur lecture idempotence:', error.message);
    return true;
  }
  return !!data;
}

async function markAsProcessed(
  eventId: string,
  eventType: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('processed_webhook_events')
    .insert({
      stripe_event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString(),
    });

  if (error) {
    if (error.code === '23505') {
      console.warn(`[webhook] Double traitement détecté pour ${eventId}, ignoré`);
    } else {
      console.error('[webhook] Erreur marquage idempotence:', error.message);
    }
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    console.error(
      '[webhook] ❌ metadata.orderId manquant pour PaymentIntent:',
      paymentIntent.id
    );
    return;
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'Payé',
      stripe_payment_intent_id: paymentIntent.id,
    })
    .eq('id', orderId);

  if (error) {
    console.error(
      `[webhook] ❌ Erreur UPDATE commande ${orderId}:`,
      error.message
    );
  } else {
    console.info(
      `[webhook] ✅ Commande ${orderId} passée à "Payé" (PI: ${paymentIntent.id})`
    );
  }
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    console.error(
      '[webhook] ❌ metadata.orderId manquant pour PaymentIntent échoué:',
      paymentIntent.id
    );
    return;
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'Paiement échoué' })
    .eq('id', orderId);

  if (error) {
    console.error(
      `[webhook] ❌ Erreur UPDATE échec paiement pour commande ${orderId}:`,
      error.message
    );
  } else {
    console.info(
      `[webhook] ⚠️ Commande ${orderId} passée à "Paiement échoué" (PI: ${paymentIntent.id})`
    );
  }
}

async function handleRefundCreated(charge: Stripe.Charge): Promise<void> {
  if (!charge.payment_intent) return;

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'Annulée' })
    .eq('stripe_payment_intent_id', charge.payment_intent as string);

  if (error) {
    console.error('[webhook] Erreur UPDATE remboursement:', error.message);
  } else {
    console.info(
      `[webhook] 💸 Remboursement enregistré pour PI: ${charge.payment_intent}`
    );
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();
  const headersList = await headers();
  const stripeSignature = headersList.get('stripe-signature');

  if (!stripeSignature) {
    console.warn('[webhook] Requête reçue sans header stripe-signature');
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error(
      '[webhook] ❌ Signature invalide:',
      err instanceof Error ? err.message : err
    );
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  const eventAgeSeconds = Math.floor(Date.now() / 1000) - event.created;
  const MAX_EVENT_AGE_SECONDS = 600;

  if (eventAgeSeconds > MAX_EVENT_AGE_SECONDS) {
    console.warn(
      `[webhook] Événement trop ancien: ${eventAgeSeconds}s (max ${MAX_EVENT_AGE_SECONDS}s) — ID: ${event.id}`
    );
    return new Response('Event timestamp too old', { status: 400 });
  }

  if (await isAlreadyProcessed(event.id)) {
    console.info(`[webhook] Événement ${event.id} déjà traité, skip`);
    return new Response('Already processed', { status: 200 });
  }

  console.info(`[webhook] Traitement de l'événement: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'charge.refunded':
        await handleRefundCreated(event.data.object as Stripe.Charge);
        break;

      default:
        console.info(`[webhook] Événement non géré: ${event.type}`);
    }
  } catch (err) {
    console.error(`[webhook] Erreur non gérée pour ${event.type}:`, err);
    return new Response('Internal processing error', { status: 500 });
  }

  await markAsProcessed(event.id, event.type);

  return new Response('OK', { status: 200 });
}

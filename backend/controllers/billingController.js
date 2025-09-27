const Stripe = require("stripe");
const { supabase, adminSupabase } = require("../config/supabase");

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY. Set it in your backend .env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_missing", {
  apiVersion: "2024-06-20",
});

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

// Find profile by stripe_customer_id first, then fallback to email
async function findProfileByEmailOrCustomer(email, customerId) {
  const db = adminSupabase || supabase;
  if (customerId) {
    const { data } = await db
      .from("profiles")
      .select("*")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (data) return data;
  }
  if (email) {
    const { data } = await db
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (data) return data;
  }
  return null;
}

// Get plan credits by plan name + interval
function getPlanCredits(planName, interval) {
  const planKey = (planName || "").toLowerCase();
  const baseCredits = planKey.includes("starter")
    ? 300
    : planKey.includes("pro")
    ? 1200
    : planKey.includes("agency")
    ? 5000
    : 0;
  return interval === "year" ? baseCredits * 12 : baseCredits;
}

// Update profile from subscription object
// Update profile from subscription object
async function updateProfileFromSubscription(subscription, planName) {
  const db = adminSupabase || supabase;
  const customerId = subscription.customer;
  const interval =
    subscription.items.data[0]?.price?.recurring?.interval || "month";
  const credits = getPlanCredits(planName, interval);

  // Append cycle to plan name before saving
  const finalPlanName =
    interval === "year" ? `${planName} Annual` : `${planName} Monthly`;

  const profile = await findProfileByEmailOrCustomer(null, customerId);

  if (profile?.id) {
    await db
      .from("profiles")
      .update({
        subscription_active: true,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        plan_name: finalPlanName,
        subscription_current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        monthly_included_credits: interval === "month" ? credits : 0,
        annual_included_credits: interval === "year" ? credits : 0,
        // ❌ don’t overwrite credits here — leave carry-over untouched
      })
      .eq("id", profile.id);
  }
}

// -----------------------------------------------------------------------------
// Checkout sessions
// -----------------------------------------------------------------------------

async function createCreditsCheckoutSession(req, res) {
  try {
    const userId = req.user?.id;
    const { quantity, tierId, unitPriceCents } = req.body;
    if (!userId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Lead Credits",
              description: `Tier: ${tierId}`,
            },
            unit_amount: unitPriceCents,
          },
          quantity,
        },
      ],
      metadata: {
        user_id: userId,
        type: "credits",
        quantity,
        tier_id: tierId || "standard",
      },
      success_url: `${process.env.FRONTEND_URL}/billing-plans?status=success`,
      cancel_url: `${process.env.FRONTEND_URL}/billing-plans?status=cancelled`,
    });
    return res.json({ success: true, url: session.url });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

async function createSubscriptionCheckoutSession(req, res) {
  try {
    const userId = req.user?.id;
    const { priceId } = req.body;
    if (!userId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    const db = adminSupabase || supabase;

    // 1️⃣ Fetch current profile (with subscription + credits)
    const { data: profile } = await db
      .from("profiles")
      .select("stripe_subscription_id, stripe_customer_id, credits")
      .eq("id", userId)
      .single();

    let carryOverCredits = profile?.credits || 0;

    // 2️⃣ For upgrades, we'll handle old subscription cancellation in webhook
    // after the new subscription is confirmed to avoid service interruption

    // 3️⃣ Get new plan info from Stripe
    const price = await stripe.prices.retrieve(priceId);
    let planName =
      price?.metadata?.nickname ||
      (price?.product
        ? (await stripe.products.retrieve(price.product))?.name
        : "");

    // 4️⃣ Create new subscription checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: profile?.stripe_customer_id || undefined, // reuse existing customer if present
      customer_email: profile?.stripe_customer_id ? undefined : req.user.email, // only set if no customer yet
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        user_id: userId,
        type: "subscription",
        plan_name: planName,
        carry_over_credits: carryOverCredits,
        old_subscription_id: profile?.stripe_subscription_id || "", // Track old subscription for upgrade handling
        is_upgrade: !!profile?.stripe_subscription_id // Flag to identify upgrade scenario
      },
      success_url: `${process.env.FRONTEND_URL}/billing-plans?status=success`,
      cancel_url: `${process.env.FRONTEND_URL}/billing-plans?status=cancelled`,
    });

    return res.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Subscription error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// -----------------------------------------------------------------------------
// Webhook handler
// -----------------------------------------------------------------------------

async function handleStripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString()); // dev fallback
    }
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
  // 1️⃣ Subscription checkout completed
  case "checkout.session.completed": {
    const session = event.data.object;
    if (session.mode === "subscription") {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription,
        { expand: ["items.data.price"] }
      );

      let planName =
        session.metadata?.plan_name ||
        subscription.items.data[0]?.price?.metadata?.nickname ||
        (
          await stripe.products.retrieve(
            subscription.items.data[0].price.product
          )
        )?.name;

      const interval =
        subscription.items.data[0]?.price?.recurring?.interval || "month";
      const baseCredits = getPlanCredits(planName, interval);

      // Find user profile
      const profile = await findProfileByEmailOrCustomer(
        session.customer_email,
        session.customer
      );

      // Handle upgrade scenario - cancel old subscription first, then update profile
      const isUpgrade = session.metadata?.is_upgrade === "true";
      const oldSubscriptionId = session.metadata?.old_subscription_id;
      
      if (isUpgrade && oldSubscriptionId) {
        try {
          console.log(`Canceling old subscription ${oldSubscriptionId} after successful upgrade`);
          await stripe.subscriptions.cancel(oldSubscriptionId);
          // No need to update database - the webhook will handle subscription deletion
        } catch (err) {
          console.error("Failed to cancel old subscription during upgrade:", err);
          // Don't throw error - the new subscription is already active
        }
      }

      // Now update profile with new subscription details and carry over credits
      if (profile?.id) {
        // Carry over credits if provided in metadata (0 on first subscription)
        const carryOver = Number(session.metadata?.carry_over_credits || 0);

        await (adminSupabase || supabase)
          .from("profiles")
          .update({
            stripe_customer_id: session.customer,
            credits: carryOver + baseCredits, // ✅ correct: carryOver + new credits
          })
          .eq("id", profile.id);
      }

      // Save subscription metadata (plan, interval, etc.)
      await updateProfileFromSubscription(subscription, planName);
    }
    break;
  }

  // 2️⃣ Invoice events (renewals)
  case "invoice.payment_succeeded": {
    const invoice = event.data.object;
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription,
        { expand: ["items.data.price.product"] }
      );

      const planName =
        subscription.items.data[0]?.price?.metadata?.nickname ||
        subscription.items.data[0].price.product.name;

      const interval =
        subscription.items.data[0]?.price?.recurring?.interval || "month";
      const baseCredits = getPlanCredits(planName, interval);

      const profile = await findProfileByEmailOrCustomer(
        null,
        subscription.customer
      );

      if (profile?.id) {
        await (adminSupabase || supabase)
          .from("profiles")
          .update({
            credits: (profile.credits || 0) + baseCredits, // ✅ only add base credits
          })
          .eq("id", profile.id);
      }

      // Keep subscription details in sync
      await updateProfileFromSubscription(subscription, planName);
    }
    break;
  }

  // 3️⃣ Subscription updated (e.g., upgrade/downgrade after trial)
  case "customer.subscription.updated": {
    const subscription = event.data.object;
    let planName =
      subscription.items.data[0]?.price?.metadata?.nickname ||
      (
        await stripe.products.retrieve(
          subscription.items.data[0].price.product
        )
      )?.name;
    await updateProfileFromSubscription(subscription, planName);
    break;
  }

  // 4️⃣ Subscription canceled
  case "customer.subscription.deleted": {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    const profile = await findProfileByEmailOrCustomer(null, customerId);

    if (profile?.id) {
      await (adminSupabase || supabase)
        .from("profiles")
        .update({
          subscription_active: false,
          plan_name: null,
          stripe_subscription_id: null,
          stripe_customer_id: null,
          monthly_included_credits: 0,
          annual_included_credits: 0,
          credits: profile.credits || 0, // keep remaining credits
          subscription_current_period_end: null,
        })
        .eq("id", profile.id);
    }
    break;
  }

  default:
    console.log(`Unhandled event type: ${event.type}`);
}

  } catch (err) {
    console.error("❌ Webhook handler failed:", err);
    return res.status(500).send("Webhook handler failed");
  }

  res.json({ received: true });
}

// -----------------------------------------------------------------------------
// Credit operations
// -----------------------------------------------------------------------------

async function debitCredits(req, res) {
  const userId = req.user?.id;
  const { amount } = req.body;
  if (!userId)
    return res.status(401).json({ success: false, error: "Unauthorized" });
  const { error } = await supabase.rpc("decrement_user_credits", {
    p_user_id: userId,
    p_delta: amount,
  });
  if (error)
    return res.status(402).json({ success: false, error: error.message });
  return res.json({ success: true });
}

async function creditCredits(req, res) {
  const userId = req.user?.id;
  const { amount } = req.body;
  if (!userId)
    return res.status(401).json({ success: false, error: "Unauthorized" });
  const { error } = await supabase.rpc("increment_user_credits", {
    p_user_id: userId,
    p_delta: amount,
  });
  if (error)
    return res.status(400).json({ success: false, error: error.message });
  return res.json({ success: true });
}

async function cancelSubscriptionImmediately(req, res) {
  const userId = req.user?.id;
  if (!userId)
    return res.status(401).json({ success: false, error: "Unauthorized" });

  const { data: profile } = await (adminSupabase || supabase)
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", userId)
    .single();

  if (!profile?.stripe_subscription_id)
    return res
      .status(400)
      .json({ success: false, error: "No active subscription" });

  const canceled = await stripe.subscriptions.cancel(
    profile.stripe_subscription_id
  );

  await (adminSupabase || supabase)
    .from("profiles")
    .update({
      subscription_active: false,
      plan_name: null,
      stripe_subscription_id: null,
      stripe_customer_id: null,
      monthly_included_credits: 0,
      annual_included_credits: 0,
      subscription_current_period_end: null,
      credits: 0,
    })
    .eq("id", userId);

  return res.json({ success: true, subscription: canceled });
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

module.exports = {
  createCreditsCheckoutSession,
  createSubscriptionCheckoutSession,
  handleStripeWebhook,
  debitCredits,
  creditCredits,
  cancelSubscriptionImmediately,
  findProfileByEmailOrCustomer,
};

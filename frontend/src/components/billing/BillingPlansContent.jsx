import { useEffect, useState } from "react";
import {
  createCreditsCheckout,
  createSubscriptionCheckout,
} from "../../service/billingService";
import { STRIPE_PRICE_IDS } from "../../config/pricing";

export default function BillingPlansContent() {
  const [quantity, setQuantity] = useState(100);
  const [selectedTier, setSelectedTier] = useState("standard");
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly | annual

  const plans = [
    {
      name: "Starter",
      monthly: "$30/mo",
      annual: "$300/yr",
      leadsMonthly: 300,
      leadsAnnual: 300 * 12,
      extra: "$0.15",
    },
    {
      name: "Pro",
      monthly: "$40/mo",
      annual: "$400/yr",
      leadsMonthly: 1200,
      leadsAnnual: 1200 * 12,
      extra: "$0.12",
    },
    {
      name: "Agency",
      monthly: "$50/mo",
      annual: "$500/yr",
      leadsMonthly: 5000,
      leadsAnnual: 5000 * 12,
      extra: "$0.10",
    },
    {
      name: "Enterprise",
      monthly: "Custom",
      annual: "Custom",
      leadsMonthly: "Unlimited",
      leadsAnnual: "Unlimited",
      extra: "Negotiable",
    },
  ];

  const tiers = [
    { id: "standard", name: "Standard ($0.20)", price: 0.2 },
    { id: "starter", name: "Starter ($0.15)", price: 0.15 },
    { id: "pro", name: "Pro ($0.12)", price: 0.12 },
    { id: "agency", name: "Agency ($0.10)", price: 0.1 },
  ];

  const selectedTierData = tiers.find((tier) => tier.id === selectedTier);
  const estimatedCost = (quantity * selectedTierData.price).toFixed(2);

  const API_BASE =
    (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_URL) ||
    "http://localhost:3000/api/v1";

  function decodeJwt(token) {
    try {
      const payload = token.split(".")[1];
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const payload = decodeJwt(token);
        const userId = payload?.sub || payload?.user_id || payload?.id;
        if (!userId) return;

        const res = await fetch(`${API_BASE}/profiles/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        console.log("Profile response:", json);
        const p = json?.data || {};

        const plan = (p.plan_name || "").toLowerCase();
        setSubscriptionActive(!!p.subscription_active);
        setCurrentPlan(plan);

        if (!p.subscription_active || !plan) {
          setSelectedTier("standard");
        } else if (plan.startsWith("starter")) {
          setSelectedTier("starter");
        } else if (plan.startsWith("pro")) {
          setSelectedTier("pro");
        } else if (plan.startsWith("agency")) {
          setSelectedTier("agency");
        }
      } catch (_) {}
    };
    loadProfile();

    const qs = new URLSearchParams(window.location.search);
    if (qs.get("status") === "success") {
      loadProfile();
    }
  }, []);

  const handleBuyCredits = async () => {
    try {
      const tierToPrice = {
        standard: 20,
        starter: 15,
        pro: 12,
        agency: 10,
      };
      const unitPriceCents = tierToPrice[selectedTier] ?? 20;
      const { success, url, error } = await createCreditsCheckout({
        quantity: Math.max(1, Number(quantity) || 1),
        tierId: selectedTier,
        unitPriceCents,
      });
      if (!success) throw new Error(error || "Failed to create checkout");
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert(err.message || "Failed to start checkout");
    }
  };

  const handleSubscribe = async (planName) => {
    try {
      const normalized = planName.toLowerCase();

      // Choose correct Stripe Price ID based on plan + billing cycle
      let priceId;
      if (normalized === "starter") {
        priceId =
          billingCycle === "monthly"
            ? STRIPE_PRICE_IDS.StarterMonthly
            : STRIPE_PRICE_IDS.StarterAnnual;
      } else if (normalized === "pro") {
        priceId =
          billingCycle === "monthly"
            ? STRIPE_PRICE_IDS.ProMonthly
            : STRIPE_PRICE_IDS.ProAnnual;
      } else if (normalized === "agency") {
        priceId =
          billingCycle === "monthly"
            ? STRIPE_PRICE_IDS.AgencyMonthly
            : STRIPE_PRICE_IDS.AgencyAnnual;
      } else if (normalized === "enterprise") {
        priceId =
          billingCycle === "monthly"
            ? STRIPE_PRICE_IDS.EnterpriseMonthly
            : STRIPE_PRICE_IDS.EnterpriseAnnual;
      }

      if (!priceId) {
        alert(
          `Missing Stripe Price ID for ${planName} (${billingCycle}). Make sure it's defined in STRIPE_PRICE_IDS.`
        );
        return;
      }

      const { success, url, error } = await createSubscriptionCheckout({
        priceId,
        planName,
      });
      if (!success)
        throw new Error(error || "Failed to create subscription checkout");
      window.location.href = url;
    } catch (err) {
      console.error("Subscription checkout error:", err);
      alert(err.message || "Failed to start subscription");
    }
  };

  const planOrder = [
    "starter monthly",
    "starter annual",
    "pro monthly",
    "pro annual",
    "agency monthly",
    "agency annual",
  ];

  function getPlanKey(planName, cycle) {
    return `${planName.toLowerCase()} ${cycle.toLowerCase()}`;
  }

function planActionLabel(planName) {
  if (!subscriptionActive) return "Subscribe";

  const normalized = getPlanKey(planName, billingCycle);
  const current = currentPlan.toLowerCase();

  if (normalized === current) return "Subscribed";

  const curIdx = planOrder.indexOf(current);
  const targetIdx = planOrder.indexOf(normalized);

  if (curIdx === -1 || targetIdx === -1) return "Subscribe";

  // If both are monthly or both are annual, do not show downgrade
  const isCurrentAnnual = current.includes("annual");
  const isTargetAnnual = normalized.includes("annual");
  const isCurrentMonthly = current.includes("monthly");
  const isTargetMonthly = normalized.includes("monthly");

  if (targetIdx > curIdx) return "Upgrade";

  if (
    (isCurrentAnnual && isTargetAnnual && targetIdx < curIdx) ||
    (isCurrentMonthly && isTargetMonthly && targetIdx < curIdx)
  ) {
    return "Subscribed"; // treat as not allowed
  }

  return "Change";
}

function planButtonDisabled(planName) {
  const normalized = getPlanKey(planName, billingCycle);
  const current = currentPlan.toLowerCase();

  // Disable if already on this plan
  if (subscriptionActive && normalized === current) return true;

  // If current plan is annual, disable all monthly buttons
  if (current.includes("annual") && normalized.includes("monthly")) {
    return true;
  }

  // If downgrade is not allowed, disable button
  const curIdx = planOrder.indexOf(current);
  const targetIdx = planOrder.indexOf(normalized);
  if (curIdx > targetIdx) return true;

  return false;
}


  return (
    <div className="flex-1 p-4 lg:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-1">
          Billing & Plans
        </h1>
        <p className="text-[var(--text-muted)] text-sm lg:text-base">
          Pay-per-lead or subscription
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plans Card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              Plans
            </h2>

            {/* Billing Cycle Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  billingCycle === "monthly"
                    ? "bg-[var(--accent-primary)] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  billingCycle === "annual"
                    ? "bg-[var(--accent-primary)] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          {/* Plans Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-input)]">
                  <th className="text-left py-3 px-2 font-semibold text-[var(--text-primary)]">
                    Plan
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-[var(--text-primary)]">
                    Price
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-[var(--text-primary)]">
                    Leads
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-[var(--text-primary)]">
                    Extra
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-[var(--text-primary)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan, index) => (
                  <tr
                    key={plan.name}
                    className={`border-b border-[var(--border-input)] ${
                      index === plans.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="py-3 px-2 text-[var(--text-primary)] font-medium">
                      {plan.name}
                    </td>
                    <td className="py-3 px-2 text-[var(--text-primary)]">
                      {plan[billingCycle]}
                    </td>
                    <td className="py-3 px-2 text-[var(--text-primary)]">
                      {billingCycle === "monthly"
                        ? typeof plan.leadsMonthly === "number"
                          ? plan.leadsMonthly.toLocaleString()
                          : plan.leadsMonthly
                        : typeof plan.leadsAnnual === "number"
                        ? plan.leadsAnnual.toLocaleString()
                        : plan.leadsAnnual}
                    </td>
                    <td className="py-3 px-2 text-[var(--text-primary)]">
                      {plan.extra}
                    </td>
                    <td className="py-3 px-2">
                      {plan[billingCycle] !== "Custom" && (
                        <button
                          onClick={() => handleSubscribe(plan.name)}
                          disabled={planButtonDisabled(plan.name)}
                          className={`px-3 py-1.5 text-white rounded-md text-sm ${
                            planButtonDisabled(plan.name)
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
                          style={{ background: "var(--btn-gradient)" }}
                        >
                          {planActionLabel(plan.name)}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pay-Per-Lead Card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-6">
            Pay-Per-Lead
          </h2>

          <div className="space-y-6">
            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-sm"
                placeholder="Enter quantity"
                min="1"
              />
            </div>

            {/* Tier Dropdown (locked to current plan) */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Tier
              </label>
              <select
                value={selectedTier}
                disabled
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-input)] rounded-lg text-[var(--text-primary)] text-sm opacity-70 cursor-not-allowed"
              >
                {tiers
                  .filter((tier) => tier.id === selectedTier)
                  .map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Credits are locked to your active subscription tier.
              </p>
            </div>

            {/* Estimated Cost */}
            <div className="flex flex-row justify-between">
              <span className="text-[var(--text-muted)] pt-3 text-lg ">
                Est. Cost: ${estimatedCost}
              </span>
              {/* Buy Credits Button */}
              <button
                onClick={handleBuyCredits}
                className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-all duration-200 text-sm"
                style={{ background: "var(--btn-gradient)" }}
              >
                Buy Credits
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

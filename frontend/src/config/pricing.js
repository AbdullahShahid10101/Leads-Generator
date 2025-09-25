function getEnv(key) {
  return (import.meta?.env && import.meta.env[key]) || "";
}

function getLocalOverride(key) {
  try {
    return window?.localStorage?.getItem(key) || "";
  } catch (_) {
    return "";
  }
}

export const STRIPE_PRICE_IDS = {
  // Starter
  StarterMonthly:
    getEnv("VITE_STRIPE_PRICE_STARTER_MONTHLY") ||
    getLocalOverride("VITE_STRIPE_PRICE_STARTER_MONTHLY") ||
    "",
  StarterAnnual:
    getEnv("VITE_STRIPE_PRICE_STARTER_ANNUAL") ||
    getLocalOverride("VITE_STRIPE_PRICE_STARTER_ANNUAL") ||
    "",

  // Pro
  ProMonthly:
    getEnv("VITE_STRIPE_PRICE_PRO_MONTHLY") ||
    getLocalOverride("VITE_STRIPE_PRICE_PRO_MONTHLY") ||
    "",
  ProAnnual:
    getEnv("VITE_STRIPE_PRICE_PRO_ANNUAL") ||
    getLocalOverride("VITE_STRIPE_PRICE_PRO_ANNUAL") ||
    "",

  // Agency
  AgencyMonthly:
    getEnv("VITE_STRIPE_PRICE_AGENCY_MONTHLY") ||
    getLocalOverride("VITE_STRIPE_PRICE_AGENCY_MONTHLY") ||
    "",
  AgencyAnnual:
    getEnv("VITE_STRIPE_PRICE_AGENCY_ANNUAL") ||
    getLocalOverride("VITE_STRIPE_PRICE_AGENCY_ANNUAL") ||
    "",

  // Enterprise
  EnterpriseMonthly:
    getEnv("VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY") ||
    getLocalOverride("VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY") ||
    "",
  EnterpriseAnnual:
    getEnv("VITE_STRIPE_PRICE_ENTERPRISE_ANNUAL") ||
    getLocalOverride("VITE_STRIPE_PRICE_ENTERPRISE_ANNUAL") ||
    "",
};

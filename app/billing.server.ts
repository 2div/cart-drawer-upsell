/*
 * Billing is intentionally disabled by default while pricing, trial
 * length, and subscription enforcement are still being finalized.
 *
 * Set BILLING_ENABLED=true only after the production plan is decided
 * and a billing gate has been wired into authenticated app routes.
 */

function readBooleanEnv(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function readNumberEnv(value: string | undefined, fallback: number) {
  if (value === undefined || value.trim() === "") return fallback;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export const BILLING_ENABLED = readBooleanEnv(
  process.env.BILLING_ENABLED,
  false,
);

export const BILLING_PLAN = {
  name:
    process.env.BILLING_PLAN_NAME ||
    "Cart Drawer Upsell",
  monthlyPrice: readNumberEnv(
    process.env.BILLING_MONTHLY_PRICE,
    0,
  ),
  currencyCode:
    process.env.BILLING_CURRENCY_CODE || "USD",
  trialDays: readNumberEnv(
    process.env.BILLING_TRIAL_DAYS,
    10,
  ),
};

export const BILLING_TEST_MODE = readBooleanEnv(
  process.env.BILLING_TEST_MODE,
  true,
);

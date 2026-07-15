"use client";

import { useEffect, useState } from "react";

import { useAppState } from "./components/app/AppProvider";

function formatUsageValue(value, limit) {
  return `${value}/${limit}`;
}

function getUsagePercent(value, limit) {
  const numericValue = Number(value);
  const numericLimit = Number(limit);

  if (!Number.isFinite(numericValue) || !Number.isFinite(numericLimit) || numericLimit <= 0) {
    return null;
  }

  return (numericValue / numericLimit) * 100;
}

function formatPeriodEnd(value) {
  if (!value) return "No renewal date yet";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function BillingPage() {
  const {
    billingSummary,
    billingPlans,
    billingStatus,
    billingError,
    billingCheckoutStatus,
    billingCheckoutError,
    billingCancelStatus,
    billingCancelError,
    refreshBilling,
    handleStartBillingCheckout,
    handleCancelSubscription,
  } = useAppState();
  const [pageNotice, setPageNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");

    if (!checkoutStatus) {
      return;
    }

    if (checkoutStatus === "success") {
      setPageNotice("Checkout completed. Refreshing your plan status...");
      refreshBilling()
        .then(() => {
          setPageNotice("Your billing status has been refreshed.");
        })
        .catch(() => {
          setPageNotice("Checkout completed, but we could not refresh billing yet.");
        });
    }

    const cleanUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, "", cleanUrl);
  }, [refreshBilling]);

  const currentPlanCode = billingSummary?.plan_code || "free";

  return (
    <section className="billing-page">
      <div className="billing-header ui-page-header">
        <div className="ui-page-header-copy">
          <p className="eyebrow">Billing</p>
          <h1>Choose the plan that matches your publishing pace</h1>
          <p className="billing-subtitle ui-page-header-subtitle">
            Keep track of your monthly usage, compare plans, and upgrade when you need
            more room to generate and publish.
          </p>
        </div>
        {billingSummary ? (
          <div className="billing-summary-card">
            <span className="billing-summary-label">Current plan</span>
            <strong>{billingSummary.plan_label}</strong>
            <p>Renews or resets on {formatPeriodEnd(billingSummary.current_period_end)}</p>
          </div>
        ) : null}
      </div>

      {pageNotice ? <div className="billing-banner success ui-notice ui-notice-success">{pageNotice}</div> : null}
      {billingError ? <div className="billing-banner error ui-notice ui-notice-error">{billingError}</div> : null}
      {billingCheckoutError ? <div className="billing-banner error ui-notice ui-notice-error">{billingCheckoutError}</div> : null}
      {billingCancelError ? <div className="billing-banner error ui-notice ui-notice-error">{billingCancelError}</div> : null}
      {billingCancelStatus === "success" ? (
        <div className="billing-banner success ui-notice ui-notice-success">
          Your subscription will cancel at the end of the current billing period.
        </div>
      ) : null}

      {billingSummary ? (
        <div className="billing-management-row">
          {billingSummary.provider !== "internal" && currentPlanCode !== "free" ? (
            billingSummary.cancel_at_period_end ? (
              <div className="billing-plan-note">
                Cancellation is already scheduled. You will keep access until {formatPeriodEnd(billingSummary.current_period_end)}.
              </div>
            ) : (
              <button
                className="ghost-button small"
                type="button"
                disabled={billingCancelStatus === "loading"}
                onClick={() => handleCancelSubscription()}
              >
                {billingCancelStatus === "loading" ? "Scheduling cancellation..." : "Cancel at period end"}
              </button>
            )
          ) : null}
        </div>
      ) : null}

      {billingSummary ? (
        <div className="billing-usage-grid">
          <UsageCard
            label="Assets this month"
            meterPercent={getUsagePercent(
              billingSummary.usage.assets_generated,
              billingSummary.limits.assets_per_month,
            )}
            remaining={`${billingSummary.remaining.assets_remaining} left`}
            value={formatUsageValue(
              billingSummary.usage.assets_generated,
              billingSummary.limits.assets_per_month,
            )}
          />
          <UsageCard
            label="Direct publishes"
            meterPercent={getUsagePercent(
              billingSummary.usage.direct_publishes,
              billingSummary.limits.direct_publishes_per_month,
            )}
            remaining={`${billingSummary.remaining.direct_publishes_remaining} left`}
            value={formatUsageValue(
              billingSummary.usage.direct_publishes,
              billingSummary.limits.direct_publishes_per_month,
            )}
          />
          <UsageCard
            label="Subscription status"
            value={billingSummary.subscription_status}
            remaining={
              billingSummary.provider === "internal"
                ? "Not yet connected to Creem"
                : "Managed through Creem"
            }
          />
        </div>
      ) : billingStatus === "loading" ? (
        <div className="billing-empty-state">
          <h3>Loading billing details</h3>
          <p>We&apos;re fetching your current plan and usage.</p>
        </div>
      ) : null}

      <div className="billing-plans-grid">
        {billingPlans.map((plan) => {
          const isCurrentPlan = currentPlanCode === plan.code;
          const isPaidPlan = plan.code !== "free";
          const canCheckout = isPaidPlan && (plan.checkout_enabled === true || Boolean(plan.checkout_url));
          const actionLabel =
            plan.code === "free"
              ? "Included"
              : canCheckout
                ? `Continue to ${plan.label}`
                : "Coming soon";
          return (
            <article
              key={plan.code}
              className={[
                "billing-plan-card",
                isCurrentPlan ? "billing-plan-current billing-plan-featured" : "",
                plan.code === "pro" && !isCurrentPlan ? "billing-plan-featured" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {isCurrentPlan ? <span className="billing-plan-ribbon">Current</span> : null}
              <div className="billing-plan-top">
                <div>
                  <p className="billing-plan-kicker">{plan.label}</p>
                  <h2>{plan.code === "pro" ? "$10.99" : plan.code === "max" ? "$29" : "$0"}</h2>
                  <span>{plan.code === "free" ? "Get started" : "per month"}</span>
                </div>
                {isCurrentPlan ? <span className="billing-plan-badge">Active</span> : null}
              </div>

              <div className="billing-plan-metrics">
                <div>
                  <strong>{plan.assets_per_month}</strong>
                  <span>assets / month</span>
                </div>
                <div>
                  <strong>{plan.direct_publishes_per_month}</strong>
                  <span>direct publishes</span>
                </div>
              </div>

              <div className="billing-plan-actions">
                {isCurrentPlan ? (
                  <button className="ghost-button small" type="button" disabled>
                    Current plan
                  </button>
                ) : canCheckout ? (
                  <button
                    className="primary-button"
                    type="button"
                    disabled={billingCheckoutStatus === "loading"}
                    onClick={() => handleStartBillingCheckout(plan.code)}
                  >
                    {billingCheckoutStatus === "loading" ? "Opening checkout..." : `Continue to ${plan.label}`}
                  </button>
                ) : (
                  <div className="billing-plan-unavailable">
                    <button className="ghost-button small" type="button" disabled>
                      {actionLabel}
                    </button>
                    <span className="billing-plan-note">
                      This tier is not open for checkout yet.
                    </span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function UsageCard({ label, value, remaining, meterPercent = null }) {
  return (
    <div className="billing-usage-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {meterPercent !== null ? (
        <div aria-hidden="true" className="billing-usage-meter">
          <div
            className="billing-usage-meter-fill"
            style={{ width: `${Math.min(100, Math.max(0, meterPercent))}%` }}
          />
        </div>
      ) : null}
      <p>{remaining}</p>
    </div>
  );
}

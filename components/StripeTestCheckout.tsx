"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function StripeTestCheckout() {
  const [priceId, setPriceId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"payment" | "subscription" | "portal" | null>(null);

  const createPaymentCheckout = useAction(api.stripe.createPaymentCheckout);
  const createSubscriptionCheckout = useAction(api.stripe.createSubscriptionCheckout);
  const getCustomerPortalUrl = useAction(api.stripe.getCustomerPortalUrl);

  async function handleOneTimePayment() {
    if (!priceId.trim()) {
      setError("Enter a Price ID (e.g. price_xxx from Stripe Dashboard)");
      return;
    }
    setError(null);
    setLoading("payment");
    try {
      const { url } = await createPaymentCheckout({
        priceId: priceId.trim(),
      });
      if (url) window.location.href = url;
      else setError("No checkout URL returned");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleSubscription() {
    if (!priceId.trim()) {
      setError("Enter a Price ID (e.g. price_xxx from Stripe Dashboard)");
      return;
    }
    setError(null);
    setLoading("subscription");
    try {
      const { url } = await createSubscriptionCheckout({
        priceId: priceId.trim(),
      });
      if (url) window.location.href = url;
      else setError("No checkout URL returned");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleBillingPortal() {
    setError(null);
    setLoading("portal");
    try {
      const result = await getCustomerPortalUrl({});
      if (result?.url) window.location.href = result.url;
      else setError("No billing customer yet. Complete a payment or subscription first.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Portal failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Stripe Checkout</CardTitle>
        <CardDescription>
          Paste your test product&apos;s <strong>Price ID</strong> (Stripe Dashboard → Products →
          your product → copy the price id, e.g. <code className="text-xs">price_xxx</code>).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="price-id" className="text-sm font-medium">
            Price ID
          </label>
          <Input
            id="price-id"
            placeholder="price_1ABC..."
            value={priceId}
            onChange={(e) => setPriceId(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleOneTimePayment}
            disabled={!!loading}
            variant="default"
          >
            {loading === "payment" ? "Redirecting…" : "Test one-time payment"}
          </Button>
          <Button
            onClick={handleSubscription}
            disabled={!!loading}
            variant="secondary"
          >
            {loading === "subscription" ? "Redirecting…" : "Test subscription"}
          </Button>
          <Button
            onClick={handleBillingPortal}
            disabled={!!loading}
            variant="outline"
          >
            {loading === "portal" ? "Opening…" : "Open billing portal"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

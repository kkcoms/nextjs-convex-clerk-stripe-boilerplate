# Stripe integration (Convex component)

This app uses the [@convex-dev/stripe](https://www.npmjs.com/package/@convex-dev/stripe) Convex component for payments and subscriptions.

## Setup

### 1. Environment variables (Convex)

In the [Convex Dashboard](https://dashboard.convex.dev) → your project → **Settings** → **Environment Variables**, add:

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` for test, `sk_live_...` for production) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) from Stripe |

### 2. Stripe webhook

1. In [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**, add an endpoint.
2. **Endpoint URL**: `https://<your-convex-deployment>.convex.site/stripe/webhook`  
   (Use the HTTP actions URL from Convex Dashboard → Settings → URL.)
3. Select events you need (e.g. `checkout.session.completed`, `customer.subscription.*`, `invoice.*`) or “Receive all events”.
4. Copy the **Signing secret** and set it as `STRIPE_WEBHOOK_SECRET` in Convex.

### 3. App URL (for redirects)

In Convex Dashboard → **Settings** → **Environment Variables**, set:

| Variable | Description |
|----------|-------------|
| `APP_URL` | Your app URL for success/cancel redirects, e.g. `http://localhost:3000` in dev or `https://yourapp.com` in prod |

### 4. Run Convex

```bash
pnpm dev
# or: npx convex dev
```

This generates the Stripe component API and deploys your Convex backend (including the webhook route).

## Testing

1. **Get a Price ID**  
   Stripe Dashboard → **Products** → your test product → copy the **Price ID** (e.g. `price_1ABC...`).

2. **Sign in** to your app and open the **Dashboard**.

3. **Test Stripe Checkout** card:
   - Paste the Price ID into the input.
   - **Test one-time payment** → redirects to Stripe Checkout; use test card `4242 4242 4242 4242`.
   - **Test subscription** → same flow for a subscription.
   - **Open billing portal** → only works after you have at least one payment or subscription (creates a Stripe customer).

4. **Test mode**: Use Stripe test keys (`sk_test_...`, `pk_test_...`) and test cards so no real charges occur.

## Usage in the app

### One-time payment checkout

```ts
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

const createPaymentCheckout = useAction(api.stripe.createPaymentCheckout);

async function handlePay(priceId: string) {
  const { url } = await createPaymentCheckout({
    priceId,
    successUrl: `${window.location.origin}/dashboard?payment=success`,
    cancelUrl: `${window.location.origin}/dashboard`,
  });
  if (url) window.location.href = url;
}
```

### Subscription checkout

```ts
const createSubscriptionCheckout = useAction(api.stripe.createSubscriptionCheckout);

async function handleSubscribe(priceId: string) {
  const { url } = await createSubscriptionCheckout({
    priceId,
    successUrl: `${window.location.origin}/dashboard?subscribed=1`,
    cancelUrl: `${window.location.origin}/pricing`,
  });
  if (url) window.location.href = url;
}
```

### Customer portal (manage subscription / payment methods)

```ts
const getCustomerPortalUrl = useAction(api.stripe.getCustomerPortalUrl);

async function handleManageBilling() {
  const result = await getCustomerPortalUrl({});
  if (result?.url) window.location.href = result.url;
}
```

## Convex API

- **`convex/convex.config.ts`** – Registers the Stripe component.
- **`convex/http.ts`** – Registers the webhook at `/stripe/webhook`.
- **`convex/stripe.ts`** – Actions that use the component and link Stripe to the current Clerk user:
  - `createPaymentCheckout` – one-time payment
  - `createSubscriptionCheckout` – subscription
  - `getCustomerPortalUrl` – Stripe Customer Portal

The component syncs Stripe data (customers, subscriptions, payments) into Convex tables; you can query them via the component’s public API (see [component directory](https://www.convex.dev/components/stripe)).

---

## How `userId` works in the component tables

The **@convex-dev/stripe** component has its own schema. Here’s how `userId` is (or isn’t) set and how to query by user.

### Summary

| Table               | Has `userId` column? | How it gets set | Notes |
|---------------------|----------------------|------------------|--------|
| **subscriptions**   | Yes, indexed         | From **subscription metadata** when the subscription is created/updated | Reliable. We pass `subscriptionMetadata: { userId }` in checkout. |
| **payments**        | Yes, indexed         | From **payment_intent metadata** when `payment_intent.succeeded` is handled | Only for **one-time** payments. Subscription payments are intentionally skipped (no row created). |
| **invoices**        | Yes, indexed         | From the **subscription** (subscription.userId) when the invoice is created, or backfilled when the subscription is created | Can be empty if the invoice webhook runs before the subscription exists. |
| **checkout_sessions** | No                  | —                | Only `metadata` is stored; `userId` is inside `metadata`. No dedicated column or index. |
| **customers**       | No                   | —                | Only `metadata` is stored; we pass `userId` in metadata when creating customers, but there is no top-level `userId` column. |

### Details

1. **checkout_sessions**  
   The component does not have a `userId` column. It only stores `metadata` (and the session id, customer id, status, mode). So you have `metadata.userId` but cannot use an index. To search by user you’d need to filter in app (e.g. fetch and filter by `metadata.userId`) or ask the component maintainers to add a `userId` column and index (e.g. [get-convex/stripe](https://github.com/get-convex/stripe)).

2. **customers**  
   Same idea: the component schema has no `userId`; only `metadata`. We set `metadata: { userId }` when creating customers via the component client, but the component does not copy that into a top-level `userId` field. So use `metadata.userId` for lookups or request a schema change upstream.

3. **subscriptions**  
   `userId` is set from **subscription metadata** in the component when it handles `customer.subscription.created` / `customer.subscription.updated`. We pass `subscriptionMetadata: { userId }` in `createCheckoutSession`, so this is the most reliable place to query “subscriptions for this user” (e.g. `listSubscriptionsByUserId`).

4. **invoices**  
   The component sets `invoice.userId` only when it already has a **subscription** row with `userId` (it looks up by `stripeSubscriptionId` and copies `subscription.userId`). If the `invoice.created` (or similar) webhook is processed **before** `customer.subscription.created`, the subscription row doesn’t exist yet, so `invoice.userId` stays empty. When the subscription is later created, the component backfills `userId` on existing invoices for that subscription. So after a short delay, recurring subscription invoices usually get `userId`; the first invoice in a new subscription can sometimes be backfilled.

5. **payments**  
   For **one-time** payments, the component handles `payment_intent.succeeded` and sets `payments.userId` from `payment_intent.metadata.userId`. For **recurring subscription** payments, the component **skips** creating a payment row (to avoid duplicating with subscription/invoice data), so you won’t see a `payments` row with `userId` for those. Use **subscriptions** and **invoices** for subscription billing, and **payments** for one-time charges.

### Recommended way to “find everything for a user”

- **Subscriptions:** Use the component’s `listSubscriptionsByUserId` (indexed by `userId`).
- **One-time payments:** Use `listPaymentsByUserId` (indexed by `userId`; only one-time payments).
- **Invoices:** Use `listInvoicesByUserId` when you need them; accept that some may have `userId` backfilled shortly after the subscription is created.
- **Checkout sessions / customers:** Use `metadata.userId` (no index) or join via subscription/customer id from the tables above. If you need indexed lookups by user for sessions or customers, consider opening an issue or PR on the [Stripe component repo](https://github.com/get-convex/stripe) to add `userId` columns and indexes.

---

## How to find a user (by userId or stripeCustomerId)

Use these patterns to look up Stripe data for a user or customer.

### By userId (Clerk user id, e.g. `user_2abc...`)

| What you need | In this app | Or component API |
|---------------|-------------|-------------------|
| **Everything** (subscriptions, payments, invoices + customer ids) | `api.stripe.getStripeDataByUserId({ userId })` | — |
| Subscriptions only | `api.stripe.getUserSubscriptions()` (current user) | `components.stripe.public.listSubscriptionsByUserId({ userId })` |
| One-time payments only | `api.stripe.getUserPayments()` (current user) | `components.stripe.public.listPaymentsByUserId({ userId })` |
| Invoices only | — | `components.stripe.public.listInvoicesByUserId({ userId })` |

**Example – find all Stripe data for a user (e.g. in admin):**

```ts
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// By userId (e.g. from your users table or Clerk)
const data = useQuery(api.stripe.getStripeDataByUserId, {
  userId: "user_3AYcj5dixWKqEcPfsMH8G42zp5D",
});
// data.subscriptions, data.payments, data.invoices, data.stripeCustomerIds
```

### By stripeCustomerId (e.g. `cus_xxx`)

| What you need | In this app | Or component API |
|---------------|-------------|-------------------|
| **Customer + subscriptions + invoices** | `api.stripe.getCustomerData({ customerId: stripeCustomerId })` | — |
| Customer record only | — | `components.stripe.public.getCustomer({ stripeCustomerId })` |
| Subscriptions for that customer | — | `components.stripe.public.listSubscriptions({ stripeCustomerId })` |
| Payments for that customer | — | `components.stripe.public.listPayments({ stripeCustomerId })` |
| Invoices for that customer | — | `components.stripe.public.listInvoices({ stripeCustomerId })` |

**Example – find everything for a Stripe customer id:**

```ts
const data = useQuery(api.stripe.getCustomerData, {
  customerId: "cus_ABC123...",
});
// data.customer, data.subscriptions, data.invoices
```

### Flow: userId → stripeCustomerId → full customer record

1. **userId → Stripe data:** Call `getStripeDataByUserId({ userId })` → you get `subscriptions`, `payments`, `invoices`, and `stripeCustomerIds`.
2. **stripeCustomerId → customer + lists:** Pick a `stripeCustomerId` from that list (or from a subscription) and call `getCustomerData({ customerId })` to get the customer record plus subscriptions and invoices for that customer.

Checkout sessions and the customers table don’t have a dedicated `userId` column, so you can’t search them by userId directly. Use the flow above: start from `userId` → get subscriptions/payments/invoices (which have `userId` or `stripeCustomerId`) → then use `stripeCustomerId` to load the customer record if needed.

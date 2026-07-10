# Next.js + Convex + Clerk + Stripe Boilerplate

**The production stack I've used to ship multiple web apps — refined over 2.5+ years as a Convex customer — now open source.**

If you've ever spent a week wiring auth, a database, real-time updates, payments, and a decent UI before writing a single product feature — this repo is for you.

This is the boilerplate I reach for when I want to go from idea → signed-in users → live data → Stripe checkout without reinventing the backend every time. There still aren't many production-shaped Convex starters out there. As Convex has gone from early adopter tech to something closer to table stakes for new apps, I wanted one of the first solid boilerplates in the wild — the same foundation I've actually shipped with.

---

## Why this exists

Before Convex, starting a new app meant the usual cloud tax: spin up something on AWS (or similar), provision and secure a Postgres instance, wire an ORM, stand up an API layer, then somehow bolt on real-time later if you needed it. Auth was another project on top of that — SSO, social login, session edge cases — before you wrote a line of product code.

I've been building on **[Convex](https://www.convex.dev/)** for over two and a half years. In that time the platform has gotten dramatically better, and so has my development experience. What used to be a multi-service backend checklist is now TypeScript functions next to my app. I don't miss babysitting databases.

Same story with **[Clerk](https://clerk.com/)**: SSO, social providers, and polished sign-in flows without becoming an identity engineer. Pair that with **Next.js**, **Stripe**, and **Tailwind / shadcn**, and you get a stack that feels fast to build on *and* solid enough to ship.

Most "full-stack starters" still leave you assembling the hard parts yourself:

- Auth that actually syncs into your database
- A backend that stays in sync with the UI
- Payments that don't become a weekend project
- A UI kit that doesn't fight you on day two

And for Convex specifically, the starter ecosystem is still thin. Postgres/Next boilerplates are everywhere; Convex ones that also include Clerk, Stripe, and a real dashboard shell are rare. This isn't a toy demo — it's the foundation I've reused across real products with significant usage. I'm open-sourcing it so other builders can skip the glue work and start on the product.

---

## What's included

| Layer | Choice | What you get |
|-------|--------|--------------|
| **Backend / DB** | [Convex](https://convex.dev/) | Reactive TypeScript backend, real-time queries, schema, server functions |
| **Web framework** | [Next.js](https://nextjs.org/) (App Router) | Routing, SSR/RSC, production hosting |
| **Auth** | [Clerk](https://clerk.com/) | Sign-in / sign-up, session management, JWT → Convex |
| **Payments** | [Stripe](https://stripe.com/) via [`@convex-dev/stripe`](https://www.npmjs.com/package/@convex-dev/stripe) | Checkout, subscriptions, customer portal, webhooks |
| **UI** | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) | Themed dashboard shell, auth screens, dark mode |
| **Language** | TypeScript | End-to-end types from schema → client |

### Built-in product pieces

- **Clerk ↔ Convex user sync** — users land in your Convex `users` table on sign-in
- **Protected routes** — middleware keeps the dashboard behind auth
- **Dashboard shell** — sidebar layout ready to extend
- **Stripe test checkout** — one-time payments, subscriptions, and billing portal from the dashboard
- **Theme support** — light / dark with Clerk appearance wired in

---

## The stack, and why

Each piece was chosen because it removes a category of work — not because it's trendy. Here's the reasoning behind every layer.

### Why Convex

[Convex](https://www.convex.dev/) is a reactive backend platform: your database, server functions, and real-time sync live in one TypeScript codebase. Think of it as a modern replacement for the "provision Postgres + build an API + add websockets later" path — not a thin wrapper around SQL, but a different (and, for many apps, better) default.

Instead of:

`AWS/GCP → Postgres → Prisma → REST/GraphQL → WebSockets → Redis → job queue`

…you write queries and mutations in TypeScript. The UI subscribes with `useQuery`, and when data changes, clients update automatically. No cache invalidation ceremony. No hand-rolled sync layer. No afternoon spent locking down a database security group before you can store a user row.

What that means in practice:

- **One language** — schema, backend logic, and client calls are all TypeScript, with types generated for you
- **Real-time by default** — dashboards, multiplayer-ish UIs, and live lists just work
- **No API boilerplate** — every `query` / `mutation` / `action` is already an endpoint
- **Components** — official packages (like Stripe) plug into your backend without standing up another server
- **Less ops** — you're not the person on-call for connection pools and migration weekends on day one

I've been a Convex customer for **2.5+ years** and watched the DX keep improving — better tooling, components, docs, and patterns. Convex is still newer than Postgres in the ecosystem sense, which is exactly why good boilerplates matter: the database replacement is ready; the "clone and ship" templates are still catching up. This repo is my contribution to that.

That reactivity + type safety is why this stack has stayed my default for shipping apps quickly without painting myself into a corner. If you're building anything that should feel "live," Convex is the unfair advantage.

### Why Clerk

Auth is where a lot of side projects die — password resets, OAuth, SSO, session cookies, edge cases, and "how do I get the user id into my database?"

**[Clerk](https://clerk.com/)** is in this boilerplate because it solves auth as a product, not as a weekend of security homework. For me, that meant shipping **SSO and social login** the easy way — Google, Microsoft, and the rest — without building an identity stack from scratch:

- **Drop-in UI** — hosted sign-in / sign-up components that look good and handle social logins, email codes, MFA, organization/SSO flows, etc.
- **SSO without the pain** — enterprise-style sign-in and multi-provider auth without becoming an IdP expert
- **Next.js-native** — middleware (`proxy.ts`) protects routes and redirects signed-in users away from auth pages with almost no custom code
- **First-class Convex integration** — Clerk issues a JWT that Convex verifies, so `ctx.auth.getUserIdentity()` works in every backend function
- **User sync included** — this repo already upserts Clerk users into a Convex `users` table (`SyncUser` → `storeUser`) so your app data has a real user record, not just a token subject

You still own your user data in Convex. Clerk owns the hard parts of identity: sessions, credentials, SSO, and compliance-shaped flows. That split is what lets you ship a SaaS login on day one and still query "current user" safely on the backend.

### Why Next.js

[Next.js](https://nextjs.org/) is the web layer: App Router for pages, React Server Components where they help, and a clear path to production on Vercel or anywhere Node runs.

In this repo it gives you:

- File-based routes for marketing/auth/dashboard without a separate router setup
- A single deployable frontend that talks to Convex over the client SDK
- Middleware hooks that play cleanly with Clerk

Convex handles the reactive data plane; Next.js handles the document/app shell. You don't need a custom Node API server in between.

### Why Stripe (via the Convex component)

Payments are the other classic time sink: Checkout sessions, webhooks, customer records, subscription state, and "did the webhook fire before the user landed?"

This boilerplate uses Stripe through the official **[`@convex-dev/stripe`](https://www.npmjs.com/package/@convex-dev/stripe)** component:

- Checkout for **one-time payments** and **subscriptions**
- **Customer portal** for billing management
- Webhooks registered on Convex HTTP routes (`/stripe/webhook`) — no separate Express app
- Customers and subscriptions linked to the **Clerk user id**, so you can query billing state by user

There's a test checkout card on the dashboard so you can verify the flow with Stripe test keys before you touch production. Full setup lives in [docs/STRIPE.md](./docs/STRIPE.md).

### Why shadcn/ui + Tailwind

Backend speed only matters if the UI doesn't slow you down. This boilerplate ships with **[shadcn/ui](https://ui.shadcn.com/)** — not as a locked-in component library, but as **source you own**.

Unlike typical npm UI kits, shadcn copies accessible, well-structured components into your repo (`components/ui/`). You can restyle, delete, or extend them without fighting a black-box package. Paired with **Tailwind CSS**, you get:

- A real **dashboard shell** (sidebar, header, nav) ready to build product into
- Auth-friendly layouts that match Clerk's themed sign-in / sign-up
- **Dark mode** via `next-themes`, with Clerk appearance kept in sync
- Consistent primitives — buttons, forms, sheets, dialogs, inputs — so every new screen starts from the same design language

Convex makes the data layer fast to ship; shadcn makes the interface layer the same. Together they're why this starter feels like a product on day one instead of a blank `div`.

Add more components anytime with the shadcn CLI — they're already configured via `components.json` (Radix / Base UI, Hugeicons, CSS variables).

### How the pieces fit together

```
┌─────────────┐     JWT / session      ┌─────────────┐
│    Clerk    │ ─────────────────────► │   Next.js   │
│  (identity) │                        │  (App UI)   │
└─────────────┘                        └──────┬──────┘
                                              │ useQuery / useMutation / useAction
                                              ▼
                                       ┌─────────────┐
                                       │   Convex    │
                                       │ DB + logic  │
                                       └──────┬──────┘
                                              │ Stripe component + webhooks
                                              ▼
                                       ┌─────────────┐
                                       │   Stripe    │
                                       │  (billing)  │
                                       └─────────────┘
```

1. User signs in with Clerk  
2. Next.js middleware protects private routes  
3. Convex receives the Clerk JWT and resolves identity  
4. `SyncUser` writes/updates the Convex `users` row  
5. App UI reads/writes data through Convex (live updates)  
6. Billing goes through Convex → Stripe, tied to that same user  

That's the whole product skeleton. Everything else is your feature code.

---

## Glue that usually takes days (already done)

| Piece | Why it matters |
|-------|----------------|
| **Clerk → Convex JWT** | `convex/auth.config.ts` + Clerk's `convex` JWT template so `ctx.auth.getUserIdentity()` works in queries/mutations |
| **User sync** | `storeUser` + `SyncUser` keep a Convex `users` table in sync with Clerk (name, email, avatar, last sign-in) |
| **Route protection** | `proxy.ts` (Clerk middleware) protects the dashboard and redirects signed-in users away from auth pages |
| **Stripe as a Convex component** | Official component — checkout, subscriptions, portal, and webhooks without a separate Express server |
| **Auth helpers** | `convex/lib/auth.ts` — `getCurrentUser` / `getCurrentUserOrNull` so every function doesn't re-implement identity lookup |
| **Theming** | Light/dark toggle with Clerk UI appearance matched to the app theme |
| **Providers** | Root layout wires Theme → Clerk → Convex in the right order so auth tokens reach the backend |

These are the integration layers most tutorials skip — and the reason forking this is faster than starting from `create-next-app` + three integration guides.

---

## Quick start

### Prerequisites

- Node.js 20+
- Accounts for [Convex](https://www.convex.dev/), [Clerk](https://clerk.com/), and (optionally) [Stripe](https://stripe.com/)

### 1. Clone and install

```bash
git clone https://github.com/kkcoms/nextjs-convex-clerk-stripe-boilerplate.git
cd nextjs-convex-clerk-stripe-boilerplate
pnpm install   # or: npm install
```

### 2. Start the app

```bash
pnpm dev
# or: npm run dev
```

This runs Next.js and `convex dev` together. On first run, the Convex CLI will walk you through creating/linking a project.

### 3. Configure Clerk

1. Create a Clerk application and copy your keys into `.env.local` (see [Environment variables](#environment-variables)).
2. In Clerk, create a **JWT template** named `convex` (see the [Convex + Clerk guide](https://docs.convex.dev/auth/clerk)).
3. Set `CLERK_JWT_ISSUER_DOMAIN` in your **Convex** dashboard environment variables to the JWT issuer URL from that template.

After this, sign-in should work and your user should appear in the Convex `users` table.

### 4. (Optional) Configure Stripe

Payments work through the official Convex Stripe component. Full setup — webhooks, env vars, test cards — lives in:

**→ [docs/STRIPE.md](./docs/STRIPE.md)**

---

## Environment variables

Create a `.env.local` in the project root:

```bash
# Clerk (Next.js)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex (filled in by `npx convex dev`)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

Set these in the **[Convex Dashboard](https://dashboard.convex.dev)** → Settings → Environment Variables:

| Variable | Where | Purpose |
|----------|--------|---------|
| `CLERK_JWT_ISSUER_DOMAIN` | Convex | Clerk JWT issuer for `ctx.auth` |
| `STRIPE_SECRET_KEY` | Convex | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Convex | Webhook signing secret |
| `APP_URL` | Convex | Success/cancel redirect base (e.g. `http://localhost:3000`) |

A starter template is in [`.env.example`](./.env.example).

---

## Project structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Authenticated dashboard + Stripe test UI
│   ├── sign-in/            # Clerk sign-in
│   └── sign-up/            # Clerk sign-up
├── components/             # App UI, providers, Stripe checkout demo
│   └── ui/                 # shadcn/ui primitives
├── convex/                 # Backend: schema, auth, users, Stripe
│   ├── schema.ts           # Database schema
│   ├── users.ts            # Clerk → Convex user sync
│   ├── stripe.ts           # Checkout, subscriptions, portal
│   ├── http.ts             # Stripe webhook route
│   └── lib/auth.ts         # Auth helpers for queries/mutations
├── docs/
│   └── STRIPE.md           # Stripe setup & usage guide
└── proxy.ts                # Clerk middleware (route protection)
```

---

## Core flows

### Auth → your database

1. User completes Clerk sign-in  
2. `ConvexClientProvider` connects with the Clerk token  
3. `SyncUser` calls `storeUser`, which upserts into `users` (create on first visit, update `lastSignedInAt` after)  
4. Backend code uses `getCurrentUser` / `getCurrentUserOrNull` from `convex/lib/auth.ts`

You never trust a client-supplied user id for authorization — identity always comes from `ctx.auth`.

### Payments

Stripe is registered as a Convex component. Checkout sessions, subscriptions, and the customer portal are exposed as Convex actions in `convex/stripe.ts`, with webhooks handled at `/stripe/webhook`. Customers are created/linked from the authenticated Clerk subject. See [docs/STRIPE.md](./docs/STRIPE.md) for setup and query patterns by `userId`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Next.js + Convex in parallel |
| `pnpm build` | Production Next.js build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint (includes Convex rules) |

---

## Who this is for

- Builders coming from the Postgres / AWS / "roll your own API" world who want a faster default
- Indie hackers and founders who want auth + DB + payments on day one
- Teams standardizing on Convex who don't want to re-glue Clerk and Stripe each project
- Anyone tired of spending the first sprint on infrastructure instead of product
- Builders who want a SaaS-shaped skeleton: login (including SSO), dashboard, billing, live data

## Who this is *not* for

- Projects that must use a specific SQL database or ORM
- Apps that only need a static site with no backend
- Teams that want to hand-roll auth and payments from scratch (you can — this just isn't that)

---

## Contributing

Contributions are welcome — bug fixes, docs, DX improvements, and examples especially.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to propose changes.

---

## License

MIT — see [LICENSE](./LICENSE).

Use it, fork it, ship with it. If this saves you a weekend, a star on the repo helps others find it.

---

## Learn more

- [Convex docs](https://docs.convex.dev/) — Tour, functions, schema, auth
- [Convex + Clerk](https://docs.convex.dev/auth/clerk)
- [Clerk docs](https://clerk.com/docs)
- [Convex Stripe component](https://www.convex.dev/components/stripe)
- [Stripe docs](https://docs.stripe.com/)
- [Next.js docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/) — components you copy into your project
- [Stack](https://stack.convex.dev/) — deep-dives and patterns
- [Convex Discord](https://convex.dev/community)

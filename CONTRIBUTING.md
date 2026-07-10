# Contributing

Thanks for helping improve this boilerplate. The goal is to keep it **lean, production-shaped, and easy to fork** — not a kitchen-sink starter.

## Ways to contribute

- Fix bugs or broken setup steps
- Improve docs (README, Stripe guide, env examples)
- Small DX improvements (scripts, types, examples)
- UI / auth / Stripe patterns that stay general-purpose

Please open an issue first for large features or stack changes so we can align on scope.

## Development setup

1. Fork and clone the repo
2. Install dependencies: `pnpm install` (or `npm install`)
3. Copy `.env.example` → `.env.local` and fill in Clerk / Convex values
4. Run `pnpm dev`
5. Configure Clerk JWT + Convex env vars as described in the README

For Stripe work, follow [docs/STRIPE.md](./docs/STRIPE.md) with **test** keys only.

## Guidelines

- Prefer small, focused PRs
- Match existing TypeScript, Convex, and UI patterns
- Keep public Convex functions validated (`args` / `returns`) and auth-aware
- Don't commit secrets (`.env*`, Clerk/Stripe keys, deploy keys)
- Don't expand scope into unrelated product features — this is a starter, not an app

## Pull requests

1. Create a branch from `main`
2. Make your change
3. Run `pnpm lint` (and exercise the flow you touched: auth, dashboard, or Stripe)
4. Open a PR with a short description of **why** the change helps people using the boilerplate

## Code of conduct

Be respectful and constructive. Harassment or bad-faith behavior isn't welcome.

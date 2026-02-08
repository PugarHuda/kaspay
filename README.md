# KasPay - Payment Gateway for Kaspa

> Accept Kaspa cryptocurrency payments with near-zero fees and instant confirmations. The Stripe for Kaspa.

Built for **Kaspathon 2026** | Track: **Payments & Commerce**

**[Live Demo](https://kaspay-flame.vercel.app)** | **[API Docs](https://kaspay-flame.vercel.app/docs)** | **[Interactive Demo](https://kaspay-flame.vercel.app/demo)**

![KasPay Home](./public/kaspay-home.png)

## What is KasPay?

KasPay is a complete payment gateway that lets merchants accept Kaspa (KAS) payments. Merchants create payment links, share them with customers, and receive KAS directly to their wallet with real-time blockchain verification.

**Key features:**
- **Instant verification** - UTXO matching + balance polling via Kaspa REST API for real-time confirmation
- **Unique payment amounts** - Random sompi nonce per payment to differentiate concurrent transactions
- **Payment links** - Create shareable links with QR codes for any amount (KAS or USD)
- **Customer tracking** - Attach customer name/email to payment links and view on receipts
- **Sender address tracking** - Automatically records the sender's Kaspa address from transaction inputs
- **Draft & publish workflow** - Save links as drafts, edit and publish when ready, set link expiration
- **Merchant dashboard** - Track payments with sender/receiver addresses, revenue charts, CSV export
- **Editable wallet** - Change your receiving Kaspa address anytime from settings
- **Webhooks** - Get notified via HTTP when payments are confirmed (HMAC-SHA256 signed)
- **Embeddable buttons** - Copy-paste HTML to add "Pay with Kaspa" to any website (3 styles)
- **REST API** - 15 endpoints for full programmatic integration
- **Payment receipts** - Detailed receipts with customer info, sender/receiver addresses, TX ID
- **Interactive demo** - Try the payment flow without real crypto at `/demo`
- **Near-zero fees** - Only Kaspa network fees (< $0.01)
- **Dark/Light mode** - Neobrutalism UI with theme toggle

## Architecture

```
Customer                  KasPay                    Kaspa Blockchain
   |                        |                            |
   |-- Opens payment link ->|                            |
   |<- QR code + address ---|                            |
   |                        |                            |
   |-- Sends KAS ---------->|----------(on-chain)------->|
   |                        |                            |
   |                        |-- Polls balance/UTXOs ---->|
   |                        |<- Confirmed! --------------|
   |<- Payment confirmed! --|                            |
   |                        |-- Webhook to merchant      |
```

**How payment verification works:**
1. Customer visits `/pay/[slug]`, which creates a payment session with a **unique amount** (base amount + random 1-9999 sompi nonce)
2. Frontend polls `GET /api/payments/:id/status` every 2 seconds
3. Backend calls Kaspa REST API (`api-tn10.kaspa.org` for testnet):
   - **Primary: UTXO matching** - `GET /addresses/{addr}/utxos` scans for a UTXO matching the exact expected sompi amount. This uniquely identifies the payment even with concurrent transactions.
   - **Fallback: Balance check** - `GET /addresses/{addr}/balance` verifies balance >= initialBalance + expectedAmount
4. On match, fetches `GET /transactions/{txId}` to extract the **sender's address** from transaction inputs
5. Payment is marked "confirmed", sender address saved, and webhook fires

**No smart contracts needed** - Kaspa is UTXO-based (like Bitcoin). The unique sompi nonce ensures each payment has a distinct amount, allowing precise UTXO matching even when multiple customers pay via the same merchant address simultaneously.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | Full-stack React with API routes |
| Language | TypeScript | Type safety |
| Database | Neon PostgreSQL + Drizzle ORM | Serverless Postgres, type-safe ORM |
| Styling | Tailwind CSS | Utility-first CSS with neobrutalism design |
| UI Components | shadcn/ui pattern (custom) | Accessible, composable |
| Auth | JWT + bcrypt | Stateless authentication |
| Blockchain | Kaspa REST API | Real-time balance/UTXO queries |
| Charts | Recharts | Dashboard analytics |
| Animations | Framer Motion | Smooth page transitions |
| QR Codes | qrcode.react | SVG QR code generation (Kaspa URI scheme) |
| Validation | Zod | Runtime type validation on all endpoints |

## Project Structure

```
kaspay/
├── app/
│   ├── (auth)/              # Login & register pages
│   ├── (dashboard)/         # Merchant dashboard (protected)
│   │   ├── dashboard/       # Analytics overview with charts
│   │   ├── payments/        # Payment history table with search/filter/CSV export
│   │   ├── links/           # Payment link management (create/draft/publish)
│   │   ├── webhooks/        # Webhook configuration & event subscriptions
│   │   └── settings/        # API keys, editable wallet address, payment timeout
│   ├── pay/[slug]/          # Customer payment page (QR + live status + countdown)
│   ├── receipt/[id]/        # Payment receipt page
│   ├── demo/                # Interactive payment demo (no real crypto)
│   ├── docs/                # API documentation
│   └── api/                 # REST API routes
│       ├── auth/            # Register, login, me
│       ├── links/           # CRUD payment links
│       ├── payments/        # Create & poll payments
│       ├── webhooks/        # Webhook management
│       ├── dashboard/       # Analytics stats
│       ├── settings/        # User settings
│       ├── network/         # Kaspa network info
│       └── price/           # KAS/USD price (CoinGecko)
├── lib/
│   ├── db/                  # Drizzle schema & Neon client
│   ├── auth/                # JWT utils & React auth context
│   ├── kaspa/               # Kaspa REST API client (balance, UTXOs, network)
│   └── webhooks/            # Webhook delivery with HMAC-SHA256 signing
└── components/ui/           # Reusable UI components (Button, Card, Badge, etc.)
```

## Setup & Development

### Prerequisites
- Node.js 18+
- A Neon PostgreSQL database (free at [neon.tech](https://neon.tech))
- A Kaspa wallet address (mainnet or testnet)

### Installation

```bash
git clone https://github.com/PugarHuda/kaspay.git
cd kaspay
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Database
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/kaspay?sslmode=require"

# Auth
JWT_SECRET="generate-a-strong-random-secret"

# Kaspa API (use testnet for development)
KASPA_API_URL="https://api-tn10.kaspa.org"  # testnet
# KASPA_API_URL="https://api.kaspa.org"     # mainnet
KASPA_NETWORK="testnet-10"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Push Database Schema

```bash
npm run db:push
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

## Deployment (Vercel)

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add environment variables (DATABASE_URL, JWT_SECRET, KASPA_API_URL, NEXT_PUBLIC_APP_URL)
4. Deploy

## API Reference

### Authentication

Protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

Get your token by calling `POST /api/auth/register` or `POST /api/auth/login`.

### Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | No | Create merchant account |
| `/api/auth/login` | POST | No | Authenticate & get JWT token |
| `/api/auth/me` | GET | Yes | Get current user profile & API key |
| `/api/links` | POST | Yes | Create payment link |
| `/api/links` | GET | Yes | List all payment links |
| `/api/links/:id` | PATCH | Yes | Update link (e.g., publish draft) |
| `/api/payments` | POST | No | Create payment session from link |
| `/api/payments/:id/status` | GET | No | Poll payment status (blockchain check) |
| `/api/payments` | GET | Yes | List all merchant payments |
| `/api/webhooks` | POST | Yes | Register webhook endpoint |
| `/api/webhooks` | GET | Yes | List registered webhooks |
| `/api/dashboard/stats` | GET | Yes | Dashboard analytics (volume, charts) |
| `/api/settings` | PATCH | Yes | Update wallet address & payment timeout |
| `/api/price` | GET | No | Get live KAS/USD price (CoinGecko) |
| `/api/network` | GET | No | Get Kaspa network stats (blocks, DAA) |

Full interactive documentation available at `/docs`.

### Webhook Events

| Event | Description |
|-------|-------------|
| `payment.confirmed` | Payment verified on blockchain |
| `payment.expired` | Payment session timed out |
| `*` | Subscribe to all events |

Each delivery includes an `X-KasPay-Signature` header (HMAC-SHA256) and `X-KasPay-Event` header.

## Kaspa Integration Details

- **Network**: Testnet-10 (for development), Mainnet (for production)
- **REST API**: `https://api-tn10.kaspa.org` (testnet) / `https://api.kaspa.org` (mainnet)
- **Explorer**: `https://explorer-tn10.kaspa.org` (testnet) / `https://explorer.kaspa.org` (mainnet)
- **Faucet**: `https://faucet-tn10.kaspanet.io` (testnet coins for testing)
- **Address format**: `kaspatest:` (testnet) or `kaspa:` (mainnet)
- **Balance unit**: API returns sompi (1 KAS = 100,000,000 sompi)
- **Verification**: UTXO matching (primary) + balance check (fallback) + sender address extraction
- **Price feed**: CoinGecko API with 60-second cache

## Troubleshooting

### Kaspium / Mobile Wallet: gRPC `UNAVAILABLE` error on Testnet

If you see this error in Kaspium or another mobile wallet:

```
gRPC Error (code: 14, codeName: UNAVAILABLE,
message: Error connecting: SocketException: Failed host lookup: 'tn10.kaspa.org')
```

This means the default public gRPC node `tn10.kaspa.org` is no longer reachable. This is a **wallet-side issue**, not a KasPay issue. KasPay uses the REST API (`api-tn10.kaspa.org`) which is separate.

**Solutions:**
1. **Check active TN10 nodes** at [nodes-tn10.kaspa.ws](https://nodes-tn10.kaspa.ws/) and set a custom gRPC endpoint in your wallet settings
2. **Use [Kaspa-NG](https://github.com/aspectron/kaspa-ng/releases)** wallet which has built-in Testnet-10 support and auto-discovers peers
3. **Use the [Web Wallet](https://wallet.kaspa.org)** or Kaspa CLI wallet connected to a working TN10 node
4. **Run your own TN10 node** - see [Kaspa TN10 setup guide](https://kaspa.org/tn10-crescendo-hardfork-node-setup-guide/)

### Payments stuck on "pending"

- Ensure `KASPA_API_URL` in `.env.local` points to the correct network
- Check that the merchant wallet address prefix matches the network (`kaspatest:` for testnet, `kaspa:` for mainnet)
- Verify the Kaspa REST API is reachable: `curl https://api-tn10.kaspa.org/info/blockdag`

### Database connection issues

- Ensure `DATABASE_URL` includes `?sslmode=require` for Neon PostgreSQL
- Run `npm run db:push` to create/update the schema

## Database Schema

5 tables with relations:

- **users** - Merchant accounts (email, password hash, Kaspa address, API key)
- **paymentLinks** - Payment links (title, amount, currency, slug, expiry, status)
- **payments** - Payment sessions (amount expected/received, sender address, TX ID, customer info, status)
- **webhooks** - Webhook endpoints (URL, events, HMAC secret, active flag)
- **webhookLogs** - Delivery logs (status code, response, errors)

## AI Usage Disclosure

As required by Kaspathon rules, here is a **transparent and detailed disclosure** of AI usage in this project. Per the rules: _"participants must clearly document where & how AI was used."_

### Tool Used

**Claude Code** (Anthropic's CLI coding assistant, model: Claude Opus 4.6)

### Where AI Was Used (by file/area)

| Area | Files | What AI Did | What Developer Did |
|------|-------|-------------|-------------------|
| **Database Schema** | `lib/db/schema.ts` | Generated Drizzle ORM table definitions based on developer's data model spec | Designed the 5-table schema (users, paymentLinks, payments, webhooks, webhookLogs), defined all fields and relations |
| **API Routes** | `app/api/**/*.ts` (15 endpoints) | Generated boilerplate for route handlers, Zod validation schemas, and CRUD logic | Specified each endpoint's behavior, auth requirements, and business logic; designed the payment verification flow |
| **Kaspa Integration** | `lib/kaspa/rpc.ts` | Wrote the KaspaAPI client class based on developer's API research | Developer researched Kaspa REST API docs, identified correct endpoints (`/addresses/{addr}/balance`, `/utxos`), tested against live TN10 API |
| **Payment Verification** | `app/api/payments/[id]/status/route.ts` | Generated the polling logic skeleton | Developer designed the verification algorithm (initialBalance + expectedAmount comparison), debugged cache issues with `cache: "no-store"` |
| **UI Pages** | `app/page.tsx`, `app/docs/page.tsx`, `app/demo/page.tsx`, `app/pay/[slug]/page.tsx`, `app/(dashboard)/**` | Generated React component code, Tailwind styling, Framer Motion animations | Developer chose neobrutalism design system, specified layout, UX flow, color scheme, and all user interactions |
| **Auth System** | `lib/auth/jwt.ts`, `lib/auth/context.tsx` | Generated JWT utilities and React auth context | Developer chose JWT + bcrypt approach, set security parameters (12 salt rounds, 7-day expiry) |
| **Webhook System** | `lib/webhooks/deliver.ts` | Generated HMAC-SHA256 signing and delivery logic | Developer designed webhook event system and payload format |
| **Documentation** | `README.md`, `app/docs/page.tsx` | Helped write and structure documentation, API reference tables, troubleshooting guides | Developer provided all technical content, verified accuracy, wrote architecture explanations |
| **Embed System** | `app/(dashboard)/links/page.tsx` (embed modal) | Generated HTML embed code templates and preview UI | Developer designed 3 embed styles (button/card/minimal) and the neobrutalism styling |

### How AI Was Used (workflow)

1. **Developer designs** - Architecture, data model, UX flow, and feature specs were all decided by the developer before any code generation
2. **Developer prompts AI** - Specific, detailed prompts describing exactly what each component should do (e.g., "create a payment status polling endpoint that checks Kaspa REST API balance and UTXOs")
3. **AI generates code** - Claude Code produced initial implementations based on the developer's specifications
4. **Developer reviews & tests** - All generated code was reviewed, tested against live Kaspa Testnet-10, and iterated on
5. **Developer debugs** - Integration issues (e.g., Next.js fetch caching returning stale blockchain data, Zod v4 breaking changes, Drizzle-kit config) were identified through testing and fixed with AI assistance

### Developer's Original Contributions

- **Product vision**: Conceived KasPay as "Stripe for Kaspa" - a full payment gateway, not just a simple send/receive tool
- **Architecture design**: Chose balance-polling verification over websockets, UTXO-based TX ID extraction, REST API over gRPC
- **Kaspa blockchain research**: Studied Kaspa's UTXO model, sompi units, address formats, REST API capabilities, and testnet infrastructure
- **Tech stack selection**: Chose Next.js 14, Neon PostgreSQL, Drizzle ORM, Tailwind, and all dependencies
- **UX/UI design decisions**: Neobrutalism design system, payment flow (QR + countdown + confetti), mobile responsive layout, dark/light mode
- **Testing with real transactions**: Sent real testnet KAS to verify the payment flow end-to-end
- **Deployment & infrastructure**: Set up Neon database, Vercel deployment, environment configuration
- **Feature design**: Draft/publish workflow, link expiration, customer fields, embed styles, CSV export, webhook events

### What AI Did NOT Do

- Did **not** make any product or design decisions
- Did **not** deploy the application or configure infrastructure
- Did **not** test with real Kaspa transactions
- Did **not** research or choose the Kaspa blockchain integration approach
- Did **not** design the database schema or API architecture (it implemented the developer's designs)
- All blockchain integration logic was **verified by the developer** against live Kaspa Testnet-10 API responses

### Commit History

The full git commit history is available to verify the development timeline and progression of work done during the hackathon period.

## Demo & Submission

| Requirement | Status |
|-------------|--------|
| GitHub Repository | This repo |
| Live Demo | [kaspay-flame.vercel.app](https://kaspay-flame.vercel.app) |
| Interactive Demo | [/demo](https://kaspay-flame.vercel.app/demo) |
| Demo Video (3 min) | _Coming soon_ |
| Screenshot | `./public/kaspay-home.png` |
| README with setup | This file |
| AI Usage Disclosure | See above |
| Open Source | MIT License |

## License

MIT

---

Built with love for the Kaspa community. Kaspathon 2026.

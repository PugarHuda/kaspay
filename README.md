# KasPay - Payment Gateway for Kaspa

> Accept Kaspa cryptocurrency payments with near-zero fees and instant confirmations. The Stripe for Kaspa.

Built for **Kaspathon 2026**.

## What is KasPay?

KasPay is a complete payment gateway that lets merchants accept Kaspa (KAS) payments. Merchants create payment links, share them with customers, and receive KAS directly to their wallet with real-time blockchain verification.

**Key features:**
- **Instant verification** - Polls Kaspa blockchain REST API to confirm payments in real-time
- **Payment links** - Create shareable links with QR codes for any amount
- **Merchant dashboard** - Track payments, revenue charts, export CSV
- **Webhooks** - Get notified via HTTP when payments are confirmed (HMAC-SHA256 signed)
- **Embeddable buttons** - Copy-paste HTML to add "Pay with Kaspa" to any website
- **REST API** - Full API for developers to integrate programmatically
- **Near-zero fees** - Only Kaspa network fees (< $0.01)

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
1. Customer visits `/pay/[slug]`, which creates a payment session
2. Frontend polls `GET /api/payments/:id/status` every 2 seconds
3. Backend calls Kaspa REST API (`api-tn10.kaspa.org` for testnet):
   - `GET /addresses/{addr}/balance` - Check if balance >= expected amount
   - `GET /addresses/{addr}/utxos` - Get transaction ID from UTXOs
4. When balance matches, payment is marked "confirmed" and webhook fires

**No smart contracts needed** - Kaspa is UTXO-based (like Bitcoin). We verify payments by checking on-chain balance and UTXOs directly via the Kaspa REST API.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | Full-stack React with API routes |
| Language | TypeScript | Type safety |
| Database | Neon PostgreSQL + Drizzle ORM | Serverless Postgres, type-safe ORM |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | shadcn/ui pattern (custom) | Accessible, composable |
| Auth | JWT + bcrypt | Stateless authentication |
| Blockchain | Kaspa REST API | Real-time balance/UTXO queries |
| Charts | Recharts | Dashboard analytics |
| Animations | Framer Motion | Smooth page transitions |
| QR Codes | qrcode.react | SVG QR code generation |

## Project Structure

```
kaspay/
├── app/
│   ├── (auth)/           # Login & register pages
│   ├── (dashboard)/      # Merchant dashboard
│   │   ├── dashboard/    # Analytics overview
│   │   ├── payments/     # Payment history table
│   │   ├── links/        # Payment link management
│   │   ├── webhooks/     # Webhook configuration
│   │   └── settings/     # API keys & wallet
│   ├── pay/[slug]/       # Customer payment page (QR + live status)
│   ├── docs/             # API documentation
│   └── api/              # REST API routes
│       ├── auth/         # Register, login, me
│       ├── links/        # CRUD payment links
│       ├── payments/     # Create & poll payments
│       ├── webhooks/     # Webhook management
│       ├── dashboard/    # Analytics stats
│       └── price/        # KAS/USD price
├── lib/
│   ├── db/               # Drizzle schema & client
│   ├── auth/             # JWT utils & React context
│   ├── kaspa/            # Kaspa REST API client
│   └── webhooks/         # Webhook delivery with HMAC
└── components/ui/        # Reusable UI components
```

## Setup & Development

### Prerequisites
- Node.js 18+
- A Neon PostgreSQL database (free at [neon.tech](https://neon.tech))
- A Kaspa wallet address (mainnet or testnet)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/kaspay.git
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

## API Overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | No | Create merchant account |
| `/api/auth/login` | POST | No | Get JWT token |
| `/api/links` | POST | Yes | Create payment link |
| `/api/links` | GET | Yes | List payment links |
| `/api/payments` | POST | No | Create payment session |
| `/api/payments/:id/status` | GET | No | Poll payment status |
| `/api/payments` | GET | Yes | List all payments |
| `/api/webhooks` | POST | Yes | Register webhook |
| `/api/price` | GET | No | Get KAS/USD price |

Full documentation available at `/docs`.

## Kaspa Integration Details

- **Network**: Testnet-10 (for development), Mainnet (for production)
- **API**: Kaspa REST API at `api-tn10.kaspa.org` (testnet) / `api.kaspa.org` (mainnet)
- **Address format**: `kaspatest:` (testnet) or `kaspa:` (mainnet)
- **Balance unit**: API returns sompi (1 KAS = 100,000,000 sompi)
- **Verification**: Balance check + UTXO lookup for transaction ID

## AI Usage Disclosure

As required by Kaspathon rules, here is a transparent disclosure of AI usage in this project:

**Tool used**: Claude Code (Anthropic's CLI coding assistant)

**How AI was used**:
- **Code generation**: Claude Code generated the initial boilerplate for API routes, database schema, UI components, and page layouts based on detailed architectural specifications provided by the developer
- **Bug fixing**: AI helped diagnose and fix issues like Next.js fetch caching (causing stale blockchain data), Zod v4 API changes, and Drizzle-kit configuration updates
- **Code review**: AI suggested improvements for security (input validation, JWT auth) and performance (cache busting for real-time blockchain queries)

**Developer's role**:
- Designed the overall architecture and payment flow
- Made all product decisions (features, UX flow, tech stack)
- Tested on Kaspa Testnet-10 with real transactions
- Debugged integration issues between KasPay and Kaspa blockchain
- Configured database, environment, and deployment

**What AI did NOT do**:
- AI did not deploy the application
- AI did not make product/design decisions
- AI did not test with real Kaspa transactions
- All blockchain integration logic was verified against live Kaspa Testnet-10 API responses

## License

MIT

---

Built with love for the Kaspa community. Kaspathon 2026.

"use client";

import Link from "next/link";
import { ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KasPayLogo, KasPayWordmark } from "@/components/ui/logo";
import { useState } from "react";

const endpoints = [
  {
    method: "POST",
    path: "/api/auth/register",
    description: "Create a new merchant account",
    auth: false,
    body: `{
  "email": "merchant@example.com",
  "password": "securepassword",
  "name": "My Store",
  "kaspaAddress": "kaspa:qr..."
}`,
    response: `{
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "token": "jwt-token"
}`,
  },
  {
    method: "POST",
    path: "/api/auth/login",
    description: "Authenticate and get JWT token",
    auth: false,
    body: `{
  "email": "merchant@example.com",
  "password": "securepassword"
}`,
    response: `{
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "token": "jwt-token"
}`,
  },
  {
    method: "GET",
    path: "/api/auth/me",
    description: "Get your account details and API key",
    auth: true,
    body: null,
    response: `{
  "id": "uuid",
  "email": "merchant@example.com",
  "name": "My Store",
  "kaspaAddress": "kaspa:qr...",
  "apiKey": "your-api-key-uuid",
  "paymentExpiry": 30
}`,
  },
  {
    method: "POST",
    path: "/api/links",
    description: "Create a new payment link. Supports KAS or USD currency (USD auto-converts at payment time).",
    auth: true,
    body: `{
  "title": "Premium Plan",
  "description": "Monthly subscription",
  "amount": 100,
  "currency": "KAS",
  "expiryMinutes": 30,
  "status": "active",
  "successMessage": "Thank you!",
  "redirectUrl": "https://yoursite.com/thanks",
  "linkExpiresIn": 10080
}`,
    response: `{
  "id": "uuid",
  "title": "Premium Plan",
  "amount": "100.00000000",
  "slug": "premium-plan-abc123",
  "url": "https://kaspay.vercel.app/pay/premium-plan-abc123",
  "status": "active",
  "expiresAt": "2026-02-15T12:00:00.000Z"
}`,
  },
  {
    method: "GET",
    path: "/api/links",
    description: "List all your payment links",
    auth: true,
    body: null,
    response: `{
  "data": [
    {
      "id": "uuid",
      "title": "Premium Plan",
      "amount": "100.00000000",
      "currency": "KAS",
      "slug": "premium-plan-abc123",
      "status": "active",
      "expiresAt": null,
      "expiryMinutes": 30,
      "createdAt": "2026-02-08T12:00:00.000Z"
    }
  ]
}`,
  },
  {
    method: "PATCH",
    path: "/api/links/:id",
    description: "Update a payment link (e.g., publish a draft or deactivate a link)",
    auth: true,
    body: `{
  "status": "active"
}`,
    response: `{
  "id": "uuid",
  "status": "active"
}`,
  },
  {
    method: "POST",
    path: "/api/payments",
    description: "Create a payment session from a link. Public endpoint for customers.",
    auth: false,
    body: `{
  "paymentLinkSlug": "premium-plan-abc123",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "metadata": { "orderId": "12345" }
}`,
    response: `{
  "id": "payment-uuid",
  "kaspaAddress": "kaspa:qr...",
  "amountExpected": "100.00000000",
  "status": "pending",
  "expiresAt": "2026-02-08T13:00:00.000Z"
}`,
  },
  {
    method: "GET",
    path: "/api/payments/:id/status",
    description: "Poll payment status. Checks Kaspa blockchain for balance and UTXOs in real-time.",
    auth: false,
    body: null,
    response: `{
  "id": "payment-uuid",
  "status": "confirmed",
  "amountReceived": 100,
  "senderAddress": "kaspatest:qr...",
  "txId": "kaspa-transaction-hash",
  "confirmations": 1,
  "confirmedAt": "2026-02-08T12:01:00.000Z"
}`,
  },
  {
    method: "GET",
    path: "/api/payments",
    description: "List all payments for your account with status and transaction details",
    auth: true,
    body: null,
    response: `{
  "data": [
    {
      "id": "uuid",
      "amountExpected": "100.00000000",
      "amountReceived": "100.00000000",
      "status": "confirmed",
      "txId": "kaspa-tx-hash...",
      "senderAddress": "kaspatest:qr...",
      "customerName": "John Doe",
      "customerEmail": "customer@example.com",
      "createdAt": "2026-02-08T12:00:00.000Z",
      "confirmedAt": "2026-02-08T12:01:00.000Z"
    }
  ]
}`,
  },
  {
    method: "POST",
    path: "/api/webhooks",
    description: "Register a webhook endpoint for payment notifications",
    auth: true,
    body: `{
  "url": "https://your-server.com/webhook",
  "events": ["payment.confirmed", "payment.expired"]
}`,
    response: `{
  "id": "uuid",
  "url": "https://your-server.com/webhook",
  "events": ["payment.confirmed", "payment.expired"],
  "secret": "webhook-signing-secret",
  "isActive": true
}`,
  },
  {
    method: "GET",
    path: "/api/webhooks",
    description: "List all your registered webhooks",
    auth: true,
    body: null,
    response: `{
  "data": [
    {
      "id": "uuid",
      "url": "https://your-server.com/webhook",
      "events": ["payment.confirmed"],
      "isActive": true,
      "createdAt": "2026-02-08T12:00:00.000Z"
    }
  ]
}`,
  },
  {
    method: "PATCH",
    path: "/api/settings",
    description: "Update your account settings (payment timeout, wallet address)",
    auth: true,
    body: `{
  "paymentExpiry": 60,
  "kaspaAddress": "kaspatest:qr..."
}`,
    response: `{
  "paymentExpiry": 60,
  "kaspaAddress": "kaspatest:qr..."
}`,
  },
  {
    method: "GET",
    path: "/api/price",
    description: "Get live KAS/USD price from CoinGecko (60-second cache)",
    auth: false,
    body: null,
    response: `{
  "price": 0.10,
  "currency": "USD"
}`,
  },
  {
    method: "GET",
    path: "/api/network",
    description: "Get live Kaspa network statistics",
    auth: false,
    body: null,
    response: `{
  "blockCount": 12345678,
  "headerCount": 12345678,
  "difficulty": 1234567890123,
  "virtualDaaScore": 87654321,
  "networkName": "testnet-10"
}`,
  },
];

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-300 text-blue-900",
    POST: "bg-emerald-300 text-emerald-900",
    PATCH: "bg-amber-300 text-amber-900",
    DELETE: "bg-red-300 text-red-900",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-md border-2 border-foreground text-xs font-black shadow-brutal-sm ${colors[method] || "bg-muted"}`}
    >
      {method}
    </span>
  );
}

export default function DocsPage() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function copyCode(code: string, idx: number) {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b-2 border-foreground sticky top-0 bg-card z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <KasPayWordmark size="sm" />
            </Link>
            <span className="text-foreground font-black">/</span>
            <span className="font-bold">API Documentation</span>
          </div>
          <Link href="/register">
            <Button size="sm">Get API Key</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-4">KasPay API</h1>
          <p className="text-lg text-muted-foreground mb-6 font-medium">
            Integrate Kaspa payments into your application with our simple REST
            API. Accept payments, create payment links, and receive webhook
            notifications.
          </p>

          <div className="bg-muted border-2 border-foreground rounded-md p-4 shadow-brutal-sm">
            <p className="text-sm font-black mb-1">Base URL</p>
            <code className="text-sm font-mono text-primary font-bold">
              {typeof window !== "undefined" ? window.location.origin : "https://kaspay.vercel.app"}
            </code>
          </div>
        </div>

        {/* Auth Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-black mb-4">Authentication</h2>
          <p className="text-muted-foreground mb-4 font-medium">
            Protected endpoints require a JWT token in the Authorization header:
          </p>
          <pre className="bg-muted border-2 border-foreground p-4 rounded-md text-sm font-mono overflow-x-auto shadow-brutal-sm font-medium">
            Authorization: Bearer your-jwt-token
          </pre>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Get your token by calling POST /api/auth/login or POST /api/auth/register.
          </p>
        </div>

        {/* Endpoints */}
        <h2 className="text-2xl font-black mb-6">Endpoints</h2>
        <div className="space-y-8">
          {endpoints.map((ep, i) => (
            <div key={i} className="border-2 border-foreground rounded-md overflow-hidden shadow-brutal">
              <div className="bg-muted px-4 py-3 flex items-center gap-3 border-b-2 border-foreground">
                <MethodBadge method={ep.method} />
                <code className="text-sm font-mono font-bold">{ep.path}</code>
                {ep.auth && (
                  <span className="ml-auto text-xs bg-amber-300 text-amber-900 px-2.5 py-0.5 rounded-md border-2 border-foreground font-black shadow-brutal-sm">
                    Auth Required
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-4 font-medium">
                  {ep.description}
                </p>

                {ep.body && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-black text-muted-foreground uppercase">
                        Request Body
                      </p>
                      <button
                        onClick={() => copyCode(ep.body!, i)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedIdx === i ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <pre className="bg-muted border-2 border-foreground p-3 rounded-md text-xs font-mono overflow-x-auto shadow-brutal-sm">
                      {ep.body}
                    </pre>
                  </div>
                )}

                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase mb-2">
                    Response
                  </p>
                  <pre className="bg-muted border-2 border-foreground p-3 rounded-md text-xs font-mono overflow-x-auto shadow-brutal-sm">
                    {ep.response}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Responses */}
        <div className="mt-12 mb-12">
          <h2 className="text-2xl font-black mb-4">Error Responses</h2>
          <p className="text-muted-foreground mb-4 font-medium">
            All endpoints return errors in a consistent format with appropriate HTTP status codes.
          </p>
          <pre className="bg-muted border-2 border-foreground p-4 rounded-md text-xs font-mono overflow-x-auto shadow-brutal-sm mb-4">
{`// 400 Bad Request - Invalid input
{ "error": "Invalid email format" }

// 401 Unauthorized - Missing or invalid token
{ "error": "Unauthorized" }

// 404 Not Found - Resource doesn't exist
{ "error": "Payment link not found" }

// 409 Conflict - Duplicate resource
{ "error": "Email already registered" }`}
          </pre>
        </div>

        {/* Webhook Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-black mb-4">Webhook Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-foreground rounded-md overflow-hidden">
              <thead>
                <tr className="bg-muted border-b-2 border-foreground">
                  <th className="px-4 py-3 text-left text-sm font-black">Event</th>
                  <th className="px-4 py-3 text-left text-sm font-black">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-foreground/20">
                  <td className="px-4 py-3"><code className="text-sm font-mono font-bold text-primary">payment.confirmed</code></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-medium">Fired when a payment is verified on the Kaspa blockchain</td>
                </tr>
                <tr className="border-b border-foreground/20">
                  <td className="px-4 py-3"><code className="text-sm font-mono font-bold text-primary">payment.expired</code></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-medium">Fired when a payment session times out without receiving funds</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><code className="text-sm font-mono font-bold text-primary">*</code></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-medium">Subscribe to all events</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Webhook Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-black mb-4">Webhook Signatures</h2>
          <p className="text-muted-foreground mb-4 font-medium">
            Each webhook delivery includes an <code className="bg-muted border-2 border-foreground px-1.5 py-0.5 rounded-md text-sm font-bold">X-KasPay-Signature</code> header
            containing an HMAC-SHA256 signature of the payload using your webhook secret.
          </p>
          <pre className="bg-muted border-2 border-foreground p-4 rounded-md text-xs font-mono overflow-x-auto shadow-brutal-sm">
{`// Verify webhook signature (Node.js)
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return signature === expected;
}`}
          </pre>
        </div>

        {/* Flow diagram */}
        <div className="mt-12">
          <h2 className="text-2xl font-black mb-4">Payment Flow</h2>
          <div className="bg-card border-2 border-foreground rounded-md p-6 shadow-brutal">
            <div className="space-y-4 text-sm">
              {[
                {
                  step: "1",
                  title: "Merchant creates a payment link",
                  desc: "POST /api/links with amount and title",
                  color: "bg-primary",
                },
                {
                  step: "2",
                  title: "Customer opens the payment page",
                  desc: "POST /api/payments creates a payment session with the merchant's Kaspa address",
                  color: "bg-primary",
                },
                {
                  step: "3",
                  title: "Customer sends KAS to the address",
                  desc: "QR code and address displayed. Customer pays from any Kaspa wallet.",
                  color: "bg-secondary",
                },
                {
                  step: "4",
                  title: "KasPay verifies on-chain",
                  desc: "GET /api/payments/:id/status polls the Kaspa blockchain REST API for balance + UTXOs",
                  color: "bg-secondary",
                },
                {
                  step: "5",
                  title: "Payment confirmed, webhook sent",
                  desc: 'Status updated to "confirmed", webhook delivered to merchant\'s endpoint with HMAC signature',
                  color: "bg-accent",
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className={`w-8 h-8 ${item.color} border-2 border-foreground rounded-md flex items-center justify-center text-xs font-black shrink-0 shadow-brutal-sm`}>
                    {item.step}
                  </div>
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

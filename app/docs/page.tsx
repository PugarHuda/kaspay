"use client";

import Link from "next/link";
import { Zap, ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    method: "POST",
    path: "/api/links",
    description: "Create a new payment link",
    auth: true,
    body: `{
  "title": "Premium Plan",
  "description": "Monthly subscription",
  "amount": 100,
  "currency": "KAS"
}`,
    response: `{
  "id": "uuid",
  "title": "Premium Plan",
  "amount": "100.00000000",
  "slug": "premium-plan-abc123",
  "url": "https://kaspay.vercel.app/pay/premium-plan-abc123",
  "status": "active"
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
    { "id": "uuid", "title": "...", "amount": "...", "status": "active" }
  ]
}`,
  },
  {
    method: "POST",
    path: "/api/payments",
    description: "Create a payment session from a link (public endpoint for customers)",
    auth: false,
    body: `{
  "paymentLinkSlug": "premium-plan-abc123",
  "customerEmail": "customer@example.com"
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
    description: "Poll payment status (checks Kaspa blockchain in real-time)",
    auth: false,
    body: null,
    response: `{
  "id": "payment-uuid",
  "status": "confirmed",
  "amountReceived": 100,
  "txId": "kaspa-transaction-hash",
  "confirmations": 1,
  "confirmedAt": "2026-02-08T12:01:00.000Z"
}`,
  },
  {
    method: "GET",
    path: "/api/payments",
    description: "List all payments for your account",
    auth: true,
    body: null,
    response: `{
  "data": [
    {
      "id": "uuid",
      "amountExpected": "100.00000000",
      "status": "confirmed",
      "txId": "...",
      "customerEmail": "...",
      "createdAt": "..."
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
  "events": ["payment.confirmed"],
  "secret": "webhook-signing-secret",
  "isActive": true
}`,
  },
];

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-800",
    POST: "bg-green-100 text-green-800",
    PATCH: "bg-yellow-100 text-yellow-800",
    DELETE: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-bold ${colors[method] || "bg-gray-100"}`}
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
      <nav className="border-b sticky top-0 bg-background/90 backdrop-blur-sm z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">KasPay</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">API Documentation</span>
          </div>
          <Link href="/register">
            <Button size="sm">Get API Key</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">KasPay API</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Integrate Kaspa payments into your application with our simple REST
            API. Accept payments, create payment links, and receive webhook
            notifications.
          </p>

          <div className="bg-muted/50 border rounded-lg p-4">
            <p className="text-sm font-medium mb-1">Base URL</p>
            <code className="text-sm font-mono text-primary">
              {typeof window !== "undefined" ? window.location.origin : "https://kaspay.vercel.app"}
            </code>
          </div>
        </div>

        {/* Auth Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Authentication</h2>
          <p className="text-muted-foreground mb-4">
            Protected endpoints require a JWT token in the Authorization header:
          </p>
          <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
            Authorization: Bearer your-jwt-token
          </pre>
          <p className="text-sm text-muted-foreground mt-2">
            Get your token by calling POST /api/auth/login or POST /api/auth/register.
          </p>
        </div>

        {/* Endpoints */}
        <h2 className="text-2xl font-bold mb-6">Endpoints</h2>
        <div className="space-y-8">
          {endpoints.map((ep, i) => (
            <div key={i} className="border rounded-xl overflow-hidden">
              <div className="bg-muted/30 px-4 py-3 flex items-center gap-3 border-b">
                <MethodBadge method={ep.method} />
                <code className="text-sm font-mono font-medium">{ep.path}</code>
                {ep.auth && (
                  <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    Auth Required
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {ep.description}
                </p>

                {ep.body && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Request Body
                      </p>
                      <button
                        onClick={() => copyCode(ep.body!, i)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {copiedIdx === i ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <pre className="bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto">
                      {ep.body}
                    </pre>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                    Response
                  </p>
                  <pre className="bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    {ep.response}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Webhook Section */}
        <div className="mt-12 mb-12">
          <h2 className="text-2xl font-bold mb-4">Webhook Signatures</h2>
          <p className="text-muted-foreground mb-4">
            Each webhook delivery includes an <code className="bg-muted px-1 py-0.5 rounded text-sm">X-KasPay-Signature</code> header
            containing an HMAC-SHA256 signature of the payload using your webhook secret.
          </p>
          <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto">
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
          <h2 className="text-2xl font-bold mb-4">Payment Flow</h2>
          <div className="bg-muted/30 border rounded-xl p-6">
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <div>
                  <p className="font-medium">Merchant creates a payment link</p>
                  <p className="text-muted-foreground">POST /api/links with amount and title</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <div>
                  <p className="font-medium">Customer opens the payment page</p>
                  <p className="text-muted-foreground">POST /api/payments creates a payment session with the merchant&apos;s Kaspa address</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <div>
                  <p className="font-medium">Customer sends KAS to the address</p>
                  <p className="text-muted-foreground">QR code and address displayed. Customer pays from any Kaspa wallet.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</div>
                <div>
                  <p className="font-medium">KasPay verifies on-chain</p>
                  <p className="text-muted-foreground">GET /api/payments/:id/status polls the Kaspa blockchain REST API for balance + UTXOs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</div>
                <div>
                  <p className="font-medium">Payment confirmed, webhook sent</p>
                  <p className="text-muted-foreground">Status updated to &quot;confirmed&quot;, webhook delivered to merchant&apos;s endpoint with HMAC signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

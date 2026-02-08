"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Loader2, Webhook, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface WebhookData {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
}

const AVAILABLE_EVENTS = [
  { value: "payment.confirmed", label: "Payment Confirmed" },
  { value: "payment.expired", label: "Payment Expired" },
  { value: "*", label: "All Events" },
];

export default function WebhooksPage() {
  const { token } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["*"]);

  useEffect(() => {
    fetchWebhooks();
  }, [token]);

  async function fetchWebhooks() {
    if (!token) return;
    try {
      const res = await fetch("/api/webhooks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWebhooks(data.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function createWebhook(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);

    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url, events: selectedEvents }),
      });

      if (!res.ok) throw new Error("Failed to create webhook");

      setShowCreate(false);
      setUrl("");
      setSelectedEvents(["*"]);
      fetchWebhooks();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  function toggleEvent(event: string) {
    if (event === "*") {
      setSelectedEvents(["*"]);
      return;
    }
    setSelectedEvents((prev) => {
      const filtered = prev.filter((e) => e !== "*");
      if (filtered.includes(event)) {
        return filtered.filter((e) => e !== event);
      }
      return [...filtered, event];
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground mt-1">
            Get notified when payments are confirmed
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add Webhook</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={createWebhook} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Endpoint URL
                </label>
                <Input
                  type="url"
                  placeholder="https://your-server.com/webhook"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Events</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_EVENTS.map((event) => (
                    <button
                      key={event.value}
                      type="button"
                      onClick={() => toggleEvent(event.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        selectedEvents.includes(event.value)
                          ? "bg-primary text-white border-primary"
                          : "bg-card text-foreground border-input hover:bg-muted"
                      }`}
                    >
                      {event.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={creating || selectedEvents.length === 0}
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Webhook className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No webhooks configured. Add one to get notified about payments.
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((wh) => (
            <Card key={wh.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-mono">
                      {wh.url}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Secret: {wh.secret.slice(0, 8)}...
                    </CardDescription>
                  </div>
                  <Badge variant={wh.isActive ? "success" : "secondary"}>
                    {wh.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {wh.events.map((event) => (
                      <Badge key={event} variant="outline">
                        {event}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Created {formatDate(wh.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Webhook Payload Example */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Webhook Payload Example</CardTitle>
          <CardDescription>
            Each webhook request includes an X-KasPay-Signature header (HMAC-SHA256)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`{
  "event": "payment.confirmed",
  "payment": {
    "id": "uuid-here",
    "status": "confirmed",
    "amountExpected": "10.00000000",
    "amountReceived": "10.00000000",
    "kaspaAddress": "kaspatest:qz...",
    "txId": "abc123...",
    "customerEmail": "customer@example.com",
    "confirmedAt": "2026-02-08T12:00:00.000Z"
  }
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

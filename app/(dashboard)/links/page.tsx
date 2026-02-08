"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Copy,
  ExternalLink,
  Loader2,
  X,
  CheckCircle2,
  Code2,
} from "lucide-react";
import { formatKAS, formatDate } from "@/lib/utils";

interface PaymentLink {
  id: string;
  title: string;
  description: string | null;
  amount: string;
  currency: string;
  slug: string;
  status: string;
  createdAt: string;
  expiresAt: string | null;
}

export default function LinksPage() {
  const { token } = useAuth();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [embedSlug, setEmbedSlug] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchLinks();
  }, [token]);

  async function fetchLinks() {
    if (!token) return;
    try {
      const res = await fetch("/api/links", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLinks(data.data || []);
    } catch (err) {
      console.error("Failed to fetch links:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: description || undefined,
          amount: parseFloat(amount),
        }),
      });

      if (!res.ok) throw new Error("Failed to create link");

      setShowCreate(false);
      setTitle("");
      setDescription("");
      setAmount("");
      fetchLinks();
    } catch (err) {
      console.error("Failed to create link:", err);
    } finally {
      setCreating(false);
    }
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/pay/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
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
          <h1 className="text-3xl font-bold">Payment Links</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your payment links
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Link
        </Button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create Payment Link</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={createLink} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="e.g., Premium Plan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description (optional)
                </label>
                <Input
                  placeholder="e.g., Monthly subscription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Amount (KAS)
                </label>
                <Input
                  type="number"
                  step="0.00000001"
                  min="0.00000001"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
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
                <Button type="submit" className="flex-1" disabled={creating}>
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

      {/* Links Grid */}
      {links.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No payment links yet. Create your first one!
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Payment Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <Card key={link.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{link.title}</CardTitle>
                  <Badge
                    variant={
                      link.status === "active" ? "success" : "secondary"
                    }
                  >
                    {link.status}
                  </Badge>
                </div>
                {link.description && (
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">
                  {formatKAS(link.amount)} KAS
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyLink(link.slug)}
                  >
                    {copied === link.slug ? (
                      <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    {copied === link.slug ? "Copied!" : "Copy Link"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEmbedSlug(link.slug)}
                    title="Embed code"
                  >
                    <Code2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(`/pay/${link.slug}`, "_blank")
                    }
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Created {formatDate(link.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Embed Code Modal */}
      {embedSlug && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Embed Payment Button</h2>
              <button
                onClick={() => setEmbedSlug(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Copy this HTML to add a &quot;Pay with Kaspa&quot; button to your website:
            </p>

            <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap mb-4">
{`<!-- KasPay Payment Button -->
<a href="${typeof window !== "undefined" ? window.location.origin : ""}/pay/${embedSlug}"
   target="_blank"
   style="display:inline-flex;align-items:center;gap:8px;
          padding:12px 24px;background:#49EACB;color:#1a1a2e;
          border-radius:8px;font-weight:600;font-size:16px;
          text-decoration:none;font-family:sans-serif;">
  ⚡ Pay with Kaspa
</a>`}
            </pre>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setEmbedSlug(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  const code = `<a href="${window.location.origin}/pay/${embedSlug}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:#49EACB;color:#1a1a2e;border-radius:8px;font-weight:600;font-size:16px;text-decoration:none;font-family:sans-serif;">⚡ Pay with Kaspa</a>`;
                  navigator.clipboard.writeText(code);
                  setCopied("embed");
                  setTimeout(() => setCopied(null), 2000);
                }}
              >
                {copied === "embed" ? (
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied === "embed" ? "Copied!" : "Copy Code"}
              </Button>
            </div>

            <div className="mt-4 p-4 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  background: "#49EACB",
                  color: "#1a1a2e",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "16px",
                  textDecoration: "none",
                }}
              >
                ⚡ Pay with Kaspa
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

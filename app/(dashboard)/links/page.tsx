"use client";

import { useEffect, useState, useMemo } from "react";
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
  Download,
  Search,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatKAS, formatDate } from "@/lib/utils";

interface PaymentLink {
  id: string;
  title: string;
  description: string | null;
  amount: string;
  currency: string;
  expiryMinutes: number;
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
  const [currency, setCurrency] = useState<"KAS" | "USD">("KAS");
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [qrSlug, setQrSlug] = useState<string | null>(null);
  const [searchLinks, setSearchLinks] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredLinks = useMemo(() => {
    return links.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (searchLinks) {
        const q = searchLinks.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          (l.description || "").toLowerCase().includes(q) ||
          l.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [links, searchLinks, statusFilter]);

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
          currency,
          successMessage: successMessage || undefined,
          redirectUrl: redirectUrl || undefined,
          expiryMinutes,
        }),
      });

      if (!res.ok) throw new Error("Failed to create link");

      setShowCreate(false);
      setTitle("");
      setDescription("");
      setAmount("");
      setCurrency("KAS");
      setSuccessMessage("");
      setRedirectUrl("");
      setExpiryMinutes(30);
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
                  Currency
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrency("KAS")}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      currency === "KAS"
                        ? "bg-primary text-white border-primary"
                        : "bg-card text-foreground border-input hover:bg-muted"
                    }`}
                  >
                    KAS
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency("USD")}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      currency === "USD"
                        ? "bg-primary text-white border-primary"
                        : "bg-card text-foreground border-input hover:bg-muted"
                    }`}
                  >
                    USD
                  </button>
                </div>
                {currency === "USD" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-converts to KAS at current market rate when customer pays
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Amount ({currency})
                </label>
                <Input
                  type="number"
                  step={currency === "USD" ? "0.01" : "0.00000001"}
                  min={currency === "USD" ? "0.01" : "0.00000001"}
                  placeholder={currency === "USD" ? "10.00" : "100"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Success Message (optional)
                </label>
                <Input
                  placeholder="e.g., Thank you for your purchase!"
                  value={successMessage}
                  onChange={(e) => setSuccessMessage(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Redirect URL (optional)
                </label>
                <Input
                  placeholder="e.g., https://yoursite.com/thank-you"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Customer will be redirected here after payment
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Payment Expiration
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { value: 15, label: "15m" },
                    { value: 30, label: "30m" },
                    { value: 60, label: "1h" },
                    { value: 120, label: "2h" },
                    { value: 1440, label: "24h" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setExpiryMinutes(opt.value)}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                        expiryMinutes === opt.value
                          ? "bg-primary text-white border-primary"
                          : "bg-card text-foreground border-input hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  How long customers have to complete payment
                </p>
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

      {/* Search & Filter */}
      {links.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description..."
              value={searchLinks}
              onChange={(e) => setSearchLinks(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1.5">
            {["all", "active", "inactive"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-foreground border-input hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ))}
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
      ) : filteredLinks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No links match your search.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map((link) => (
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
                  {link.currency === "USD"
                    ? `$${parseFloat(link.amount).toFixed(2)} USD`
                    : `${formatKAS(link.amount)} KAS`}
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
                    onClick={() => setQrSlug(link.slug)}
                    title="QR Code"
                  >
                    <Download className="w-4 h-4" />
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
                  Created {formatDate(link.createdAt)} &middot; Expires in {link.expiryMinutes >= 60 ? `${link.expiryMinutes / 60}h` : `${link.expiryMinutes}m`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {qrSlug && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">QR Code</h2>
              <button
                onClick={() => setQrSlug(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center mb-4" id="qr-container">
              <div className="p-4 bg-white rounded-xl border">
                <QRCodeSVG
                  value={`${window.location.origin}/pay/${qrSlug}`}
                  size={250}
                  level="M"
                  fgColor="#1a1a2e"
                  includeMargin={false}
                />
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground mb-4">
              {window.location.origin}/pay/{qrSlug}
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setQrSlug(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  const svg = document.querySelector("#qr-container svg");
                  if (!svg) return;
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const canvas = document.createElement("canvas");
                  canvas.width = 500;
                  canvas.height = 500;
                  const ctx = canvas.getContext("2d");
                  const img = new Image();
                  img.onload = () => {
                    ctx?.fillRect(0, 0, 500, 500);
                    ctx!.fillStyle = "white";
                    ctx?.fillRect(0, 0, 500, 500);
                    ctx?.drawImage(img, 25, 25, 450, 450);
                    const a = document.createElement("a");
                    a.download = `kaspay-${qrSlug}.png`;
                    a.href = canvas.toDataURL("image/png");
                    a.click();
                  };
                  img.src = "data:image/svg+xml;base64," + btoa(svgData);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
            </div>
          </div>
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

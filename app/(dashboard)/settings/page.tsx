"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Key, Wallet, Clock, Loader2, Save, Pencil } from "lucide-react";
import { truncateAddress } from "@/lib/utils";

const EXPIRY_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
  { value: 1440, label: "24 hours" },
];

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [copiedApi, setCopiedApi] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [expiry, setExpiry] = useState(user?.paymentExpiry || 30);
  const [savingExpiry, setSavingExpiry] = useState(false);
  const [expirySaved, setExpirySaved] = useState(false);
  const [walletAddress, setWalletAddress] = useState(user?.kaspaAddress || "");
  const [editingWallet, setEditingWallet] = useState(false);
  const [savingWallet, setSavingWallet] = useState(false);
  const [walletSaved, setWalletSaved] = useState(false);
  const [walletError, setWalletError] = useState("");

  function copyToClipboard(text: string, type: "api" | "address") {
    navigator.clipboard.writeText(text);
    if (type === "api") {
      setCopiedApi(true);
      setTimeout(() => setCopiedApi(false), 2000);
    } else {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  }

  async function saveWallet() {
    if (!walletAddress.startsWith("kaspa:") && !walletAddress.startsWith("kaspatest:")) {
      setWalletError("Address must start with kaspa: or kaspatest:");
      return;
    }
    if (walletAddress.length < 40) {
      setWalletError("Invalid address length");
      return;
    }
    setWalletError("");
    setSavingWallet(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kaspaAddress: walletAddress }),
      });
      if (!res.ok) {
        const data = await res.json();
        setWalletError(data.error || "Failed to save");
        return;
      }
      setEditingWallet(false);
      setWalletSaved(true);
      setTimeout(() => setWalletSaved(false), 2000);
    } catch {
      setWalletError("Failed to save");
    } finally {
      setSavingWallet(false);
    }
  }

  async function saveExpiry(value: number) {
    setExpiry(value);
    setSavingExpiry(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentExpiry: value }),
      });
      setExpirySaved(true);
      setTimeout(() => setExpirySaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setSavingExpiry(false);
    }
  }

  if (!user) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black">Settings</h1>
        <p className="text-muted-foreground mt-1 font-medium">
          Manage your account and API settings
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-bold mb-2 block">Name</label>
              <Input value={user.name || ""} readOnly />
            </div>
            <div>
              <label className="text-sm font-bold mb-2 block">Email</label>
              <Input value={user.email} readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Wallet */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary border-2 border-foreground rounded-md flex items-center justify-center shadow-brutal-sm">
                <Wallet className="w-4 h-4" />
              </div>
              <CardTitle>Wallet Address</CardTitle>
            </div>
            <CardDescription>
              Payments are sent directly to this address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {editingWallet ? (
              <>
                <Input
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="kaspa:... or kaspatest:..."
                  className="font-mono text-sm"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={saveWallet}
                    disabled={savingWallet}
                    size="sm"
                  >
                    {savingWallet ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-2" />
                    ) : (
                      <Save className="w-3 h-3 mr-2" />
                    )}
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setWalletAddress(user.kaspaAddress);
                      setEditingWallet(false);
                      setWalletError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                {walletError && (
                  <p className="text-sm text-destructive font-bold">{walletError}</p>
                )}
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    value={user.kaspaAddress}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setEditingWallet(true)}
                    title="Edit wallet address"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(user.kaspaAddress, "address")
                    }
                  >
                    {copiedAddress ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {walletSaved && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Wallet address updated
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Expiry */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary border-2 border-foreground rounded-md flex items-center justify-center shadow-brutal-sm">
                <Clock className="w-4 h-4" />
              </div>
              <CardTitle>Payment Expiration</CardTitle>
            </div>
            <CardDescription>
              How long customers have to complete a payment before it expires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {EXPIRY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => saveExpiry(opt.value)}
                  disabled={savingExpiry}
                  className={`py-2 px-3 rounded-md border-2 text-sm font-bold transition-all ${
                    expiry === opt.value
                      ? "bg-primary text-primary-foreground border-foreground shadow-brutal-sm"
                      : "bg-card text-foreground border-foreground/30 hover:border-foreground hover:shadow-brutal-sm"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3">
              {savingExpiry && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </div>
              )}
              {expirySaved && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  Saved
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Key */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent border-2 border-foreground rounded-md flex items-center justify-center shadow-brutal-sm">
                <Key className="w-4 h-4" />
              </div>
              <CardTitle>API Key</CardTitle>
            </div>
            <CardDescription>
              Use this key to authenticate API requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={user.apiKey || ""}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                onClick={() =>
                  copyToClipboard(user.apiKey || "", "api")
                }
              >
                {copiedApi ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="mt-4 p-4 bg-muted border-2 border-foreground rounded-md shadow-brutal-sm">
              <p className="text-sm font-black mb-2">API Usage Example</p>
              <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/payments \\
  -H "Authorization: Bearer ${user.apiKey ? truncateAddress(user.apiKey, 4) : "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 100, "title": "My Product"}'`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

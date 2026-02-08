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
import { Copy, CheckCircle2, Key, Wallet } from "lucide-react";
import { truncateAddress } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuth();
  const [copiedApi, setCopiedApi] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

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

  if (!user) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
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
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input value={user.name || ""} readOnly />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input value={user.email} readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Wallet */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <CardTitle>Wallet Address</CardTitle>
            </div>
            <CardDescription>
              Payments are sent directly to this address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={user.kaspaAddress}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                onClick={() =>
                  copyToClipboard(user.kaspaAddress, "address")
                }
              >
                {copiedAddress ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Key */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
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
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">API Usage Example</p>
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

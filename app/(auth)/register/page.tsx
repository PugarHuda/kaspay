"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kaspaAddress, setKaspaAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!kaspaAddress.startsWith("kaspa:") && !kaspaAddress.startsWith("kaspatest:")) {
      setError("Kaspa address must start with 'kaspa:' or 'kaspatest:'");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name, kaspaAddress);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary border-2 border-foreground rounded-md flex items-center justify-center shadow-brutal-sm">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-black">KasPay</span>
          </Link>
          <h1 className="text-2xl font-black">Create your account</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Start accepting Kaspa payments in minutes
          </p>
        </div>

        <div className="bg-card rounded-md border-2 border-foreground shadow-brutal-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border-2 border-destructive text-destructive text-sm font-bold p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-bold mb-2 block">
                Business Name
              </label>
              <Input
                type="text"
                placeholder="Your business name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold mb-2 block">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold mb-2 block">Password</label>
              <Input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="text-sm font-bold mb-2 block">
                Kaspa Wallet Address
              </label>
              <Input
                type="text"
                placeholder="kaspa:qr..."
                value={kaspaAddress}
                onChange={(e) => setKaspaAddress(e.target.value)}
                required
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                This is where you&apos;ll receive payments
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground font-medium">
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className="text-primary font-bold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

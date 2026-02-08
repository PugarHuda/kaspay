"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  Loader2,
  Zap,
  Clock,
  AlertCircle,
  ExternalLink,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatKAS } from "@/lib/utils";

interface PaymentData {
  id: string;
  kaspaAddress: string;
  amountExpected: string;
  status: string;
  expiresAt: string;
  title: string;
  description: string | null;
  txId?: string;
  amountReceived?: string;
  confirmedAt?: string;
}

export default function PaymentPage() {
  const params = useParams();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [kasPrice, setKasPrice] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const createdRef = useRef(false);

  // Create payment on mount (with guard against double-mount in StrictMode)
  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;
    createPayment();
    fetchPrice();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [params.slug]);

  // Poll for status when payment is pending
  useEffect(() => {
    if (payment && payment.status === "pending") {
      pollRef.current = setInterval(checkStatus, 2000);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [payment?.id, payment?.status]);

  // Countdown timer
  useEffect(() => {
    if (!payment?.expiresAt || payment.status !== "pending") return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(payment.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(timer);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [payment?.expiresAt, payment?.status]);

  async function createPayment() {
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentLinkSlug: params.slug }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create payment");
      }

      setPayment(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPrice() {
    try {
      const res = await fetch("/api/price");
      const data = await res.json();
      setKasPrice(data.price || 0);
    } catch {
      // ignore
    }
  }

  async function checkStatus() {
    if (!payment) return;

    try {
      const res = await fetch(`/api/payments/${payment.id}/status`);
      const data = await res.json();

      if (data.status === "confirmed") {
        setPayment((prev) =>
          prev
            ? {
                ...prev,
                status: "confirmed",
                txId: data.txId,
                amountReceived: data.amountReceived?.toString(),
                confirmedAt: data.confirmedAt,
              }
            : null
        );
        if (pollRef.current) clearInterval(pollRef.current);

        // Dynamic import for confetti
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#49EACB", "#3DD9AD", "#2BC48F"],
        });
      } else if (data.status === "expired") {
        setPayment((prev) => (prev ? { ...prev, status: "expired" } : null));
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch {
      // ignore poll errors
    }
  }

  function copyAddress() {
    if (!payment) return;
    navigator.clipboard.writeText(payment.kaspaAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyAmount() {
    if (!payment) return;
    navigator.clipboard.writeText(payment.amountExpected);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Payment Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  const usdAmount =
    kasPrice > 0 ? parseFloat(payment.amountExpected) * kasPrice : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-bold">KasPay</span>
          </div>
          <h1 className="text-lg font-medium opacity-90">
            {payment.title}
          </h1>
          {payment.description && (
            <p className="text-sm opacity-70 mt-1">{payment.description}</p>
          )}
          <div className="mt-4">
            <div className="text-3xl font-bold">
              {formatKAS(payment.amountExpected)} KAS
            </div>
            {usdAmount > 0 && (
              <div className="text-sm opacity-70 mt-1">
                ≈ ${usdAmount.toFixed(2)} USD
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {payment.status === "confirmed" ? (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Payment Confirmed!
                </h2>
                <p className="text-muted-foreground mb-4">
                  Your transaction has been confirmed on the Kaspa blockchain.
                </p>

                {payment.txId && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-4 text-left">
                    <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                    <p className="text-xs font-mono break-all">{payment.txId}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {payment.txId && (
                    <a
                      href={`https://explorer-tn10.kaspa.org/txs/${payment.txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Kaspa Explorer
                      </Button>
                    </a>
                  )}
                  <a href={`/receipt/${payment.id}`} target="_blank">
                    <Button variant="outline" className="w-full">
                      <Receipt className="w-4 h-4 mr-2" />
                      View Receipt
                    </Button>
                  </a>
                </div>
              </motion.div>
            ) : payment.status === "expired" ? (
              <motion.div
                key="expired"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Payment Expired</h2>
                <p className="text-muted-foreground">
                  This payment has expired. Please request a new payment link.
                </p>
              </motion.div>
            ) : (
              <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white rounded-xl border-2 border-primary/20 shadow-sm">
                    <QRCodeSVG
                      value={`kaspa:${payment.kaspaAddress.replace("kaspa:", "")}?amount=${payment.amountExpected}`}
                      size={220}
                      level="M"
                      fgColor="#1a1a2e"
                      includeMargin={false}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block text-muted-foreground">
                    Send to this address
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 py-2.5 border rounded-lg text-xs font-mono bg-muted/30 break-all leading-relaxed">
                      {payment.kaspaAddress}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyAddress}
                      className="shrink-0"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Amount to send */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block text-muted-foreground">
                    Exact amount to send
                  </label>
                  <div
                    className="flex items-center justify-between px-3 py-2.5 border rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={copyAmount}
                  >
                    <span className="font-mono font-bold">
                      {payment.amountExpected} KAS
                    </span>
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Timer & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">
                      Waiting for payment...
                    </span>
                  </div>
                  {timeLeft && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {timeLeft}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Zap className="w-3 h-3" />
            Powered by{" "}
            <span className="font-semibold text-primary">KasPay</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

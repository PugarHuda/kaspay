"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  Loader2,
  Clock,
  AlertCircle,
  ExternalLink,
  Receipt,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KasPayLogo } from "@/components/ui/logo";
import { formatKAS, cleanAmount } from "@/lib/utils";

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
  currency?: string;
  originalUsdAmount?: string | null;
  successMessage?: string | null;
  redirectUrl?: string | null;
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

  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;
    createPayment();
    fetchPrice();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [params.slug]);

  useEffect(() => {
    if (payment && payment.status === "pending") {
      pollRef.current = setInterval(checkStatus, 2000);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [payment?.id, payment?.status]);

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

        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#49EACB", "#FFD700", "#FF6B9D"],
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
    navigator.clipboard.writeText(cleanAmount(payment.amountExpected));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-md border-2 border-foreground shadow-brutal-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-destructive border-2 border-foreground rounded-md flex items-center justify-center mx-auto mb-4 shadow-brutal-sm">
            <AlertCircle className="w-8 h-8 text-destructive-foreground" />
          </div>
          <h1 className="text-xl font-black mb-2">Payment Error</h1>
          <p className="text-muted-foreground font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  const usdAmount =
    kasPrice > 0 ? parseFloat(payment.amountExpected) * kasPrice : 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-card rounded-md border-2 border-foreground shadow-brutal-lg max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-primary border-b-2 border-foreground p-6">
          <div className="flex items-center gap-2 mb-4">
            <KasPayLogo size="sm" className="bg-card border-foreground" />
            <span className="font-black text-primary-foreground">KasPay</span>
          </div>
          <h1 className="text-lg font-black text-primary-foreground">
            {payment.title}
          </h1>
          {payment.description && (
            <p className="text-sm text-primary-foreground/70 font-medium mt-1">{payment.description}</p>
          )}
          <div className="mt-4">
            {payment.originalUsdAmount ? (
              <>
                <div className="text-3xl font-black text-primary-foreground">
                  ${parseFloat(payment.originalUsdAmount).toFixed(2)} USD
                </div>
                <div className="text-sm text-primary-foreground/70 font-bold mt-1">
                  = {formatKAS(payment.amountExpected)} KAS (live rate)
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-black text-primary-foreground">
                  {formatKAS(payment.amountExpected)} KAS
                </div>
                {usdAmount > 0 && (
                  <div className="text-sm text-primary-foreground/70 font-bold mt-1">
                    ~ ${usdAmount.toFixed(2)} USD
                  </div>
                )}
              </>
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
                  <div className="w-20 h-20 bg-emerald-300 border-2 border-foreground rounded-md flex items-center justify-center mx-auto mb-4 shadow-brutal">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-black text-emerald-600 mb-2">
                  Payment Confirmed!
                </h2>
                <p className="text-muted-foreground font-medium mb-4">
                  {payment.successMessage || "Your transaction has been confirmed on the Kaspa blockchain."}
                </p>

                {payment.txId && (
                  <div className="bg-muted border-2 border-foreground rounded-md p-3 mb-4 text-left shadow-brutal-sm">
                    <p className="text-xs text-muted-foreground font-bold mb-1">Transaction ID</p>
                    <p className="text-xs font-mono break-all font-medium">{payment.txId}</p>
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
                  {payment.redirectUrl && (
                    <a href={payment.redirectUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full">
                        Continue
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  )}
                </div>
              </motion.div>
            ) : payment.status === "expired" ? (
              <motion.div
                key="expired"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-muted border-2 border-foreground rounded-md flex items-center justify-center mx-auto mb-4 shadow-brutal-sm">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-black mb-2">Payment Expired</h2>
                <p className="text-muted-foreground font-medium">
                  This payment has expired. Please request a new payment link.
                </p>
              </motion.div>
            ) : (
              <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Testnet notice */}
                {payment.kaspaAddress.startsWith("kaspatest:") && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary border-2 border-foreground rounded-md mb-4 text-xs font-bold shadow-brutal-sm">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Testnet - make sure your wallet is set to <strong>Testnet-10</strong></span>
                  </div>
                )}

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white border-2 border-foreground rounded-md shadow-brutal">
                    <QRCodeSVG
                      value={`${payment.kaspaAddress}?amount=${cleanAmount(payment.amountExpected)}`}
                      size={200}
                      level="H"
                      fgColor="#1a1a2e"
                      includeMargin
                    />
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground mb-4 font-bold">
                  Scan with Kaspium or any Kaspa wallet
                </p>

                {/* Amount to send */}
                <div className="mb-4">
                  <label className="text-sm font-bold mb-2 block text-muted-foreground">
                    Exact amount to send
                  </label>
                  <div
                    className="flex items-center justify-between px-3 py-2.5 border-2 border-foreground rounded-md bg-muted cursor-pointer hover:shadow-brutal-sm transition-all shadow-brutal-sm"
                    onClick={copyAmount}
                  >
                    <span className="font-mono font-black text-lg">
                      {cleanAmount(payment.amountExpected)} KAS
                    </span>
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <label className="text-sm font-bold mb-2 block text-muted-foreground">
                    Send to this address
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 py-2.5 border-2 border-foreground rounded-md text-xs font-mono bg-muted break-all leading-relaxed font-medium shadow-brutal-sm">
                      {payment.kaspaAddress}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyAddress}
                      className="shrink-0"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Open in Wallet */}
                <a
                  href={`${payment.kaspaAddress}?amount=${cleanAmount(payment.amountExpected)}`}
                  className="block mb-4"
                >
                  <Button variant="secondary" className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Open in Kaspa Wallet
                  </Button>
                </a>


                {/* Timer & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary border-2 border-foreground rounded-md shadow-brutal-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-bold">
                      Waiting for payment...
                    </span>
                  </div>
                  {timeLeft && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground font-bold">
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
        <div className="border-t-2 border-foreground px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-bold">
            <KasPayLogo size="sm" className="w-4 h-4 shadow-none border" />
            Powered by{" "}
            <span className="font-black text-primary">KasPay</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

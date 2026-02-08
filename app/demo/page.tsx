"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  Copy,
  Loader2,
  Zap,
  Clock,
  ExternalLink,
  Receipt,
  ArrowLeft,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KasPayLogo } from "@/components/ui/logo";

const DEMO_PAYMENT = {
  title: "KasPay Pro Plan",
  description: "Annual subscription - Unlimited payment links",
  amount: "250",
  address: "kaspatest:qz0dn8ly4v4jmgafc25lmjnsmf6y6y0ahxqpcynyq",
  txId: "f4a3b9c1e8d72f5a096b413e87dc25f0a9e3b8d14c67f2059a8e3b1c4d7f9a2e",
};

type DemoStep = "pending" | "sending" | "confirming" | "confirmed";

export default function DemoPage() {
  const [step, setStep] = useState<DemoStep>("pending");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("29:59");
  const [progress, setProgress] = useState(0);

  // Countdown timer for pending state
  useEffect(() => {
    if (step !== "pending") return;
    let seconds = 29 * 60 + 59;
    const timer = setInterval(() => {
      seconds--;
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      setTimeLeft(`${m}:${s.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // Progress animation for confirming state
  useEffect(() => {
    if (step !== "confirming") return;
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [step]);

  // Auto-transition from confirming to confirmed
  useEffect(() => {
    if (step === "confirming" && progress >= 100) {
      const timeout = setTimeout(async () => {
        setStep("confirmed");
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#49EACB", "#FFD700", "#FF6B9D"],
        });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [step, progress]);

  function simulatePayment() {
    setStep("sending");
    setTimeout(() => setStep("confirming"), 1500);
  }

  function copyAddress() {
    navigator.clipboard.writeText(DEMO_PAYMENT.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function resetDemo() {
    setStep("pending");
    setProgress(0);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      {/* Back link */}
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      {/* Demo banner */}
      <div className="bg-secondary border-2 border-foreground rounded-md px-4 py-2 shadow-brutal-sm max-w-md w-full text-center">
        <p className="text-sm font-black text-secondary-foreground">
          INTERACTIVE DEMO - No real crypto involved
        </p>
      </div>

      {/* Payment card */}
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
            {DEMO_PAYMENT.title}
          </h1>
          <p className="text-sm text-primary-foreground/70 font-medium mt-1">
            {DEMO_PAYMENT.description}
          </p>
          <div className="mt-4">
            <div className="text-3xl font-black text-primary-foreground">
              {DEMO_PAYMENT.amount} KAS
            </div>
            <div className="text-sm text-primary-foreground/70 font-bold mt-1">
              ~ $25.00 USD
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === "confirmed" ? (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <div className="w-20 h-20 bg-emerald-300 border-2 border-foreground rounded-md flex items-center justify-center mx-auto mb-4 shadow-brutal">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-black text-emerald-600 mb-2">
                  Payment Confirmed!
                </h2>
                <p className="text-muted-foreground font-medium mb-4">
                  Transaction verified on the Kaspa blockchain in ~1 second.
                </p>

                <div className="bg-muted border-2 border-foreground rounded-md p-3 mb-4 text-left shadow-brutal-sm">
                  <p className="text-xs text-muted-foreground font-bold mb-1">Transaction ID</p>
                  <p className="text-xs font-mono break-all font-medium">{DEMO_PAYMENT.txId}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full" onClick={resetDemo}>
                    <Play className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Link href="/register">
                    <Button className="w-full">
                      Create Your Account
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : step === "sending" || step === "confirming" ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                {step === "sending" ? (
                  <>
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <h2 className="text-lg font-black mb-2">Sending Transaction...</h2>
                    <p className="text-muted-foreground font-medium">
                      Broadcasting to Kaspa network
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-full bg-muted border-2 border-foreground rounded-md h-6 mb-4 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    <h2 className="text-lg font-black mb-2">
                      Confirming on Blockchain...
                    </h2>
                    <p className="text-muted-foreground font-medium">
                      Kaspa BlockDAG confirms in ~1 second
                    </p>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Demo notice */}
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary border-2 border-foreground rounded-md mb-4 text-xs font-bold shadow-brutal-sm">
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span>Demo mode - click &quot;Simulate Payment&quot; below</span>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white border-2 border-foreground rounded-md shadow-brutal">
                    <QRCodeSVG
                      value={`${DEMO_PAYMENT.address}?amount=${DEMO_PAYMENT.amount}`}
                      size={180}
                      level="H"
                      fgColor="#1a1a2e"
                      includeMargin
                    />
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground mb-4 font-bold">
                  Scan with Kaspium or any Kaspa wallet
                </p>

                {/* Amount */}
                <div className="mb-4">
                  <label className="text-sm font-bold mb-2 block text-muted-foreground">
                    Exact amount to send
                  </label>
                  <div className="flex items-center justify-between px-3 py-2.5 border-2 border-foreground rounded-md bg-muted shadow-brutal-sm">
                    <span className="font-mono font-black text-lg">
                      {DEMO_PAYMENT.amount} KAS
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
                      {DEMO_PAYMENT.address}
                    </div>
                    <Button variant="outline" size="icon" onClick={copyAddress} className="shrink-0">
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Simulate button */}
                <Button className="w-full mb-4 bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={simulatePayment}>
                  <Play className="w-4 h-4 mr-2" />
                  Simulate Payment
                </Button>

                {/* Timer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30 border-2 border-foreground rounded-md shadow-brutal-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-bold">Waiting...</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground font-bold">
                    <Clock className="w-4 h-4" />
                    {timeLeft}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-foreground px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-bold">
            <Zap className="w-3 h-3" />
            Powered by <span className="font-black text-primary">KasPay</span>
          </div>
        </div>
      </motion.div>

      {/* CTA below */}
      <div className="max-w-md w-full text-center">
        <p className="text-muted-foreground font-medium mb-3">
          This is what your customers see. Ready to accept Kaspa payments?
        </p>
        <Link href="/register">
          <Button size="lg" className="w-full">
            Create Free Account
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

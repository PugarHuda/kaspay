"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Printer,
  Copy,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KasPayLogo } from "@/components/ui/logo";
import { formatKAS, formatDate } from "@/lib/utils";

interface ReceiptData {
  id: string;
  status: string;
  amountExpected: string;
  amountReceived: string | null;
  kaspaAddress: string;
  txId: string | null;
  customerEmail: string | null;
  confirmedAt: string | null;
  createdAt: string;
  title: string;
  description: string | null;
  currency: string;
}

export default function ReceiptPage() {
  const params = useParams();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [kasPrice, setKasPrice] = useState(0);

  useEffect(() => {
    fetchReceipt();
    fetchPrice();
  }, [params.id]);

  async function fetchReceipt() {
    try {
      const res = await fetch(`/api/payments/${params.id}`);
      if (!res.ok) throw new Error("Payment not found");
      setReceipt(await res.json());
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

  function copyTxId() {
    if (!receipt?.txId) return;
    navigator.clipboard.writeText(receipt.txId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-md" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-md border-2 border-foreground shadow-brutal-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-destructive border-2 border-foreground rounded-md flex items-center justify-center mx-auto mb-4 shadow-brutal-sm">
            <AlertCircle className="w-8 h-8 text-destructive-foreground" />
          </div>
          <h1 className="text-xl font-black mb-2">Receipt Not Found</h1>
          <p className="text-muted-foreground font-medium">{error || "This payment does not exist."}</p>
        </div>
      </div>
    );
  }

  const usdAmount =
    kasPrice > 0 ? parseFloat(receipt.amountExpected) * kasPrice : 0;

  const statusConfig = {
    confirmed: {
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-300",
      label: "Confirmed",
    },
    pending: {
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-300",
      label: "Pending",
    },
    expired: {
      icon: AlertCircle,
      color: "text-red-700",
      bg: "bg-red-300",
      label: "Expired",
    },
  };

  const status = statusConfig[receipt.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 print:bg-white print:p-0">
      <div className="bg-card rounded-md border-2 border-foreground shadow-brutal-lg max-w-lg w-full overflow-hidden print:shadow-none print:rounded-none print:border-0">
        {/* Header */}
        <div className="bg-primary border-b-2 border-foreground p-6 print:border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <KasPayLogo size="sm" className="bg-card border-foreground" />
              <span className="font-black text-lg text-primary-foreground">KasPay</span>
            </div>
            <span className="text-sm font-bold text-primary-foreground/70">Payment Receipt</span>
          </div>
        </div>

        <div className="p-6">
          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-foreground ${status.bg} ${status.color} shadow-brutal-sm`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-black">{status.label}</span>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center mb-6">
            <div className="text-3xl font-black mb-1">
              {formatKAS(receipt.amountReceived || receipt.amountExpected)} KAS
            </div>
            {usdAmount > 0 && (
              <p className="text-muted-foreground font-bold">
                ~ ${usdAmount.toFixed(2)} USD
              </p>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3 border-t-2 border-foreground pt-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-bold">Item</span>
              <span className="text-sm font-bold">{receipt.title}</span>
            </div>
            {receipt.description && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground font-bold">Description</span>
                <span className="text-sm font-medium">{receipt.description}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-bold">Payment ID</span>
              <span className="text-sm font-mono font-medium">{receipt.id.slice(0, 8)}...</span>
            </div>
            {receipt.customerEmail && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground font-bold">Customer</span>
                <span className="text-sm font-medium">{receipt.customerEmail}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground font-bold">Date</span>
              <span className="text-sm font-medium">
                {formatDate(receipt.confirmedAt || receipt.createdAt)}
              </span>
            </div>
          </div>

          {/* Transaction ID */}
          {receipt.txId && (
            <div className="mt-4 border-t-2 border-foreground pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground font-bold">Transaction ID</span>
                <button onClick={copyTxId} className="text-muted-foreground hover:text-foreground transition-colors">
                  {copied ? (
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs font-mono break-all bg-muted border-2 border-foreground p-2 rounded-md font-medium shadow-brutal-sm">
                {receipt.txId}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2 print:hidden">
            {receipt.txId && (
              <a
                href={`https://explorer-tn10.kaspa.org/txs/${receipt.txId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Kaspa Explorer
                </Button>
              </a>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-foreground px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-bold">
            <KasPayLogo size="sm" className="w-4 h-4 shadow-none border" />
            Powered by{" "}
            <span className="font-black text-primary">KasPay</span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  ExternalLink,
  Printer,
  Copy,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="bg-card rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Receipt Not Found</h1>
          <p className="text-muted-foreground">{error || "This payment does not exist."}</p>
        </div>
      </div>
    );
  }

  const usdAmount =
    kasPrice > 0 ? parseFloat(receipt.amountExpected) * kasPrice : 0;

  const statusConfig = {
    confirmed: {
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      label: "Confirmed",
    },
    pending: {
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      label: "Pending",
    },
    expired: {
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      label: "Expired",
    },
  };

  const status = statusConfig[receipt.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 print:bg-white print:p-0">
      <div className="bg-card rounded-2xl shadow-xl max-w-lg w-full overflow-hidden print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white print:bg-primary">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">KasPay</span>
            </div>
            <span className="text-sm opacity-80">Payment Receipt</span>
          </div>
        </div>

        <div className="p-6">
          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.bg} ${status.color}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-semibold">{status.label}</span>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold mb-1">
              {formatKAS(receipt.amountReceived || receipt.amountExpected)} KAS
            </div>
            {usdAmount > 0 && (
              <p className="text-muted-foreground">
                ≈ ${usdAmount.toFixed(2)} USD
              </p>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Item</span>
              <span className="text-sm font-medium">{receipt.title}</span>
            </div>
            {receipt.description && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Description</span>
                <span className="text-sm">{receipt.description}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Payment ID</span>
              <span className="text-sm font-mono">{receipt.id.slice(0, 8)}...</span>
            </div>
            {receipt.customerEmail && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Customer</span>
                <span className="text-sm">{receipt.customerEmail}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date</span>
              <span className="text-sm">
                {formatDate(receipt.confirmedAt || receipt.createdAt)}
              </span>
            </div>
          </div>

          {/* Transaction ID */}
          {receipt.txId && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Transaction ID</span>
                <button onClick={copyTxId} className="text-muted-foreground hover:text-foreground">
                  {copied ? (
                    <CheckCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs font-mono break-all bg-muted/50 p-2 rounded">
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
        <div className="border-t px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Zap className="w-3 h-3" />
            Powered by{" "}
            <span className="font-semibold text-primary">KasPay</span>
          </div>
        </div>
      </div>
    </div>
  );
}

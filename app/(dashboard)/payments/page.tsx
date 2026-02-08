"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth/context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatKAS, formatDate, truncateAddress } from "@/lib/utils";

interface Payment {
  id: string;
  kaspaAddress: string;
  amountExpected: string;
  amountReceived: string | null;
  txId: string | null;
  status: string;
  customerEmail: string | null;
  customerName: string | null;
  createdAt: string;
  confirmedAt: string | null;
  paymentLink: { title: string } | null;
}

const STATUS_FILTERS = ["all", "confirmed", "pending", "expired"] as const;

export default function PaymentsPage() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!token) return;

    fetch("/api/payments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPayments(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (p.paymentLink?.title || "").toLowerCase().includes(q) ||
          (p.customerEmail || "").toLowerCase().includes(q) ||
          (p.customerName || "").toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.txId || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [payments, search, statusFilter]);

  function exportCSV() {
    const headers = [
      "ID",
      "Title",
      "Amount Expected",
      "Amount Received",
      "Status",
      "Customer",
      "TX ID",
      "Date",
    ];
    const rows = filtered.map((p) => [
      p.id,
      p.paymentLink?.title || "Direct",
      p.amountExpected,
      p.amountReceived || "",
      p.status,
      p.customerEmail || "",
      p.txId || "",
      p.createdAt,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kaspay-payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-black">Payments</h1>
          <p className="text-muted-foreground mt-1 font-medium">
            View all your payment transactions
          </p>
        </div>
        {payments.length > 0 && (
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      {payments.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, customer, TX ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-md border-2 text-xs font-bold capitalize transition-all ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground border-foreground shadow-brutal-sm"
                    : "bg-card text-foreground border-foreground/30 hover:border-foreground hover:shadow-brutal-sm"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-medium">
              No payments yet. Share your payment links to start receiving
              payments.
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-medium">
              No payments match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-foreground text-left bg-muted/50">
                    <th className="p-4 text-sm font-black text-muted-foreground">
                      Payment
                    </th>
                    <th className="p-4 text-sm font-black text-muted-foreground">
                      Amount
                    </th>
                    <th className="p-4 text-sm font-black text-muted-foreground">
                      Status
                    </th>
                    <th className="p-4 text-sm font-black text-muted-foreground">
                      Customer
                    </th>
                    <th className="p-4 text-sm font-black text-muted-foreground">
                      TX ID
                    </th>
                    <th className="p-4 text-sm font-black text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-foreground/20 last:border-0 hover:bg-muted/30"
                    >
                      <td className="p-4">
                        <div className="font-bold">
                          {payment.paymentLink?.title || "Direct Payment"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono font-medium">
                          {payment.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono font-bold">
                          {formatKAS(payment.amountExpected)} KAS
                        </div>
                        {payment.amountReceived && (
                          <div className="text-xs text-emerald-600 font-mono font-bold">
                            Received: {formatKAS(payment.amountReceived)}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            payment.status === "confirmed"
                              ? "success"
                              : payment.status === "pending"
                                ? "warning"
                                : "destructive"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm font-medium">
                        {payment.customerEmail || (
                          <span className="text-muted-foreground">
                            Anonymous
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {payment.txId ? (
                          <span className="text-xs font-mono text-muted-foreground font-medium">
                            {truncateAddress(payment.txId, 6)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground font-medium">
                        {formatDate(payment.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

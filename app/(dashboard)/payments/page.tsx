"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download } from "lucide-react";
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

export default function PaymentsPage() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

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
    const rows = payments.map((p) => [
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
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">
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

      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No payments yet. Share your payment links to start receiving
              payments.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left bg-muted/30">
                    <th className="p-4 text-sm font-medium text-muted-foreground">
                      Payment
                    </th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">
                      TX ID
                    </th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b last:border-0 hover:bg-muted/20"
                    >
                      <td className="p-4">
                        <div className="font-medium">
                          {payment.paymentLink?.title || "Direct Payment"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {payment.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono font-medium">
                          {formatKAS(payment.amountExpected)} KAS
                        </div>
                        {payment.amountReceived && (
                          <div className="text-xs text-green-600 font-mono">
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
                      <td className="p-4 text-sm">
                        {payment.customerEmail || (
                          <span className="text-muted-foreground">
                            Anonymous
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {payment.txId ? (
                          <span className="text-xs font-mono text-muted-foreground">
                            {truncateAddress(payment.txId, 6)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
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

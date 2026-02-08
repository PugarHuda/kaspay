"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  CreditCard,
  Link2,
  TrendingUp,
  Loader2,
  Activity,
  Blocks,
  Gauge,
  Network,
} from "lucide-react";
import { formatKAS, formatDate } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totals: {
    totalPayments: number;
    totalVolume: string;
    confirmedPayments: number;
    pendingPayments: number;
  };
  links: {
    totalLinks: number;
    activeLinks: number;
  };
  dailyPayments: Array<{
    date: string;
    count: number;
    volume: string;
  }>;
  recentPayments: Array<{
    id: string;
    amountExpected: string;
    amountReceived: string | null;
    status: string;
    customerEmail: string | null;
    createdAt: string;
    paymentLink: { title: string } | null;
  }>;
}

interface NetworkStats {
  blockCount: number;
  headerCount: number;
  difficulty: number;
  virtualDaaScore: number;
  networkName: string;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [network, setNetwork] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch("/api/dashboard/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch("/api/network")
      .then((res) => res.json())
      .then(setNetwork)
      .catch(console.error);
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const chartData =
    stats?.dailyPayments.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      volume: parseFloat(d.volume),
      count: d.count,
    })) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your payment activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Volume
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatKAS(stats?.totals.totalVolume || "0")} KAS
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payments
            </CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totals.totalPayments || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totals.confirmedPayments || 0} confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Links
            </CardTitle>
            <Link2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.links.activeLinks || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.links.totalLinks || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totals.pendingPayments || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              awaiting payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment Volume (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="hsl(172, 66%, 50%)"
                    fill="hsl(172, 66%, 50%)"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats?.recentPayments.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No payments yet. Create a payment link to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">
                      Payment
                    </th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="font-medium">
                          {payment.paymentLink?.title || "Direct Payment"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.customerEmail || "Anonymous"}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="font-mono">
                          {formatKAS(payment.amountExpected)} KAS
                        </span>
                      </td>
                      <td className="py-3">
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
                      <td className="py-3 text-sm text-muted-foreground">
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
      {/* Kaspa Network Stats */}
      {network && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <CardTitle>Kaspa Network (Live)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Blocks className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Blocks</span>
                </div>
                <p className="text-lg font-bold">
                  {network.blockCount?.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Difficulty</span>
                </div>
                <p className="text-lg font-bold">
                  {network.difficulty
                    ? (network.difficulty / 1e12).toFixed(2) + "T"
                    : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">DAA Score</span>
                </div>
                <p className="text-lg font-bold">
                  {network.virtualDaaScore?.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Network className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Network</span>
                </div>
                <p className="text-lg font-bold capitalize">
                  {network.networkName || "testnet-10"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

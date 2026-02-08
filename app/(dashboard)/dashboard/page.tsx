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

const STAT_COLORS = [
  "bg-primary",
  "bg-secondary",
  "bg-accent",
  "bg-primary",
];

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

  const statCards = [
    {
      title: "Total Volume",
      value: `${formatKAS(stats?.totals.totalVolume || "0")} KAS`,
      icon: DollarSign,
      sub: null,
    },
    {
      title: "Total Payments",
      value: stats?.totals.totalPayments || 0,
      icon: CreditCard,
      sub: `${stats?.totals.confirmedPayments || 0} confirmed`,
    },
    {
      title: "Active Links",
      value: stats?.links.activeLinks || 0,
      icon: Link2,
      sub: `${stats?.links.totalLinks || 0} total`,
    },
    {
      title: "Pending",
      value: stats?.totals.pendingPayments || 0,
      icon: TrendingUp,
      sub: "awaiting payment",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="text-muted-foreground mt-1 font-medium">
          Overview of your payment activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 ${STAT_COLORS[i]} border-2 border-foreground rounded-md flex items-center justify-center shadow-brutal-sm`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{stat.value}</div>
              {stat.sub && (
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  {stat.sub}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" fontSize={12} fontWeight={600} />
                  <YAxis fontSize={12} fontWeight={600} />
                  <Tooltip
                    contentStyle={{
                      border: "2px solid hsl(var(--foreground))",
                      borderRadius: "6px",
                      boxShadow: "4px 4px 0px 0px hsl(var(--foreground))",
                      fontWeight: 700,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="hsl(165, 80%, 52%)"
                    fill="hsl(165, 80%, 52%)"
                    fillOpacity={0.2}
                    strokeWidth={3}
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
            <div className="text-center py-8 text-muted-foreground font-medium">
              No payments yet. Create a payment link to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-foreground text-left">
                    <th className="pb-3 text-sm font-black text-muted-foreground">
                      Payment
                    </th>
                    <th className="pb-3 text-sm font-black text-muted-foreground">
                      Amount
                    </th>
                    <th className="pb-3 text-sm font-black text-muted-foreground">
                      Status
                    </th>
                    <th className="pb-3 text-sm font-black text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-foreground/20 last:border-0">
                      <td className="py-3">
                        <div className="font-bold">
                          {payment.paymentLink?.title || "Direct Payment"}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                          {payment.customerEmail || "Anonymous"}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="font-mono font-bold">
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
                      <td className="py-3 text-sm text-muted-foreground font-medium">
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
              <div className="w-8 h-8 bg-primary border-2 border-foreground rounded-md flex items-center justify-center shadow-brutal-sm">
                <Activity className="w-4 h-4" />
              </div>
              <CardTitle>Kaspa Network (Live)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Blocks, label: "Blocks", value: network.blockCount?.toLocaleString() },
                { icon: Gauge, label: "Difficulty", value: network.difficulty ? (network.difficulty / 1e12).toFixed(2) + "T" : "N/A" },
                { icon: TrendingUp, label: "DAA Score", value: network.virtualDaaScore?.toLocaleString() },
                { icon: Network, label: "Network", value: network.networkName || "testnet-10" },
              ].map((stat) => (
                <div key={stat.label} className="p-3 bg-muted border-2 border-foreground rounded-md shadow-brutal-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-bold">{stat.label}</span>
                  </div>
                  <p className="text-lg font-black">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

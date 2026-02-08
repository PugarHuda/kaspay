"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Zap,
  LayoutDashboard,
  CreditCard,
  Link2,
  Settings,
  LogOut,
  Loader2,
  Webhook,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/links", label: "Payment Links", icon: Link2 },
  { href: "/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r-2 border-foreground z-40 hidden lg:block">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary border-2 border-foreground rounded-md flex items-center justify-center shadow-brutal-sm">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-black tracking-tight">KasPay</span>
          </Link>
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition-all",
                pathname === item.href
                  ? "bg-primary text-primary-foreground border-2 border-foreground shadow-brutal-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border-2 border-transparent"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t-2 border-foreground">
          <div className="flex items-center justify-between px-3 py-2 mb-2">
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all w-full border-2 border-transparent hover:border-foreground"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card border-b-2 border-foreground px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary border-2 border-foreground rounded-md flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-black">KasPay</span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "p-2 rounded-md transition-all border-2",
                pathname === item.href
                  ? "bg-primary text-primary-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:border-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
            </Link>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  Shield,
  DollarSign,
  ArrowRight,
  Code2,
  Globe,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { KasPayLogo, KasPayWordmark } from "@/components/ui/logo";
import { useState } from "react";

const features = [
  {
    icon: Zap,
    title: "Instant Confirmations",
    description:
      "Kaspa's BlockDAG technology confirms transactions in under 1 second. No more waiting.",
    color: "bg-primary",
  },
  {
    icon: DollarSign,
    title: "Near-Zero Fees",
    description:
      "Transaction fees less than $0.01. Stop losing 3% of your revenue to payment processors.",
    color: "bg-secondary",
  },
  {
    icon: Shield,
    title: "Secure & Trustless",
    description:
      "Direct blockchain payments. No middleman, no chargebacks, no frozen accounts.",
    color: "bg-accent",
  },
  {
    icon: Code2,
    title: "Developer Friendly",
    description:
      "Simple REST API, webhooks, and embeddable payment links. Integrate in minutes.",
    color: "bg-primary",
  },
  {
    icon: Globe,
    title: "Global Payments",
    description:
      "Accept payments from anyone, anywhere. No country restrictions or banking requirements.",
    color: "bg-secondary",
  },
  {
    icon: CreditCard,
    title: "Beautiful Checkout",
    description:
      "Professional payment pages with QR codes. Your customers will love the experience.",
    color: "bg-accent",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b-2 border-foreground bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <KasPayWordmark size="md" />
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/demo">
                <Button variant="ghost" size="sm">Demo</Button>
              </Link>
              <Link href="/docs">
                <Button variant="ghost" size="sm">API Docs</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <ThemeToggle />
            </div>
            <button
              className="sm:hidden p-2 border-2 border-foreground rounded-md shadow-brutal-sm bg-card"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t-2 border-foreground bg-card px-4 py-4 space-y-2">
            <Link href="/demo" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Demo</Button>
            </Link>
            <Link href="/docs" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">API Docs</Button>
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start">Sign In</Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <div className="flex justify-end pt-2">
              <ThemeToggle />
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b-2 border-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--secondary)/0.15),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary border-2 border-foreground text-primary-foreground text-sm font-bold mb-8 shadow-brutal-sm">
              <KasPayLogo size="sm" className="border-primary-foreground/30" />
              Built for Kaspa Blockchain
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
              The{" "}
              <span className="bg-primary text-primary-foreground px-3 py-1 border-2 border-foreground inline-block -rotate-1 shadow-brutal">
                payment gateway
              </span>{" "}
              for Kaspa
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
              Accept Kaspa payments instantly with near-zero fees. Create payment
              links, embed checkout, and track everything from a beautiful
              dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Start Accepting Payments
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Try Demo Payment
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {[
              { label: "Transaction Fee", value: "< $0.01", color: "bg-primary" },
              { label: "Confirmation Time", value: "~1 sec", color: "bg-secondary" },
              { label: "Uptime", value: "99.9%", color: "bg-accent" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 bg-card border-2 border-foreground rounded-md shadow-brutal"
              >
                <div className="text-3xl font-black">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-bold mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Everything you need to accept Kaspa
            </h2>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
              A complete payment infrastructure built specifically for Kaspa
              blockchain.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-card border-2 border-foreground rounded-md p-6 shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all"
              >
                <div className={`w-12 h-12 ${feature.color} border-2 border-foreground rounded-md flex items-center justify-center mb-4 shadow-brutal-sm`}>
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-lg font-black mb-2">{feature.title}</h3>
                <p className="text-muted-foreground font-medium">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Get started in 3 simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Account",
                description:
                  "Sign up with your email and Kaspa wallet address. Takes 30 seconds.",
                color: "bg-primary",
              },
              {
                step: "2",
                title: "Create Payment Link",
                description:
                  "Set the amount and share the link with your customer. Or use our API.",
                color: "bg-secondary",
              },
              {
                step: "3",
                title: "Get Paid Instantly",
                description:
                  "Customer pays via QR code. Funds arrive in your wallet in ~1 second.",
                color: "bg-accent",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`w-16 h-16 ${item.color} border-2 border-foreground rounded-md flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-brutal`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-black mb-3">{item.title}</h3>
                <p className="text-muted-foreground font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary border-b-2 border-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-primary-foreground mb-6">
            Ready to accept Kaspa payments?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10 font-medium">
            Join the future of payments. No setup fees, no monthly costs.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-card hover:bg-card/90"
            >
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-foreground py-10 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <KasPayWordmark size="sm" />
              <p className="text-sm text-muted-foreground font-medium mt-2">
                Open source payment gateway for Kaspa blockchain.
              </p>
            </div>
            <div>
              <h4 className="font-black text-sm mb-3">Product</h4>
              <div className="space-y-2">
                <Link href="/demo" className="block text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">Interactive Demo</Link>
                <Link href="/docs" className="block text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">API Documentation</Link>
                <Link href="/register" className="block text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">Create Account</Link>
              </div>
            </div>
            <div>
              <h4 className="font-black text-sm mb-3">Kaspa Ecosystem</h4>
              <div className="space-y-2">
                <a href="https://kaspa.org" target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">Kaspa.org</a>
                <a href="https://explorer-tn10.kaspa.org" target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">Kaspa Explorer</a>
                <a href="https://faucet-tn10.kaspanet.io" target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">Testnet Faucet</a>
              </div>
            </div>
          </div>
          <div className="border-t-2 border-foreground/20 pt-6 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Built for Kaspathon 2026. Near-zero fees, instant confirmations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

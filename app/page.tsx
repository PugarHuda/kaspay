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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const features = [
  {
    icon: Zap,
    title: "Instant Confirmations",
    description:
      "Kaspa's BlockDAG technology confirms transactions in under 1 second. No more waiting.",
  },
  {
    icon: DollarSign,
    title: "Near-Zero Fees",
    description:
      "Transaction fees less than $0.01. Stop losing 3% of your revenue to payment processors.",
  },
  {
    icon: Shield,
    title: "Secure & Trustless",
    description:
      "Direct blockchain payments. No middleman, no chargebacks, no frozen accounts.",
  },
  {
    icon: Code2,
    title: "Developer Friendly",
    description:
      "Simple REST API, webhooks, and embeddable payment links. Integrate in minutes.",
  },
  {
    icon: Globe,
    title: "Global Payments",
    description:
      "Accept payments from anyone, anywhere. No country restrictions or banking requirements.",
  },
  {
    icon: CreditCard,
    title: "Beautiful Checkout",
    description:
      "Professional payment pages with QR codes. Your customers will love the experience.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">KasPay</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/docs">
                <Button variant="ghost">API Docs</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-primary/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Built for Kaspa Blockchain
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              The{" "}
              <span className="text-primary">payment gateway</span>{" "}
              for Kaspa
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
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
              <Link href="/pay/demo">
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
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { label: "Transaction Fee", value: "< $0.01" },
              { label: "Confirmation Time", value: "~1 sec" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to accept Kaspa
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete payment infrastructure built specifically for Kaspa
              blockchain.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in 3 simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Create Account",
                description:
                  "Sign up with your email and Kaspa wallet address. Takes 30 seconds.",
              },
              {
                step: "2",
                title: "Create Payment Link",
                description:
                  "Set the amount and share the link with your customer. Or use our API.",
              },
              {
                step: "3",
                title: "Get Paid Instantly",
                description:
                  "Customer pays via QR code. Funds arrive in your wallet in ~1 second.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to accept Kaspa payments?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join the future of payments. No setup fees, no monthly costs.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="text-lg px-8 bg-white text-primary hover:bg-white/90"
            >
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">KasPay</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for Kaspathon 2026. Open source payment gateway for Kaspa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

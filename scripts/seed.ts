import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_RxgXcK30Mmvb@ep-wispy-bread-ai6x5yfo-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("Seeding database...");

  // Find existing user
  const users = await db.query.users.findMany();
  if (users.length === 0) {
    console.log("No users found. Create an account first via the app.");
    return;
  }

  const user = users[0];
  console.log(`Using user: ${user.email} (${user.id})`);

  // Clear existing sample data (keep real data)
  const existingLinks = await db.query.paymentLinks.findMany({
    where: (pl, { eq }) => eq(pl.userId, user.id),
  });
  console.log(`Found ${existingLinks.length} existing links`);

  // Create sample payment links with different statuses
  const now = new Date();

  const sampleLinks = [
    {
      userId: user.id,
      title: "Premium Subscription",
      description: "Monthly premium access to all features",
      amount: "50",
      currency: "KAS",
      slug: `premium-sub-${Date.now()}`,
      status: "active",
      expiryMinutes: 30,
      expiresAt: new Date(now.getTime() + 7 * 86400000), // expires in 7 days
    },
    {
      userId: user.id,
      title: "One-time Donation",
      description: "Support our project with a donation",
      amount: "25",
      currency: "KAS",
      slug: `donation-${Date.now()}`,
      status: "active",
      expiryMinutes: 60,
      expiresAt: null, // never expires
    },
    {
      userId: user.id,
      title: "NFT Mint Pass",
      description: "Early access mint pass for collection drop",
      amount: "5.99",
      currency: "USD",
      slug: `nft-mint-${Date.now()}`,
      status: "draft",
      expiryMinutes: 120,
      expiresAt: null,
    },
    {
      userId: user.id,
      title: "Workshop Ticket",
      description: "Blockchain development workshop - Feb 2026",
      amount: "15",
      currency: "USD",
      slug: `workshop-${Date.now()}`,
      status: "draft",
      expiryMinutes: 1440,
      expiresAt: null,
    },
    {
      userId: user.id,
      title: "Flash Sale Item",
      description: "Limited time offer - already ended",
      amount: "100",
      currency: "KAS",
      slug: `flash-sale-${Date.now()}`,
      status: "active",
      expiryMinutes: 15,
      expiresAt: new Date(now.getTime() - 3600000), // expired 1 hour ago
    },
    {
      userId: user.id,
      title: "Holiday Bundle",
      description: "Special holiday package - expired",
      amount: "29.99",
      currency: "USD",
      slug: `holiday-bundle-${Date.now()}`,
      status: "active",
      expiryMinutes: 30,
      expiresAt: new Date(now.getTime() - 86400000 * 3), // expired 3 days ago
    },
    {
      userId: user.id,
      title: "API Access Key",
      description: "Developer API access - 30 days",
      amount: "200",
      currency: "KAS",
      slug: `api-access-${Date.now()}`,
      status: "active",
      expiryMinutes: 60,
      expiresAt: new Date(now.getTime() + 2 * 3600000), // expires in 2 hours
    },
    {
      userId: user.id,
      title: "Merch Store - T-Shirt",
      description: "Official KasPay branded t-shirt",
      amount: "10",
      currency: "USD",
      slug: `merch-tshirt-${Date.now()}`,
      status: "active",
      expiryMinutes: 30,
      expiresAt: new Date(now.getTime() + 30 * 86400000), // expires in 30 days
    },
  ];

  console.log(`\nCreating ${sampleLinks.length} payment links...`);

  const createdLinks = [];
  for (const link of sampleLinks) {
    const [created] = await db.insert(schema.paymentLinks).values(link).returning();
    createdLinks.push(created);
    console.log(`  - ${link.title} [${link.status}] ${link.expiresAt ? `expires: ${link.expiresAt.toISOString()}` : "(no expiry)"}`);
  }

  // Create sample payments for some links
  const samplePayments = [
    {
      paymentLinkId: createdLinks[0].id,
      userId: user.id,
      kaspaAddress: user.kaspaAddress,
      amountExpected: "50",
      initialBalance: "1000",
      status: "confirmed",
      customerEmail: "alice@example.com",
      customerName: "Alice Johnson",
      txId: "abc123def456789012345678901234567890abcdef1234567890abcdef123456",
      confirmedAt: new Date(now.getTime() - 7200000), // 2 hours ago
      expiresAt: new Date(now.getTime() + 1800000),
    },
    {
      paymentLinkId: createdLinks[0].id,
      userId: user.id,
      kaspaAddress: user.kaspaAddress,
      amountExpected: "50",
      initialBalance: "1050",
      status: "confirmed",
      customerEmail: "bob@crypto.io",
      customerName: "Bob Smith",
      txId: "def789abc012345678901234567890abcdef12345678901234567890abcde789",
      confirmedAt: new Date(now.getTime() - 3600000), // 1 hour ago
      expiresAt: new Date(now.getTime() + 1800000),
    },
    {
      paymentLinkId: createdLinks[1].id,
      userId: user.id,
      kaspaAddress: user.kaspaAddress,
      amountExpected: "25",
      initialBalance: "1100",
      status: "pending",
      customerEmail: "charlie@mail.com",
      customerName: "Charlie Davis",
      expiresAt: new Date(now.getTime() + 1800000), // 30 min left
    },
    {
      paymentLinkId: createdLinks[4].id,
      userId: user.id,
      kaspaAddress: user.kaspaAddress,
      amountExpected: "100",
      initialBalance: "1100",
      status: "expired",
      customerEmail: "dave@web3.dev",
      customerName: "Dave Wilson",
      expiresAt: new Date(now.getTime() - 7200000), // expired 2h ago
    },
    {
      paymentLinkId: createdLinks[7].id,
      userId: user.id,
      kaspaAddress: user.kaspaAddress,
      amountExpected: "10",
      initialBalance: "1100",
      status: "confirmed",
      customerEmail: "eve@startup.com",
      customerName: "Eve Martinez",
      txId: "789abc012345678901234567890abcdef12345678901234567890abcdefabc012",
      confirmedAt: new Date(now.getTime() - 86400000), // 1 day ago
      expiresAt: new Date(now.getTime() + 1800000),
    },
  ];

  console.log(`\nCreating ${samplePayments.length} payments...`);
  for (const payment of samplePayments) {
    await db.insert(schema.payments).values(payment);
    console.log(`  - ${payment.status} | ${payment.customerEmail || "anonymous"} | ${payment.amountExpected} KAS`);
  }

  console.log("\nDone! Seed data created successfully.");
}

seed().catch(console.error);

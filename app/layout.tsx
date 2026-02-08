import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KasPay - Payment Gateway for Kaspa",
  description:
    "Accept Kaspa cryptocurrency payments with near-zero fees and instant confirmations. The Stripe for Kaspa.",
  keywords: ["kaspa", "payment", "gateway", "cryptocurrency", "blockchain"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

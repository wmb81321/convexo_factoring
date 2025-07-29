import { config } from "@/config";
import { cookieToInitialState } from "@account-kit/core";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Convexo Wallet - Smart Web3 Wallet",
  description: "Next-generation web3 wallet with gasless transactions, social login, and seamless UX. Built with Alchemy Account Kit on Optimism.",
  keywords: ["web3", "wallet", "smart wallet", "gasless", "optimism", "ethereum", "convexo"],
  authors: [{ name: "Convexo Team" }],
  openGraph: {
    title: "Convexo Wallet - Smart Web3 Wallet",
    description: "Experience the future of web3 with gasless transactions and social login",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convexo Wallet",
    description: "Next-generation smart wallet for web3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Persist state across pages
  // https://www.alchemy.com/docs/wallets/react/ssr#persisting-the-account-state
  const initialState = cookieToInitialState(
    config,
    headers().get("cookie") ?? undefined
  );

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}

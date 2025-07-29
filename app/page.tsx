"use client";

import { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Header from "./components/header";
import LoginCard from "./components/login-card";
import PrivySmartWallet from "./components/privy-smart-wallet";

export default function Home() {
  const { authenticated, ready } = usePrivy();
  const { wallets } = useWallets();

  // Show loading while Privy initializes
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Convexo Wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      <div className="bg-bg-main bg-cover bg-center bg-no-repeat min-h-[calc(100vh-4rem)]">
        <main className="container mx-auto px-4 py-8">
          {!authenticated ? (
            <div className="flex justify-center items-center h-full pb-[4rem]">
              <LoginCard />
            </div>
          ) : (
            <PrivySmartWallet />
          )}
        </main>
      </div>
    </div>
  );
}

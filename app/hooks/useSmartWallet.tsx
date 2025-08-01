"use client";

import { useWallets } from "@privy-io/react-auth";
import { useMemo } from "react";

/**
 * Simple hook that returns the smart wallet (since we only use smart wallets)
 */
export function useSmartWallet() {
  const { wallets } = useWallets();

  const wallet = useMemo(() => {
    // Since we only create smart wallets, just return the first wallet
    // All users will have a smart wallet created automatically
    return wallets && wallets.length > 0 ? wallets[0] : null;
  }, [wallets]);

  return {
    wallet,
    isSmartWallet: true, // Always true since we only use smart wallets
    canUseGasSponsorship: true, // Always true for smart wallets
    allWallets: wallets,
  };
}
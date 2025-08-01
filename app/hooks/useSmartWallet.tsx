"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useMemo } from "react";

/**
 * Simple hook that returns the smart wallet (since we only use smart wallets)
 */
export function useSmartWallet() {
  const { user } = usePrivy();
  const { client } = useSmartWallets();

  const wallet = useMemo(() => {
    // Get embedded wallet (foundation for smart wallet functionality)
    return user?.linkedAccounts?.find(
      (account) => account.type === 'wallet'
    ) || null;
  }, [user]);

  return {
    wallet,
    client,
    isSmartWallet: true, // Always true since we only use smart wallets
    canUseGasSponsorship: true, // Always true for smart wallets
    address: wallet?.address,
  };
}
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

  const embeddedWallet = useMemo(() => {
    // Get embedded wallet (foundation for smart wallet functionality)
    return user?.linkedAccounts?.find(
      (account) => account.type === 'wallet'
    ) || null;
  }, [user]);

  const smartWalletAddress = useMemo(() => {
    // Get the actual smart wallet address from the client
    return client?.account?.address || null;
  }, [client]);

  return {
    wallet: embeddedWallet,
    client,
    isSmartWallet: true, // Always true since we only use smart wallets
    canUseGasSponsorship: true, // Always true for smart wallets
    address: smartWalletAddress, // Use smart wallet address, not embedded
    embeddedWalletAddress: embeddedWallet?.address,
    smartWalletAddress,
  };
}
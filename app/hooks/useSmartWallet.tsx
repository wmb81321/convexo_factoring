"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useMemo, useEffect } from "react";

/**
 * Enhanced hook for smart wallet management with debugging
 */
export function useSmartWallet() {
  const { user, authenticated } = usePrivy();
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

  // Debug smart wallet creation
  useEffect(() => {
    if (authenticated && user) {
      console.log('🔍 Smart Wallet Debug Info:');
      console.log('- User authenticated:', authenticated);
      console.log('- Embedded wallet:', embeddedWallet?.address);
      console.log('- Smart wallet client exists:', !!client);
      console.log('- Smart wallet address:', smartWalletAddress);
      console.log('- Client object:', client);
      
      if (embeddedWallet && !smartWalletAddress && client) {
        console.warn('⚠️ Embedded wallet exists but smart wallet not created. This might indicate a configuration issue.');
      }
    }
  }, [authenticated, user, embeddedWallet, smartWalletAddress, client]);

  return {
    wallet: embeddedWallet,
    client,
    isSmartWallet: !!smartWalletAddress, // True only if smart wallet actually exists
    canUseGasSponsorship: !!smartWalletAddress, // True only if smart wallet exists
    address: smartWalletAddress, // Use smart wallet address, not embedded
    embeddedWalletAddress: embeddedWallet?.address,
    smartWalletAddress,
    isLoading: authenticated && !client, // Loading state for smart wallet creation
  };
}
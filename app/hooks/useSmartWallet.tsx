"use client";

import { useWallets } from "@privy-io/react-auth";
import { useMemo } from "react";

/**
 * Custom hook to intelligently select the best wallet for the user
 * Prioritizes smart wallets for gas sponsorship, falls back to external wallets
 */
export function useSmartWallet() {
  const { wallets } = useWallets();

  const selectedWallet = useMemo(() => {
    if (!wallets || wallets.length === 0) {
      return null;
    }

    // Priority order:
    // 1. Smart wallets (for gas sponsorship)
    // 2. External wallets (MetaMask, etc.)
    // 3. Embedded wallets (fallback)

    // First, try to find a smart wallet
    const smartWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
    if (smartWallet) {
      console.log('🎯 Using smart wallet for gas sponsorship:', smartWallet.address);
      return smartWallet;
    }

    // Then, try external wallets (MetaMask, etc.)
    const externalWallet = wallets.find(wallet => 
      wallet.walletClientType === 'metamask' || 
      wallet.walletClientType === 'coinbase_wallet' ||
      wallet.walletClientType === 'rainbow' ||
      wallet.walletClientType === 'wallet_connect' ||
      wallet.walletClientType?.includes('injected')
    );
    if (externalWallet) {
      console.log('🦊 Using external wallet:', externalWallet.walletClientType, externalWallet.address);
      return externalWallet;
    }

    // Fallback to first available wallet
    console.log('📱 Using fallback wallet:', wallets[0].walletClientType, wallets[0].address);
    return wallets[0];
  }, [wallets]);

  const isSmartWallet = selectedWallet?.walletClientType === 'privy';
  const isExternalWallet = selectedWallet && !isSmartWallet;

  return {
    wallet: selectedWallet,
    isSmartWallet,
    isExternalWallet,
    allWallets: wallets,
    canUseGasSponsorship: isSmartWallet, // Only smart wallets support gas sponsorship
  };
}

/**
 * Hook specifically for getting smart wallet client (for sponsored transactions)
 */
export function useSmartWalletClient() {
  const { wallets } = useWallets();
  
  const smartWallet = useMemo(() => {
    return wallets?.find(wallet => wallet.walletClientType === 'privy') || null;
  }, [wallets]);

  return {
    smartWallet,
    hasSmartWallet: !!smartWallet,
  };
}
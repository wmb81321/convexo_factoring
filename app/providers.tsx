"use client";
import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PropsWithChildren } from "react";

// Create a simple Redux store for Uniswap widget
const store = configureStore({
  reducer: {
    // Add any reducers here if needed
  },
});

export const Providers = (props: PropsWithChildren) => {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  // Don't render PrivyProvider during build if no app ID
  if (!privyAppId) {
    return <>{props.children}</>;
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        // Login methods - supporting multiple authentication options
        loginMethods: ['wallet', 'google', 'apple', 'telegram'],
        
        // Appearance customization
        appearance: {
          theme: 'light',
          accentColor: '#4B66F3',
          logo: '/convexo-logo.png',
          showWalletLoginFirst: false,
        },
        
        // Embedded wallet configuration for smart wallets
        embeddedWallets: {
          createOnLogin: 'users-without-wallets', // Create smart wallets for users without external wallets
          requireUserPasswordOnCreate: false,
          showWalletUIs: true,
        },


        // Supported chains configuration (must match dashboard setup)
        supportedChains: [
          {
            id: 11155111, // Ethereum Sepolia
            name: 'Ethereum Sepolia',
            network: 'sepolia',
            nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://ethereum-sepolia-rpc.publicnode.com'] } },
            blockExplorers: { default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' } },
          },
          {
            id: 11155420, // OP Sepolia  
            name: 'OP Sepolia',
            network: 'optimism-sepolia',
            nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://sepolia.optimism.io'] } },
            blockExplorers: { default: { name: 'Optimism Sepolia Explorer', url: 'https://sepolia-optimism.etherscan.io' } },
          },
          {
            id: 84532, // Base Sepolia
            name: 'Base Sepolia',
            network: 'base-sepolia', 
            nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://sepolia.base.org'] } },
            blockExplorers: { default: { name: 'Base Sepolia Explorer', url: 'https://sepolia.basescan.org' } },
          },
          {
            id: 1301, // Unichain Sepolia
            name: 'Unichain Sepolia',
            network: 'unichain-sepolia',
            nativeCurrency: { name: 'Unichain Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://sepolia.unichain.org'] } },
            blockExplorers: { default: { name: 'Unichain Sepolia Explorer', url: 'https://unichain-sepolia.blockscout.com' } },
          },
        ],
        
        // Set default chain to Ethereum Sepolia (matches your dashboard setup)
        defaultChain: {
          id: 11155111,
          name: 'Ethereum Sepolia',
          network: 'sepolia',
          nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: { default: { http: ['https://ethereum-sepolia-rpc.publicnode.com'] } },
          blockExplorers: { default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' } },
        },
        
        // External wallet support - will be auto-detected by Privy
      }}
    >
      <SmartWalletsProvider
        config={{
                  // Alchemy Gas Manager configuration for proper sponsorship
        paymasterContext: {
          policyId: process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID,
          rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
        },
        }}
      >
        <Provider store={store}>
          {props.children}
        </Provider>
      </SmartWalletsProvider>
    </PrivyProvider>
  );
};

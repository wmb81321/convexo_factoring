"use client";
import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { PropsWithChildren } from "react";

export const Providers = (props: PropsWithChildren) => {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        // Login methods - supporting multiple authentication options
        loginMethods: ['email', 'sms', 'google', 'apple'],
        
        // Appearance customization
        appearance: {
          theme: 'light',
          accentColor: '#4B66F3',
          logo: '/convexo-logo.png',
          showWalletLoginFirst: false,
        },
        
        // Embedded wallet configuration for smart wallets
        embeddedWallets: {
          createOnLogin: 'all-users', // Create smart wallets for all users
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
            rpcUrls: { default: { http: ['https://rpc.sepolia.org'] } },
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
          rpcUrls: { default: { http: ['https://rpc.sepolia.org'] } },
          blockExplorers: { default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' } },
        },
        
        // External wallet support - will be auto-detected by Privy
      }}
    >
      <SmartWalletsProvider>
        {props.children}
      </SmartWalletsProvider>
    </PrivyProvider>
  );
};

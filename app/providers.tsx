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
        
        // Login methods - social logins create embedded wallets automatically
        loginMethods: ['google', 'apple', 'telegram'],
        
        // Appearance customization
        appearance: {
          theme: 'light',
          accentColor: '#4B66F3',
          logo: '/convexo-logo.png',
          showWalletLoginFirst: false,
        },
        
        // CREATE embedded wallets (needed for smart wallets)
        embeddedWallets: {
          createOnLogin: 'all-users', // Create for all users
          requireUserPasswordOnCreate: false,
          showWalletUIs: false, // Hide UI since we use smart wallet interface
        },  


        // Supported chains configuration with Alchemy RPC URLs for gas sponsorship
        supportedChains: [
          {
            id: 11155111, // Ethereum Sepolia
            name: 'Ethereum Sepolia',
            network: 'sepolia',
            nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://eth-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'] } },
            blockExplorers: { default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' } },
          },
          {
            id: 11155420, // OP Sepolia  
            name: 'OP Sepolia',
            network: 'optimism-sepolia',
            nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://opt-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'] } },
            blockExplorers: { default: { name: 'Optimism Sepolia Explorer', url: 'https://sepolia-optimism.etherscan.io' } },
          },
          {
            id: 84532, // Base Sepolia
            name: 'Base Sepolia',
            network: 'base-sepolia', 
            nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://base-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'] } },
            blockExplorers: { default: { name: 'Base Sepolia Explorer', url: 'https://sepolia.basescan.org' } },
          },
          {
            id: 1301, // Unichain Sepolia
            name: 'Unichain Sepolia',
            network: 'unichain-sepolia',
            nativeCurrency: { name: 'Unichain Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://unichain-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'] } },
            blockExplorers: { default: { name: 'Unichain Sepolia Explorer', url: 'https://unichain-sepolia.blockscout.com' } },
          },
        ],
        
        // Set default chain to Ethereum Sepolia (matches your dashboard setup)
        defaultChain: {
          id: 11155111,
          name: 'Ethereum Sepolia',
          network: 'sepolia',
          nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: { default: { http: ['https://eth-sepolia.g.alchemy.com/v2/wkftoNwmx1w1I2Zo3Kljuv0T28pCBQy0'] } },
          blockExplorers: { default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' } },
        },
        
        // External wallet support - will be auto-detected by Privy
      }}
    >
      <SmartWalletsProvider
        config={{
          // Multi-chain Alchemy Gas Manager configuration
          paymasterContext: (chainId: number) => {
            const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
            const policyId = process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID;
            
            // Return appropriate RPC URL based on chain ID
            const getRpcUrl = (id: number): string => {
              switch (id) {
                case 11155111: // Ethereum Sepolia
                  return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
                case 11155420: // OP Sepolia
                  return `https://opt-sepolia.g.alchemy.com/v2/${apiKey}`;
                case 84532: // Base Sepolia
                  return `https://base-sepolia.g.alchemy.com/v2/${apiKey}`;
                case 1301: // Unichain Sepolia
                  return `https://unichain-sepolia.g.alchemy.com/v2/${apiKey}`;
                default:
                  return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`; // Fallback
              }
            };

            return {
              policyId,
              rpcUrl: getRpcUrl(chainId),
            };
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

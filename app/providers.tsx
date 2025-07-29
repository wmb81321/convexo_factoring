"use client";
import { PrivyProvider } from '@privy-io/react-auth';
import { PropsWithChildren } from "react";

export const Providers = (props: PropsWithChildren) => {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        // Login methods
        loginMethods: ['email', 'sms', 'google', 'apple'],
        
        // Appearance
        appearance: {
          theme: 'light',
          accentColor: '#4B66F3',
          logo: '/convexo-logo.png',
          showWalletLoginFirst: false,
        },
        
        // Smart wallet configuration
        embeddedWallets: {
          createOnLogin: 'all-users', // Create smart wallets for all users
          requireUserPasswordOnCreate: false,
          showWalletUIs: true,
        },
        
        // Smart wallet settings
        smartWallet: {
          chains: [1], // Ethereum mainnet
          bundlerUrl: process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL,
          paymasterUrl: `https://paymaster.alchemy.com/api/v1/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
          paymasterContext: {
            policyId: process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID,
          },
        },
        
        // External wallets support
        externalWallets: {
          coinbaseWallet: {
            enabled: true,
          },
          metamask: {
            enabled: true,
          },
          walletConnect: {
            enabled: true,
          },
        },
      }}
    >
      {props.children}
    </PrivyProvider>
  );
};

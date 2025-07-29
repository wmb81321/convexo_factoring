"use client";
import { PrivyProvider } from '@privy-io/react-auth';
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
        
        // External wallet support - will be auto-detected by Privy
      }}
    >
      {props.children}
    </PrivyProvider>
  );
};

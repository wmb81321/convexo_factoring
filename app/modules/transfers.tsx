"use client";

import { useWallets } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TokenBalances from "@/app/components/token-balances";

export default function Transfers() {
  const { wallets } = useWallets();
  const wallet = wallets?.[0];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Token Balances</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          View your token holdings across all supported chains
        </p>
      </div>

      <Card>
        <CardContent>
          {wallet?.address ? (
            <TokenBalances walletAddress={wallet.address} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Connect wallet to view balances</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
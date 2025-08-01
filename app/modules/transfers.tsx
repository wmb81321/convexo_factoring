"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TokenBalances from "@/app/components/token-balances";
import { useSmartWallet } from "@/app/hooks/useSmartWallet";

export default function Transfers() {
  const { wallet, isSmartWallet, canUseGasSponsorship } = useSmartWallet();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Token Balances</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          View your token holdings across all supported chains
        </p>
        
        {/* Smart Wallet Indicator */}
        {wallet && (
          <div className="flex justify-center">
            <Badge variant="default" className="gap-2">
              🚀 Smart Wallet • Gas Sponsored
            </Badge>
          </div>
        )}
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
"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  Shield, 
  Zap, 
  Globe 
} from "lucide-react";
import PrivySmartWallet from "../components/privy-smart-wallet";

export default function Home() {
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();

  // Show smart wallet interface when authenticated
  // (smart wallets are created automatically)
  if (authenticated && user) {
    return (
      <div className="space-y-6">
        {/* Smart Wallet Dashboard - Primary Interface */}
        <PrivySmartWallet />
        
        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="">
                <div className="flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Transfers</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Send and receive tokens via smart wallet
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">DeFi</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Swap tokens and manage liquidity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This should rarely show now since login 
  // creates smart wallets automatically
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Convexo Smart Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Your gateway to gasless transactions and cross-chain DeFi
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-400 font-medium">
              🚀 Smart wallets are created automatically when you connect!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
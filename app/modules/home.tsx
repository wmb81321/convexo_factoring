"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Shield, Zap, Globe } from "lucide-react";

export default function Home() {
  const { user, login, logout } = usePrivy();

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to Convexo
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Your gateway to cross-chain DeFi and smart wallet solutions
            </p>
            <Button onClick={login} className="w-full">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Welcome back, {user.email?.address?.split('@')[0] || 'User'}! 👋
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Ready to explore cross-chain DeFi? Navigate to the modules below to get started.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Wallet className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Transfers</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Send and receive tokens across chains
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
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
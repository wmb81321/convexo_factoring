"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginCard() {
  const { login, ready } = usePrivy();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!ready) return;
    
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
            <span className="text-2xl">🚀</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Convexo Wallet
          </CardTitle>
          <CardDescription className="text-base">
            Experience next-generation smart wallets with gasless transactions on Sepolia testnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-center">🎯 Smart Wallet Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Gasless transactions (sponsored)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Social & email authentication</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Account abstraction (ERC-4337)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Sepolia testnet ready</span>
              </li>
            </ul>
          </div>
          
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn || !ready}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              "Connect Smart Wallet"
            )}
          </Button>
          
          <div className="text-center text-xs text-gray-500">
            Powered by Privy • Sponsored by Alchemy
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

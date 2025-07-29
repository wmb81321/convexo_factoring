"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthModal } from "@account-kit/react";
import { usePrivy } from "@privy-io/react-auth";

type WalletType = 'smart' | 'traditional' | null;

interface WalletSelectorProps {
  onWalletSelected: (type: WalletType) => void;
}

export default function WalletSelector({ onWalletSelected }: WalletSelectorProps) {
  const [selectedType, setSelectedType] = useState<WalletType>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { openAuthModal } = useAuthModal();
  const { login } = usePrivy();

  const handleSmartWallet = async () => {
    setIsConnecting(true);
    setSelectedType('smart');
    try {
      await openAuthModal();
      onWalletSelected('smart');
    } catch (error) {
      console.error("Error with smart wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTraditionalWallet = async () => {
    setIsConnecting(true);
    setSelectedType('traditional');
    try {
      await login();
      onWalletSelected('traditional');
    } catch (error) {
      console.error("Error with traditional wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Choose Your Convexo Experience
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select the wallet type that best fits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Smart Wallet Option */}
        <Card className={cn(
          "relative border-2 hover:shadow-xl transition-all duration-300 cursor-pointer",
          selectedType === 'smart' ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-gray-200",
          "hover:border-blue-300"
        )}>
          <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            RECOMMENDED
          </div>
          
          <CardHeader className="text-center pb-4">
            <div className="text-4xl mb-2">⚡</div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
              Smart Wallet
            </CardTitle>
            <CardDescription className="text-base">
              Next-generation wallet with gasless transactions and social login
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Gasless transactions (sponsored)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Social login (Google, Facebook)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Passkey authentication</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Email-based recovery</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Advanced security features</span>
              </li>
            </ul>

            <Button
              onClick={handleSmartWallet}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
            >
              {isConnecting && selectedType === 'smart' ? "Connecting..." : "Connect Smart Wallet"}
            </Button>
          </CardContent>
        </Card>

        {/* Traditional Wallet Option */}
        <Card className={cn(
          "border-2 hover:shadow-xl transition-all duration-300 cursor-pointer",
          selectedType === 'traditional' ? "border-gray-500 bg-gray-50 dark:bg-gray-900/10" : "border-gray-200",
          "hover:border-gray-300"
        )}>
          <CardHeader className="text-center pb-4">
            <div className="text-4xl mb-2">🔐</div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
              Traditional Wallet
            </CardTitle>
            <CardDescription className="text-base">
              Classic embedded wallet with email/phone authentication
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Email & phone authentication</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Embedded wallet creation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Private key export</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Full wallet control</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Compatible with all dApps</span>
              </li>
            </ul>

            <Button
              onClick={handleTraditionalWallet}
              disabled={isConnecting}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50 font-medium"
            >
              {isConnecting && selectedType === 'traditional' ? "Connecting..." : "Connect Traditional Wallet"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8 text-sm text-gray-500">
        Both options are secure and support Optimism network. You can switch between them anytime.
      </div>
    </div>
  );
} 
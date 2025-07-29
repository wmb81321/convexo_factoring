"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";

export default function TraditionalWallet() {
  const { user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [isExporting, setIsExporting] = useState(false);

  const userWallet = wallets?.[0];

  const handleExportWallet = async () => {
    setIsExporting(true);
    try {
      // Privy's export functionality would go here
      console.log("Exporting wallet...");
    } catch (error) {
      console.error("Error exporting wallet:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            Traditional Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-mono">{user?.email?.address || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-mono">{user?.phone?.number || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span>User ID:</span>
                <span className="font-mono text-xs">{user?.id.slice(0, 12)}...</span>
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          {userWallet && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-3 text-blue-800 dark:text-blue-400">
                Embedded Wallet
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Wallet Address
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-white dark:bg-gray-700 rounded border text-sm font-mono">
                      {userWallet.address}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(userWallet.address)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Chain ID
                  </label>
                  <div className="mt-1 p-2 bg-white dark:bg-gray-700 rounded border text-sm">
                    {userWallet.chainId || 'Unknown'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Wallet Type
                  </label>
                  <div className="mt-1 p-2 bg-white dark:bg-gray-700 rounded border text-sm">
                    {userWallet.walletClientType || 'Embedded Wallet'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportWallet}
                  disabled={isExporting}
                >
                  {isExporting ? "Exporting..." : "Export Wallet"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://optimistic.etherscan.io/address/${userWallet.address}`, '_blank')}
                >
                  View on Explorer
                </Button>
              </div>
            </div>
          )}

          {/* Wallet Features */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h3 className="font-semibold mb-3 text-green-800 dark:text-green-400">
              Traditional Wallet Features
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Full private key control</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Export & import capabilities</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Compatible with all dApps</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Email & phone recovery</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Optimism network support</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Switch Wallet Type
            </Button>
            <Button
              variant="destructive"
              onClick={logout}
              className="flex-1"
            >
              Disconnect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
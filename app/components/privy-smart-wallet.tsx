"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";

export default function PrivySmartWallet() {
  const { user, logout, exportWallet } = usePrivy();
  const { wallets } = useWallets();
  const [isExporting, setIsExporting] = useState(false);

  const smartWallet = wallets?.find(wallet => wallet.walletClientType === 'privy');
  const embeddedWallet = wallets?.find(wallet => wallet.address);

  const handleExportWallet = async () => {
    if (!embeddedWallet) return;
    
    setIsExporting(true);
    try {
      await exportWallet({ address: embeddedWallet.address });
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
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            Convexo Smart Wallet Connected!
          </CardTitle>
        </CardHeader>
        <CardContent>
                     <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 
                border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-400">
              🎉 Welcome to the Future of Web3!
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your smart wallet is now active with gasless transactions powered by Alchemy on Sepolia testnet.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700 dark:text-green-400">✅ Smart Features Active:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Gasless transactions (sponsored)</li>
                  <li>• Social & email authentication</li>
                  <li>• Sepolia testnet support</li>
                  <li>• Account abstraction enabled</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400">🔧 Infrastructure:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Bundler: Pimlico</li>
                  <li>• Paymaster: Alchemy</li>
                  <li>• Network: Sepolia (Chain ID: 11155111)</li>
                  <li>• Provider: Privy</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3">User Details</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-mono">{user?.email?.address || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                  <span className="font-mono">{user?.phone?.number || 'Not provided'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                  <span className="font-mono text-xs">{user?.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Wallets:</span>
                  <span className="font-medium">{wallets?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Wallet Details */}
          {embeddedWallet && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-3 text-blue-800 dark:text-blue-400">
                Smart Wallet Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    Wallet Address
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-white dark:bg-gray-700 rounded border text-sm font-mono break-all">
                      {embeddedWallet.address}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(embeddedWallet.address)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                      Chain ID
                    </label>
                    <div className="p-2 bg-white dark:bg-gray-700 rounded border text-sm">
                      {embeddedWallet.chainId || '11155111 (Sepolia)'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                      Wallet Type
                    </label>
                    <div className="p-2 bg-white dark:bg-gray-700 rounded border text-sm">
                      Smart Wallet
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportWallet}
                    disabled={isExporting}
                  >
                    {isExporting ? "Exporting..." : "Export Private Key"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://sepolia.etherscan.io/address/${embeddedWallet.address}`, '_blank')}
                  >
                    View on Sepolia Etherscan
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Refresh Wallet
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

      {/* Next Steps Card */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Test Smart Wallet Features:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Send gasless transactions</li>
                <li>• Interact with dApps</li>
                <li>• Test social recovery</li>
                <li>• Export private keys</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Integration Complete:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>✅ Privy authentication</li>
                <li>✅ Smart wallet creation</li>
                <li>✅ Alchemy gas sponsorship</li>
                <li>✅ Sepolia testnet support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
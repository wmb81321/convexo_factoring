"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useState } from "react";
import ChainSelector from "./chain-selector";
import TokenBalances from "./token-balances";
import { getChainById, DEFAULT_CHAIN } from "@/lib/chains";

export default function PrivySmartWallet() {
  const { user, logout } = usePrivy();
  const { client: smartWalletClient } = useSmartWallets();
  const [selectedChainId, setSelectedChainId] = useState(DEFAULT_CHAIN.chainId);
  const [isExporting, setIsExporting] = useState(false);

  // Get smart wallet from user's linked accounts (NOT from wallets)
  const smartWallet = user?.linkedAccounts?.find(
    (account) => account.type === 'smart_wallet'
  );
  const selectedChain = getChainById(selectedChainId);

  const handleExportWallet = async () => {
    if (!smartWallet) return;
    
    setIsExporting(true);
    try {
      // Smart wallets don't need export in the same way
      console.log('Smart wallet address:', smartWallet.address);
      alert(`Smart wallet address: ${smartWallet.address}`);
    } catch (error) {
      console.error("Error with smart wallet:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleChainChange = (chainId: number) => {
    setSelectedChainId(chainId);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            Convexo Smart Wallet Active!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 
                border border-blue-200 dark:border-blue-800">
            <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-400">
              🎉 Welcome to the Future of Web3!
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your smart wallet is active with gasless transactions powered by Alchemy across multiple testnets. No embedded wallets needed!
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700 dark:text-green-400">✅ Smart Features Active:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Gasless transactions (sponsored)</li>
                  <li>• Social & email authentication</li>
                  <li>• Multi-chain testnet support</li>
                  <li>• Account abstraction enabled</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400">🔧 Infrastructure:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Bundler: Pimlico</li>
                  <li>• Paymaster: Alchemy</li>
                  <li>• Networks: ETH, UNI, OP, BASE Sepolia</li>
                  <li>• Provider: Privy</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chain Selector & Wallet Info */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chain & Network Info */}
        <Card>
          <CardHeader>
            <CardTitle>Network & Chain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chain Selector */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                Select Testnet
              </label>
              <ChainSelector
                currentChainId={selectedChainId}
                onChainChange={handleChainChange}
              />
            </div>

            {/* Current Chain Info */}
            {selectedChain && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Current Network</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="font-medium">{selectedChain.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Chain ID:</span>
                    <span className="font-mono">{selectedChain.chainId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                    <span className="font-medium">{selectedChain.nativeCurrency.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Bundler:</span>
                    <span className="text-green-600">✅ Active</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User & Wallet Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">User Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-mono text-xs">{user?.email?.address || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                  <span className="font-mono text-xs">{user?.phone?.number || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Smart Wallet:</span>
                  <span className="font-medium">{smartWallet ? '✅ Active' : '❌ Not Found'}</span>
                </div>
              </div>
            </div>

            {/* Smart Wallet Details - ONLY WALLET TYPE */}
            {smartWallet ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-400">
                  🚀 Smart Wallet
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                      Address
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-white dark:bg-gray-700 rounded border text-sm font-mono">
                        {smartWallet.address}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(smartWallet.address)}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportWallet}
                      disabled={isExporting}
                    >
                      {isExporting ? "View Address..." : "View Address"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`${selectedChain?.blockExplorer}/address/${smartWallet.address}`, '_blank')}
                    >
                      View on Explorer
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-400">
                  ⚠️ Smart Wallet Not Found
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Smart wallet is being created. Please refresh if this persists.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Token Balances - FROM SMART WALLET ONLY */}
      {smartWallet && (
        <TokenBalances
          walletAddress={smartWallet.address}
        />
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
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

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Multi-Chain Smart Wallet Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">🌐 Supported Networks:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Ethereum Sepolia (Default)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Unichain Sepolia</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Optimism Sepolia</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Base Sepolia</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">🪙 Supported Tokens:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>ETH (Native) - All chains</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>USDC - Ethereum Sepolia</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>COPE - Ethereum Sepolia</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-500">⏳</span>
                  <span>More tokens coming soon</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
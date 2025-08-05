"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Download, ArrowUpDown, ExternalLink, Copy, Key } from "lucide-react";
import TokenBalances from "@/app/components/token-balances";
import SendModal from "@/app/components/send-modal";
import ReceiveModal from "@/app/components/receive-modal";
import { useSmartWallet } from "@/app/hooks/useSmartWallet";
import { DEFAULT_CHAIN, getChainById } from "@/lib/chains";
import TokenIcon from "@/app/components/token-icon";
import { usePrivy } from "@privy-io/react-auth";

type WalletType = 'smart' | 'embedded';

export default function Transfers() {
  const { 
    wallet: embeddedWallet, 
    smartWalletAddress, 
    embeddedWalletAddress,
    client 
  } = useSmartWallet();
  
  const { exportWallet } = usePrivy();
  
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType>('smart');
  const [selectedChainId, setSelectedChainId] = useState(DEFAULT_CHAIN.chainId);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Get current wallet address based on selection
  const currentWalletAddress = selectedWalletType === 'smart' 
    ? smartWalletAddress 
    : embeddedWalletAddress;

  const isSmartWalletSelected = selectedWalletType === 'smart';
  const selectedChain = getChainById(selectedChainId);

  // Export private key for embedded wallets
  const handleExportPrivateKey = async () => {
    if (!embeddedWallet || selectedWalletType !== 'embedded') return;
    
    setIsExporting(true);
    try {
      await exportWallet();
    } catch (error) {
      console.error('Failed to export wallet:', error);
      alert('Failed to export wallet. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Open wallet in block explorer
  const openInExplorer = () => {
    if (!currentWalletAddress || !selectedChain) return;
    
    const explorerUrl = `${selectedChain.blockExplorer}/address/${currentWalletAddress}`;
    window.open(explorerUrl, '_blank');
  };

  // Copy address to clipboard
  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      alert('Address copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Transfers</h1>
        <p className="text-lg text-white">
          Send and receive tokens with your smart wallet or embedded wallet
        </p>
      </div>

      {/* Wallet Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            Wallet Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Smart Wallet Option */}
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedWalletType === 'smart' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedWalletType('smart')}
            >
              <div className="flex items-center gap-3 mb-2">
                <TokenIcon symbol="COPE" size={32} />
                <div>
                  <h3 className="font-semibold">Smart Wallet</h3>
                  <Badge variant="secondary" className="text-xs">
                    Gasless Transactions
                  </Badge>
                </div>
              </div>
              {smartWalletAddress && (
                <div className="mt-2 space-y-2">
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-300 block truncate">
                    {smartWalletAddress}
                  </code>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyAddress(smartWalletAddress)}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={openInExplorer}
                      className="h-6 px-2 text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Explorer
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Embedded Wallet Option */}
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedWalletType === 'embedded' 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedWalletType('embedded')}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔐</span>
                <div>
                  <h3 className="font-semibold">Embedded Wallet</h3>
                  <Badge variant="outline" className="text-xs">
                    Direct Control
                  </Badge>
                </div>
              </div>
              {embeddedWalletAddress && (
                <div className="mt-2 space-y-2">
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-300 block truncate">
                    {embeddedWalletAddress}
                  </code>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyAddress(embeddedWalletAddress)}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={openInExplorer}
                      className="h-6 px-2 text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Explorer
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportPrivateKey}
                      disabled={isExporting}
                      className="h-6 px-2 text-xs text-orange-600 hover:text-orange-700"
                    >
                      <Key className="w-3 h-3 mr-1" />
                      {isExporting ? 'Exporting...' : 'Export Key'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Selection Info */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Active Wallet: {isSmartWalletSelected ? '🚀 Smart Wallet' : '🔐 Embedded Wallet'}
              </span>
              {isSmartWalletSelected && (
                <Badge variant="secondary" className="text-xs">
                  Gas Sponsored
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Action Buttons */}
      {currentWalletAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quick Actions</span>
              <Badge variant={isSmartWalletSelected ? "default" : "secondary"}>
                {isSmartWalletSelected ? 'Gas Sponsored' : 'User Pays Gas'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setShowSendModal(true)}
                className="flex items-center gap-2 h-12"
                variant={isSmartWalletSelected ? "default" : "outline"}
              >
                <Send className="w-4 h-4" />
                Send Tokens
              </Button>
              <Button
                onClick={() => setShowReceiveModal(true)}
                variant="outline"
                className="flex items-center gap-2 h-12"
              >
                <Download className="w-4 h-4" />
                Receive Tokens
              </Button>
            </div>
            
            {!isSmartWalletSelected && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>⚠️ Embedded Wallet Notice:</strong>
                    <div className="text-xs mt-1">
                      You&apos;ll need to pay gas fees for transactions. Make sure you have enough ETH for gas.
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="text-sm text-orange-800 dark:text-orange-200">
                    <strong>🔑 Private Key Export:</strong>
                    <div className="text-xs mt-1">
                      You can export your private key to use this wallet in other applications like MetaMask. Keep your private key secure!
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Token Balances */}
      {currentWalletAddress && (
        <Card>
          <CardHeader>
            <CardTitle>
              Token Balances - {isSmartWalletSelected ? 'Smart Wallet' : 'Embedded Wallet'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TokenBalances walletAddress={currentWalletAddress} />
          </CardContent>
        </Card>
      )}

      {/* Send Modal */}
      {showSendModal && currentWalletAddress && (
        <SendModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          walletAddress={currentWalletAddress}
          chainId={selectedChainId}
          balances={[]} // Will be fetched by the modal
          walletType={selectedWalletType}
          isSmartWallet={isSmartWalletSelected}
        />
      )}

      {/* Receive Modal */}
      {showReceiveModal && currentWalletAddress && (
        <ReceiveModal
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
          walletAddress={currentWalletAddress}
          chainId={selectedChainId}
          walletType={selectedWalletType}
        />
      )}
    </div>
  );
}
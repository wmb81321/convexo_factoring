"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Download, ArrowUpDown } from "lucide-react";
import TokenBalances from "@/app/components/token-balances";
import SendModal from "@/app/components/send-modal";
import ReceiveModal from "@/app/components/receive-modal";
import { useSmartWallet } from "@/app/hooks/useSmartWallet";
import { DEFAULT_CHAIN } from "@/lib/chains";

type WalletType = 'smart' | 'embedded';

export default function Transfers() {
  const { 
    wallet: embeddedWallet, 
    smartWalletAddress, 
    embeddedWalletAddress,
    client 
  } = useSmartWallet();
  
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType>('smart');
  const [selectedChainId, setSelectedChainId] = useState(DEFAULT_CHAIN.chainId);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  // Get current wallet address based on selection
  const currentWalletAddress = selectedWalletType === 'smart' 
    ? smartWalletAddress 
    : embeddedWalletAddress;

  const isSmartWalletSelected = selectedWalletType === 'smart';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Transfers</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
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
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="font-semibold">Smart Wallet</h3>
                  <Badge variant="secondary" className="text-xs">
                    Gasless Transactions
                  </Badge>
                </div>
              </div>
              {smartWalletAddress && (
                <code className="text-xs font-mono text-gray-600 block truncate">
                  {smartWalletAddress}
                </code>
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
                <code className="text-xs font-mono text-gray-600 block truncate">
                  {embeddedWalletAddress}
                </code>
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

      {/* Transfer Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => setShowSendModal(true)}
              disabled={!currentWalletAddress}
              className="h-16 text-lg"
              variant="default"
            >
              <Send className="w-6 h-6 mr-2" />
              Send Tokens
            </Button>
            
            <Button 
              onClick={() => setShowReceiveModal(true)}
              disabled={!currentWalletAddress}
              className="h-16 text-lg"
              variant="outline"
            >
              <Download className="w-6 h-6 mr-2" />
              Receive Tokens
            </Button>
          </div>
        </CardContent>
      </Card>

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
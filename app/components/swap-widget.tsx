"use client";

import React, { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { SwapWidget, lightTheme } from '@uniswap/widgets';
import '@uniswap/widgets/fonts.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Zap,
  ExternalLink,
  Settings
} from "lucide-react";
import { getAllChains, getChainById } from "@/lib/chains";

// Use default light theme
const customTheme = lightTheme;

// JSON-RPC endpoints for different chains
const jsonRpcUrlMap = {
  11155111: ['https://eth-sepolia.g.alchemy.com/v2/demo'], // Ethereum Sepolia
  11155420: ['https://sepolia.optimism.io'], // Optimism Sepolia
  84532: ['https://sepolia.base.org'], // Base Sepolia
  1301: ['https://sepolia.unichain.org'], // Unichain Sepolia
};

// Custom token list including your COPE token
const customTokenList = [
  {
    name: "Ethereum",
    address: "NATIVE",
    symbol: "ETH",
    decimals: 18,
    chainId: 11155111,
    logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png"
  },
  {
    name: "USD Coin",
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    symbol: "USDC",
    decimals: 6,
    chainId: 11155111,
    logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png"
  },
  {
    name: "Electronic Colombian Peso",
    address: "0xA4A4fCb23ffcd964346D2e4eCDf5A8c15C69B219",
    symbol: "COPE",
    decimals: 18,
    chainId: 11155111,
    logoURI: 
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA4A4fCb23ffcd964346D2e4eCDf5A8c15C69B219/logo.png"
  },
  // Base Sepolia tokens
  {
    name: "Ethereum",
    address: "NATIVE",
    symbol: "ETH",
    decimals: 18,
    chainId: 84532,
    logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png"
  },
  {
    name: "USD Coin",
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    symbol: "USDC",
    decimals: 6,
    chainId: 84532,
    logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png"
  },
  {
    name: "Electronic Colombian Peso",
    address: "0x34fa1aed9f275451747f3e9b5377608ccf96a458",
    symbol: "COPE",
    decimals: 18,
    chainId: 84532,
    logoURI: 
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA4A4fCb23ffcd964346D2e4eCDf5A8c15C69B219/logo.png"
  }
];

interface SwapWidgetProps {
  defaultInputToken?: string;
  defaultOutputToken?: string;
  defaultInputAmount?: number;
  onSwapComplete?: (txHash: string) => void;
}

export default function SwapWidgetComponent({ 
  defaultInputToken = "NATIVE",
  defaultOutputToken,
  defaultInputAmount,
  onSwapComplete 
}: SwapWidgetProps) {
  const { wallets } = useWallets();
  const wallet = wallets?.[0];
  const [isConnected, setIsConnected] = useState(false);
  const [currentChain, setCurrentChain] = useState(11155111); // Default to Ethereum Sepolia
  const [swapHistory, setSwapHistory] = useState<any[]>([]);

  // Check if wallet is connected
  useEffect(() => {
    setIsConnected(!!wallet?.address);
  }, [wallet?.address]);

  // Handle wallet connection
  const handleConnectWallet = () => {
    // The widget will handle wallet connection automatically
    console.log('Connecting wallet...');
  };

  // Handle swap completion
  const handleSwapComplete = (txHash: string) => {
    console.log('Swap completed:', txHash);
    setSwapHistory(prev => [...prev, { txHash, timestamp: new Date() }]);
    onSwapComplete?.(txHash);
  };

  // Get current chain info
  const currentChainInfo = getChainById(currentChain);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Swap Tokens</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Trade tokens using Uniswap Protocol
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentChainInfo && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {currentChainInfo.shortName}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://app.uniswap.org', '_blank')}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open Uniswap
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-semibold">Connect Wallet</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect your wallet to start swapping tokens
              </p>
              <Button onClick={handleConnectWallet} className="gap-2">
                <Zap className="w-4 h-4" />
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Swap Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Swap Tokens
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex justify-center">
            <SwapWidget
              provider={wallet?.walletClientType === 'privy' ? undefined : undefined}
              jsonRpcUrlMap={jsonRpcUrlMap}
              tokenList={customTokenList}
              theme={customTheme}
              defaultInputTokenAddress={defaultInputToken}
              defaultOutputTokenAddress={defaultOutputToken}
              defaultInputAmount={defaultInputAmount}
              onConnectWalletClick={handleConnectWallet}
              width={400}
              hideConnectionUI={false}
              onError={(error) => {
                console.error('Swap widget error:', error);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Swap Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Swap Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                // Set default to ETH -> COPE
                window.location.href = '?input=NATIVE&output=0xA4A4fCb23ffcd964346D2e4eCDf5A8c15C69B219&amount=0.1';
              }}
            >
              <div className="text-lg">💎 → 🚀</div>
              <div className="text-sm">ETH → COPE</div>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                // Set default to COPE -> ETH
                window.location.href = '?input=0xA4A4fCb23ffcd964346D2e4eCDf5A8c15C69B219&output=NATIVE&amount=100';
              }}
            >
              <div className="text-lg">🚀 → 💎</div>
              <div className="text-sm">COPE → ETH</div>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                // Set default to USDC -> COPE
                window.location.href = 
                  '?input=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238&output=0xA4A4fCb23ffcd964346D2e4eCDf5A8c15C69B219&amount=100';
              }}
            >
              <div className="text-lg">💵 → 🚀</div>
              <div className="text-sm">USDC → COPE</div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Swaps */}
      {swapHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {swapHistory.slice(-5).reverse().map((swap, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Swap completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {swap.timestamp.toLocaleTimeString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://sepolia.etherscan.io/tx/${swap.txHash}`, '_blank')}
                      className="h-6 px-2 text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">About This Swap Interface</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p>
                This swap interface is powered by the Uniswap Protocol and allows you to trade tokens 
                including your COPE (Electronic Colombian Peso) tokens.
              </p>
              <p>
                Supported chains: Ethereum Sepolia, Base Sepolia, Optimism Sepolia, and Unichain Sepolia
              </p>
              <p>
                All swaps are executed through Uniswap&apos;s secure smart contracts with automatic price discovery.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
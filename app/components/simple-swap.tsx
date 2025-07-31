"use client";

import { SwapWidget } from '@uniswap/widgets';
import '@uniswap/widgets/fonts.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Custom token list for Ethereum Sepolia - NO EXTERNAL DEPENDENCIES
const SEPOLIA_TOKEN_LIST = [
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
    logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png"
  }
];

// RPC endpoints for Ethereum Sepolia
const jsonRpcUrlMap = {
  11155111: ['https://rpc.sepolia.org', 'https://ethereum-sepolia.blockpi.network/v1/rpc/public']
};

export default function SimpleSwap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            USDC ⇄ COPE Swap
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://sepolia.etherscan.io/token/0xa4a4fcb23ffcd964346d2e4ecdf5a8c15c69b219', '_blank')}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View COPE
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex justify-center">
          <SwapWidget 
            jsonRpcUrlMap={jsonRpcUrlMap}
            tokenList={SEPOLIA_TOKEN_LIST}
            defaultInputTokenAddress="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
            defaultOutputTokenAddress="0xA4A4fCb23ffcd964346D2e4eCDf5A8c15C69B219"
            width={380}
          />
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Trade on Ethereum Sepolia • USDC-COPE Liquidity Pool
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Pool Address: 
            <a 
              href="https://app.uniswap.org/positions/v4/ethereum_sepolia/12714" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-1 hover:text-blue-600 underline"
            >
              View Analytics
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
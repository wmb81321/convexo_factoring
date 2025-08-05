"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Zap, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { useSmartWallet } from "@/app/hooks/useSmartWallet";
import { useSponsoredTransactions } from "@/app/hooks/useSponsoredTransactions";
import { fetchAllBalances } from "@/lib/blockchain";
import TokenIcon from "./token-icon";

// Token contracts on Ethereum Sepolia
const TOKENS = {
  USDC: {
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin"
  },
  COPE: {
    address: "0xA4A4fCb23ffcd964346D2e4eCDf5A8c15C69B219", 
    symbol: "COPE",
    decimals: 6,
    name: "Electronic Colombian Peso"
  }
};

const POOL_ADDRESS = "0x6e3a232aab5dabf359a7702f287752eb3db696f8f917e758dce73ae2a9f60301";

interface TokenBalance {
  symbol: string;
  balance: string;
  formattedBalance: string;
  contract?: string;
}

export default function CustomSwap() {
  const { smartWalletAddress } = useSmartWallet();
  const { sendSponsoredTransaction, status, reset } = useSponsoredTransactions();
  
  const [fromToken, setFromToken] = useState(TOKENS.USDC);
  const [toToken, setToToken] = useState(TOKENS.COPE);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // Fetch token balances using the same method as transfer module
  useEffect(() => {
    const fetchBalances = async () => {
      if (!smartWalletAddress) return;

      setIsLoadingBalances(true);
      try {
        console.log('🔍 Fetching balances for smart wallet:', smartWalletAddress);
        
        // Use the same fetchAllBalances function from the blockchain lib
        const allBalances = await fetchAllBalances(smartWalletAddress, 11155111); // Sepolia
        setBalances(allBalances);
        
        console.log('✅ Balances fetched:', allBalances);
      } catch (error) {
        console.error('❌ Error fetching balances:', error);
        setBalances([]);
      } finally {
        setIsLoadingBalances(false);
      }
    };

    if (smartWalletAddress) {
      fetchBalances();
    }
  }, [smartWalletAddress]);

  // Manual refresh function
  const refreshBalances = async () => {
    if (!smartWalletAddress) return;

    setIsLoadingBalances(true);
    try {
      const allBalances = await fetchAllBalances(smartWalletAddress, 11155111);
      setBalances(allBalances);
    } catch (error) {
      console.error('Error refreshing balances:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Get balance for a specific token
  const getTokenBalance = (tokenSymbol: string): string => {
    const balance = balances.find(b => b.symbol === tokenSymbol);
    return balance ? balance.balance : "0";
  };

  const getFormattedBalance = (tokenSymbol: string): string => {
    const balance = balances.find(b => b.symbol === tokenSymbol);
    return balance ? balance.formattedBalance : "0.00";
  };

  // Simple 1:1000 exchange rate for demo (USDC to COPE)
  const calculateSwapAmount = (amount: string, from: string, to: string): string => {
    if (!amount || isNaN(Number(amount))) return "";
    
    const inputAmount = Number(amount);
    if (from === "USDC" && to === "COPE") {
      return (inputAmount * 1000).toFixed(6);
    } else if (from === "COPE" && to === "USDC") {
      return (inputAmount / 1000).toFixed(6);
    }
    return amount;
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    const calculatedTo = calculateSwapAmount(value, fromToken.symbol, toToken.symbol);
    setToAmount(calculatedTo);
  };

  const swapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    // Swap amounts too
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!smartWalletAddress || !fromAmount || Number(fromAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const fromBalance = Number(getTokenBalance(fromToken.symbol));
    if (Number(fromAmount) > fromBalance) {
      alert(`Insufficient ${fromToken.symbol} balance`);
      return;
    }

    try {
      console.log(`🔄 Initiating swap: ${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol}`);
      
      // Reset previous status
      reset();

      // For demo purposes, we'll do a simple token transfer to simulate swap
      // In production, this would interact with Uniswap router
      
      // Step 1: Send the "from" token (simulating giving it to the pool)
      await sendSponsoredTransaction({
        recipient: POOL_ADDRESS, // In production, this would be the Uniswap router
        amount: fromAmount,
        tokenAddress: fromToken.address,
        decimals: fromToken.decimals,
        chainId: 11155111,
      });

      if (status.transactionHash) {
        alert(`✅ Swap initiated! Transaction: ${status.transactionHash.slice(0, 10)}...`);
        
        // Refresh balances after successful transaction
        setTimeout(() => {
          refreshBalances();
        }, 2000);
        
        // Clear form
        setFromAmount("");
        setToAmount("");
      }

    } catch (error) {
      console.error('❌ Swap failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ Swap failed: ${errorMessage}`);
    }
  };

  if (!smartWalletAddress) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Smart Wallet</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Please connect your smart wallet to use the swap feature
          </p>
        </CardContent>
      </Card>
    );
  }

  const canSwap = fromAmount && Number(fromAmount) > 0 && Number(fromAmount) <= Number(getTokenBalance(fromToken.symbol));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Smart Wallet USDC ⇄ COPE Swap
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshBalances}
              disabled={isLoadingBalances}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingBalances ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://sepolia.etherscan.io/address/${POOL_ADDRESS}`, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Pool
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* From Token */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
          <div className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
            <TokenIcon symbol={fromToken.symbol} size={40} />
            <div className="flex-1">
              <div className="font-semibold text-lg">{fromToken.symbol}</div>
              <div className="text-sm text-gray-500">
                Balance: {getFormattedBalance(fromToken.symbol)}
              </div>
            </div>
            <div className="text-right">
              <Input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="w-32 text-right text-lg font-medium border-0 bg-transparent p-0 focus:ring-0"
                step="any"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFromAmountChange(getTokenBalance(fromToken.symbol))}
                className="text-xs text-blue-600 p-0 h-auto"
              >
                MAX
              </Button>
            </div>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={swapTokens}
            className="rounded-full p-3 border-2 hover:bg-blue-50"
          >
            <ArrowUpDown className="w-5 h-5" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
          <div className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
            <TokenIcon symbol={toToken.symbol} size={40} />
            <div className="flex-1">
              <div className="font-semibold text-lg">{toToken.symbol}</div>
              <div className="text-sm text-gray-500">
                Balance: {getFormattedBalance(toToken.symbol)}
              </div>
            </div>
            <div className="text-right">
              <Input
                type="number"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="w-32 text-right text-lg font-medium border-0 bg-transparent p-0 focus:ring-0"
              />
              <div className="text-xs text-gray-500">Estimated</div>
            </div>
          </div>
        </div>

        {/* Exchange Rate Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <div className="text-sm text-blue-800 dark:text-blue-400">
            <strong>Exchange Rate:</strong> 1 USDC = 1,000 COPE (Demo Rate)
          </div>
        </div>

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={!canSwap || status.isLoading}
          className={`w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 
            hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg`}
        >
          {status.isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Swapping...
            </div>
          ) : (
            `🚀 Swap ${fromToken.symbol} → ${toToken.symbol}`
          )}
        </Button>

        {/* Transaction Status */}
        {status.transactionHash && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="text-sm text-green-800 dark:text-green-200">
              <strong>✅ Transaction Successful!</strong>
              <div className="text-xs mt-1 font-mono break-all">
                Tx: {status.transactionHash}
              </div>
            </div>
          </div>
        )}

        {status.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="text-sm text-red-800 dark:text-red-200">
              <strong>❌ Transaction Failed</strong>
              <div className="text-xs mt-1">{status.error}</div>
            </div>
          </div>
        )}

        {/* Smart Wallet Info */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-sm text-green-800 dark:text-green-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">✨</span>
              <strong>Gasless Smart Wallet Swaps</strong>
            </div>
            <div className="text-xs space-y-1">
              <div>
                🏦 Wallet: {smartWalletAddress.slice(0, 8)}...{smartWalletAddress.slice(-6)}
              </div>
              <div>⚡ Gas: {status.isSponsored ? "Sponsored" : "Fallback"}</div>
              <div>🌐 Network: Ethereum Sepolia</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
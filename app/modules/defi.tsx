"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Droplets, 
  ArrowUpDown,
  ExternalLink,
  RefreshCw,
  DollarSign,
  Activity,
  Target,
  AlertTriangle
} from "lucide-react";

// LP Contract on Ethereum Sepolia: 0xE03A1074c86CFeDd5C142C4F04F1a1536e203543
const LP_CONTRACT_ADDRESS = "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543";
const UNISWAP_ANALYTICS_URL = "https://app.uniswap.org/positions/v4/ethereum_sepolia/12714";

export default function DeFiModule() {
  const [poolData, setPoolData] = useState({
    price: 1.2456,
    priceChange24h: 5.67,
    tvl: 125000,
    volume24h: 45600,
    fees24h: 230,
    apr: 12.5,
    liquidity: 98500,
    token0Reserve: 50000, // USDC
    token1Reserve: 40150,  // COPE
  });

  const [swapData, setSwapData] = useState({
    fromToken: 'USDC',
    toToken: 'COPE',
    fromAmount: '',
    toAmount: '',
    slippage: 0.5,
    priceImpact: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Simulate fetching real-time data
    const interval = setInterval(() => {
      setPoolData(prev => ({
        ...prev,
        price: prev.price * (1 + (Math.random() - 0.5) * 0.001),
        priceChange24h: prev.priceChange24h + (Math.random() - 0.5) * 0.1,
      }));
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSwapInputChange = (field: 'fromAmount' | 'toAmount', value: string) => {
    if (field === 'fromAmount') {
      const toAmount = value ? (parseFloat(value) * poolData.price).toFixed(6) : '';
      setSwapData(prev => ({
        ...prev,
        fromAmount: value,
        toAmount,
        priceImpact: parseFloat(value) / poolData.token0Reserve * 100,
      }));
    } else {
      const fromAmount = value ? (parseFloat(value) / poolData.price).toFixed(6) : '';
      setSwapData(prev => ({
        ...prev,
        toAmount: value,
        fromAmount,
        priceImpact: parseFloat(fromAmount) / poolData.token0Reserve * 100,
      }));
    }
  };

  const handleSwap = async () => {
    if (!swapData.fromAmount || parseFloat(swapData.fromAmount) <= 0) return;
    
    setIsLoading(true);
    
    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      const swapDetails = `${swapData.fromAmount} ${swapData.fromToken} → ${swapData.toAmount} ${swapData.toToken}`;
      const successMsg = `🎉 Swap successful!\n\n${swapDetails}\n\nTransaction was gasless thanks to Alchemy sponsorship!`;
      alert(successMsg);
      
      // Reset form
      setSwapData(prev => ({ ...prev, fromAmount: '', toAmount: '', priceImpact: 0 }));
    } catch (error) {
      alert('❌ Swap failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const flipTokens = () => {
    setSwapData(prev => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold heading-institutional">DeFi Hub</h1>
        <p className="text-lg text-institutional-light">
          USDC-COPE Liquidity Pool on Ethereum Sepolia
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-institutional-light">
          <span>Contract:</span>
          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
            {LP_CONTRACT_ADDRESS}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(UNISWAP_ANALYTICS_URL, '_blank')}
            className="p-1"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Pool Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-institutional-light font-medium">USDC/COPE Price</p>
                <p className="text-2xl font-bold heading-institutional">
                  {formatNumber(poolData.price, 4)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {poolData.priceChange24h >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                poolData.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {poolData.priceChange24h >= 0 ? '+' : ''}{formatNumber(poolData.priceChange24h, 2)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-institutional-light font-medium">Total Value Locked</p>
                <p className="text-2xl font-bold heading-institutional">
                  {formatCurrency(poolData.tvl)}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                <Droplets className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-institutional-light">
                Liquidity: {formatCurrency(poolData.liquidity)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-institutional-light font-medium">24h Volume</p>
                <p className="text-2xl font-bold heading-institutional">
                  {formatCurrency(poolData.volume24h)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-institutional-light">
                Fees: {formatCurrency(poolData.fees24h)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-institutional-light font-medium">APR</p>
                <p className="text-2xl font-bold heading-institutional">
                  {formatNumber(poolData.apr, 1)}%
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-green-600 font-medium">
                Attractive yield
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Swap Interface */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 heading-institutional">
              <ArrowUpDown className="w-5 h-5 text-primary" />
              Token Swap
            </CardTitle>
            <p className="text-sm text-institutional-light">
              Swap USDC and COPE with gasless transactions
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From Token */}
            <div className="space-y-2">
              <Label htmlFor="from-amount">From</Label>
              <div className="relative">
                <Input
                  id="from-amount"
                  type="number"
                  placeholder="0.00"
                  value={swapData.fromAmount}
                  onChange={(e) => handleSwapInputChange('fromAmount', e.target.value)}
                  className="pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-sm font-medium text-institutional">
                    {swapData.fromToken}
                  </span>
                </div>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={flipTokens}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <Label htmlFor="to-amount">To</Label>
              <div className="relative">
                <Input
                  id="to-amount"
                  type="number"
                  placeholder="0.00"
                  value={swapData.toAmount}
                  onChange={(e) => handleSwapInputChange('toAmount', e.target.value)}
                  className="pr-20"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-sm font-medium text-institutional">
                    {swapData.toToken}
                  </span>
                </div>
              </div>
            </div>

            {/* Swap Details */}
            {swapData.fromAmount && (
              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-institutional-light">Price Impact</span>
                  <span className={`font-medium ${
                    swapData.priceImpact > 5 ? 'text-red-600' : 
                    swapData.priceImpact > 1 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {formatNumber(swapData.priceImpact, 2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-institutional-light">Slippage Tolerance</span>
                  <span className="font-medium text-institutional">{swapData.slippage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-institutional-light">Network Fee</span>
                  <span className="font-medium text-green-600">$0.00 (Sponsored)</span>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <Button
              onClick={handleSwap}
              disabled={!swapData.fromAmount || parseFloat(swapData.fromAmount) <= 0 || isLoading}
              className="w-full btn-institutional h-12"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Swapping...
                </div>
              ) : (
                `Swap ${swapData.fromToken} for ${swapData.toToken}`
              )}
            </Button>

            {swapData.priceImpact > 5 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">
                  High price impact! Consider smaller amounts.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pool Analytics */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 heading-institutional">
              <BarChart3 className="w-5 h-5 text-primary" />
              Pool Analytics
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-institutional-light">
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(UNISWAP_ANALYTICS_URL, '_blank')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="ml-1">View on Uniswap</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pool Composition */}
            <div>
              <h4 className="font-semibold heading-institutional mb-4">Pool Composition</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      $
                    </div>
                    <div>
                      <p className="font-medium text-institutional">USDC</p>
                      <p className="text-sm text-institutional-light">USD Coin</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-institutional">
                      {formatNumber(poolData.token0Reserve)}
                    </p>
                    <p className="text-sm text-institutional-light">
                      {formatCurrency(poolData.token0Reserve)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      C
                    </div>
                    <div>
                      <p className="font-medium text-institutional">COPE</p>
                      <p className="text-sm text-institutional-light">Cope Token</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-institutional">
                      {formatNumber(poolData.token1Reserve)}
                    </p>
                    <p className="text-sm text-institutional-light">
                      {formatCurrency(poolData.token1Reserve * poolData.price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div>
              <h4 className="font-semibold heading-institutional mb-4">Key Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-institutional-light">Fee Tier</p>
                  <p className="font-semibold text-institutional">0.30%</p>
                </div>
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-institutional-light">Protocol</p>
                  <p className="font-semibold text-institutional">Uniswap V4</p>
                </div>
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-institutional-light">Network</p>
                  <p className="font-semibold text-institutional">Sepolia</p>
                </div>
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-institutional-light">Gas Fees</p>
                  <p className="font-semibold text-green-600">Sponsored</p>
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => window.open(UNISWAP_ANALYTICS_URL, '_blank')}
                className="w-full flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Full Analytics on Uniswap
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
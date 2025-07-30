"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallets } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Wallet, 
  ArrowUpDown,
  ExternalLink,
  RefreshCw,
  DollarSign,
  Activity,
  Target,
  AlertTriangle
} from "lucide-react";
import { fetchPoolData, type PoolData, type UserBalance } from "@/lib/pool-data";

// LP Contract on Ethereum Sepolia: Updated to match real analytics
const LP_CONTRACT_ADDRESS = "0x6e3a232aab5dabf359a7702f287752eb3db696f8f917e758dce73ae2a9f60301";
const UNISWAP_ANALYTICS_URL = 
  "https://app.uniswap.org/explore/pools/ethereum_sepolia/0x6e3a232aab5dabf359a7702f287752eb3db696f8f917e758dce73ae2a9f60301";

export default function DeFiModule() {
  const { wallets } = useWallets();
  const wallet = wallets?.[0];

  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [priceChange24h, setPriceChange24h] = useState(5.67);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [swapData, setSwapData] = useState({
    fromToken: 'USDC',
    toToken: 'COPE',
    fromAmount: '',
    toAmount: '',
    slippage: 0.5,
    priceImpact: 0,
  });

  const [isSwapLoading, setIsSwapLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch real pool and user data
  const fetchData = useCallback(async () => {
    if (!wallet?.address) return;
    
    try {
      setIsDataLoading(true);
      const data = await fetchPoolData(wallet.address);
      setPoolData(data.poolData);
      setUserBalance(data.userBalance || null);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch pool data:', error);
    } finally {
      setIsDataLoading(false);
    }
  }, [wallet?.address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Update data every 30 seconds
    const interval = setInterval(() => {
      fetchData();
      // Simulate price change for demo
      setPriceChange24h(prev => prev + (Math.random() - 0.5) * 0.1);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSwapInputChange = (field: 'fromAmount' | 'toAmount', value: string) => {
    if (!poolData) return;
    
    if (field === 'fromAmount') {
      const toAmount = value ? (parseFloat(value) * poolData.usdcCopePrice).toFixed(6) : '';
      setSwapData(prev => ({
        ...prev,
        fromAmount: value,
        toAmount,
        priceImpact: parseFloat(value) / 50000 * 100, // Assuming 50k USDC reserve
      }));
    } else {
      const fromAmount = value ? (parseFloat(value) / poolData.usdcCopePrice).toFixed(6) : '';
      setSwapData(prev => ({
        ...prev,
        toAmount: value,
        fromAmount,
        priceImpact: parseFloat(fromAmount) / 50000 * 100,
      }));
    }
  };

  const handleSwap = async () => {
    if (!swapData.fromAmount || parseFloat(swapData.fromAmount) <= 0) return;
    
    setIsSwapLoading(true);
    
    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      const swapDetails = `${swapData.fromAmount} ${swapData.fromToken} → ${swapData.toAmount} ${swapData.toToken}`;
      const successMsg = `🎉 Swap successful!\n\n${swapDetails}\n\nTransaction was gasless thanks to Alchemy sponsorship!`;
      alert(successMsg);
      
      // Reset form and refresh data
      setSwapData(prev => ({ ...prev, fromAmount: '', toAmount: '', priceImpact: 0 }));
      fetchData(); // Refresh balances after swap
    } catch (error) {
      alert('❌ Swap failed. Please try again.');
    } finally {
      setIsSwapLoading(false);
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
          <span>Pool ID:</span>
          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
            {LP_CONTRACT_ADDRESS.slice(0, 10)}...{LP_CONTRACT_ADDRESS.slice(-8)}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(UNISWAP_ANALYTICS_URL, '_blank')}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="View on Uniswap Analytics"
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
                {isDataLoading ? (
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-2xl font-bold heading-institutional">
                    {poolData ? formatNumber(poolData.usdcCopePrice, 4) : '-.----'}
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {priceChange24h >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {priceChange24h >= 0 ? '+' : ''}{formatNumber(priceChange24h, 2)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-institutional-light font-medium">Total Balance</p>
                {isDataLoading ? (
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-2xl font-bold heading-institutional">
                    {userBalance ? formatCurrency(userBalance.totalUsd) : '$0.00'}
                  </p>
                )}
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-institutional-light">
                {userBalance ? (
                  `${formatNumber(userBalance.eth, 4)} ETH • ${formatNumber(userBalance.usdc, 2)} USDC • ${formatNumber(userBalance.cope, 2)} COPE`
                ) : (
                  'Connect wallet to view balance'
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-institutional-light font-medium">Total Value Locked</p>
                {isDataLoading ? (
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-2xl font-bold heading-institutional">
                    {poolData ? formatCurrency(poolData.tvlUSD) : '$-.--'}
                  </p>
                )}
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-institutional-light">
                Live from Uniswap Analytics
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-institutional-light font-medium">24h Volume</p>
                {isDataLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-2xl font-bold heading-institutional">
                    {poolData ? formatCurrency(poolData.volume24h) : '$-.--'}
                  </p>
                )}
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-institutional-light">
                Fees: {poolData ? formatCurrency(poolData.fees24h) : '$-.--'}
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
              disabled={!swapData.fromAmount || parseFloat(swapData.fromAmount) <= 0 || isSwapLoading || !poolData}
              className="w-full btn-institutional h-12"
            >
              {isSwapLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Swapping...
                </div>
              ) : !poolData ? (
                'Loading pool data...'
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
              <h4 className="font-semibold heading-institutional mb-4">Your Holdings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-900/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      Ξ
                    </div>
                    <div>
                      <p className="font-medium text-institutional">ETH</p>
                      <p className="text-sm text-institutional-light">Ethereum</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-institutional">
                      {userBalance ? formatNumber(userBalance.eth, 4) : '0.0000'}
                    </p>
                    <p className="text-sm text-institutional-light">
                      {userBalance && poolData ? 
                        formatCurrency(userBalance.eth * poolData.ethUsdcPrice) : '$0.00'}
                    </p>
                  </div>
                </div>

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
                      {userBalance ? formatNumber(userBalance.usdc, 2) : '0.00'}
                    </p>
                    <p className="text-sm text-institutional-light">
                      {userBalance ? formatCurrency(userBalance.usdc) : '$0.00'}
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
                      {userBalance ? formatNumber(userBalance.cope, 2) : '0.00'}
                    </p>
                    <p className="text-sm text-institutional-light">
                      {userBalance && poolData ? 
                        formatCurrency(userBalance.cope * poolData.usdcCopePrice) : '$0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pool Analytics */}
            <div>
              <h4 className="font-semibold heading-institutional mb-4">Pool Analytics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-institutional-light">TVL</p>
                  <p className="font-semibold text-institutional">
                    {poolData ? formatCurrency(poolData.tvlUSD) : '$-.--'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-institutional-light">24h Volume</p>
                  <p className="font-semibold text-institutional">
                    {poolData ? formatCurrency(poolData.volume24h) : '$-.--'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-institutional-light">24h Fees</p>
                  <p className="font-semibold text-institutional">
                    {poolData ? formatCurrency(poolData.fees24h) : '$-.--'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-institutional-light">APR</p>
                  <p className="font-semibold text-institutional">
                    {poolData ? formatNumber(poolData.apr, 2) : '-.--'}%
                  </p>
                </div>
              </div>
            </div>

            {/* Pool Info */}
            <div>
              <h4 className="font-semibold heading-institutional mb-4">Pool Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-institutional-light">Token Pair</p>
                  <p className="font-semibold text-institutional">
                    {poolData ? `${poolData.token0.symbol}/${poolData.token1.symbol}` : 'USDC/COPE'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-institutional-light">Fee Tier</p>
                  <p className="font-semibold text-institutional">0.30%</p>
                </div>
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-institutional-light">Network</p>
                  <p className="font-semibold text-institutional">Ethereum Sepolia</p>
                </div>
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-institutional-light">ETH Price</p>
                  <p className="font-semibold text-institutional">
                    {poolData ? formatCurrency(poolData.ethUsdcPrice) : '$-.--'}
                  </p>
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <Button
                variant="outline"
                onClick={() => window.open(UNISWAP_ANALYTICS_URL, '_blank')}
                className="w-full flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Real-Time Analytics on Uniswap
              </Button>
              <div className="text-center">
                <p className="text-xs text-institutional-light">
                  Data sourced from Uniswap V3 Subgraph
                </p>
                <p className="text-xs text-institutional-light">
                  Pool: {LP_CONTRACT_ADDRESS.slice(0, 10)}...{LP_CONTRACT_ADDRESS.slice(-8)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
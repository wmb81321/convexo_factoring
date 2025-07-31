"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  AlertTriangle,
  PieChart,
  Coins
} from "lucide-react";
import { fetchAllPoolsData, type PoolData, type UserBalance } from "@/lib/pool-data";
import { 
  getSwapQuote, 
  prepareSwapTransaction, 
  checkTokenApproval, 
  prepareApprovalTransaction, 
  type SwapParams, 
  type SwapQuote 
} from "@/lib/uniswap-integration";
import { useSponsoredTransactions } from "@/app/hooks/useSponsoredTransactions";
import { SUPPORTED_CHAINS } from "@/lib/chains";

export default function DeFiModule() {
  const { wallets } = useWallets();
  const wallet = wallets?.[0];
  const { sendSponsoredTransaction, status: sponsorStatus } = useSponsoredTransactions();

  const [poolsData, setPoolsData] = useState<PoolData[]>([]);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Swap state - only USDC ↔ COPE
  const [swapData, setSwapData] = useState({
    fromToken: 'USDC',
    toToken: 'COPE',
    fromAmount: '',
    toAmount: '',
    slippage: 0.5,
    priceImpact: 0,
  });

  const [currentQuote, setCurrentQuote] = useState<SwapQuote | null>(null);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [isSwapLoading, setIsSwapLoading] = useState(false);

  // Get USDC-COPE pool data specifically
  const usdcCopePool = poolsData.find(p => p.poolType === 'USDC/ECOP');
  const ethUsdPool = poolsData.find(p => p.poolType === 'USDC/ETH');

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsDataLoading(true);
      console.log('🔍 DeFi fetchData called with wallet:', wallet?.address);
      
      if (!wallet?.address) {
        console.log('⚠️ No wallet address, skipping data fetch');
        setPoolsData([]);
        setUserBalance(null);
        return;
      }
      
      const data = await fetchAllPoolsData(wallet.address);
      console.log('✅ DeFi data fetched:', {
        poolsCount: data.pools.length,
        hasUserBalance: !!data.userBalance,
        userBalance: data.userBalance
      });
      
      setPoolsData(data.pools);
      setUserBalance(data.userBalance || null);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error fetching DeFi data:', error);
      setPoolsData([]);
      setUserBalance(null);
    } finally {
      setIsDataLoading(false);
    }
  }, [wallet?.address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Calculate individual token USD values using REAL prices
  const ethUsdValue = userBalance && ethUsdPool ? userBalance.eth * ethUsdPool.ethUsdcPrice! : 0;
  const usdcUsdValue = userBalance ? userBalance.usdc * 1 : 0; // USDC ≈ $1
  
  // COPE USD value using REAL LP price (e.g., if 4174.57 COPE = 1 USDC, then 1 COPE = 0.0002395 USDC)
  const copeUsdValue = userBalance && usdcCopePool && usdcCopePool.usdcEcopPrice 
    ? userBalance.ecop * usdcCopePool.usdcEcopPrice! 
    : 0;
  
  const totalUsdValue = ethUsdValue + usdcUsdValue + copeUsdValue;
  
  // Debug logging for price verification
  React.useEffect(() => {
    if (usdcCopePool) {
      console.log('🔍 COPE Price Debug:', {
        copePrice: usdcCopePool.usdcEcopPrice,
        copeBalance: userBalance?.ecop || 0,
        copeUsdValue: copeUsdValue,
        exchangeRate: usdcCopePool.usdcEcopPrice ? `1 COPE = $${usdcCopePool.usdcEcopPrice.toFixed(8)}` : 'No price',
        inverseRate: usdcCopePool.usdcEcopPrice ? `1 USDC = ${(1/usdcCopePool.usdcEcopPrice).toFixed(2)} COPE` : 'No price'
      });
    }
  }, [usdcCopePool, userBalance, copeUsdValue]);

  // Swap handling
  const handleSwapInputChange = async (field: 'fromAmount' | 'toAmount', value: string) => {
    if (!wallet?.address || !value || parseFloat(value) <= 0) {
      setSwapData(prev => ({
        ...prev,
        [field]: value,
        [field === 'fromAmount' ? 'toAmount' : 'fromAmount']: '',
        priceImpact: 0,
      }));
      setCurrentQuote(null);
      return;
    }

    const chainId = 11155111; // Sepolia
    const chainConfig = SUPPORTED_CHAINS[chainId];
    const usdcAddress = chainConfig.tokens.usdc?.address;
    const copeAddress = chainConfig.tokens.ecop?.address;

    if (!usdcAddress || !copeAddress) {
      console.error('Token addresses not found');
      return;
    }

    setSwapData(prev => ({ ...prev, [field]: value }));

    if (field === 'fromAmount') {
      setIsGettingQuote(true);
      try {
        const swapParams: SwapParams = {
          tokenIn: swapData.fromToken === 'USDC' ? usdcAddress : copeAddress,
          tokenOut: swapData.toToken === 'USDC' ? usdcAddress : copeAddress,
          amountIn: value,
          slippagePercent: swapData.slippage,
          recipient: wallet.address,
          chainId,
        };

        const quote = await getSwapQuote(swapParams);
        setCurrentQuote(quote);
        
        setSwapData(prev => ({
          ...prev,
          toAmount: quote.amountOutFormatted,
          priceImpact: quote.priceImpact,
        }));
      } catch (error) {
        console.error('Error getting swap quote:', error);
        setCurrentQuote(null);
        setSwapData(prev => ({ ...prev, toAmount: '', priceImpact: 0 }));
      } finally {
        setIsGettingQuote(false);
      }
    }
  };

  const handleSwap = async () => {
    if (!wallet?.address || !swapData.fromAmount || !currentQuote) {
      alert('Please enter a valid amount and get a quote first.');
      return;
    }
    
    setIsSwapLoading(true);
    
    try {
      const chainId = 11155111;
      const chainConfig = SUPPORTED_CHAINS[chainId];
      const usdcAddress = chainConfig.tokens.usdc?.address;
      const copeAddress = chainConfig.tokens.ecop?.address;

      if (!usdcAddress || !copeAddress) {
        throw new Error('Token addresses not found');
      }

      const tokenInAddress = swapData.fromToken === 'USDC' ? usdcAddress : copeAddress;
      const routerAddress = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';

      // Check approval if needed
      const needsApproval = !(await checkTokenApproval(
        tokenInAddress,
        wallet.address,
        routerAddress,
        swapData.fromAmount,
        chainId
      ));

      if (needsApproval) {
        const approvalTx = prepareApprovalTransaction(
          tokenInAddress,
          routerAddress,
          swapData.fromAmount,
          chainId
        );

        await sendSponsoredTransaction({
          recipient: approvalTx.to,
          amount: '0',
          tokenAddress: tokenInAddress,
          decimals: swapData.fromToken === 'USDC' ? 6 : 18,
          chainId,
        });

        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Execute swap
      const swapParams: SwapParams = {
        tokenIn: tokenInAddress,
        tokenOut: swapData.toToken === 'USDC' ? usdcAddress : copeAddress,
        amountIn: swapData.fromAmount,
        slippagePercent: swapData.slippage,
        recipient: wallet.address,
        chainId,
      };

      const swapTx = prepareSwapTransaction(swapParams, currentQuote, chainId);
      
      await sendSponsoredTransaction({
        recipient: swapTx.to,
        amount: '0',
        tokenAddress: tokenInAddress,
        decimals: swapData.fromToken === 'USDC' ? 6 : 18,
        chainId,
      });

      alert(`🎉 Swap Executed!\n${swapData.fromAmount} ${swapData.fromToken} → ${swapData.toAmount} ${swapData.toToken}`);
      
      setSwapData(prev => ({ ...prev, fromAmount: '', toAmount: '', priceImpact: 0 }));
      setCurrentQuote(null);
      fetchData();
      
    } catch (error) {
      console.error('Swap failed:', error);
      alert(`Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Format functions
  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold heading-institutional">DeFi Portfolio</h1>
        <p className="text-lg text-institutional-light">
          Electronic Colombian Peso (COPE) Trading & Analytics
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-institutional-light">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* OWNERSHIP SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <PieChart className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold heading-institutional">Portfolio Holdings</h2>
        </div>

        {/* Holdings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Balance */}
          <Card className="glass-card lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-institutional-light font-medium">Total Portfolio Value</p>
                  {isDataLoading ? (
                    <div className="h-10 w-40 bg-gray-200 animate-pulse rounded"></div>
                  ) : !userBalance ? (
                    <p className="text-2xl font-bold text-gray-500">Connect Wallet</p>
                  ) : (
                    <p className="text-3xl font-bold heading-institutional">
                      {formatCurrency(totalUsdValue)}
                    </p>
                  )}
                  {userBalance && (
                    <p className="text-sm text-institutional-light mt-2">
                      {formatNumber(userBalance.eth, 4)} ETH • {formatNumber(userBalance.usdc, 2)} USDC • {formatNumber(userBalance.ecop, 2)} COPE
                    </p>
                  )}
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <Wallet className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ETH Price */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-institutional-light font-medium">ETH Price</p>
                  {isDataLoading ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold heading-institutional">
                      {ethUsdPool ? formatCurrency(ethUsdPool.ethUsdcPrice!) : '$--.--'}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* COPE Price */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-institutional-light font-medium">COPE Price</p>
                  {isDataLoading ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold heading-institutional">
                      {usdcCopePool ? `$${formatNumber(usdcCopePool.usdcEcopPrice!, 4)}` : '$--.----'}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                  <Coins className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Individual Holdings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ETH Holding */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                    Ξ
                  </div>
                  <div>
                    <p className="font-semibold text-institutional">Ethereum</p>
                    <p className="text-sm text-institutional-light">ETH</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-institutional-light">Quantity</span>
                  <span className="font-medium">
                    {userBalance ? formatNumber(userBalance.eth, 6) : '0.000000'} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-institutional-light">USD Value</span>
                  <span className="font-bold text-institutional">
                    {formatCurrency(ethUsdValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-institutional-light">Price Source</span>
                  <span className="text-xs text-institutional-light">CoinGecko</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* USDC Holding */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    $
                  </div>
                  <div>
                    <p className="font-semibold text-institutional">USD Coin</p>
                    <p className="text-sm text-institutional-light">USDC</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-institutional-light">Quantity</span>
                  <span className="font-medium">
                    {userBalance ? formatNumber(userBalance.usdc, 2) : '0.00'} USDC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-institutional-light">USD Value</span>
                  <span className="font-bold text-institutional">
                    {formatCurrency(usdcUsdValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-institutional-light">Price Source</span>
                  <span className="text-xs text-institutional-light">CoinGecko</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* COPE Holding */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                    C
                  </div>
                  <div>
                    <p className="font-semibold text-institutional">Electronic Colombian Peso</p>
                    <p className="text-sm text-institutional-light">COPE</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-institutional-light">Quantity</span>
                  <span className="font-medium">
                    {userBalance ? formatNumber(userBalance.ecop, 2) : '0.00'} COPE
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-institutional-light">USD Value</span>
                  <span className="font-bold text-institutional">
                    {formatCurrency(copeUsdValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-institutional-light">Price Source</span>
                  <span className="text-xs text-institutional-light">USDC-COPE LP</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* TOKEN SWAP SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ArrowUpDown className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold heading-institutional">Token Swap</h2>
        </div>

        <Card className="glass-card max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">USDC ↔ COPE Exchange</CardTitle>
            <p className="text-sm text-institutional-light text-center">
              Trade using the USDC-COPE liquidity pool
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
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
                  placeholder={isGettingQuote ? "Getting quote..." : "0.00"}
                  value={swapData.toAmount}
                  className="pr-20"
                  readOnly
                  disabled={isGettingQuote}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {isGettingQuote && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span className="text-sm font-medium text-institutional">
                    {swapData.toToken}
                  </span>
                </div>
              </div>
            </div>

            {/* Swap Details */}
            {swapData.fromAmount && swapData.toAmount && currentQuote && (
              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-institutional-light">Price Impact</span>
                  <span className={`font-medium ${
                    currentQuote.priceImpact > 5 ? 'text-red-600' : 
                    currentQuote.priceImpact > 1 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {formatNumber(currentQuote.priceImpact, 2)}%
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
              disabled={!swapData.fromAmount || !swapData.toAmount || !currentQuote || isSwapLoading || isGettingQuote}
              className="w-full btn-institutional h-12"
            >
              {isSwapLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing Swap...
                </div>
              ) : isGettingQuote ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Getting Quote...
                </div>
              ) : !currentQuote ? (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Enter Amount for Quote
                </div>
              ) : (
                `Swap ${swapData.fromToken} → ${swapData.toToken}`
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
      </div>

      {/* LIQUIDITY POOL ANALYTICS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold heading-institutional">USDC-COPE Pool Analytics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Market Price */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-institutional-light font-medium">COPE Market Price</p>
                  {isDataLoading ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold heading-institutional">
                      {usdcCopePool ? `$${formatNumber(usdcCopePool.usdcEcopPrice!, 4)}` : '$--.----'}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TVL */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-institutional-light font-medium">Total Value Locked</p>
                  {isDataLoading ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold heading-institutional">
                      {usdcCopePool ? formatCurrency(usdcCopePool.tvlUSD) : '$-.--'}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* APR */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-institutional-light font-medium">Annual Percentage Rate</p>
                  {isDataLoading ? (
                    <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold heading-institutional">
                      {usdcCopePool ? `${formatNumber(usdcCopePool.apr, 2)}%` : '--.--'}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 24h Volume */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-institutional-light font-medium">24h Volume</p>
                  {isDataLoading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold heading-institutional">
                      {usdcCopePool ? formatCurrency(usdcCopePool.volume24h) : '$-.--'}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-institutional-light">
                  Fees: {usdcCopePool ? formatCurrency(usdcCopePool.fees24h) : '$-.--'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pool Details */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Pool Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-institutional-light">Token Pair</p>
                <p className="font-semibold text-institutional">USDC/COPE</p>
              </div>
              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-institutional-light">Fee Tier</p>
                <p className="font-semibold text-institutional">0.30%</p>
              </div>
              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-institutional-light">Network</p>
                <p className="font-semibold text-institutional">Ethereum Sepolia</p>
              </div>
              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-institutional-light">LP Contract</p>
                <p className="font-semibold text-institutional text-xs">
                  0xE03A1074c86CFeDd5C142C4F04F1a1536e203543
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://app.uniswap.org/positions/v4/ethereum_sepolia/12714', '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Uniswap
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://sepolia.etherscan.io/token/0xA4A4fCb23ffcd964346D2e4eCDf5A8c15C69B219', '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  COPE Token Contract
                </Button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-institutional-light">
                  Price data sourced from USDC-COPE LP • Market data from CoinGecko API
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWallets } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Activity, 
  Users, 
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Wallet,
  Zap
} from "lucide-react";
import { fetchAllChainsBalances, getAggregatedBalanceSummary } from "@/lib/blockchain";
import { getPoolAnalytics, getUserDeFiPortfolio } from "@/lib/uniswap-subgraph";
import { fetchMarketData } from "@/lib/pool-data";
import { fetchTokenPrice } from "@/lib/price-feeds";
import SimpleSwap from "@/app/components/simple-swap";

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  formattedBalance: string;
  usdValue?: string;
  contract?: string;
  isLoading?: boolean;
  error?: string;
}

interface PoolAnalytics {
  poolId: string;
  token0: { symbol: string; name: string; decimals: number };
  token1: { symbol: string; name: string; decimals: number };
  feeTier: number;
  tvlUSD: number;
  volume24H: number;
  volumeUSD: number;
  feesUSD: number;
  apr: number;
  price: number;
  token0Price: number;
  token1Price: number;
  liquidity: string;
  totalValueLockedToken0: number;
  totalValueLockedToken1: number;
  historicalData: any[];
}

interface UserPortfolio {
  positions: any[];
  totalValue: number;
  totalFees: number;
  positionCount: number;
}

export default function DeFi() {
  const { wallets } = useWallets();
  const wallet = wallets?.[0];
  
  const [allChainsBalances, setAllChainsBalances] = useState<{ [chainId: number]: TokenBalance[] }>({});
  const [poolAnalytics, setPoolAnalytics] = useState<PoolAnalytics | null>(null);
  const [userPortfolio, setUserPortfolio] = useState<UserPortfolio | null>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const aggregatedSummary = getAggregatedBalanceSummary(allChainsBalances);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!wallet?.address) {
      console.log('⚠️ DeFi: No wallet address available');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`🔍 DeFi: Fetching data for ${wallet.address}`);
      
      // Fetch multi-chain balances
      const balances = await fetchAllChainsBalances(wallet.address);
      setAllChainsBalances(balances);
      
      // Fetch pool analytics from Uniswap subgraph
      const analytics = await getPoolAnalytics();
      setPoolAnalytics(analytics);
      
      // Fetch user DeFi portfolio
      const portfolio = await getUserDeFiPortfolio(wallet.address);
      setUserPortfolio(portfolio);
      
      // Fetch market data for price feeds
      const market = await fetchMarketData();
      setMarketData(market);
      
      // Fetch ETH price from CoinGecko
      try {
        const ethPriceData = await fetchTokenPrice('ethereum');
        setEthPrice(ethPriceData.price);
      } catch (error) {
        console.error('Failed to fetch ETH price:', error);
        setEthPrice(null);
      }
      
      setLastUpdated(new Date());
      console.log('✅ DeFi: All data fetched successfully');
    } catch (error) {
      console.error("❌ DeFi: Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [wallet?.address]);

  useEffect(() => {
    fetchData();
  }, [wallet?.address, fetchData]);

  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  if (!wallet?.address) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-semibold">Connect Wallet</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect your wallet to view DeFi analytics and manage your positions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DeFi Hub</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your DeFi positions and track pool analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Ownership Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Ownership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">💎</div>
                <div>
                  <div className="font-semibold">{formatNumber(aggregatedSummary.totalEth, 6)} ETH</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {ethPrice ? formatCurrency(aggregatedSummary.totalEth * ethPrice) : 'Loading...'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">💵</div>
                <div>
                  <div className="font-semibold">{formatNumber(aggregatedSummary.totalUsdc, 2)} USDC</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {formatCurrency(aggregatedSummary.totalUsdc)}
                  </div>
                </div>
              </div>
            </div>
            
                         <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
               <div className="flex items-center gap-3">
                 <div className="text-2xl">🚀</div>
                 <div>
                   <div className="font-semibold">{formatNumber(aggregatedSummary.totalCope, 2)} COPE</div>
                   <div className="text-sm text-gray-600 dark:text-gray-300">
                     {poolAnalytics?.token1Price ? formatCurrency(aggregatedSummary.totalCope * poolAnalytics.token1Price) : 'Loading...'}
                   </div>
                 </div>
               </div>
             </div>
             

          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Total Portfolio Value</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Combined value across all chains
                </p>
              </div>
              <div className="text-right">
                                 <div className="text-xl font-bold">
                   {(() => {
                     const ethValue = ethPrice ? aggregatedSummary.totalEth * ethPrice : 0;
                     const usdcValue = aggregatedSummary.totalUsdc;
                     const copeValue = poolAnalytics?.token1Price ? aggregatedSummary.totalCope * poolAnalytics.token1Price : 0;
                     return formatCurrency(ethValue + usdcValue + copeValue);
                   })()}
                 </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liquidity Pool Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Liquidity Pool Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {poolAnalytics ? (
            <>
              {/* Pool Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {poolAnalytics.token0.symbol}-{poolAnalytics.token1.symbol} Pool
                    </h3>
                                         <p className="text-sm text-gray-600 dark:text-gray-300">
                       Fee Tier: {poolAnalytics.feeTier / 1000000}%
                     </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Active
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(poolAnalytics.tvlUSD)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">TVL</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(poolAnalytics.volume24H)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">24h Volume</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatPercentage(poolAnalytics.apr)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">APR</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatNumber(1 / poolAnalytics.token1Price, 6)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">COPE/USDC</div>
                  </div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-semibold">Pool Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">Total Fees (24h)</span>
                      <span className="font-medium">{formatCurrency(poolAnalytics.feesUSD)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">{poolAnalytics.token0.symbol} Locked</span>
                      <span className="font-medium">{formatNumber(poolAnalytics.totalValueLockedToken0, 2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">{poolAnalytics.token1.symbol} Locked</span>
                      <span className="font-medium">{formatNumber(poolAnalytics.totalValueLockedToken1, 2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Price Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">{poolAnalytics.token0.symbol} Price</span>
                      <span className="font-medium">{formatNumber(poolAnalytics.token0Price, 6)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">{poolAnalytics.token1.symbol} Price</span>
                      <span className="font-medium">{formatNumber(poolAnalytics.token1Price, 6)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm">Exchange Rate</span>
                      <span className="font-medium">
                        1 {poolAnalytics.token0.symbol} = {formatNumber(poolAnalytics.token0Price, 6)} {poolAnalytics.token1.symbol}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-500">Loading pool analytics...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* USDC-COPE LP Swap Interface */}
      <SimpleSwap />

      {/* User Positions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userPortfolio ? (
            userPortfolio.positions.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{userPortfolio.positionCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Active Positions</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(userPortfolio.totalValue)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Total Value</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(userPortfolio.totalFees)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Collected Fees</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {userPortfolio.positions.map((position, index) => (
                    <div key={position.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">
                            {position.pool.token0.symbol}-{position.pool.token1.symbol}
                          </h4>
                                                     <p className="text-sm text-gray-600 dark:text-gray-300">
                             Fee Tier: {position.pool.feeTier / 1000000}%
                           </p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Active
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Liquidity:</span>
                          <div className="font-medium">{formatNumber(parseFloat(position.liquidity), 0)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Value:</span>
                          <div className="font-medium">{formatCurrency(position.totalDepositedValue)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Fees:</span>
                          <div className="font-medium">{formatCurrency(position.totalCollectedFees)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Range:</span>
                          <div className="font-medium">{position.tickLower} - {position.tickUpper}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Positions</h3>
                                 <p className="text-gray-600 dark:text-gray-300 mb-4">
                   You don&apos;t have any active liquidity positions yet
                 </p>
                <Button className="gap-2">
                  <ArrowUpRight className="w-4 h-4" />
                  Add Liquidity
                </Button>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-500">Loading positions...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
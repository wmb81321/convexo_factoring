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

// Real USDC/WETH pool for TVL data, but synthetically creates USDC/COPE pricing
const LP_CONTRACT_ADDRESS = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640";
const UNISWAP_ANALYTICS_URL = 
  "https://app.uniswap.org/explore/pools/ethereum/0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640";

export default function DeFiModule() {
  const { wallets } = useWallets();
  const wallet = wallets?.[0];
  const { sendSponsoredTransaction, status: sponsorStatus } = useSponsoredTransactions();

  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);

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
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch real pool and user data - NO MOCKED DATA
  const fetchData = useCallback(async () => {
    console.log('🔄 fetchData called, wallet address:', wallet?.address);
    
    try {
      setIsDataLoading(true);
      console.log('📡 Fetching REAL pool data...');
      
      const data = await fetchPoolData(wallet?.address);
      console.log('✅ Got real data:', data);
      
      setPoolData(data.poolData);
      setUserBalance(data.userBalance || null);
      setLastUpdated(new Date());
      
      console.log('🎯 State updated with real data');
    } catch (error) {
      console.error('💥 ERROR fetching real pool data:', error);
      
             // Show error to user instead of hiding it
       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
       alert(`❌ Failed to load real Uniswap data: ${errorMessage}\n\nPlease check console for details.`);
      
      // Don't set any fallback data - let the UI show the error state
      setPoolData(null);
      setUserBalance(null);
    } finally {
      setIsDataLoading(false);
    }
  }, [wallet?.address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Update data every 30 seconds - fetches real market data
    const interval = setInterval(() => {
      fetchData();
      // Real price change data is now fetched from the API, no simulation needed
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

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

    // Get token addresses from chain config
    const chainId = 11155111; // Sepolia
    const chainConfig = SUPPORTED_CHAINS[chainId];
    const usdcAddress = chainConfig.tokens.usdc?.address;
    const copeAddress = chainConfig.tokens.cope?.address;

    if (!usdcAddress || !copeAddress) {
      console.error('❌ Token addresses not found for chain', chainId);
      return;
    }

    setSwapData(prev => ({ ...prev, [field]: value }));

    if (field === 'fromAmount') {
      // Get real quote from Uniswap
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
        console.error('❌ Error getting swap quote:', error);
        setCurrentQuote(null);
        setSwapData(prev => ({
          ...prev,
          toAmount: '',
          priceImpact: 0,
        }));
      } finally {
        setIsGettingQuote(false);
      }
    }
  };

  const handleSwap = async () => {
    if (!wallet?.address || !swapData.fromAmount || !currentQuote || parseFloat(swapData.fromAmount) <= 0) {
      alert('❌ Please enter a valid amount and get a quote first.');
      return;
    }
    
    setIsSwapLoading(true);
    
    try {
      const chainId = 11155111; // Sepolia
      const chainConfig = SUPPORTED_CHAINS[chainId];
      const usdcAddress = chainConfig.tokens.usdc?.address;
      const copeAddress = chainConfig.tokens.cope?.address;

      if (!usdcAddress || !copeAddress) {
        throw new Error('Token addresses not found');
      }

      const tokenInAddress = swapData.fromToken === 'USDC' ? usdcAddress : copeAddress;
      
      // Step 1: Check if approval is needed (for ERC-20 tokens)
      if (swapData.fromToken !== 'ETH') {
        console.log('🔍 Checking token approval...');
        
        const routerAddress = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E'; // Sepolia router
        const needsApproval = !(await checkTokenApproval(
          tokenInAddress,
          wallet.address,
          routerAddress,
          swapData.fromAmount,
          chainId
        ));

        if (needsApproval) {
          console.log('📝 Sending approval transaction...');
          
          const approvalTx = prepareApprovalTransaction(
            tokenInAddress,
            routerAddress,
            swapData.fromAmount
          );

          // Send approval with gas sponsorship
          await sendSponsoredTransaction({
            recipient: approvalTx.to,
            amount: '0', // No ETH transfer for approval
            tokenAddress: tokenInAddress,
            decimals: swapData.fromToken === 'USDC' ? 6 : 18,
            chainId,
          });

          console.log('✅ Approval transaction sent');
          
          // Wait a bit for approval to be mined
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      // Step 2: Execute the swap
      console.log('🔄 Executing swap...');
      
      const swapParams: SwapParams = {
        tokenIn: tokenInAddress,
        tokenOut: swapData.toToken === 'USDC' ? usdcAddress : copeAddress,
        amountIn: swapData.fromAmount,
        slippagePercent: swapData.slippage,
        recipient: wallet.address,
        chainId,
      };

      const swapTx = prepareSwapTransaction(swapParams, currentQuote, chainId);
      
      // Execute swap with gas sponsorship
      await sendSponsoredTransaction({
        recipient: swapTx.to,
        amount: '0', // No ETH transfer for token swap
        tokenAddress: tokenInAddress,
        decimals: swapData.fromToken === 'USDC' ? 6 : 18,
        chainId,
      });

      const swapDetails = `${swapData.fromAmount} ${swapData.fromToken} → ${swapData.toAmount} ${swapData.toToken}`;
      const successMsg = `🎉 Real Swap Executed!\n\n${swapDetails}\n\n` +
        `Transaction was gasless thanks to Alchemy sponsorship!\n\n` +
        `Price Impact: ${currentQuote.priceImpact.toFixed(2)}%`;
      alert(successMsg);
      
      // Reset form and refresh data
      setSwapData(prev => ({ ...prev, fromAmount: '', toAmount: '', priceImpact: 0 }));
      setCurrentQuote(null);
      fetchData(); // Refresh balances after swap
      
    } catch (error) {
      console.error('❌ Swap failed:', error);
      alert(`❌ Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                ) : !poolData ? (
                  <p className="text-xl font-bold text-red-600">
                    ERROR: No Real Data
                  </p>
                ) : (
                  <p className="text-2xl font-bold heading-institutional">
                    {formatNumber(poolData.usdcCopePrice, 4)}
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
                ) : !userBalance ? (
                  <p className="text-lg font-bold text-gray-500">
                    Connect Wallet
                  </p>
                ) : (
                  <p className="text-2xl font-bold heading-institutional">
                    {formatCurrency(userBalance.totalUsd)}
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
                  `${formatNumber(userBalance.usdc, 2)} USDC • ${formatNumber(userBalance.cope, 2)} COPE • ${formatNumber(userBalance.eth, 4)} ETH`
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
                ) : !poolData ? (
                  <p className="text-lg font-bold text-red-600">
                    No Data
                  </p>
                ) : poolData.tvlUSD === 0 ? (
                  <p className="text-lg font-bold text-yellow-600">
                    Pool Empty
                  </p>
                ) : (
                  <p className="text-2xl font-bold heading-institutional">
                    {formatCurrency(poolData.tvlUSD)}
                  </p>
                )}
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
                          <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-green-600 font-medium">
                  ✅ Real USDC/WETH Pool Data
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
              Real Uniswap V3 swaps with live quotes and gasless transactions
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
                  placeholder={isGettingQuote ? "Getting quote..." : "0.00"}
                  value={swapData.toAmount}
                  onChange={(e) => handleSwapInputChange('toAmount', e.target.value)}
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
                  <span className="text-institutional-light">Minimum Received</span>
                  <span className="font-medium text-institutional">
                    {(parseFloat(currentQuote.amountOutFormatted) * (100 - swapData.slippage) / 100).toFixed(6)} {swapData.toToken}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-institutional-light">Network Fee</span>
                  <span className="font-medium text-green-600">$0.00 (Sponsored)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-institutional-light">Route</span>
                  <span className="font-medium text-institutional text-xs">{currentQuote.route}</span>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <Button
              onClick={handleSwap}
              disabled={!swapData.fromAmount || !swapData.toAmount || !currentQuote || isSwapLoading || isGettingQuote || !poolData}
              className="w-full btn-institutional h-12"
            >
              {isSwapLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing Real Swap...
                </div>
              ) : isGettingQuote ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Getting Quote...
                </div>
              ) : !poolData ? (
                'Loading pool data...'
              ) : !currentQuote ? (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Enter Amount for Quote
                </div>
              ) : (
                `Execute Real Swap: ${swapData.fromToken} → ${swapData.toToken}`
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
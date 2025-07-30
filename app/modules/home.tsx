"use client";

import { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Zap, 
  ArrowUpRight, 
  DollarSign,
  Activity,
  Users,
  Globe
} from "lucide-react";

export default function HomeModule() {
  const { wallets } = useWallets();
  const wallet = wallets?.[0];
  
  const [stats, setStats] = useState({
    totalBalance: 0,
    transactionCount: 0,
    gasSponsored: 0,
    lastActivity: new Date(),
  });

  useEffect(() => {
    // Simulate loading user stats
    const timer = setTimeout(() => {
      setStats({
        totalBalance: 1247.85,
        transactionCount: 23,
        gasSponsored: 15,
        lastActivity: new Date(),
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold heading-institutional">
          Welcome back! 👋
        </h1>
        <p className="text-lg text-institutional-light">
          Your Convexo smart wallet dashboard
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance */}
        <Card className="glass-card hover-lift transition-institutional">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-institutional-light font-medium">
                  Total Balance
                </p>
                <p className="text-2xl font-bold heading-institutional">
                  ${stats.totalBalance.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                +12.5% this month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="glass-card hover-lift transition-institutional">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-institutional-light font-medium">
                  Transactions
                </p>
                <p className="text-2xl font-bold heading-institutional">
                  {stats.transactionCount}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-institutional-light">
                Last activity: Today
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Gas Sponsored */}
        <Card className="glass-card hover-lift transition-institutional">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-institutional-light font-medium">
                  Gas Sponsored
                </p>
                <p className="text-2xl font-bold heading-institutional">
                  {stats.gasSponsored}
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-purple-600 font-medium">
                $47.30 saved in fees
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Network Status */}
        <Card className="glass-card hover-lift transition-institutional">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-institutional-light font-medium">
                  Network
                </p>
                <p className="text-lg font-bold heading-institutional">
                  Ethereum Sepolia
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">
                Connected
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Details */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 heading-institutional">
              <Wallet className="w-5 h-5 text-primary" />
              Smart Wallet Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-sm text-institutional-light font-medium">
                  Wallet Address
                </p>
                <p className="font-mono text-sm heading-institutional">
                  {wallet?.address ? formatAddress(wallet.address) : 'Loading...'}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Smart Wallet
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                <p className="text-sm text-institutional-light font-medium">
                  Wallet Type
                </p>
                <p className="text-sm font-semibold text-blue-600">
                  ERC-4337 Smart Wallet
                </p>
              </div>
              <div className="p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                <p className="text-sm text-institutional-light font-medium">
                  Provider
                </p>
                <p className="text-sm font-semibold text-purple-600">
                  Privy + Alchemy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 heading-institutional">
              <Shield className="w-5 h-5 text-primary" />
              Active Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold text-institutional">
                    Gas Sponsorship Active
                  </p>
                  <p className="text-xs text-institutional-light">
                    Powered by Alchemy Gas Manager
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold text-institutional">
                    Multi-Chain Support
                  </p>
                  <p className="text-xs text-institutional-light">
                    Ethereum, Optimism, Base, Polygon
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold text-institutional">
                    Social Authentication
                  </p>
                  <p className="text-xs text-institutional-light">
                    Email, Google, Apple login
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold text-institutional">
                    DeFi Integration
                  </p>
                  <p className="text-xs text-institutional-light">
                    Uniswap V4 USDC-COPE LP
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="heading-institutional">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-institutional text-center">
              <ArrowUpRight className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-institutional">Send</p>
            </button>
            <button className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-institutional text-center">
              <ArrowUpRight className="w-6 h-6 text-blue-600 mx-auto mb-2 rotate-180" />
              <p className="text-sm font-medium text-institutional">Receive</p>
            </button>
            <button className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-institutional text-center">
              <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-institutional">Swap</p>
            </button>
            <button className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-institutional text-center">
              <Users className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-institutional">Pool</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
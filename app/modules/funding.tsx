"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowDownToLine, 
  ArrowUpFromLine,
  ExternalLink,
  Copy,
  RefreshCw
} from "lucide-react";
import TokenIcon from "@/app/components/token-icon";
import ChainSelector from "@/app/components/chain-selector";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_CHAIN } from "@/lib/chains";

type FundingType = 'cash-in' | 'cash-out';
type TokenSymbol = 'USDC' | 'ETH' | 'COPE';

interface QuoteRequest {
  type: FundingType;
  amount: string;
  token: TokenSymbol;
  chainId: number;
  fiatCurrency: string;
}

export default function Funding() {
  const [fundingType, setFundingType] = useState<FundingType>('cash-in');
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('USDC');
  const [amount, setAmount] = useState('');
  const [chainId, setChainId] = useState(DEFAULT_CHAIN.chainId);
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [quoteId, setQuoteId] = useState<string | null>(null);

  const handleGetQuote = async () => {
    // Generate a random quote ID for demo
    const newQuoteId = Math.random().toString(36).substring(2, 15);
    setQuoteId(newQuoteId);
    
    // In production, this would make an API call to get a real quote
    const quoteRequest: QuoteRequest = {
      type: fundingType,
      amount,
      token: selectedToken,
      chainId,
      fiatCurrency
    };
    
    console.log('Quote request:', quoteRequest);
  };

  const copyQuoteId = async () => {
    if (quoteId) {
      await navigator.clipboard.writeText(quoteId);
      alert('Quote ID copied to clipboard!');
    }
  };

  const openTelegram = () => {
    window.open('https://t.me/convexoprotocol', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Funding</h1>
        <p className="text-lg text-white">
          Cash in or cash out your crypto assets
        </p>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Get Quote</span>
            <div className="flex gap-2">
              <Button
                variant={fundingType === 'cash-in' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFundingType('cash-in')}
                className="flex items-center gap-2"
              >
                <ArrowDownToLine className="w-4 h-4" />
                Cash In
              </Button>
              <Button
                variant={fundingType === 'cash-out' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFundingType('cash-out')}
                className="flex items-center gap-2"
              >
                <ArrowUpFromLine className="w-4 h-4" />
                Cash Out
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token Selection */}
          <div className="space-y-2">
            <Label>Select Token</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['USDC', 'ETH', 'COPE'] as TokenSymbol[]).map((token) => (
                <Button
                  key={token}
                  variant={selectedToken === token ? 'default' : 'outline'}
                  onClick={() => setSelectedToken(token)}
                  className="flex items-center justify-center gap-2 h-16"
                >
                  <TokenIcon symbol={token} size={24} />
                  <span>{token}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Chain Selection */}
          <div className="space-y-2">
            <Label>Select Network</Label>
            <ChainSelector
              currentChainId={chainId}
              onChainChange={setChainId}
            />
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
              />
              <select
                value={fiatCurrency}
                onChange={(e) => setFiatCurrency(e.target.value)}
                className="bg-background border rounded-md px-3"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Get Quote Button */}
          <Button 
            onClick={handleGetQuote}
            className="w-full"
            disabled={!amount || Number(amount) <= 0}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Get Quote
          </Button>

          {/* Quote Result */}
          {quoteId && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-sm">
                  Quote ID
                </Badge>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {quoteId}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyQuoteId}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contact our Telegram agent with your quote ID to proceed:
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={openTelegram}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Telegram Chat
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">1️⃣</div>
                <h3 className="font-semibold mb-2">Get a Quote</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select your preferred token, network, and amount to receive a quote ID
                </p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">2️⃣</div>
                <h3 className="font-semibold mb-2">Contact Agent</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share your quote ID with our Telegram agent @convexoprotocol
                </p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">3️⃣</div>
                <h3 className="font-semibold mb-2">Complete Transaction</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Follow the agent&apos;s instructions to complete your {fundingType} process
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

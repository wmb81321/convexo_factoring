"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ExternalLink, Copy, Check, AlertCircle, Send, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChainById } from "@/lib/chains";
import { fetchAllBalances, TokenBalance } from "@/lib/blockchain";
import SendModal from "./send-modal";
import ReceiveModal from "./receive-modal";

interface TokenBalancesProps {
  walletAddress: string;
  chainId: number;
}

export default function TokenBalances({ walletAddress, chainId }: TokenBalancesProps) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  const chain = getChainById(chainId);

  // Fetch real token balances from blockchain
  const fetchBalances = useCallback(async () => {
    if (!chain || !walletAddress) return;

    setIsLoading(true);
    try {
      console.log(`Fetching balances for ${walletAddress} on chain ${chainId}`);
      
      // Fetch real balances from blockchain
      const realBalances = await fetchAllBalances(walletAddress, chainId);
      
      setBalances(realBalances);
      setLastUpdated(new Date());
      
      console.log('Balances fetched successfully:', realBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
      
      // Set empty balances on error
      setBalances([]);
    } finally {
      setIsLoading(false);
    }
  }, [chain, walletAddress, chainId]);

  useEffect(() => {
    fetchBalances();
  }, [walletAddress, chainId, fetchBalances]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case "ETH": return "💎";
      case "USDC": return "💵";
      case "COPE": return "🚀";
      default: return "🪙";
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!chain) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            ⚠️ Chain not supported
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Token Balances</CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBalances}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chain Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌐</span>
              <div>
                <div className="font-medium">{chain.name}</div>
                <div className="text-sm text-gray-500">Chain ID: {chain.chainId}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(chain.blockExplorer, '_blank')}
              className="h-8 gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="text-xs">Explorer</span>
            </Button>
          </div>
        </div>

        {/* Send & Receive Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => setShowReceiveModal(true)}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Download className="h-4 w-4" />
            Receive
          </Button>
          <Button
            onClick={() => setShowSendModal(true)}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            disabled={balances.length === 0 || balances.every(b => b.error)}
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>

        {/* Token Balances */}
        <div className="space-y-3">
          {balances.map((token, index) => (
            <div
              key={`${token.symbol}-${index}`}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                token.error 
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTokenIcon(token.symbol)}</span>
                <div>
                  <div className={`font-medium ${token.error ? "text-red-600" : ""}`}>
                    {token.symbol}
                    {token.error && <AlertCircle className="inline h-3 w-3 ml-1" />}
                  </div>
                  <div className={`text-sm ${token.error ? "text-red-500" : "text-gray-500"}`}>
                    {token.error ? token.error : token.name}
                  </div>
                  {token.contract && !token.error && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-400 font-mono">
                        {formatAddress(token.contract)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(token.contract!)}
                        className="h-5 w-5 p-0"
                      >
                        {copiedAddress === token.contract ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className={`font-medium ${token.error ? "text-red-600" : ""}`}>
                  {token.formattedBalance} {token.symbol}
                </div>
                {token.usdValue && !token.error && (
                  <div className="text-sm text-gray-500">{token.usdValue}</div>
                )}
                {token.error && (
                  <div className="text-xs text-red-500 mt-1">
                    Click refresh to retry
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No tokens message for chains without token contracts */}
        {balances.length === 1 && balances[0].symbol === "ETH" && (
          <div className="text-center py-4 text-gray-500">
            <div className="text-sm">
              💡 USDC and COPE contracts not yet available on {chain.shortName}
            </div>
            <div className="text-xs mt-1">
              Only ETH balance shown for now
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && balances.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-500">Loading balances...</span>
            </div>
          </div>
                 )}
       </CardContent>
     </Card>

     {/* Send Modal */}
     <SendModal
       isOpen={showSendModal}
       onClose={() => setShowSendModal(false)}
       walletAddress={walletAddress}
       chainId={chainId}
       balances={balances}
     />

     {/* Receive Modal */}
     <ReceiveModal
       isOpen={showReceiveModal}
       onClose={() => setShowReceiveModal(false)}
       walletAddress={walletAddress}
       chainId={chainId}
     />
   </>
   );
 } 
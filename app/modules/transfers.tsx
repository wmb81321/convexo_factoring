"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  Copy, 
  Check,
  History,
  Send as SendIcon,
  Download
} from "lucide-react";
import TokenBalances from "@/app/components/token-balances";
import SendModal from "@/app/components/send-modal";
import ReceiveModal from "@/app/components/receive-modal";
import { useWallets } from "@privy-io/react-auth";

export default function TransfersModule() {
  const { wallets } = useWallets();
  const wallet = wallets?.[0];
  
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock transaction history
  const [transactions] = useState([
    {
      id: '1',
      type: 'send',
      amount: '100.0',
      token: 'USDC',
      to: '0x742d35cc...c495b9e46',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: 'completed',
      gasSponsored: true,
      hash: '0x1234567890abcdef1234567890abcdef12345678'
    },
    {
      id: '2',
      type: 'receive',
      amount: '50.0',
      token: 'COPE',
      from: '0x8ba1f109...c22C501be',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      status: 'completed',
      gasSponsored: false,
      hash: '0xabcdef1234567890abcdef1234567890abcdef12'
    },
    {
      id: '3',
      type: 'send',
      amount: '0.05',
      token: 'ETH',
      to: '0x9876543...def123456',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      status: 'completed',
      gasSponsored: true,
      hash: '0x567890abcdef1234567890abcdef1234567890ab'
    }
  ]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold heading-institutional">Transfers</h1>
        <p className="text-lg text-institutional-light">
          Send and receive tokens with gasless transactions
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card hover-lift transition-institutional cursor-pointer" 
              onClick={() => setShowSendModal(true)}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <ArrowUpRight className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold heading-institutional">Send Tokens</h3>
                <p className="text-institutional-light">
                  Transfer tokens to any address with gas sponsorship
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
              <span>✨ Gasless transactions available</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift transition-institutional cursor-pointer"
              onClick={() => setShowReceiveModal(true)}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full">
                <ArrowDownLeft className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold heading-institutional">Receive Tokens</h3>
                <p className="text-institutional-light">
                  Get your wallet address or QR code to receive tokens
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <QrCode className="w-4 h-4" />
              <span>QR code & address available</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Address Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 heading-institutional">
            <Copy className="w-5 h-5 text-primary" />
            Your Wallet Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-institutional-light font-medium mb-1">
                Smart Wallet Address
              </p>
              <code className="text-sm font-mono heading-institutional">
                {wallet?.address || 'Loading...'}
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => wallet?.address && copyToClipboard(wallet.address)}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Token Balances */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="heading-institutional">Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          {wallet?.address ? (
            <TokenBalances walletAddress={wallet.address} />
          ) : (
            <div className="text-center py-8">
              <p className="text-institutional-light">Connect wallet to view balances</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 heading-institutional">
            <History className="w-5 h-5 text-primary" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg 
                  hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className={`p-2 rounded-full ${
                  tx.type === 'send' 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'bg-green-50 dark:bg-green-900/20'
                }`}>
                  {tx.type === 'send' ? (
                    <ArrowUpRight className={`w-4 h-4 ${
                      tx.type === 'send' ? 'text-blue-600' : 'text-green-600'
                    }`} />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-green-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-institutional">
                      {tx.type === 'send' ? 'Sent' : 'Received'} {tx.amount} {tx.token}
                    </span>
                    {tx.gasSponsored && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-600 text-xs rounded-full">
                        Gasless
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-institutional-light">
                    <span>
                      {tx.type === 'send' ? 'To:' : 'From:'} {formatAddress(tx.to || tx.from || '')}
                    </span>
                    <span>{formatDate(tx.date)}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tx.status === 'completed'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600'
                  }`}>
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
            
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-institutional-light">No transactions yet</p>
                <p className="text-sm text-institutional-light">
                  Your transaction history will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showSendModal && wallet?.address && (
        <SendModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          walletAddress={wallet.address}
          chainId={11155111}
          balances={[]} // TokenBalances component will provide this
        />
      )}

      {showReceiveModal && wallet?.address && (
        <ReceiveModal
          isOpen={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
          walletAddress={wallet.address}
          chainId={11155111}
        />
      )}
    </div>
  );
} 
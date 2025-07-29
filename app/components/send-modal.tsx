"use client";

import { useState, useEffect } from "react";
import { X, QrCode, Send, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChainById } from "@/lib/chains";
import { TokenBalance } from "@/lib/blockchain";
import { useWallets } from "@privy-io/react-auth";
import { parseEther, parseUnits } from "viem";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  chainId: number;
  balances: TokenBalance[];
}

export default function SendModal({
  isOpen,
  onClose,
  walletAddress,
  chainId,
  balances,
}: SendModalProps) {
  const [step, setStep] = useState<'select' | 'details' | 'confirm'>('select');
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const chain = getChainById(chainId);
  const { wallets } = useWallets();

  useEffect(() => {
    // Validate Ethereum address
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    setIsValidAddress(ethereumAddressRegex.test(recipientAddress));
  }, [recipientAddress]);

  const resetModal = () => {
    setStep('select');
    setSelectedToken(null);
    setRecipientAddress("");
    setAmount("");
    setShowQrScanner(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleTokenSelect = (token: TokenBalance) => {
    setSelectedToken(token);
    setStep('details');
  };

  const handleQrScan = (result: string) => {
    // Extract address from QR code (handle ethereum: URIs)
    let address = result;
    if (result.startsWith('ethereum:')) {
      address = result.split('ethereum:')[1].split('?')[0];
    }
    setRecipientAddress(address);
    setShowQrScanner(false);
  };

  const handleSendTransaction = async () => {
    if (!selectedToken || !recipientAddress || !amount || !wallets.length) return;
    
    setIsLoading(true);
    setTxHash(null);
    
    try {
      const wallet = wallets[0]; // Use the first (smart) wallet
      
      // Prepare transaction parameters
      let txParams;
      
      if (selectedToken.symbol === 'ETH') {
        // Native ETH transfer
        txParams = {
          to: recipientAddress as `0x${string}`,
          value: parseEther(amount),
        };
      } else {
        // ERC-20 token transfer
        const tokenAmount = parseUnits(amount, selectedToken.symbol === 'USDC' ? 6 : 18);
        
        // ERC-20 transfer function call
        txParams = {
          to: selectedToken.contract as `0x${string}`,
          data: `0xa9059cbb${recipientAddress.slice(2).padStart(64, '0')}${tokenAmount.toString(16).padStart(64, '0')}` as `0x${string}`,
        };
      }
      
      console.log('Sending transaction:', {
        token: selectedToken.symbol,
        to: recipientAddress,
        amount: amount,
        chain: chainId,
        wallet: wallet.address,
      });
      
      // Send transaction using Privy smart wallet
      const txResponse = await wallet.sendTransaction(txParams);
      
      console.log('Transaction sent:', txResponse);
      setTxHash(txResponse.hash);
      
      // Show success message with transaction hash
      alert(`✅ Transaction sent!\n\n${amount} ${selectedToken.symbol} → ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}\n\nTx Hash: ${txResponse.hash.slice(0, 10)}...`);
      
      // Wait a moment before closing to show the hash
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error('Transaction failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`❌ Transaction failed:\n\n${errorMessage}\n\nPlease check your balance and try again.`);
    } finally {
      setIsLoading(false);
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

  const isAmountValid = () => {
    if (!amount || !selectedToken) return false;
    const numAmount = parseFloat(amount);
    const balance = parseFloat(selectedToken.balance);
    return numAmount > 0 && numAmount <= balance;
  };

  const canProceed = () => {
    switch (step) {
      case 'select':
        return selectedToken !== null;
      case 'details':
        return isValidAddress && isAmountValid();
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Crypto
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Chain Info */}
          <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sending from
            </div>
            <div className="font-semibold">{chain?.name}</div>
          </div>

          {/* Step 1: Select Token */}
          {step === 'select' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Select Token to Send</h3>
              <div className="space-y-2">
                {balances.map((token, index) => (
                  <div
                    key={`${token.symbol}-${index}`}
                    onClick={() => !token.error && handleTokenSelect(token)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      token.error 
                        ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTokenIcon(token.symbol)}</span>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-gray-500">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{token.formattedBalance}</div>
                        {token.usdValue && (
                          <div className="text-sm text-gray-500">{token.usdValue}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Enter Details */}
          {step === 'details' && selectedToken && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('select')}
                  className="p-0 h-auto text-blue-600"
                >
                  ← Back
                </Button>
                <span className="text-lg">Send {selectedToken.symbol}</span>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipient Address
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0x..."
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowQrScanner(!showQrScanner)}
                      className="px-3"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {showQrScanner && (
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                      <QrCode className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        QR Scanner not implemented yet. Please paste the address manually.
                      </p>
                    </div>
                  )}
                  
                  {recipientAddress && !isValidAddress && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <AlertCircle className="h-3 w-3" />
                      Invalid Ethereum address
                    </div>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg pr-20"
                      step="any"
                      min="0"
                      max={selectedToken.balance}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {selectedToken.symbol}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Balance: {selectedToken.formattedBalance} {selectedToken.symbol}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAmount(selectedToken.balance)}
                      className="h-auto p-0 text-blue-600"
                    >
                      Max
                    </Button>
                  </div>
                  
                  {amount && selectedToken.usdValue && (
                    <div className="text-sm text-gray-500">
                      ≈ ${(parseFloat(amount) * parseFloat(selectedToken.usdValue.replace('$', ''))).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Fee Info */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="text-sm text-green-800 dark:text-green-200">
                  <strong>✨ Gasless Transaction</strong>
                  <div className="text-xs mt-1">
                    This transaction will be sponsored by Alchemy. No ETH needed for gas!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirm Transaction */}
          {step === 'confirm' && selectedToken && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('details')}
                  className="p-0 h-auto text-blue-600"
                >
                  ← Back
                </Button>
                <span className="text-lg">Confirm Transaction</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-mono text-sm">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                </div>
                
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-mono text-sm">{recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <div className="text-right">
                      <div className="font-semibold">{amount} {selectedToken.symbol}</div>
                      {selectedToken.usdValue && (
                        <div className="text-sm text-gray-500">
                          ≈ ${(parseFloat(amount) * parseFloat(selectedToken.usdValue.replace('$', ''))).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-600">Network Fee:</span>
                    <span className="text-green-600 font-medium">Free (Sponsored)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            
            {step === 'details' && (
              <Button
                onClick={() => setStep('confirm')}
                disabled={!canProceed()}
                className="flex-1"
              >
                Review Transaction
              </Button>
            )}
            
            {step === 'confirm' && (
              <Button
                onClick={handleSendTransaction}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Transaction"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
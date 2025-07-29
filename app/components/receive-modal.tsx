"use client";

import { useState, useEffect } from "react";
import { Copy, Check, X, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChainById } from "@/lib/chains";

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  chainId: number;
}

export default function ReceiveModal({
  isOpen,
  onClose,
  walletAddress,
  chainId,
}: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const chain = getChainById(chainId);

  useEffect(() => {
    if (isOpen && walletAddress) {
      // Generate QR code using a simple data URL (you can replace with qrcode library)
      const qrText = walletAddress;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrText)}`;
      setQrCodeUrl(qrUrl);
    }
  }, [isOpen, walletAddress]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Convexo Wallet Address",
          text: `Send crypto to my wallet on ${chain?.name}`,
          url: `ethereum:${walletAddress}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Receive Crypto
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Chain Info */}
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Receiving on
            </div>
            <div className="font-semibold text-lg">{chain?.name}</div>
            <div className="text-xs text-gray-500">Chain ID: {chainId}</div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Wallet QR Code"
                  className="w-48 h-48"
                  onError={() => setQrCodeUrl("")}
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                  <QrCode className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Wallet Address
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={walletAddress}
                readOnly
                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 text-sm font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="px-3"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Important:</strong>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Only send {chain?.nativeCurrency.symbol} and tokens from {chain?.name}</li>
                <li>• Sending from other networks will result in lost funds</li>
                <li>• This is a smart wallet address</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleShare}
            >
              Share Address
            </Button>
            <Button
              onClick={() => window.open(`${chain?.blockExplorer}/address/${walletAddress}`, '_blank')}
              className="flex-1"
            >
              View on Explorer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
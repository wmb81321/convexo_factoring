"use client";

import { useState, useCallback } from 'react';
import { useWallets, useSendTransaction } from '@privy-io/react-auth';
import { 
  prepareSponsoredTokenTransfer, 
  isGasSponsorshipAvailable,
  type TokenTransferParams 
} from '@/lib/smart-wallet-utils';

export interface SponsoredTransactionStatus {
  isLoading: boolean;
  isSponsored: boolean;
  transactionHash?: string;
  error?: string;
}

export interface UseSponsoredTransactionsReturn {
  sendSponsoredTransaction: (params: TokenTransferParams) => Promise<void>;
  checkSponsorship: (params: TokenTransferParams) => Promise<boolean>;
  status: SponsoredTransactionStatus;
  reset: () => void;
}

/**
 * Hook for sending transactions with Alchemy gas sponsorship
 * Integrates Privy smart wallets with proper Alchemy Gas Manager API
 */
export function useSponsoredTransactions(): UseSponsoredTransactionsReturn {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  
  const [status, setStatus] = useState<SponsoredTransactionStatus>({
    isLoading: false,
    isSponsored: false,
  });

  const smartWallet = wallets?.find(wallet => wallet.address);

  const reset = useCallback(() => {
    setStatus({
      isLoading: false,
      isSponsored: false,
    });
  }, []);

  const checkSponsorship = useCallback(async (params: TokenTransferParams): Promise<boolean> => {
    if (!smartWallet?.address) {
      throw new Error('No smart wallet connected');
    }

    try {
      const isEligible = await isGasSponsorshipAvailable(
        {
          to: params.recipient,
          chainId: params.chainId,
        },
        smartWallet.address
      );

      return isEligible;
    } catch (error) {
      console.warn('Failed to check sponsorship eligibility:', error);
      return false;
    }
  }, [smartWallet]);

  const sendSponsoredTransaction = useCallback(async (params: TokenTransferParams) => {
    if (!smartWallet?.address) {
      throw new Error('No smart wallet connected');
    }

    setStatus(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Check if transaction is eligible for sponsorship
      const isEligible = await checkSponsorship(params);
      
      if (isEligible) {
        // Use the new Alchemy gas sponsorship flow
        console.log('🎉 Transaction eligible for gas sponsorship!');
        
        setStatus(prev => ({ ...prev, isSponsored: true }));

        // For now, use Privy's existing sendTransaction with the smart wallet
        // The SmartWalletsProvider with paymasterContext should handle sponsorship
        const txParams = params.tokenAddress 
          ? {
              // ERC-20 token transfer
              to: params.tokenAddress as `0x${string}`,
              data: buildTransferCallData(params.recipient, params.amount, params.decimals || 18),
            }
          : {
              // Native ETH transfer  
              to: params.recipient as `0x${string}`,
              value: BigInt(parseFloat(params.amount) * 1e18),
            };

        const result = await sendTransaction(txParams);
        
        setStatus(prev => ({ 
          ...prev, 
          isLoading: false, 
          transactionHash: result.hash 
        }));

        console.log('✅ Sponsored transaction sent:', result.hash);
        
      } else {
        // Fallback to regular transaction (user pays gas)
        console.log('⚠️ Transaction not eligible for sponsorship, user will pay gas');
        
        setStatus(prev => ({ ...prev, isSponsored: false }));

        const txParams = params.tokenAddress 
          ? {
              to: params.tokenAddress as `0x${string}`,
              data: buildTransferCallData(params.recipient, params.amount, params.decimals || 18),
            }
          : {
              to: params.recipient as `0x${string}`,
              value: BigInt(parseFloat(params.amount) * 1e18),
            };

        const result = await sendTransaction(txParams);
        
        setStatus(prev => ({ 
          ...prev, 
          isLoading: false, 
          transactionHash: result.hash 
        }));
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));

      console.error('❌ Transaction failed:', error);
      throw error;
    }
  }, [smartWallet, sendTransaction, checkSponsorship]);

  return {
    sendSponsoredTransaction,
    checkSponsorship,
    status,
    reset,
  };
}

/**
 * Build call data for ERC-20 token transfer
 */
function buildTransferCallData(
  recipient: string, 
  amount: string, 
  decimals: number = 18
): `0x${string}` {
  const transferSelector = '0xa9059cbb';
  const recipientPadded = recipient.slice(2).padStart(64, '0');
  const tokenAmount = BigInt(parseFloat(amount) * Math.pow(10, decimals));
  const amountPadded = tokenAmount.toString(16).padStart(64, '0');
  
  return `${transferSelector}${recipientPadded}${amountPadded}` as `0x${string}`;
} 
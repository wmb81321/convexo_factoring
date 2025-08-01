# 🔧 Smart Wallet Migration Guide

## Problem Solved
Existing users have both embedded wallets AND smart wallets. We want to prioritize smart wallets for gas sponsorship while still supporting external wallets.

## Solution: useSmartWallet Hook

### Before (Current Code):
```typescript
import { useWallets } from "@privy-io/react-auth";

export default function DeFi() {
  const { wallets } = useWallets();
  const wallet = wallets?.[0]; // Just takes first wallet randomly
  
  // Rest of component...
}
```

### After (Smart Selection):
```typescript
import { useSmartWallet } from "@/app/hooks/useSmartWallet";

export default function DeFi() {
  const { wallet, isSmartWallet, canUseGasSponsorship } = useSmartWallet();
  
  // Rest of component...
}
```

## 🎯 How It Works

### For Existing Users with Both Wallets:
1. ✅ **Smart wallet found** → Uses smart wallet (gas sponsorship enabled)
2. 🦊 **External wallet found** → Uses external wallet (user pays gas)
3. 📱 **Fallback** → Uses first available wallet

### For New Users:
1. **External wallet login** → Uses their MetaMask/etc directly
2. **Social login** → Gets smart wallet automatically

## 🔄 Migration Steps

### 1. Update DeFi Module:
```typescript
// OLD
const { wallets } = useWallets();
const wallet = wallets?.[0];

// NEW  
const { wallet, isSmartWallet, canUseGasSponsorship } = useSmartWallet();
```

### 2. Update Send Modal:
```typescript
// OLD
const { wallets } = useWallets();
const wallet = wallets?.[0];

// NEW
const { wallet, canUseGasSponsorship } = useSmartWallet();

// Then conditionally show gas sponsorship UI
{canUseGasSponsorship && (
  <div className="text-green-600">Free (Sponsored)</div>
)}
```

### 3. Update Transfers Module:
```typescript
// OLD
const { wallets } = useWallets();
const wallet = wallets?.[0];

// NEW
const { wallet, isSmartWallet } = useSmartWallet();
```

## 🎯 Benefits

### For Existing Users:
- ✅ **Automatically uses smart wallet** if available (gas sponsorship)
- ✅ **Falls back to external wallet** if no smart wallet
- ✅ **No user confusion** - app picks best option
- ✅ **Backward compatible** - nothing breaks

### For New Users:
- ✅ **External wallet users** → Use their wallet directly
- ✅ **Social login users** → Get smart wallet with gas sponsorship

### For Developers:
- ✅ **Simple API** - just use `useSmartWallet()`
- ✅ **Clear indicators** - know what wallet type user has
- ✅ **Gas sponsorship flag** - know when to show sponsored features

## 📝 Implementation Order

1. ✅ **Created useSmartWallet hook**
2. **Update DeFi module** (example below)
3. **Update Send Modal**
4. **Update Transfers module**
5. **Update any other wallet usage**

## 🎯 Next Steps

Would you like me to update the DeFi module as the first example?
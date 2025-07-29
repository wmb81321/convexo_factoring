# 🔧 Smart Wallets Gas Sponsorship Troubleshooting

## ❌ **Issue: "Add funds on Ethereum Sepolia to complete transaction"**

If you see this message, **gas sponsorship is NOT working**. The smart wallet is created but transactions aren't being sponsored.

## ✅ **Fix Steps:**

### 1. **Check Environment Variables**
```bash
# Make sure .env.local exists with these values:
NEXT_PUBLIC_PRIVY_APP_ID=your_actual_privy_app_id
NEXT_PUBLIC_ALCHEMY_API_KEY=SXANY5q1gB0q1Sw600WAI  
NEXT_PUBLIC_ALCHEMY_POLICY_ID=5c1f3503-0f13-4109-8559-e04e27f55239
```

### 2. **Verify Privy Dashboard Configuration**
- ✅ Smart wallets enabled in Privy Dashboard
- ✅ Alchemy selected as paymaster provider
- ✅ Policy ID `5c1f3503-0f13-4109-8559-e04e27f55239` configured
- ✅ All chains (ETH, OP, BASE, UNI Sepolia) configured

### 3. **Check Alchemy Gas Policy**
- ✅ Policy `5c1f3503-0f13-4109-8559-e04e27f55239` is active
- ✅ Policy has sufficient funds/credits
- ✅ Policy allows your smart wallet addresses
- ✅ Policy covers the specific chain you're testing on

### 4. **Restart Development Server**
```bash
# After updating .env.local:
npm run dev
```

## 🔍 **Debugging Steps:**

### Check Environment Variables Are Loaded:
Add this to any component to verify:
```typescript
console.log('Policy ID:', process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID);
console.log('Privy App ID:', process.env.NEXT_PUBLIC_PRIVY_APP_ID);
```

### Check Smart Wallet Address:
```typescript
import { useWallets } from "@privy-io/react-auth";

const { wallets } = useWallets();
console.log('Smart wallet address:', wallets[0]?.address);
```

## 🚨 **Common Issues:**

1. **No .env.local file** → Create from .env.example
2. **Wrong Policy ID** → Must match dashboard exactly
3. **Alchemy policy inactive** → Check Alchemy dashboard
4. **Wrong chain configuration** → Verify chain IDs match
5. **Missing Privy App ID** → Add your actual app ID

## ✅ **Success Indicators:**

When gas sponsorship works correctly:
- ✅ No "Add funds" message
- ✅ Estimated fee shows $0.00 (or "Free")
- ✅ Transaction completes without user having ETH
- ✅ Smart wallet balance can be empty

## 📞 **If Still Not Working:**

1. Check Alchemy dashboard for policy usage
2. Verify Privy dashboard smart wallet config
3. Test on different networks
4. Check browser console for errors
5. Restart both dev server and browser 
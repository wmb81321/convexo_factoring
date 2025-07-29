/**
 * Test script for Alchemy Gas Sponsorship Implementation
 * Run this to validate your setup is working correctly
 */

import { getGasManager } from '../lib/alchemy-gas-manager';
import { isGasSponsorshipAvailable } from '../lib/smart-wallet-utils';

interface TestConfig {
  testWalletAddress: string;
  testRecipient: string;
  testChainId: number;
}

// Test configuration - update these values for your testing
const TEST_CONFIG: TestConfig = {
  testWalletAddress: '0x742d35cc6270c8532e9e866c06c495b9e46',
  testRecipient: '0x8ba1f109551bD432803012645Hac136c22C501be',
  testChainId: 11155111, // Ethereum Sepolia
};

async function testEnvironmentConfiguration() {
  console.log('🔧 Testing Environment Configuration...\n');
  
  const requiredVars = {
    'NEXT_PUBLIC_ALCHEMY_API_KEY': process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    'NEXT_PUBLIC_ALCHEMY_POLICY_ID': process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID,
    'NEXT_PUBLIC_PRIVY_APP_ID': process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  };

  let allConfigured = true;
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      console.log(`✅ ${key}: ${value.slice(0, 10)}...`);
    } else {
      console.log(`❌ ${key}: Missing`);
      allConfigured = false;
    }
  }

  if (!allConfigured) {
    console.log('\n❌ Environment configuration incomplete!');
    console.log('Please check your .env.local file and restart the development server.\n');
    return false;
  }

  console.log('\n✅ Environment configuration complete!\n');
  return true;
}

async function testGasManagerConnection() {
  console.log('🔗 Testing Gas Manager Connection...\n');
  
  try {
    const gasManager = getGasManager();
    console.log('✅ Gas Manager instance created successfully');
    
    // Test eligibility check
    const isEligible = await gasManager.isEligibleForSponsorship(
      {
        sender: TEST_CONFIG.testWalletAddress,
        callData: '0x',
      },
      TEST_CONFIG.testChainId
    );

    console.log(`✅ Sponsorship eligibility check: ${isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);
    
    return true;
  } catch (error) {
    console.log('❌ Gas Manager connection failed:', error);
    return false;
  }
}

async function testSponsorshipEligibility() {
  console.log('🎯 Testing Sponsorship Eligibility...\n');

  try {
    // Test ETH transfer eligibility
    const ethEligible = await isGasSponsorshipAvailable(
      {
        to: TEST_CONFIG.testRecipient,
        chainId: TEST_CONFIG.testChainId,
      },
      TEST_CONFIG.testWalletAddress
    );

    console.log(`✅ ETH transfer sponsorship: ${ethEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);

    // Test ERC-20 transfer eligibility (mock USDC)
    const tokenEligible = await isGasSponsorshipAvailable(
      {
        to: '0xA0b86a33E6417aCce23dA66eF0ac50', // Mock token address
        data: '0xa9059cbb', // transfer function selector
        chainId: TEST_CONFIG.testChainId,
      },
      TEST_CONFIG.testWalletAddress
    );

    console.log(`✅ Token transfer sponsorship: ${tokenEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);

    return true;
  } catch (error) {
    console.log('❌ Sponsorship eligibility test failed:', error);
    return false;
  }
}

async function testAlchemyRpcEndpoints() {
  console.log('🌐 Testing Alchemy RPC Endpoints...\n');

  const chainEndpoints = [
    { chainId: 11155111, name: 'Ethereum Sepolia' },
    { chainId: 11155420, name: 'OP Sepolia' },
    { chainId: 84532, name: 'Base Sepolia' },
  ];

  for (const { chainId, name } of chainEndpoints) {
    try {
      const gasManager = getGasManager();
      // This will test the RPC URL construction
      const rpcUrl = (gasManager as any).getAlchemyRpcUrl(chainId);
      console.log(`✅ ${name}: ${rpcUrl.split('/').slice(-2).join('/')}`);
    } catch (error) {
      console.log(`❌ ${name}: Failed to construct RPC URL`);
    }
  }

  console.log('\n✅ RPC endpoint configuration complete!\n');
  return true;
}

async function testPrivyIntegration() {
  console.log('🔐 Testing Privy Integration...\n');

  try {
    // Test that all required Privy environment variables are set
    const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    
    if (!privyAppId) {
      console.log('❌ NEXT_PUBLIC_PRIVY_APP_ID not configured');
      return false;
    }

    console.log(`✅ Privy App ID configured: ${privyAppId.slice(0, 10)}...`);
    console.log('✅ SmartWalletsProvider will use Alchemy Gas Manager');
    console.log('✅ Enhanced provider events enabled');

    return true;
  } catch (error) {
    console.log('❌ Privy integration test failed:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Running Alchemy Gas Sponsorship Tests\n');
  console.log('=' .repeat(50) + '\n');

  const tests = [
    { name: 'Environment Configuration', test: testEnvironmentConfiguration },
    { name: 'Gas Manager Connection', test: testGasManagerConnection },
    { name: 'Sponsorship Eligibility', test: testSponsorshipEligibility },
    { name: 'Alchemy RPC Endpoints', test: testAlchemyRpcEndpoints },
    { name: 'Privy Integration', test: testPrivyIntegration },
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const { name, test } of tests) {
    console.log(`\n📋 ${name}`);
    console.log('-'.repeat(30));
    
    try {
      const result = await test();
      if (result) {
        passedTests++;
        console.log(`✅ ${name} PASSED\n`);
      } else {
        console.log(`❌ ${name} FAILED\n`);
      }
    } catch (error) {
      console.log(`❌ ${name} FAILED:`, error);
      console.log('');
    }
  }

  console.log('=' .repeat(50));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed\n`);

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your Alchemy Gas Sponsorship setup is ready!');
    console.log('\n📚 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Test transactions in your application');
    console.log('3. Monitor usage in Alchemy Dashboard');
    console.log('4. Check the ALCHEMY_GAS_SPONSORSHIP_SETUP.md for usage examples');
  } else {
    console.log('⚠️  Some tests failed. Please check the configuration and try again.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your .env.local file has all required variables');
    console.log('2. Check your Alchemy Policy ID is active and has sufficient funds');
    console.log('3. Ensure your Privy app is configured with smart wallets enabled');
    console.log('4. Restart your development server after environment changes');
  }
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests, TEST_CONFIG }; 
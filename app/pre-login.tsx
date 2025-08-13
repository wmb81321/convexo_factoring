"use client";

import { usePrivy } from "@privy-io/react-auth";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  Shield, 
  Zap, 
  Globe,
  ArrowRight,
  CreditCard,
  Repeat,
  Lock
} from "lucide-react";

export default function PreLogin() {
  const { login } = usePrivy();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Welcome to Convexo Smart Wallet
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            Your gateway to gasless transactions and cross-chain DeFi
          </p>
          <Button 
            onClick={() => login()}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full"
          >
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Smart Wallet Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Wallet className="w-6 h-6 text-blue-400" />
                Smart Wallet Technology
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>Experience next-generation wallet features with automatic creation and seamless management.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Automatic wallet creation
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  Enhanced security
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Gasless Transactions Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Zap className="w-6 h-6 text-yellow-400" />
                Gasless Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>Never worry about gas fees again. We handle the complexity for you.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  No ETH needed for transactions
                </li>
                <li className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-green-400" />
                  Sponsored transactions
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Cross-chain DeFi Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Globe className="w-6 h-6 text-purple-400" />
                Cross-chain DeFi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>Access multiple chains and DeFi protocols from a single interface.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-blue-400" />
                  Seamless cross-chain swaps
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-400" />
                  Secure protocol integration
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Why Choose Convexo?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Shield className="w-8 h-8 text-blue-400" />,
              title: "Enhanced Security",
              description: "Built-in protection and recovery options"
            },
            {
              icon: <Zap className="w-8 h-8 text-yellow-400" />,
              title: "Fast & Efficient",
              description: "Lightning-quick transactions without the wait"
            },
            {
              icon: <CreditCard className="w-8 h-8 text-green-400" />,
              title: "No Gas Fees",
              description: "We cover your transaction costs"
            },
            {
              icon: <Globe className="w-8 h-8 text-purple-400" />,
              title: "Multi-chain Support",
              description: "Access multiple networks seamlessly"
            }
          ].map((benefit, index) => (
            <div key={index} className="p-6 bg-gray-800 rounded-xl">
              <div className="flex justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-400">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience the Future of Web3?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Join thousands of users who have already made the switch to gasless transactions.
          </p>
          <Button 
            onClick={() => login()}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full"
          >
            Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

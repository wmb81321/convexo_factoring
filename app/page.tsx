"use client";

import { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Header from "./components/header";
import LoginCard from "./components/login-card";
import PrivySmartWallet from "./components/privy-smart-wallet";

export default function Home() {
  const { authenticated, ready } = usePrivy();
  const { wallets } = useWallets();

  // Professional loading state
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-2 border-primary/10 rounded-full mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Convexo Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Initializing secure connection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Professional Header */}
      <Header />
      
      {/* Main Content with Professional Layout */}
      <main className="min-h-[calc(100vh-4rem)] relative">
        {/* Content Container */}
        <div className="container-institutional section-padding">
          <div className="max-w-6xl mx-auto">
            {!authenticated ? (
              /* Login Section with Professional Styling */
              <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-full max-w-md fade-in">
                  <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold heading-institutional mb-4">
                      Welcome to Convexo
                    </h1>
                    <p className="text-lg text-institutional-light">
                      Next-generation smart wallet with gasless transactions
                    </p>
                  </div>
                  <LoginCard />
                </div>
              </div>
            ) : (
              /* Authenticated Dashboard with Professional Layout */
              <div className="slide-up">
                <PrivySmartWallet />
              </div>
            )}
          </div>
        </div>
        
        {/* Professional Footer Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container-institutional">
            <div className="text-center">
              <p className="text-sm text-institutional-light">
                Powered by Alchemy Gas Manager • Secured by Privy Smart Wallets
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

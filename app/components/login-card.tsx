"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthModal } from "@account-kit/react";

export default function LoginPage() {
  const { openAuthModal } = useAuthModal();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  return (
    <Card
      className={cn(
        "relative w-full max-w-md shadow-xl border border-gray-200/50",
        "bg-white/70 dark:bg-gray-900/70 backdrop-blur-md",
        "hover:shadow-2xl transition-all duration-300"
      )}
    >
      <CardHeader className={cn("text-center space-y-4 pb-8")}>
        <div className="flex justify-center mb-4">
          <div className="text-6xl">🚀</div>
        </div>
        <CardTitle
          className={cn(
            "text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600",
            "dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
          )}
        >
          Convexo Wallet
        </CardTitle>
        <CardDescription
          className={cn("text-base text-gray-600 dark:text-gray-400")}
        >
          Experience the future of web3 with gasless transactions, social login, and seamless UX. 
          Login to get started.
        </CardDescription>
      </CardHeader>

      <CardContent className={cn("space-y-6 pb-8")}>
        <Button
          size="lg"
          onClick={() => openAuthModal()}
          disabled={isLoggingIn}
          className={cn(
            "w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600",
            "hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl",
            "text-white transition-all duration-200"
          )}
        >
          {isLoggingIn ? (
            <>
              <Loader2 className={cn("animate-spin -ml-1 mr-3 h-5 w-5")} />
              Connecting...
            </>
          ) : (
            <>Connect Smart Wallet</>
          )}
        </Button>
        
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          🔐 Email • 🔑 Passkey • 🌐 Social Login
        </div>
      </CardContent>
    </Card>
  );
}

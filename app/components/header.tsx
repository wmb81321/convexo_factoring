import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

export default function Header() {
  const { authenticated, logout } = usePrivy();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🚀</div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Convexo Wallet
            </h1>
            <p className="text-xs text-gray-500">Smart Web3 Wallet</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {authenticated && (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/20 
                text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Smart Wallet</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-600 hover:text-gray-800"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

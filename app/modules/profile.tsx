"use client";

import { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Camera, 
  Settings, 
  Shield, 
  Bell,
  Globe,
  Moon,
  Sun,
  Copy,
  Check
} from "lucide-react";

export default function ProfileModule() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets?.[0];
  
  const [profile, setProfile] = useState({
    name: user?.email?.address || '',
    email: user?.email?.address || '',
    avatar: '',
    currency: 'USD',
    language: 'en',
    notifications: true,
    theme: 'light',
  });
  
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Profile Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold heading-institutional">Profile Settings</h1>
        <p className="text-lg text-institutional-light">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 heading-institutional">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <button 
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-white shadow-lg rounded-full 
                      flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold heading-institutional">Profile Picture</h3>
                  <p className="text-sm text-institutional-light">
                    Upload a profile picture to personalize your account
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="btn-institutional"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 heading-institutional">
                <Settings className="w-5 h-5 text-primary" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <select 
                    id="currency"
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800"
                    value={profile.currency}
                    onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select 
                    id="language"
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800"
                    value={profile.language}
                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium heading-institutional">Notifications</h4>
                      <p className="text-sm text-institutional-light">
                        Receive transaction and security alerts
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfile({ ...profile, notifications: !profile.notifications })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      profile.notifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        profile.notifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {profile.theme === 'light' ? (
                      <Sun className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <Moon className="w-5 h-5 text-purple-600" />
                    )}
                    <div>
                      <h4 className="font-medium heading-institutional">Theme</h4>
                      <p className="text-sm text-institutional-light">
                        Choose your preferred theme
                      </p>
                    </div>
                  </div>
                  <select 
                    className="p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800"
                    value={profile.theme}
                    onChange={(e) => setProfile({ ...profile, theme: e.target.value })}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Information */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 heading-institutional">
                <Shield className="w-5 h-5 text-primary" />
                Wallet Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50/50 dark:bg-green-900/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-green-600">Smart Wallet Active</span>
                </div>
                <p className="text-xs text-institutional-light">
                  Your smart wallet is connected and secured
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Wallet Address</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                      {wallet?.address ? formatAddress(wallet.address) : 'Loading...'}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => wallet?.address && copyToClipboard(wallet.address)}
                      className="p-2"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Wallet Type</Label>
                  <p className="text-sm text-institutional-light mt-1">
                    ERC-4337 Smart Wallet
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Provider</Label>
                  <p className="text-sm text-institutional-light mt-1">
                    Privy + Alchemy
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Network</Label>
                  <p className="text-sm text-institutional-light mt-1">
                    Ethereum Sepolia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 heading-institutional">
                <Globe className="w-5 h-5 text-primary" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold text-institutional">
                    Social Recovery
                  </p>
                  <p className="text-xs text-institutional-light">
                    Account recovery via email
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold text-institutional">
                    Gas Sponsorship
                  </p>
                  <p className="text-xs text-institutional-light">
                    Gasless transactions enabled
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold text-institutional">
                    Multi-Factor Auth
                  </p>
                  <p className="text-xs text-institutional-light">
                    Enhanced security enabled
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
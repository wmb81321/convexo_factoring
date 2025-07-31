"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Smartphone,
  Globe
} from "lucide-react";

export default function Profile() {
  const { user, logout } = usePrivy();

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              Please connect your wallet to view profile
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock verification status - this will be integrated with Veriff
  const verificationStatus = {
    isVerified: false,
    status: "pending", // "pending", "verified", "rejected"
    requestedAt: null,
    verifiedAt: null
  };

  const getVerificationBadge = () => {
    switch (verificationStatus.status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Verified</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Not Verified</Badge>;
    }
  };

  const getVerificationIcon = () => {
    switch (verificationStatus.status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleVerificationRequest = () => {
    // TODO: Integrate with Veriff API
    console.log("Requesting verification with Veriff...");
    alert("Verification request will be integrated with Veriff API");
  };

  return (
    <div className="space-y-6">
      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.email?.address?.split('@')[0] || 'User'}</h3>
              <p className="text-gray-600 dark:text-gray-300">{user.email?.address}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Email</p>
                                 <p className="text-sm text-gray-600 dark:text-gray-300">{user.email?.address}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Globe className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Wallet Type</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Smart Wallet</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              {getVerificationIcon()}
              <div>
                <p className="font-medium">Identity Verification</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {verificationStatus.status === "verified" 
                    ? "Your identity has been verified" 
                    : verificationStatus.status === "pending"
                    ? "Verification is being processed"
                    : verificationStatus.status === "rejected"
                    ? "Verification was rejected"
                    : "Complete verification to unlock all features"
                  }
                </p>
              </div>
            </div>
            {getVerificationBadge()}
          </div>

          {verificationStatus.status === "not_verified" && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Why verify your identity?
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Higher transaction limits</li>
                <li>• Access to advanced DeFi features</li>
                <li>• Enhanced security and compliance</li>
                <li>• Priority customer support</li>
              </ul>
            </div>
          )}

          {verificationStatus.status === "pending" && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-900 dark:text-yellow-100">
                  Verification in Progress
                </span>
              </div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Your verification request is being reviewed. This usually takes 1-2 business days.
              </p>
            </div>
          )}

          {verificationStatus.status === "rejected" && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-900 dark:text-red-100">
                  Verification Rejected
                </span>
              </div>
              <p className="text-sm text-red-800 dark:text-red-200">
                Your verification was not approved. Please ensure all documents are clear and valid.
              </p>
            </div>
          )}

          {verificationStatus.status !== "verified" && (
            <Button 
              onClick={handleVerificationRequest}
              className="w-full"
              disabled={verificationStatus.status === "pending"}
            >
              {verificationStatus.status === "pending" 
                ? "Verification in Progress..." 
                : verificationStatus.status === "rejected"
                ? "Request New Verification"
                : "Request Verification"
              }
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={logout} 
            variant="outline" 
            className="w-full"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 
"use client";

import { Wallet } from "lucide-react";

interface WalletButtonsProps {
  cwid: string;
  isMobile: boolean;
  buttonTextSize: string;
  borderRadius: string;
}

export default function WalletButtons({ 
  cwid, 
  isMobile, 
  buttonTextSize, 
  borderRadius 
}: WalletButtonsProps) {
  const handleAddToAppleWallet = () => {
    // In a real implementation, this would generate a pkpass file
    alert("This would generate an Apple Wallet pass for the event with your CWID: " + cwid);
  };
  
  const handleAddToGoogleWallet = () => {
    // In a real implementation, this would generate a Google Wallet pass
    alert("This would generate a Google Wallet pass for the event with your CWID: " + cwid);
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-xs">
      <button
        onClick={handleAddToAppleWallet}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors"
        style={{
          backgroundColor: "#000000",
          color: "#FFFFFF",
          fontSize: buttonTextSize,
          fontWeight: "medium",
          borderRadius: borderRadius,
        }}
      >
        <Wallet className="h-4 w-4" />
        Add to Apple Wallet
      </button>
      
      <button
        onClick={handleAddToGoogleWallet}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors"
        style={{
          backgroundColor: "#4285F4",
          color: "#FFFFFF",
          fontSize: buttonTextSize,
          fontWeight: "medium",
          borderRadius: borderRadius,
        }}
      >
        <Wallet className="h-4 w-4" />
        Add to Google Wallet
      </button>
    </div>
  );
} 
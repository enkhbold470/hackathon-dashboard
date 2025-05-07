"use client";

import { useQRCode } from 'next-qrcode';
import { Card, CardContent } from "@/components/ui/card";
import colors from "@/lib/colors";
import uiConfig from "@/lib/ui-config";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface QRCodeProps {
  cwid: string;
  size?: number;
  title?: string;
  description?: string;
}

export default function QRCode({ 
  cwid, 
  size = 200,
  title = "Your QR Code",
  description = "Scan this QR code at check-in" 
}: QRCodeProps) {
  const { Canvas } = useQRCode();
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < parseInt(uiConfig.breakpoints.md.replace('px', '')))
    }
    
    // Initial check
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, []);

  // Handle download
  const handleDownload = () => {
    const canvas = document.querySelector('#qr-canvas canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qrcode-${cwid}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <Card
      className="overflow-hidden relative shadow-md"
      style={{
        backgroundColor: colors.theme.background,
        borderColor: colors.theme.inputBorder,
        borderWidth: "1px",
        borderRadius: uiConfig.borderRadius.lg,
        boxShadow: uiConfig.shadows.md,
      }}
    >
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        <div className="text-center mb-2">
          <h3 
            style={{ 
              color: colors.theme.primary,
              fontSize: isMobile ? uiConfig.typography.fontSize.mobile.sectionTitle : uiConfig.typography.fontSize.sectionTitle,
              fontWeight: uiConfig.typography.fontWeight.bold,
            }}
          >
            {title}
          </h3>
          <p
            style={{ 
              color: colors.theme.secondary,
              fontSize: isMobile ? uiConfig.typography.fontSize.mobile.helperText : uiConfig.typography.fontSize.helperText,
            }}
          >
            {description}
          </p>
        </div>
        
        <div
          id="qr-canvas"
          className="p-4 bg-white rounded-lg"
          style={{
            borderRadius: uiConfig.borderRadius.md,
            padding: "1rem",
          }}
        >
          <Canvas
            text={cwid}
            options={{
              type: 'image/png',
              quality: 0.8,
              margin: 2,
              scale: 4,
              width: size,
              color: {
                dark: colors.theme.foreground,
                light: '#FFFFFF',
              },
            }}
          />
        </div>
        
        {/* <button
          onClick={handleDownload}
          className="flex items-center gap-2 mt-4 px-4 py-2 rounded-md transition-colors"
          style={{
            backgroundColor: colors.theme.primary,
            color: colors.theme.buttonText,
            fontSize: isMobile ? uiConfig.typography.fontSize.mobile.buttonText : uiConfig.typography.fontSize.buttonText,
            fontWeight: uiConfig.typography.fontWeight.medium,
            borderRadius: uiConfig.borderRadius.md,
          }}
        >
          <Download size={16} />
          Download QR Code
        </button> */}
      </CardContent>
    </Card>
  );
} 
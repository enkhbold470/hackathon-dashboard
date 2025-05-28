import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { Analytics } from "@vercel/analytics/react"
import Navigation from "@/components/navigation";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    url: siteConfig.ogUrl,
    type: siteConfig.ogType as "website",
    images: [{
      url: siteConfig.ogImage.url,
      height: siteConfig.ogImage.height,
      width: siteConfig.ogImage.width
    }],
  },

  authors: {
    name: siteConfig.name,
    url: siteConfig.url,
  },
  metadataBase: new URL(siteConfig.url),
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <Providers>
            <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      DAHacks 2025
                    </h1>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg transition-colors">
                          Sign Up
                        </button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                  </div>
                </div>
              </div>
            </header>
            
            <Navigation />
            
            <main className="min-h-screen">{children}</main>
            <Toaster />
          </Providers>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}

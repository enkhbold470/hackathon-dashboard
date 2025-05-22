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
import { linkToMatchAnza } from "@/lib/applicationData";
import Link from "next/link";

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
            <header className="flex justify-between items-center p-4 gap-4 h-16">
            
              <Link href={linkToMatchAnza} className="text-blue-500 group relative" target="_blank"> 
                Looking for teammate? Click here!
                <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded-md -bottom-8 left-0 whitespace-nowrap">
                  Platform for finding teammates based on project interests
                </span>
              </Link>
              
              <div className="flex gap-4">
                <SignedOut>
                  <SignInButton />
                  <SignUpButton />
              </SignedOut>
              <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </header>
            <main>{children}</main>
            <Toaster />
          </Providers>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}

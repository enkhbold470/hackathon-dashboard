import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
export const metadata: Metadata = {
  title: "Typescript App",
  description: "Created with Nextjs",
  generator: "Typescript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider waitlistUrl="/">   
     <html lang="en">
      <body>

      {/* <header className="flex justify-end items-center p-4 gap-4 h-16 border">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header> */}
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
    </ClerkProvider>

  );
}

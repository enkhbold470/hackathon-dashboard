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
  useUser
} from '@clerk/nextjs'
import colors from "@/lib/colors"
export const metadata: Metadata = {
  title: "DA Hacks 3.5 Portal",
  description: "Apply as a Hacker here!",
  generator: "Typescript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ClerkProvider >   
     <html lang="en">
      <body>
      <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
    </ClerkProvider>

  );
}

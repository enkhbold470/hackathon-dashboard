"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NavbarProps {
  showMatches?: boolean;
}

export default function Navbar({ showMatches = true }: NavbarProps) {
  return (
    <header className="border-b flex justify-center">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex pl-3">
          <Link href="/matcher" className="flex items-center space-x-2">
            <span className="font-bold">DA Hacks 3.5</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            {showMatches ? (
              <Button variant="outline" asChild>
                <Link href="/matcher/matches">
                  Matches
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/home">
                  Home
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/">
                Back to Portal
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
} 
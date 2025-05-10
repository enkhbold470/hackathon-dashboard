"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NavbarProps {
  showMatches?: boolean;
}

export default function Navbar({ showMatches = true }: NavbarProps) {
  return (
    <nav className="flex justify-center gap-2 w-full mb-4">
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
  );
} 
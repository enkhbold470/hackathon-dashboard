"use client";

import MatchingUI from "@/components/matcher/MatchingUI";
import Navbar from "@/components/matcher/Navbar";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Matcher() {
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    fetch('/api/db/get')
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.application && (data.application.status === "accepted" || data.application.status === "confirmed")) {
          setCanAccess(true);
        } else {
          redirect("/");
        }
      });
  }, []);

  const PROFILES = [
    {
      id: "1",
      name: "Alice",
      avatar: "https://i.pravatar.cc/150?img=1",
      bio: "test 1",
    },
    {
      id: "2",
      name: "Bob",
      avatar: "https://i.pravatar.cc/150?img=2",
      bio: "test 2",
    },
    {
      id: "3",
      name: "Carol",
      avatar: "https://i.pravatar.cc/150?img=3",
      bio: "test 3",
    },
  ];

  if (canAccess) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex min-h-screen flex-col items-center p-10 gap-5 overflow-x-hidden">
          <p className="text-sm text-gray-500 dark:text-gray-400">Swipe right to match, swipe left to pass.</p>
          <div className="w-full max-w-md">
            <MatchingUI profiles={PROFILES} />
          </div>
        </main>
      </div>
    );
  }
}

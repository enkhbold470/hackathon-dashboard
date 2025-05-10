"use client";

import Navbar from "@/components/matcher/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Matches() {
  // TODO: Replace with actual matched profiles from backend
  const MATCHED_PROFILES = [
    {
      id: "1",
      name: "Alice",
      avatar: "vercel.svg",
      bio: "test 1",
    },
    {
      id: "2",
      name: "Bob",
      avatar: "vercel.svg",
      bio: "test 2",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar showMatches={false} />
      <main className="flex min-h-screen flex-col items-center p-10 gap-5">
        <div className="flex w-full justify-between items-center">
          <h1 className="text-2xl font-bold">Your Matches</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {MATCHED_PROFILES.map((profile) => (
            <Card key={profile.id} className="overflow-hidden">
              <div 
                className="w-full h-48 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${profile.avatar})` }}
              />
              <CardHeader>
                <CardTitle>{profile.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
} 
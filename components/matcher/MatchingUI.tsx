"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useMemo, useState } from "react";
import TinderCard from "react-tinder-card";
import { toast } from "sonner";
import styles from './MatchingUI.module.css';

interface Profile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

interface MatchingUIProps {
  profiles: Profile[];
}

export default function MatchingUI({
  profiles: initialProfiles,
}: MatchingUIProps) {
  const [cards, setCards] = useState<Profile[]>(initialProfiles);
  const [currentIndex, setCurrentIndex] = useState(cards.length - 1);
  const [lastDirection, setLastDirection] = useState<string | null>(null);

  const [matched, setMatched] = React.useState<string[]>([]);
  const [passed, setPassed] = React.useState<string[]>([]);
  const [lastAction, setLastAction] = React.useState<{ type: 'match' | 'pass', profile: Profile } | null>(null);
  const [isFlashing, setIsFlashing] = React.useState(false);

  useEffect(() => {
    setCurrentIndex(cards.length - 1);
  }, [cards]);

  const childRefs = useMemo(
    () => cards.map(() => React.createRef<any>()),
    [cards]
  );

  const handleMatch = (profile: Profile) => {
    setMatched((prev) => [...prev, profile.id]);
    setLastAction({ type: 'match', profile });
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 500); // Reset after animation
    toast.success("You matched with " + profile.name, {
      action: {
        label: "Undo",
        onClick: () => {
          setMatched((prev) => prev.filter(id => id !== profile.id));
          setCards((prev) => {
            if (!prev.some(p => p.id === profile.id)) {
              return [...prev, profile];
            }
            return prev;
          });
          setLastAction(null);
        },
      },
    });
  };

  const handlePass = (profile: Profile) => {
    setPassed((prev) => [...prev, profile.id]);
    setLastAction({ type: 'pass', profile });
    toast("You passed " + profile.name, {
      action: {
        label: "Undo",
        onClick: () => {
          setPassed((prev) => prev.filter(id => id !== profile.id));
          setCards((prev) => {
            if (!prev.some(p => p.id === profile.id)) {
              return [...prev, profile];
            }
            return prev;
          });
          setLastAction(null);
        },
      },
    });
  };

  const handleSwipe = (direction: string, profile: Profile) => {
    setLastDirection(direction);

    if (direction === "right") {
      handleMatch(profile);
    } else {
      handlePass(profile);
    }
    setCards((prev) => prev.filter((p) => p.id !== profile.id));
  };

  const swipe = (dir: "left" | "right") => {
    if (currentIndex < 0 || !childRefs[currentIndex]?.current) return;
    childRefs[currentIndex].current.swipe(dir);

    setLastDirection(dir);
    if (dir === "right") {
      handleMatch(cards[currentIndex]);
    } else {
      handlePass(cards[currentIndex]);
    }
    setCards((prev) => prev.filter((p) => p.id !== cards[currentIndex].id));
  };

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">No more profiles!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {isFlashing && (
        <div 
          className={`fixed inset-0 bg-green-500/10 pointer-events-none ${styles.flash}`}
        />
      )}
      <div className="relative w-80 h-96">
        {cards.map((profile, index) => (
          <TinderCard
            ref={childRefs[index]}
            key={profile.id}
            onSwipe={(dir) => handleSwipe(dir, profile)}
            preventSwipe={["up", "down"]}
          >
            <Card
              className="w-80 h-96 overflow-hidden rounded-2xl shadow-lg absolute top-0 left-0 cursor-pointer select-none"
              style={{ zIndex: index }}
            >
              <div 
                className="relative w-full h-48 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${profile.avatar})` }}
              />
              <CardHeader>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>
          </TinderCard>
        ))}
      </div>

      <CardFooter className="flex gap-4 mt-4">
        <Button
          variant="outline"
          onClick={() => swipe("left")}
          className="cursor-pointer"
        >
          Pass
        </Button>
        <Button onClick={() => swipe("right")} className="cursor-pointer">
          Match
        </Button>
      </CardFooter>
    </div>
  );
}

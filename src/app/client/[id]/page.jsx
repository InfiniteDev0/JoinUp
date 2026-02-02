"use client";

import { Button } from "@/components/ui/button";
import { HyperText } from "@/components/ui/hyper-text";
import {
  ChartNoAxesGantt,
  Play,
  User2,
  Brain,
  MessageCircle,
  Lightbulb,
  Palette,
  HelpCircle,
  Users,
  Sparkles,
  Quote,
  Trophy,
  Zap,
  Lock,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const page = () => {
  const [userName, setUserName] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);

  const handleGameClick = (game) => {
    if (game.id > 2) {
      toast.info("Game coming soon!");
    } else {
      setSelectedGame(game.id);
    }
  };

  const games = [
    {
      id: 1,
      name: "Trivia Question",
      icon: Brain,
      bgImage:
        "https://www.citypng.com/public/uploads/preview/question-marks-white-sketch-drawing-pattern-doddle-png-704081694705460utw1thhcc3.png?v=2025091316",
    },
    {
      id: 2,
      name: "Imposter",
      icon: MessageCircle,
      bgImage:
        "https://plus.unsplash.com/premium_photo-1672759360872-791a5ba6e2cc?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8b2RkJTIwb25lJTIwb3V0fGVufDB8fDB8fHww",
    },
    {
      id: 3,
      name: "Truth or Dare",
      icon: Sparkles,
      bgImage:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop",
    },
    {
      id: 4,
      name: "Pictionary",
      icon: Palette,
      bgImage:
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop",
    },
    {
      id: 5,
      name: "20 Questions",
      icon: HelpCircle,
      bgImage:
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=400&fit=crop",
    },
    {
      id: 6,
      name: "Charades",
      icon: Users,
      bgImage:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop",
    },
    {
      id: 7,
      name: "Never Have I Ever",
      icon: Quote,
      bgImage:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop",
    },
    {
      id: 8,
      name: "Two Truths One Lie",
      icon: Lightbulb,
      bgImage:
        "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=400&h=400&fit=crop",
    },
    {
      id: 9,
      name: "Riddle Master",
      icon: Zap,
      bgImage:
        "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=400&h=400&fit=crop",
    },
    {
      id: 10,
      name: "Quiz Battle",
      icon: Trophy,
      bgImage:
        "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop",
    },
  ];

  useEffect(() => {
    // Get user details from localStorage
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      try {
        const user = JSON.parse(userDetails);
        const displayName = user.displayName || "Friend";

        // Extract initials from display name
        const initials = displayName;

        setUserName(initials || "Friend");
      } catch (error) {
        console.error("Error parsing user details:", error);
        setUserName("Friend");
      }
    }
  }, []);

  return (
    <div className="p-5 relative bg-[#ffaa0009] h-screen w-full">
      <nav className="flex w-full items-center justify-between mb-10">
        <Button
          className={"rounded-full border-black/20 w-11 h-11"}
          variant="outline"
        >
          <ChartNoAxesGantt className="size-5" />
        </Button>
        <h1 className="changa text-3xl flex items-center">
          <HyperText animateOnHover={false} duration={1500}>
            Join
          </HyperText>
          <HyperText
            className="text-[#fa5c00]"
            animateOnHover={false}
            duration={1500}
          >
            Up
          </HyperText>
        </h1>
        <Button className={"rounded-full w-11 h-11"}>
          <User2 />
        </Button>
      </nav>
      {/* hero */}
      <div className="flex flex-col mt-10 gap-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Hey, {userName}👋</h2>
          <p className="text-sm text-muted-foreground">
            JoinUp with your friends.
          </p>
        </div>
        {/* choose a game */}
        <hr />
        <div>
          <h1 className="text-xl">Your Games</h1>
        </div>
        {/* games array in cards , game image , below it , game name , and this div is scrool able along the y axis*/}
        <div className="h-[50vh] grid grid-cols-2 gap-4 overflow-y-scroll pb-20">
          {games.map((game) => {
            const Icon = game.icon;
            const isLocked = game.id > 2;
            return (
              <div
                key={game.id}
                onClick={() => handleGameClick(game)}
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${game.bgImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                className={`rounded-md overflow-hidden transition-all cursor-pointer relative h-40 border-2 ${
                  selectedGame === game.id && !isLocked
                    ? "border-[#fa5c00]"
                    : ""
                }`}
              >
                {isLocked && (
                  <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                    <Lock className="size-3 text-white/70" />
                  </div>
                )}
                {selectedGame === game.id && !isLocked && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGame(null);
                    }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 hover:bg-white transition-all"
                  >
                    <X className="size-3 text-black" />
                  </div>
                )}
                <div
                  className={`flex flex-col items-center justify-center h-full py-6 px-4 ${
                    isLocked ? "opacity-50" : ""
                  }`}
                >
                  <Icon className="size-12 text-white mb-2" strokeWidth={1.5} />
                  <h3 className="font-semibold text-white text-center text-sm">
                    {game.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* play cta button */}
      <Button
        disabled={!selectedGame}
        className={`absolute bottom-10 left-5 right-5 rounded-full h-12 transition-all ${
          selectedGame
            ? "bg-[#fa5c00] text-black hover:bg-[#fa5c00]/90"
            : "bg-black/50 text-white/50 cursor-not-allowed"
        }`}
      >
        <Play className="size-5" />
        Start a Game
      </Button>
    </div>
  );
};

export default page;

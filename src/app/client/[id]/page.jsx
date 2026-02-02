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
  Plus,
  DoorOpen,
  History,
  Award,
  BookOpen,
  Settings,
  UserCircle,
  UserPen,
  BarChart3,
  UserPlus,
  Bell,
  LogOut,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const params = useParams();
  const [userName, setUserName] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

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
      category: "mind",
      bgImage:
        "https://www.citypng.com/public/uploads/preview/question-marks-white-sketch-drawing-pattern-doddle-png-704081694705460utw1thhcc3.png?v=2025091316",
    },
    {
      id: 2,
      name: "Imposter",
      icon: MessageCircle,
      category: "tricky",
      bgImage:
        "https://plus.unsplash.com/premium_photo-1672759360872-791a5ba6e2cc?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8b2RkJTIwb25lJTIwb3V0fGVufDB8fDB8fHww",
    },
    {
      id: 3,
      name: "Truth or Dare",
      icon: Sparkles,
      category: "group",
      bgImage:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop",
    },
    {
      id: 4,
      name: "Pictionary",
      icon: Palette,
      category: "group",
      bgImage:
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop",
    },
    {
      id: 5,
      name: "20 Questions",
      icon: HelpCircle,
      category: "mind",
      bgImage:
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=400&fit=crop",
    },
    {
      id: 6,
      name: "Charades",
      icon: Users,
      category: "group",
      bgImage:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop",
    },
    {
      id: 7,
      name: "Never Have I Ever",
      icon: Quote,
      category: "group",
      bgImage:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop",
    },
    {
      id: 8,
      name: "Two Truths One Lie",
      icon: Lightbulb,
      category: "tricky",
      bgImage:
        "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=400&h=400&fit=crop",
    },
    {
      id: 9,
      name: "Riddle Master",
      icon: Zap,
      category: "mind",
      bgImage:
        "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=400&h=400&fit=crop",
    },
    {
      id: 10,
      name: "Quiz Battle",
      icon: Trophy,
      category: "math",
      bgImage:
        "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop",
    },
  ];

  const categories = [
    { id: "all", label: "All Games" },
    { id: "mind", label: "Mind" },
    { id: "group", label: "Group Games" },
    { id: "math", label: "Math" },
    { id: "tricky", label: "Tricky" },
  ];

  const filteredGames =
    selectedCategory === "all"
      ? games
      : games.filter((game) => game.category === selectedCategory);

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
          onClick={() => setShowMenu(true)}
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
        <Button
          onClick={() => setShowProfile(true)}
          className={"rounded-full w-11 h-11"}
        >
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
          <Button
            disabled={!selectedGame}
            onClick={() => {
              if (selectedGame) {
                router.push(`/client/${params.id}/start?game=${selectedGame}`);
              }
            }}
            className={`rounded-full h-12 transition-all ${
              selectedGame
                ? "bg-[#fa5c00] text-black hover:bg-[#fa5c00]/90"
                : "bg-black/50 text-white/50 cursor-not-allowed"
            }`}
          >
            <Play className="size-5" />
            Start a Game
          </Button>
        </div>
        {/* choose a game */}
        <hr />
        <div>
          <h1 className="text-xl">Your Games</h1>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedCategory === category.id
                  ? "bg-[#fa5c00] text-white"
                  : "bg-[#1a1a1a] text-white/70 hover:text-white"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* games array in cards , game image , below it , game name , and this div is scrool able along the y axis*/}
        <div className="h-[50vh] grid grid-cols-2 gap-4 overflow-y-scroll pb-20">
          {filteredGames.map((game) => {
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
      {/* Menu Panel - Slides from Left */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Menu</h2>
                <Button
                  onClick={() => setShowMenu(false)}
                  variant="ghost"
                  className="rounded-full w-10 h-10 p-0"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div className="space-y-2">
                <MenuItem
                  icon={Plus}
                  label="Create Game Room"
                  onClick={() => toast.info("Create room coming soon!")}
                />
                <MenuItem
                  icon={DoorOpen}
                  label="Join Room"
                  onClick={() => toast.info("Join room coming soon!")}
                />
                <MenuItem
                  icon={Users}
                  label="Active Rooms"
                  onClick={() => toast.info("Active rooms coming soon!")}
                />
                <MenuItem
                  icon={History}
                  label="Game History"
                  onClick={() => toast.info("History coming soon!")}
                />
                <MenuItem
                  icon={Award}
                  label="Leaderboard"
                  onClick={() => toast.info("Leaderboard coming soon!")}
                />
                <MenuItem
                  icon={BookOpen}
                  label="How to Play"
                  onClick={() => toast.info("Tutorial coming soon!")}
                />
                <MenuItem
                  icon={Settings}
                  label="Settings"
                  onClick={() => toast.info("Settings coming soon!")}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile Panel - Slides from Right */}
      <AnimatePresence>
        {showProfile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-80 bg-white z-50 shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Profile</h2>
                <Button
                  onClick={() => setShowProfile(false)}
                  variant="ghost"
                  className="rounded-full w-10 h-10 p-0"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[#fa5c00] flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <h3 className="text-xl font-semibold">{userName}</h3>
              </div>

              <div className="space-y-2">
                <MenuItem
                  icon={UserCircle}
                  label="View Profile"
                  onClick={() => toast.info("Profile coming soon!")}
                />
                <MenuItem
                  icon={UserPen}
                  label="Edit Profile"
                  onClick={() => toast.info("Edit profile coming soon!")}
                />
                <MenuItem
                  icon={BarChart3}
                  label="My Stats"
                  onClick={() => toast.info("Stats coming soon!")}
                />
                <MenuItem
                  icon={UserPlus}
                  label="Friends"
                  onClick={() => toast.info("Friends coming soon!")}
                />
                <MenuItem
                  icon={Bell}
                  label="Notifications"
                  onClick={() => toast.info("Notifications coming soon!")}
                />
                <MenuItem
                  icon={Settings}
                  label="Account Settings"
                  onClick={() => toast.info("Settings coming soon!")}
                />
                <div className="pt-4 border-t mt-4">
                  <MenuItem
                    icon={LogOut}
                    label="Logout"
                    onClick={() => {
                      localStorage.removeItem("userDetails");
                      window.location.href = "/auth";
                    }}
                    className="text-red-600 hover:bg-red-50"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// MenuItem Component
const MenuItem = ({ icon: Icon, label, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
  >
    <Icon className="size-5" />
    <span className="font-medium">{label}</span>
  </button>
);

export default Page;

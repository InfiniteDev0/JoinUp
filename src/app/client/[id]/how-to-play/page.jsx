"use client";

import { HyperText } from "@/components/ui/hyper-text";
import {
  ArrowLeft,
  Trophy,
  Target,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

export default function HowToPlayPage() {
  const router = useRouter();

  const games = [
    {
      id: 1,
      name: "Trivia Question",
      icon: "🧠",
      description: "Test your knowledge across various categories",
      rules: [
        "Answer 5 multiple-choice questions",
        "Each correct answer earns points",
        "Timer runs for each question",
        "Highest score wins",
      ],
    },
    {
      id: 2,
      name: "Imposter",
      icon: "🎭",
      description: "Find the imposter among your friends",
      rules: [
        "One player is secretly the imposter",
        "Everyone gets a word except the imposter",
        "Discuss and find who doesn't have the word",
        "Vote to eliminate the imposter",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#ffaa0009] p-5">
      {/* Header */}
      <nav className="flex w-full items-center justify-between mb-10">
        <Button
          onClick={() => router.back()}
          className="rounded-full border-black/20 w-11 h-11"
          variant="outline"
        >
          <ArrowLeft className="size-5" />
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
        <div className="w-11" />
      </nav>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How to Play</h2>
          <p className="text-muted-foreground text-lg">
            Learn the rules and start playing with friends!
          </p>
        </div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="size-6 text-[#fa5c00]" />
            Quick Start Guide
          </h3>
          <ol className="space-y-3 text-lg">
            <li className="flex gap-3">
              <span className="font-bold text-[#fa5c00]">1.</span>
              <span>Select a game from the dashboard</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#fa5c00]">2.</span>
              <span>Configure game settings (players, category, timer)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#fa5c00]">3.</span>
              <span>Share the room code with friends</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#fa5c00]">4.</span>
              <span>Wait for everyone to join and ready up</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#fa5c00]">5.</span>
              <span>Play the game and have fun!</span>
            </li>
          </ol>
        </motion.div>

        {/* Game Rules */}
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{game.icon}</span>
              <div>
                <h3 className="text-2xl font-bold">{game.name}</h3>
                <p className="text-muted-foreground">{game.description}</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Rules:</h4>
              <ul className="space-y-2">
                {game.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#fa5c00] mt-1">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#fa5c00] text-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-2xl font-bold mb-4">💡 Pro Tips</h3>
          <ul className="space-y-2">
            <li>• Use voice chat for better communication in Imposter</li>
            <li>• Play regularly to improve your trivia knowledge</li>
            <li>• Invite friends for more competitive games</li>
            <li>• Check your stats to track your progress</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

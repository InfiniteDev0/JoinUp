"use client";

import { HyperText } from "@/components/ui/hyper-text";
import {
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

export default function StatsPage() {
  const router = useRouter();
  const params = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userData = JSON.parse(userDetails);
      setUser(userData);
      loadStats(userData.uid);
    }
  }, []);

  const loadStats = async (uid) => {
    try {
      const data = await api.getUserStats(uid);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ffaa0009]">
        <Loader2 className="size-8 animate-spin text-[#fa5c00]" />
      </div>
    );
  }

  const winRate =
    stats?.gamesPlayed > 0
      ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
      : 0;

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

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg text-center"
        >
          <div className="w-24 h-24 rounded-full bg-[#fa5c00] flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            {user?.displayName
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold mb-1">{user?.displayName}</h2>
          <p className="text-muted-foreground">{user?.email}</p>
        </motion.div>

        {/* Overall Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <Trophy className="size-8 text-[#fa5c00] mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats?.gamesWon || 0}</p>
            <p className="text-sm text-muted-foreground">Wins</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <Target className="size-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats?.gamesPlayed || 0}</p>
            <p className="text-sm text-muted-foreground">Games Played</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <TrendingUp className="size-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{winRate}%</p>
            <p className="text-sm text-muted-foreground">Win Rate</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <Zap className="size-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats?.totalScore || 0}</p>
            <p className="text-sm text-muted-foreground">Total Score</p>
          </div>
        </motion.div>

        {/* Game-Specific Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="size-6 text-[#fa5c00]" />
            Game Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">🧠 Trivia Question</p>
                <p className="text-sm text-muted-foreground">
                  {stats?.triviaGames || 0} games • {stats?.triviaWins || 0}{" "}
                  wins
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#fa5c00]">
                  {stats?.triviaGames > 0
                    ? ((stats.triviaWins / stats.triviaGames) * 100).toFixed(0)
                    : 0}
                  %
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">🎭 Imposter</p>
                <p className="text-sm text-muted-foreground">
                  {stats?.imposterGames || 0} games • {stats?.imposterWins || 0}{" "}
                  wins
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#fa5c00]">
                  {stats?.imposterGames > 0
                    ? (
                        (stats.imposterWins / stats.imposterGames) *
                        100
                      ).toFixed(0)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-[#fa5c00] to-orange-600 text-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold mb-4">🏆 Achievements</h3>
          <div className="grid grid-cols-2 gap-3">
            {stats?.gamesPlayed >= 1 && (
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <p className="text-2xl mb-1">🎮</p>
                <p className="text-xs">First Game</p>
              </div>
            )}
            {stats?.gamesWon >= 1 && (
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <p className="text-2xl mb-1">🥇</p>
                <p className="text-xs">First Win</p>
              </div>
            )}
            {stats?.gamesPlayed >= 10 && (
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <p className="text-2xl mb-1">🔥</p>
                <p className="text-xs">10 Games</p>
              </div>
            )}
            {stats?.gamesWon >= 5 && (
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <p className="text-2xl mb-1">⭐</p>
                <p className="text-xs">5 Wins</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

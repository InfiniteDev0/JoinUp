"use client";

import { HyperText } from "@/components/ui/hyper-text";
import {
  ArrowLeft,
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  Target,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const router = useRouter();
  const params = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userData = JSON.parse(userDetails);
      setUser(userData);
      loadLeaderboard();
      loadUserRank(userData.uid);
    }
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await api.getLeaderboard(50);
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRank = async (uid) => {
    try {
      const data = await api.getUserRank(uid);
      setUserRank(data);
    } catch (error) {
      console.error("Failed to load rank:", error);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="size-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="size-6 text-gray-400" />;
    if (rank === 3) return <Medal className="size-6 text-orange-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ffaa0009]">
        <Loader2 className="size-8 animate-spin text-[#fa5c00]" />
      </div>
    );
  }

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
        {/* User Rank Card */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#fa5c00] to-orange-600 rounded-2xl p-6 shadow-lg text-white"
          >
            <h3 className="text-lg font-bold mb-3">Your Rank</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                  #{userRank.rank}
                </div>
                <div>
                  <p className="font-semibold text-lg">{user?.displayName}</p>
                  <p className="text-sm text-white/80">
                    Top{" "}
                    {((userRank.rank / userRank.totalPlayers) * 100).toFixed(1)}
                    %
                  </p>
                </div>
              </div>
              <TrendingUp className="size-8" />
            </div>
          </motion.div>
        )}

        {/* Leaderboard Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="size-7 text-[#fa5c00]" />
            Leaderboard
          </h2>
        </div>

        {/* Empty State */}
        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <Trophy className="size-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Players Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to play games and claim the top spot!
            </p>
            <Button
              onClick={() => router.push(`/client/${params.id}`)}
              className="bg-[#fa5c00] text-white hover:bg-[#fa5c00]/90"
            >
              Start Playing
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((player, index) => {
              const rank = index + 1;
              const isCurrentUser = player.uid === user?.uid;

              return (
                <motion.div
                  key={player.uid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`bg-white rounded-xl p-4 shadow-lg flex items-center gap-4 ${
                    isCurrentUser ? "ring-2 ring-[#fa5c00]" : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 text-center">
                    {getRankIcon(rank) || (
                      <span className="text-2xl font-bold text-gray-600">
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#fa5c00] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {player.displayName?.charAt(0).toUpperCase()}
                  </div>

                  {/* Name and Stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold truncate">{player.displayName}</p>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-[#fa5c00] text-white text-xs rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Trophy className="size-3" />
                        {player.stats.gamesWon} wins
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="size-3" />
                        {player.stats.totalScore} pts
                      </span>
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-[#fa5c00]">
                      {player.stats.gamesPlayed > 0
                        ? (
                            (player.stats.gamesWon / player.stats.gamesPlayed) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

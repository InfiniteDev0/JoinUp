"use client";

import { Button } from "@/components/ui/button";
import { HyperText } from "@/components/ui/hyper-text";
import { Home, Trophy, Crown, Target, Users, Loader2 } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

const ResultPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");

  const [roomData, setRoomData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    // Get current user
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      setCurrentUser(JSON.parse(userDetails));
    }

    // Fetch final room data
    const fetchRoomData = async () => {
      if (roomId) {
        const docSnap = await getDoc(doc(db, "rooms", roomId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setRoomData({ id: docSnap.id, ...data });

          // Determine winner
          if (data.gameId === 1) {
            // Trivia - highest score
            const sortedPlayers = [...data.players].sort(
              (a, b) => (b.score || 0) - (a.score || 0),
            );
            setWinner(sortedPlayers[0]);
          } else if (data.gameId === 2) {
            // Imposter - find who got the most votes
            const voteCounts = {};
            data.players.forEach((player) => {
              if (player.vote) {
                voteCounts[player.vote] = (voteCounts[player.vote] || 0) + 1;
              }
            });

            const mostVotedId = Object.keys(voteCounts).reduce((a, b) =>
              voteCounts[a] > voteCounts[b] ? a : b,
            );

            const mostVotedPlayer = data.players.find(
              (p) => p.uid === mostVotedId,
            );
            const actualImposter = data.players.find((p) => p.isImposter);

            // Winner is determined by if they found the imposter
            if (mostVotedPlayer?.uid === actualImposter?.uid) {
              // Players found the imposter - non-imposters win
              setWinner(data.players.find((p) => !p.isImposter));
            } else {
              // Imposter wins
              setWinner(actualImposter);
            }
          }
        }
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  useEffect(() => {
    // Trigger confetti for winner
    if (winner && currentUser && winner.uid === currentUser.uid) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [winner, currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ffaa0009]">
        <Loader2 className="size-8 animate-spin text-[#fa5c00]" />
      </div>
    );
  }

  const sortedPlayers =
    roomData?.gameId === 1
      ? [...(roomData?.players || [])].sort(
          (a, b) => (b.score || 0) - (a.score || 0),
        )
      : roomData?.players || [];

  const isCurrentUserWinner = winner?.uid === currentUser?.uid;

  return (
    <div className="p-5 relative bg-[#ffaa0009] min-h-screen w-full">
      {/* Header */}
      <nav className="flex w-full items-center justify-center mb-10">
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
      </nav>

      <div className="flex flex-col gap-6 max-w-md mx-auto">
        {/* Winner Announcement */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="text-center"
        >
          <Trophy className="size-20 text-[#fa5c00] mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">
            {isCurrentUserWinner ? "You Won! 🎉" : "Game Over!"}
          </h2>
          <p className="text-lg text-muted-foreground">{roomData?.gameName}</p>
        </motion.div>

        {/* Winner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Winner</h3>
            <Crown className="size-8" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {winner?.displayName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-2xl font-bold">{winner?.displayName}</p>
              {roomData?.gameId === 1 && (
                <p className="text-sm opacity-90">
                  Score: {winner?.score || 0}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Users className="size-5" />
            Final Results
          </h3>
          <div className="space-y-2">
            {sortedPlayers.map((player, index) => (
              <motion.div
                key={player.uid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`rounded-lg p-4 flex items-center justify-between ${
                  player.uid === winner?.uid
                    ? "bg-[#fa5c00]/10 border-2 border-[#fa5c00]"
                    : "bg-[#1a1a1a]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#fa5c00]/20 flex items-center justify-center font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#fa5c00] flex items-center justify-center text-white font-bold">
                    {player.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {player.displayName}
                    </p>
                    {roomData?.gameId === 2 && player.isImposter && (
                      <p className="text-xs text-red-500">Imposter</p>
                    )}
                  </div>
                </div>
                {roomData?.gameId === 1 && (
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-white/70" />
                    <span className="font-bold text-white">
                      {player.score || 0}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Game Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-[#1a1a1a] rounded-lg p-4 space-y-2 text-sm"
        >
          <div className="flex justify-between text-white">
            <span className="text-white/70">Game Type:</span>
            <span className="font-semibold">{roomData?.gameName}</span>
          </div>
          <div className="flex justify-between text-white">
            <span className="text-white/70">Category:</span>
            <span className="font-semibold capitalize">
              {roomData?.category}
            </span>
          </div>
          <div className="flex justify-between text-white">
            <span className="text-white/70">Players:</span>
            <span className="font-semibold">{roomData?.players.length}</span>
          </div>
          {roomData?.gameId === 1 && currentUser && (
            <div className="flex justify-between text-white">
              <span className="text-white/70">Your Score:</span>
              <span className="font-semibold">
                {roomData?.players.find((p) => p.uid === currentUser.uid)
                  ?.score || 0}
              </span>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => router.push(`/client/${params.id}`)}
            className="flex-1 bg-[#fa5c00] text-black hover:bg-[#fa5c00]/90 rounded-full h-14 text-lg font-semibold"
          >
            <Home className="size-5" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

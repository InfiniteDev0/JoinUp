"use client";

import { Button } from "@/components/ui/button";
import { HyperText } from "@/components/ui/hyper-text";
import {
  Home,
  Trophy,
  Crown,
  Target,
  Users,
  Loader2,
  Play,
  X,
  Check,
} from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "sonner";
import { api } from "@/lib/api";
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
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Get current user
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const user = JSON.parse(userDetails);
      setCurrentUser(user);
    }

    // Listen to room for deletion by host
    if (roomId) {
      const unsubscribe = onSnapshot(doc(db, "rooms", roomId), (docSnap) => {
        if (!docSnap.exists()) {
          // Room was deleted by host, redirect all players
          localStorage.removeItem("currentRoomId");
          localStorage.removeItem("currentGameStatus");
          localStorage.removeItem("currentRoomData");
          toast.success("Host ended the room");
          router.push(`/client/${params.id}`);
        } else {
          const data = docSnap.data();
          setRoomData({ id: docSnap.id, ...data });

          // Check if current user is host
          if (userDetails) {
            const user = JSON.parse(userDetails);
            const hostPlayer = data.players.find(
              (p) => p.uid === user.uid && p.isHost,
            );
            setIsHost(!!hostPlayer);
          }

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

            const voteKeys = Object.keys(voteCounts);
            if (voteKeys.length > 0) {
              const mostVotedId = voteKeys.reduce((a, b) =>
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
            } else {
              // No votes cast - imposter wins by default
              const actualImposter = data.players.find((p) => p.isImposter);
              setWinner(actualImposter);
            }
          }

          setLoading(false);
        }
      });

      return () => unsubscribe();
    }
  }, [roomId, params.id, router]);

  useEffect(() => {
    // Save game to backend and trigger confetti
    if (winner && currentUser && roomData && !loading) {
      // Save game result to backend
      const gameData = {
        roomCode: roomData.code,
        gameId: roomData.gameId,
        gameName: roomData.gameName,
        category: roomData.category,
        players: roomData.players.map((p) => ({
          uid: p.uid,
          displayName: p.displayName,
          photoURL: p.photoURL,
          score: p.score || 0,
          isWinner: p.uid === winner.uid,
          isImposter: p.isImposter || false,
        })),
        winner: {
          uid: winner.uid,
          displayName: winner.displayName,
          photoURL: winner.photoURL,
        },
        duration: roomData.timer,
      };

      api
        .saveGameResult(gameData)
        .catch((err) => console.error("Failed to save game:", err));

      // Trigger confetti for winner
      if (winner.uid === currentUser.uid) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  }, [winner, currentUser, roomData, loading]);

  const handlePlayAgain = async () => {
    if (!roomData || !isHost) return;

    try {
      // Reset room for new game - keep players but reset game data
      const resetPlayers = roomData.players.map((player) => ({
        uid: player.uid,
        displayName: player.displayName,
        photoURL: player.photoURL,
        isHost: player.isHost,
        isReady: player.isHost, // Host is always ready
        score: 0,
        vote: null,
        isImposter: false,
        assignedWord: null,
      }));

      await updateDoc(doc(db, "rooms", roomId), {
        status: "waiting",
        players: resetPlayers,
        gameId: null,
        gameName: null,
        category: null,
        timer: null,
      });

      toast.success("Room reset! Select a new game.");
      router.push(`/client/${params.id}/start?room=${roomId}`);
    } catch (error) {
      console.error("Error resetting room:", error);
      toast.error("Failed to reset room");
    }
  };

  const handleEndRoom = async () => {
    if (!roomData || !isHost) return;

    try {
      await deleteDoc(doc(db, "rooms", roomId));

      // Clear room data from localStorage
      localStorage.removeItem("currentRoomId");
      localStorage.removeItem("currentGameStatus");
      localStorage.removeItem("currentRoomData");

      toast.success("Room ended successfully");
      router.push(`/client/${params.id}`);
    } catch (error) {
      console.error("Error ending room:", error);
      toast.error("Failed to end room");
    }
  };

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
        {/* Winner Announcement - Only for Trivia */}
        {roomData?.gameId === 1 && (
          <>
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
              <p className="text-lg text-muted-foreground">
                {roomData?.gameName}
              </p>
            </motion.div>

            {/* Winner Card - Only for Trivia */}
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
                  <p className="text-sm opacity-90">
                    Score: {winner?.score || 0}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Imposter Game Title */}
        {roomData?.gameId === 2 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-center"
          >
            <Trophy className="size-20 text-[#fa5c00] mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Final Results</h2>
            <p className="text-lg text-muted-foreground">
              {roomData?.gameName}
            </p>
          </motion.div>
        )}

        {/* Leaderboard */}
        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Users className="size-5" />
            {roomData?.gameId === 2 ? "Players" : "Final Results"}
          </h3>
          <div className="space-y-2">
            {sortedPlayers.map((player, index) => (
              <motion.div
                key={player.uid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`rounded-lg p-4 flex items-center justify-between ${
                  roomData?.gameId === 1 && player.uid === winner?.uid
                    ? "bg-[#fa5c00]/10 border-2 border-[#fa5c00]"
                    : "bg-[#1a1a1a]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {roomData?.gameId === 1 && (
                    <div className="w-8 h-8 rounded-full bg-[#fa5c00]/20 flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-full bg-[#fa5c00] flex items-center justify-center text-white font-bold">
                    {player.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {player.displayName}
                    </p>
                    {roomData?.gameId === 2 &&
                      player.assignedWord === "IMPOSTER" && (
                        <p className="text-xs text-red-500">Imposter</p>
                      )}
                  </div>
                </div>
                {roomData?.gameId === 1 ? (
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-white/70" />
                    <span className="font-bold text-white">
                      {player.score || 0}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full">
                    {player.assignedWord === "IMPOSTER" ? (
                      <X
                        className="size-6 text-red-500 font-bold"
                        strokeWidth={3}
                      />
                    ) : (
                      <Check
                        className="size-6 text-green-500 font-bold"
                        strokeWidth={3}
                      />
                    )}
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
        <div className="space-y-3">
          {isHost && roomData?.gameId === 1 && (
            <div className="flex gap-3">
              <Button
                onClick={handlePlayAgain}
                className="flex-1 bg-[#fa5c00] text-white hover:bg-[#fa5c00]/90 rounded-full h-14 text-lg font-semibold gap-2"
              >
                <Play className="size-5" />
                Play Another Game
              </Button>
              <Button
                onClick={handleEndRoom}
                className="flex-1 bg-red-500 text-white hover:bg-red-600 rounded-full h-14 text-lg font-semibold gap-2"
              >
                <X className="size-5" />
                End Room
              </Button>
            </div>
          )}
          {isHost && roomData?.gameId === 2 && (
            <Button
              onClick={handleEndRoom}
              className="w-full bg-red-500 text-white hover:bg-red-600 rounded-full h-14 text-lg font-semibold gap-2"
            >
              <X className="size-5" />
              End Room
            </Button>
          )}
          {!isHost && (
            <div className="text-center p-6 bg-[#1a1a1a] rounded-lg">
              <p className="text-white/70 text-sm">
                Waiting for host to end the room...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

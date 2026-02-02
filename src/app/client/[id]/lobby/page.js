"use client";

import { Button } from "@/components/ui/button";
import { HyperText } from "@/components/ui/hyper-text";
import {
  ArrowLeft,
  Copy,
  Check,
  Users,
  Crown,
  Loader2,
  UserPlus,
} from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const LobbyPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");

  const [roomData, setRoomData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const user = JSON.parse(userDetails);
      setCurrentUser(user);

      // Update user's current room in backend
      if (roomId) {
        api
          .updateCurrentRoom(user.uid, roomId)
          .catch((err) => console.error("Failed to update current room:", err));
      }
    }

    // Listen to room updates
    if (roomId) {
      const unsubscribe = onSnapshot(doc(db, "rooms", roomId), (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setRoomData({ id: doc.id, ...data });

          // Store room ID and data for friend invites
          localStorage.setItem("currentRoomId", roomId);
          localStorage.setItem("currentRoomData", JSON.stringify(data));

          // Check if game should start
          if (data.status === "playing") {
            router.push(`/client/${params.id}/game?room=${roomId}`);
          }
        } else {
          toast.error("Room not found");
          router.push(`/client/${params.id}`);
        }
        setLoading(false);
      });

      return () => {
        unsubscribe();
        // Clear room when leaving lobby
        if (userDetails) {
          const user = JSON.parse(userDetails);
          api
            .updateCurrentRoom(user.uid, null)
            .catch((err) =>
              console.error("Failed to clear current room:", err),
            );
        }
      };
    }
  }, [roomId, params.id, router]);

  const handleCopyCode = () => {
    if (roomData?.code) {
      navigator.clipboard.writeText(roomData.code);
      setCopied(true);
      toast.success("Room code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleReady = async () => {
    if (!roomData || !currentUser) return;

    try {
      const updatedPlayers = roomData.players.map((player) =>
        player.uid === currentUser.uid
          ? { ...player, isReady: !player.isReady }
          : player,
      );

      await updateDoc(doc(db, "rooms", roomId), {
        players: updatedPlayers,
      });
    } catch (error) {
      console.error("Error toggling ready:", error);
      toast.error("Failed to update ready status");
    }
  };

  const handleStartGame = async () => {
    if (!roomData || !currentUser) return;

    // Check if user is host
    const isHost = roomData.players.find(
      (p) => p.uid === currentUser.uid,
    )?.isHost;
    if (!isHost) {
      toast.error("Only the host can start the game");
      return;
    }

    // Check if all non-host players are ready
    const allReady = roomData.players.every((p) => p.isHost || p.isReady);
    if (!allReady) {
      toast.error("All players must be ready");
      return;
    }

    try {
      await updateDoc(doc(db, "rooms", roomId), {
        status: "playing",
      });
    } catch (error) {
      console.error("Error starting game:", error);
      toast.error("Failed to start game");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ffaa0009]">
        <Loader2 className="size-8 animate-spin text-[#fa5c00]" />
      </div>
    );
  }

  const currentPlayerData = roomData?.players.find(
    (p) => p.uid === currentUser?.uid,
  );
  const isHost = currentPlayerData?.isHost;
  const allPlayersReady =
    roomData?.players.every((p) => p.isHost || p.isReady) &&
    roomData?.players.length >= 2;

  return (
    <div className="p-5 relative bg-[#ffaa0009] min-h-screen w-full">
      {/* Header */}
      <nav className="flex w-full items-center justify-between mb-10">
        <Button
          onClick={() => router.push(`/client/${params.id}`)}
          className={"rounded-full border-black/20 w-11 h-11"}
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

      {/* Lobby Content */}
      <div className="flex flex-col gap-6 max-w-md mx-auto">
        <div>
          <h2 className="text-2xl font-bold mb-2">Game Lobby</h2>
          <p className="text-sm text-muted-foreground">{roomData?.gameName}</p>
        </div>

        {/* Room Code */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 text-center">
          <p className="text-sm text-white/70 mb-2">Room Code</p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-4xl font-bold text-[#fa5c00] tracking-widest">
              {roomData?.code}
            </p>
            <Button
              onClick={handleCopyCode}
              variant="ghost"
              className="rounded-full w-10 h-10 p-0"
            >
              {copied ? (
                <Check className="size-5 text-green-500" />
              ) : (
                <Copy className="size-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-white/50 mt-2">
            Share this code with friends to join
          </p>
          <Button
            onClick={() => router.push(`/client/${params.id}/friends`)}
            className="mt-3 w-full bg-[#fa5c00] text-white hover:bg-[#fa5c00]/90 gap-2"
          >
            <UserPlus className="size-4" />
            Invite Friends
          </Button>
        </div>

        {/* Game Info */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/70">Category:</span>
            <span className="font-semibold text-white capitalize">
              {roomData?.category}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Timer:</span>
            <span className="font-semibold text-white">{roomData?.timer}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Players:</span>
            <span className="font-semibold text-white">
              {roomData?.players.length} / {roomData?.maxPlayers}
            </span>
          </div>
        </div>

        {/* Players List */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="size-5" />
            <h3 className="font-semibold">
              Players ({roomData?.players.length}/{roomData?.maxPlayers})
            </h3>
          </div>
          <div className="space-y-2">
            {roomData?.players.map((player, index) => (
              <motion.div
                key={player.uid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fa5c00] flex items-center justify-center text-white font-bold">
                    {player.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">
                        {player.displayName}
                      </p>
                      {player.isHost && (
                        <Crown className="size-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  {player.isReady ? (
                    <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-semibold">
                      Ready
                    </span>
                  ) : (
                    <span className="text-xs bg-white/10 text-white/50 px-3 py-1 rounded-full">
                      Waiting
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ready Button */}
        {!isHost && (
          <Button
            onClick={handleToggleReady}
            className={`w-full rounded-full h-14 text-lg font-semibold ${
              currentPlayerData?.isReady
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-[#fa5c00] text-black hover:bg-[#fa5c00]/90"
            }`}
          >
            {currentPlayerData?.isReady ? "Not Ready" : "Ready"}
          </Button>
        )}

        {/* Start Game Button (Host Only) */}
        {isHost && (
          <Button
            onClick={handleStartGame}
            disabled={!allPlayersReady}
            className={`w-full rounded-full h-14 text-lg font-semibold ${
              allPlayersReady
                ? "bg-[#fa5c00] text-black hover:bg-[#fa5c00]/90"
                : "bg-black/50 text-white/50 cursor-not-allowed"
            }`}
          >
            Start Game
          </Button>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;

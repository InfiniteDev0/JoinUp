"use client";

import { Button } from "@/components/ui/button";
import { HyperText } from "@/components/ui/hyper-text";
import { ArrowLeft, Users, Clock, Play } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

const StartPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("game");
  const existingRoomId = searchParams.get("room");

  const [playerCount, setPlayerCount] = useState(2);
  const [gameCategory, setGameCategory] = useState("animals");
  const [timer, setTimer] = useState(60);
  const [isCreating, setIsCreating] = useState(false);
  const [existingRoom, setExistingRoom] = useState(null);

  // Check if we're reconfiguring an existing room
  React.useEffect(() => {
    if (existingRoomId) {
      const fetchRoom = async () => {
        const docSnap = await getDoc(doc(db, "rooms", existingRoomId));
        if (docSnap.exists()) {
          const room = docSnap.data();
          setExistingRoom({ id: docSnap.id, ...room });
          setPlayerCount(room.maxPlayers || 2);
        }
      };
      fetchRoom();
    }
  }, [existingRoomId]);

  // Game configurations
  const gameConfigs = {
    1: {
      name: "Trivia Question",
      categories: [
        { id: "animals", label: "Animals" },
        { id: "football", label: "Football" },
        { id: "history", label: "History" },
        { id: "science", label: "Science" },
        { id: "entertainment", label: "Entertainment" },
      ],
    },
    2: {
      name: "Imposter",
      categories: [
        { id: "objects", label: "Objects" },
        { id: "places", label: "Places" },
        { id: "actions", label: "Actions" },
        { id: "animals", label: "Animals" },
      ],
    },
  };

  const currentGame = gameConfigs[gameId] || gameConfigs[1];

  const handleBeginGame = async () => {
    setIsCreating(true);
    try {
      // Get user details
      const userDetails = localStorage.getItem("userDetails");
      if (!userDetails) {
        toast.error("Please login first");
        router.push("/auth");
        return;
      }

      const user = JSON.parse(userDetails);

      if (existingRoom) {
        // Update existing room with new game settings
        await updateDoc(doc(db, "rooms", existingRoomId), {
          gameId: parseInt(gameId),
          gameName: currentGame.name,
          category: gameCategory,
          timer: timer,
          maxPlayers: playerCount,
        });

        toast.success("Game settings updated!");
        router.push(`/client/${params.id}/lobby?room=${existingRoomId}`);
      } else {
        // Create new room
        const roomCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

        const roomData = {
          code: roomCode,
          gameId: parseInt(gameId),
          gameName: currentGame.name,
          hostId: user.uid,
          hostName: user.displayName,
          maxPlayers: playerCount,
          category: gameCategory,
          timer: timer,
          status: "waiting",
          players: [
            {
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL,
              isReady: false,
              isHost: true,
            },
          ],
          createdAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, "rooms"), roomData);
        toast.success("Room created!");
        router.push(`/client/${params.id}/lobby?room=${docRef.id}`);
      }
    } catch (error) {
      console.error("Error creating/updating room:", error);
      toast.error(`Failed to create room: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-5 relative bg-[#ffaa0009] min-h-screen w-full">
      {/* Header */}
      <nav className="flex w-full items-center justify-between mb-10">
        <Button
          onClick={() => router.back()}
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
        <div className="w-11" /> {/* Spacer */}
      </nav>

      {/* Game Setup */}
      <div className="flex flex-col gap-6 max-w-md mx-auto">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {existingRoom ? "New Game Settings" : currentGame.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {existingRoom
              ? "Configure settings for your next game"
              : "Configure your game settings"}
          </p>
          {existingRoom && (
            <p className="text-xs text-[#fa5c00] mt-2">
              Room Code: {existingRoom.code} • {existingRoom.players.length}{" "}
              players waiting
            </p>
          )}
        </div>

        {/* Number of Players */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4" />
            Number of Players
          </label>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6, 8, 10].map((count) => (
              <button
                key={count}
                onClick={() => setPlayerCount(count)}
                className={`flex-1 py-3 rounded-lg  transition-all ${
                  playerCount === count
                    ? "bg-[#fa5c00] text-white"
                    : "bg-[#1a1a1a] text-white/70 hover:text-white"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Game Category */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Game Category</label>
          <div className="grid grid-cols-2 gap-2">
            {currentGame.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setGameCategory(category.id)}
                className={`py-3 px-4 rounded-lg  transition-all ${
                  gameCategory === category.id
                    ? "bg-[#fa5c00] text-white"
                    : "bg-[#1a1a1a] text-white/70 hover:text-white"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Clock className="size-4" />
            Game Timer (seconds)
          </label>
          <div className="flex gap-2">
            {[30, 60, 90, 120, 180].map((time) => (
              <button
                key={time}
                onClick={() => setTimer(time)}
                className={`flex-1 py-3 rounded-lg  transition-all ${
                  timer === time
                    ? "bg-[#fa5c00] text-white"
                    : "bg-[#1a1a1a] text-white/70 hover:text-white"
                }`}
              >
                {time}s
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/70">Game:</span>
            <span className=" text-white">{currentGame.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Players:</span>
            <span className=" text-white">{playerCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Category:</span>
            <span className=" text-white capitalize">{gameCategory}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Timer:</span>
            <span className=" text-white">{timer}s</span>
          </div>
        </div>

        {/* Begin Game Button */}
        <Button
          onClick={handleBeginGame}
          disabled={isCreating}
          className="w-full bg-[#fa5c00] text-black hover:bg-[#fa5c00]/90 rounded-full h-14 text-lg "
        >
          {isCreating ? (
            existingRoom ? (
              "Updating..."
            ) : (
              "Creating Room..."
            )
          ) : (
            <>
              <Play className="size-5" />
              {existingRoom ? "Continue to Lobby" : "Begin Game"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StartPage;

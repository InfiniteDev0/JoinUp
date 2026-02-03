"use client";

import { Button } from "@/components/ui/button";
import { HyperText } from "@/components/ui/hyper-text";
import { ArrowLeft, Loader2, DoorOpen } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import React, { useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { toast } from "sonner";

const JoinRoomPage = () => {
  const router = useRouter();
  const params = useParams();

  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = async () => {
    if (!roomCode || roomCode.length !== 6) {
      toast.error("Please enter a valid 6-character room code");
      return;
    }

    setIsJoining(true);
    try {
      // Get user details
      const userDetails = localStorage.getItem("userDetails");
      if (!userDetails) {
        toast.error("Please login first");
        router.push("/auth");
        return;
      }

      const user = JSON.parse(userDetails);

      // Find room by code
      const roomsRef = collection(db, "rooms");
      const q = query(roomsRef, where("code", "==", roomCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Room not found. Please check the code.");
        setIsJoining(false);
        return;
      }

      const roomDoc = querySnapshot.docs[0];
      const roomData = roomDoc.data();

      // Check if room is full
      if (roomData.players.length >= roomData.maxPlayers) {
        toast.error("Room is full!");
        setIsJoining(false);
        return;
      }

      // Check if user already in room
      if (roomData.players.some((p) => p.uid === user.uid)) {
        toast.info("You're already in this room!");
        router.push(`/client/${params.id}/lobby?room=${roomDoc.id}`);
        return;
      }

      // Check if game already started
      if (roomData.status !== "waiting") {
        toast.error("Game already started!");
        setIsJoining(false);
        return;
      }

      // Add player to room
      await updateDoc(doc(db, "rooms", roomDoc.id), {
        players: arrayUnion({
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isReady: false,
          isHost: false,
        }),
      });

      toast.success("Joined room!");
      router.push(`/client/${params.id}/lobby?room=${roomDoc.id}`);
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error(`Failed to join room: ${error.message}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCodeInput = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    setRoomCode(value);
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
        <div className="w-11" />
      </nav>

      {/* Join Room Content */}
      <div className="flex flex-col items-center justify-center gap-8 max-w-md mx-auto mt-20">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#fa5c00]/10 flex items-center justify-center mx-auto mb-4">
            <DoorOpen className="size-10 text-[#fa5c00]" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Join a Room</h2>
          <p className="text-sm text-muted-foreground">
            Enter the room code to join your friends
          </p>
        </div>

        {/* Room Code Input */}
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={handleCodeInput}
              placeholder="ABC123"
              maxLength={6}
              className="w-full h-16 text-center text-3xl font-bold tracking-widest bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#fa5c00] transition-colors uppercase"
            />
            <p className="text-xs text-muted-foreground text-center">
              Enter the 6-character code
            </p>
          </div>

          {/* Join Button */}
          <Button
            onClick={handleJoinRoom}
            disabled={isJoining || roomCode.length !== 6}
            className={`w-full h-14 text-lg font-semibold rounded-full ${
              roomCode.length === 6 && !isJoining
                ? "bg-[#fa5c00] text-black hover:bg-[#fa5c00]/90"
                : "bg-black/50 text-white/50 cursor-not-allowed"
            }`}
          >
            {isJoining ? (
              <>
                <Loader2 className="size-5 animate-spin mr-2" />
                Joining...
              </>
            ) : (
              <>
                <DoorOpen className="size-5" />
                Join Room
              </>
            )}
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 w-full">
          <h3 className="font-semibold text-white mb-2 text-sm">
            How to join:
          </h3>
          <ol className="text-xs text-white/70 space-y-1">
            <li>1. Ask your friend for their room code</li>
            <li>2. Enter the 6-character code above</li>
            <li>3. Click &quot;Join Room&quot; to enter the lobby</li>
            <li>4. Mark yourself as ready when you&apos;re set</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomPage;

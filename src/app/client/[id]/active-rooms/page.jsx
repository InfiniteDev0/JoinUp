"use client";

import { HyperText } from "@/components/ui/hyper-text";
import { ArrowLeft, Users, Play, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ActiveRoomsPage() {
  const router = useRouter();
  const params = useParams();
  const [activeRooms, setActiveRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userData = JSON.parse(userDetails);
      setUser(userData);
      loadActiveRooms(userData.uid);
    }
  }, []);

  const loadActiveRooms = async (uid) => {
    try {
      const rooms = await api.getActiveRooms(uid);
      setActiveRooms(rooms);
    } catch (error) {
      console.error("Failed to load active rooms:", error);
      toast.error("Failed to load active rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomId) => {
    router.push(`/client/${params.id}/lobby?room=${roomId}`);
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
        {/* Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="size-7 text-[#fa5c00]" />
            Active Rooms
          </h2>
        </div>

        {/* Empty State - No Friends */}
        {activeRooms.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <Users className="size-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Rooms</h3>
            <p className="text-muted-foreground mb-4">
              None of your friends are currently in game rooms. Invite them to
              play!
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => router.push(`/client/${params.id}/friends`)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <UserPlus className="size-4" />
                Add Friends
              </Button>
              <Button
                onClick={() => router.push(`/client/${params.id}/join`)}
                className="bg-[#fa5c00] text-white hover:bg-[#fa5c00]/90 flex items-center gap-2"
              >
                <Play className="size-4" />
                Create Room
              </Button>
            </div>
          </div>
        )}

        {/* Active Rooms List */}
        {activeRooms.length > 0 && (
          <div className="space-y-3">
            {activeRooms.map((room, index) => (
              <motion.div
                key={room.roomId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-5 shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Friend Avatar */}
                  <div className="w-14 h-14 rounded-full bg-[#fa5c00] flex items-center justify-center text-white font-bold text-xl">
                    {room.displayName?.charAt(0).toUpperCase()}
                  </div>

                  {/* Friend Info */}
                  <div>
                    <h3 className="font-bold text-lg">{room.displayName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>In a room</span>
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <Button
                  onClick={() => handleJoinRoom(room.roomId)}
                  className="bg-[#fa5c00] text-white hover:bg-[#fa5c00]/90 flex items-center gap-2"
                >
                  <Play className="size-4" />
                  Join
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200"
        >
          <h3 className="font-bold text-lg mb-2">💡 Quick Tip</h3>
          <p className="text-sm text-muted-foreground">
            Active rooms show where your friends are currently playing. Join
            them instantly or create your own room and invite friends!
          </p>
        </motion.div>
      </div>
    </div>
  );
}

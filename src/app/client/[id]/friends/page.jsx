"use client";

import { HyperText } from "@/components/ui/hyper-text";
import {
  ArrowLeft,
  UserPlus,
  Users,
  Search,
  Check,
  X,
  Loader2,
  Send,
  Copy,
  Key,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function FriendsPage() {
  const router = useRouter();
  const params = useParams();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [user, setUser] = useState(null);
  const [friendCode, setFriendCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userData = JSON.parse(userDetails);
      setUser(userData);
      // Generate friend code from first 8 chars of UID
      setFriendCode(userData.uid.substring(0, 8).toUpperCase());
      loadFriends(userData.uid);
      loadUserData(userData.uid);
    }

    // Check if coming from a room (for inviting)
    const roomId = localStorage.getItem("currentRoomId");
    if (roomId) {
      setCurrentRoomId(roomId);
    }
  }, []);

  const loadFriends = async (uid) => {
    try {
      const data = await api.getFriends(uid);
      setFriends(data);
    } catch (error) {
      console.error("Failed to load friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (uid) => {
    try {
      const data = await api.getUser(uid);
      setFriendRequests(data.friendRequests || []);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await api.searchUsers(searchQuery);
      // Filter out self and existing friends
      const filtered = results.filter(
        (r) => r.uid !== user.uid && !friends.some((f) => f.uid === r.uid),
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (toUid) => {
    try {
      await api.sendFriendRequest(user.uid, toUid);
      toast.success("Friend request sent!");
      setSearchResults(searchResults.filter((r) => r.uid !== toUid));
    } catch (error) {
      console.error("Failed to send request:", error);
      toast.error("Failed to send friend request");
    }
  };
  const addFriendByCode = async () => {
    if (!codeInput.trim()) {
      toast.error("Please enter a friend code");
      return;
    }

    try {
      // Search for user by UID prefix
      const results = await api.searchUsers("");
      const matchedUser = results.find(
        (u) => u.uid.substring(0, 8).toUpperCase() === codeInput.toUpperCase(),
      );

      if (!matchedUser) {
        toast.error("Invalid friend code");
        return;
      }

      if (matchedUser.uid === user.uid) {
        toast.error("You can't add yourself!");
        return;
      }

      if (friends.some((f) => f.uid === matchedUser.uid)) {
        toast.error("Already friends!");
        return;
      }

      await api.sendFriendRequest(user.uid, matchedUser.uid);
      toast.success(`Friend request sent to ${matchedUser.displayName}!`);
      setCodeInput("");
    } catch (error) {
      console.error("Failed to add by code:", error);
      toast.error("Failed to add friend");
    }
  };

  const copyFriendCode = () => {
    navigator.clipboard.writeText(friendCode);
    toast.success("Friend code copied!");
  };

  const inviteToGame = async (friendUid, friendName) => {
    if (!currentRoomId) {
      toast.error("No active room. Create a game first!");
      return;
    }

    try {
      const roomData = localStorage.getItem("currentRoomData");
      const room = roomData ? JSON.parse(roomData) : null;

      await api.sendGameInvite(
        user.uid,
        friendUid,
        currentRoomId,
        room?.gameName || "a game",
      );
      toast.success(`Invite sent to ${friendName}!`);
    } catch (error) {
      console.error("Failed to invite:", error);
      toast.error("Failed to send invite");
    }
  };
  const acceptRequest = async (friendUid) => {
    try {
      await api.acceptFriendRequest(user.uid, friendUid);
      toast.success("Friend request accepted!");
      loadFriends(user.uid);
      loadUserData(user.uid);
    } catch (error) {
      console.error("Failed to accept:", error);
      toast.error("Failed to accept request");
    }
  };

  const rejectRequest = async (friendUid) => {
    try {
      await api.rejectFriendRequest(user.uid, friendUid);
      toast.success("Friend request rejected");
      loadUserData(user.uid);
    } catch (error) {
      console.error("Failed to reject:", error);
      toast.error("Failed to reject request");
    }
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
        {/* Friend Code Section */}
        <div className="bg-gradient-to-r from-[#fa5c00] to-orange-600 rounded-xl p-5 shadow-lg text-white">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Key className="size-5" />
            Your Friend Code
          </h3>
          <div className="flex gap-2 items-center mb-4">
            <div className="flex-1 bg-white/20 rounded-lg px-4 py-3 font-mono text-2xl text-center font-bold tracking-wider">
              {friendCode}
            </div>
            <Button
              onClick={copyFriendCode}
              className="bg-white text-[#fa5c00] hover:bg-white/90"
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <p className="text-sm text-white/80">
            Share this code with friends so they can add you!
          </p>
        </div>

        {/* Add Friend by Code */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <UserPlus className="size-5 text-[#fa5c00]" />
            Add Friend by Code
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === "Enter" && addFriendByCode()}
              placeholder="Enter friend code..."
              maxLength={8}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fa5c00] font-mono text-lg"
            />
            <Button
              onClick={addFriendByCode}
              className="bg-[#fa5c00] text-white hover:bg-[#fa5c00]/90"
            >
              <UserPlus className="size-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Search className="size-5 text-[#fa5c00]" />
            Search by Name
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by name..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fa5c00]"
            />
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="bg-[#fa5c00] text-white hover:bg-[#fa5c00]/90"
            >
              {searching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((result) => (
                <div
                  key={result.uid}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#fa5c00] flex items-center justify-center text-white font-bold">
                      {result.displayName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{result.displayName}</span>
                  </div>
                  <Button
                    onClick={() => sendFriendRequest(result.uid)}
                    size="sm"
                    className="bg-[#fa5c00] text-white hover:bg-[#fa5c00]/90"
                  >
                    <UserPlus className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-lg">
            <h3 className="font-bold mb-4">
              Friend Requests ({friendRequests.length})
            </h3>
            <div className="space-y-3">
              {friendRequests.map((request) => (
                <motion.div
                  key={request.from}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#fa5c00] flex items-center justify-center text-white font-bold">
                      {request.fromName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{request.fromName}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => acceptRequest(request.from)}
                      size="sm"
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      <Check className="size-4" />
                    </Button>
                    <Button
                      onClick={() => rejectRequest(request.from)}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="bg-white rounded-xl p-5 shadow-lg">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Users className="size-5 text-[#fa5c00]" />
            Friends ({friends.length})
          </h3>
          {friends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="size-12 mx-auto mb-3 text-gray-300" />
              <p>No friends yet. Search and add some!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend, index) => (
                <motion.div
                  key={friend.uid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#fa5c00] flex items-center justify-center text-white font-bold">
                      {friend.displayName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{friend.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(friend.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {currentRoomId ? (
                    <Button
                      onClick={() =>
                        inviteToGame(friend.uid, friend.displayName)
                      }
                      size="sm"
                      className="bg-[#fa5c00] text-white hover:bg-[#fa5c00]/90 gap-1"
                    >
                      <Send className="size-4" />
                      Invite
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[#fa5c00] border-[#fa5c00]"
                      onClick={() => {
                        const code = friend.uid.substring(0, 8).toUpperCase();
                        navigator.clipboard.writeText(code);
                        toast.success(`${friend.displayName}'s code copied!`);
                      }}
                    >
                      <Copy className="size-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

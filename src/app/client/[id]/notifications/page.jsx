"use client";

import { HyperText } from "@/components/ui/hyper-text";
import {
  ArrowLeft,
  Bell,
  Trophy,
  UserPlus,
  Users,
  CheckCheck,
  Loader2,
  Trash2,
  BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { requestNotificationPermission, getFCMToken } from "@/lib/fcm";

export default function NotificationsPage() {
  const router = useRouter();
  const params = useParams();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userData = JSON.parse(userDetails);
      setUser(userData);
      loadNotifications(userData.uid);

      // Check if FCM token exists
      const token = getFCMToken();
      if (token) {
        setFcmToken(token);
        setNotificationEnabled(true);
      }
    }
  }, []);

  const loadNotifications = async (uid) => {
    try {
      const data = await api.getNotifications(uid);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead(user.uid);
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.clearAllNotifications(user.uid);
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      toast.error("Failed to clear notifications. Please try again.");
    }
  };

  const enablePushNotifications = async () => {
    try {
      const token = await requestNotificationPermission(user.uid);
      if (token) {
        setFcmToken(token);
        setNotificationEnabled(true);
        toast.success("Push notifications enabled!");
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      toast.error("Failed to enable notifications");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "win":
        return <Trophy className="size-6 text-yellow-500" />;
      case "invite":
        return <Users className="size-6 text-blue-500" />;
      case "friend_request":
        return <UserPlus className="size-6 text-green-500" />;
      case "friend_accept":
        return <CheckCheck className="size-6 text-green-500" />;
      default:
        return <Bell className="size-6 text-gray-500" />;
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ffaa0009]">
        <Loader2 className="size-8 animate-spin text-[#fa5c00]" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

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

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Enable Push Notifications Banner */}
        {!notificationEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#fa5c00] to-orange-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center gap-4">
              <BellRing className="size-12 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  Enable Push Notifications
                </h3>
                <p className="text-sm text-white/90 mb-3">
                  Get instant updates about game invites, wins, and friend
                  requests!
                </p>
                <Button
                  onClick={enablePushNotifications}
                  className="bg-white text-[#fa5c00] hover:bg-white/90 h-10 font-semibold"
                >
                  Enable Notifications
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header Actions */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>
          {(unreadCount > 0 || notifications.length > 0) && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  onClick={markAllRead}
                  variant="outline"
                  size="sm"
                  className="text-[#fa5c00] flex-1 sm:flex-none"
                >
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  onClick={clearAllNotifications}
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-500 hover:bg-red-50 flex-1 sm:flex-none"
                >
                  <Trash2 className="size-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <Bell className="size-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground">
              You're all caught up! Play some games to get notifications.
            </p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl p-4 shadow-lg flex items-start gap-4 ${
                !notification.read ? "border-2 border-[#fa5c00]" : ""
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-base">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-[#fa5c00] flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-xs text-muted-foreground">
                    {formatTime(notification.timestamp)}
                  </p>
                  {notification.roomId && (
                    <Button
                      onClick={() =>
                        router.push(
                          `/client/${params.id}/lobby?room=${notification.roomId}`,
                        )
                      }
                      size="sm"
                      className="bg-[#fa5c00] text-white hover:bg-[#fa5c00]/90 h-7 text-xs"
                    >
                      Join Game
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

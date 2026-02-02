const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = {
  // Auth
  syncUser: async (userData) => {
    const response = await fetch(`${API_URL}/auth/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // User
  getUser: async (uid) => {
    const response = await fetch(`${API_URL}/user/${uid}`);
    return response.json();
  },

  getUserStats: async (uid) => {
    const response = await fetch(`${API_URL}/user/${uid}/stats`);
    return response.json();
  },

  searchUsers: async (query) => {
    const response = await fetch(`${API_URL}/user/search/${query}`);
    return response.json();
  },

  // Game
  saveGameResult: async (gameData) => {
    const response = await fetch(`${API_URL}/game/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gameData),
    });
    return response.json();
  },

  getGameHistory: async (uid) => {
    const response = await fetch(`${API_URL}/game/history/${uid}`);
    return response.json();
  },

  // Friends
  sendFriendRequest: async (fromUid, toUid) => {
    const response = await fetch(`${API_URL}/friends/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUid, toUid }),
    });
    return response.json();
  },

  acceptFriendRequest: async (uid, friendUid) => {
    const response = await fetch(`${API_URL}/friends/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, friendUid }),
    });
    return response.json();
  },

  rejectFriendRequest: async (uid, friendUid) => {
    const response = await fetch(`${API_URL}/friends/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, friendUid }),
    });
    return response.json();
  },

  getFriends: async (uid) => {
    const response = await fetch(`${API_URL}/friends/${uid}`);
    return response.json();
  },

  sendGameInvite: async (fromUid, toUid, roomId, gameName) => {
    const response = await fetch(`${API_URL}/friends/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUid, toUid, roomId, gameName }),
    });
    return response.json();
  },

  // Notifications
  getNotifications: async (uid) => {
    const response = await fetch(`${API_URL}/notifications/${uid}`);
    return response.json();
  },

  markNotificationRead: async (uid, notificationId) => {
    const response = await fetch(
      `${API_URL}/notifications/read/${uid}/${notificationId}`,
      {
        method: "POST",
      },
    );
    return response.json();
  },

  markAllNotificationsRead: async (uid) => {
    const response = await fetch(`${API_URL}/notifications/read-all/${uid}`, {
      method: "POST",
    });
    return response.json();
  },

  // Leaderboard
  getLeaderboard: async (limit = 50) => {
    const response = await fetch(`${API_URL}/leaderboard/top?limit=${limit}`);
    return response.json();
  },

  getUserRank: async (uid) => {
    const response = await fetch(`${API_URL}/leaderboard/rank/${uid}`);
    return response.json();
  },

  // Active Rooms
  getActiveRooms: async (uid) => {
    const response = await fetch(`${API_URL}/friends/${uid}/active-rooms`);
    return response.json();
  },

  updateCurrentRoom: async (uid, roomId) => {
    const response = await fetch(`${API_URL}/user/${uid}/room`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId }),
    });
    return response.json();
  },
};

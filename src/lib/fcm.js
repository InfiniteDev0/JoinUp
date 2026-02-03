import { messaging, getToken, onMessage } from "./firebase";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { api } from "./api";

// Request notification permission and get FCM token
export const requestNotificationPermission = async (userId) => {
  try {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted");

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (token) {
        // Store token in cookies (expires in 30 days)
        Cookies.set("fcm_token", token, { expires: 30 });
        console.log("FCM Token stored in cookies:", token);

        // Save token to backend if userId provided
        if (userId) {
          try {
            await api.saveFCMToken(userId, token);
            console.log("FCM Token saved to backend");
          } catch (error) {
            console.error("Error saving FCM token to backend:", error);
          }
        }

        return token;
      } else {
        console.log("No registration token available");
        return null;
      }
    } else if (permission === "denied") {
      console.log("Notification permission denied");
      toast.error("Please enable notifications in your browser settings");
      return null;
    } else {
      console.log("Notification permission not granted");
      return null;
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

// Get stored FCM token from cookies
export const getFCMToken = () => {
  return Cookies.get("fcm_token") || null;
};

// Remove FCM token from cookies
export const removeFCMToken = () => {
  Cookies.remove("fcm_token");
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Message received in foreground:", payload);
      resolve(payload);
    });
  });

// Initialize FCM for the app
export const initializeFCM = async (userId) => {
  try {
    // Check if token already exists
    let token = getFCMToken();

    if (!token) {
      // Request permission and get new token
      token = await requestNotificationPermission();
    }

    if (token && userId) {
      // Send token to backend to associate with user
      // You can add API call here to save token to your backend
      console.log("FCM initialized for user:", userId, "with token:", token);
    }

    // Listen for messages
    onMessage(messaging, (payload) => {
      console.log("Foreground message:", payload);

      // Show toast notification
      toast.success(payload.notification.title, {
        description: payload.notification.body,
      });
    });

    return token;
  } catch (error) {
    console.error("Error initializing FCM:", error);
    return null;
  }
};

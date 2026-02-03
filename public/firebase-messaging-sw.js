// Give the service worker access to Firebase Messaging.
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDrsrPAQxR8cR8iq2QjiKG_FOJ7uRWA8w8",
  authDomain: "homify-a2353.firebaseapp.com",
  projectId: "homify-a2353",
  storageBucket: "homify-a2353.firebasestorage.app",
  messagingSenderId: "390768285202",
  appId: "1:390768285202:web:faae78e2871ea9cf95aacb",
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192.svg",
    badge: "/icon-192.svg",
    vibrate: [200, 100, 200],
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click received.");

  event.notification.close();

  // Open the app
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
});

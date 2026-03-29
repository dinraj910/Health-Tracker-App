import api from "./api.js";

/**
 * Fetch notifications from the server
 * @param {Object} params - { limit, unreadOnly }
 */
export const getNotifications = async (params = {}) => {
  const { data } = await api.get("/notifications", { params });
  return data;
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
};

/**
 * Mark all notifications as read
 */
export const markAllRead = async () => {
  const { data } = await api.patch("/notifications/read-all");
  return data;
};

/**
 * Delete a single notification
 */
export const deleteNotification = async (id) => {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};

/**
 * Convert a base64url string to a Uint8Array (required for Web Push subscription)
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

/**
 * Register the service worker and subscribe to Web Push
 */
export const subscribeToPush = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("[Push] Web Push not supported in this browser");
    return false;
  }

  try {
    // Get VAPID public key from server
    const { data: keyData } = await api.get("/notifications/vapid-key");
    const vapidPublicKey = keyData?.data?.vapidPublicKey;
    if (!vapidPublicKey) return false;

    // Register service worker
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    await navigator.serviceWorker.ready;

    // Check if already subscribed
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      // Sync existing subscription with server
      await api.post("/notifications/subscribe", { subscription: existing });
      return true;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Save subscription to server
    await api.post("/notifications/subscribe", { subscription });
    return true;
  } catch (err) {
    console.error("[Push] Failed to subscribe:", err);
    return false;
  }
};

/**
 * Unsubscribe from Web Push
 */
export const unsubscribeFromPush = async () => {
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
    }
    await api.delete("/notifications/unsubscribe");
    return true;
  } catch (err) {
    console.error("[Push] Failed to unsubscribe:", err);
    return false;
  }
};

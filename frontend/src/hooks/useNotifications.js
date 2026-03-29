import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import {
  getNotifications,
  markAsRead as markReadAPI,
  markAllRead as markAllReadAPI,
  deleteNotification as deleteAPI,
  subscribeToPush,
} from "../services/notificationService";

const POLL_INTERVAL = 30000; // 30 seconds

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const pushAttemptedRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await getNotifications({ limit: 20 });
      if (res?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id) => {
    try {
      await markReadAPI(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllReadAPI();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      await deleteAPI(id);
      setNotifications((prev) => {
        const removed = prev.find((n) => n._id === id);
        if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((n) => n._id !== id);
      });
    } catch {
      // ignore
    }
  }, []);

  // Attempt push subscription once (with button-triggered permission prompt)
  const enablePushNotifications = useCallback(async () => {
    const result = await subscribeToPush();
    return result;
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));

    // Poll every 30s
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);

    // Refetch when tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Try to re-sync existing push subscription silently (no prompt)
    if (!pushAttemptedRef.current && "serviceWorker" in navigator) {
      pushAttemptedRef.current = true;
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {});
    }

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isAuthenticated, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllRead,
    deleteNotification,
    enablePushNotifications,
    refreshNotifications: fetchNotifications,
  };
};

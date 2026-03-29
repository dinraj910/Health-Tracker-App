import webPush from 'web-push';

// Configure VAPID details
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@meditrack.app';

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn('[PushService] VAPID keys not set — push notifications disabled.');
}

/**
 * Send a Web Push notification to a single user's subscription
 * @param {Object} subscription - The push subscription object from the browser
 * @param {Object} payload - { title, body, icon, data }
 */
export const sendPushNotification = async (subscription, payload) => {
  if (!vapidPublicKey || !vapidPrivateKey) return;
  if (!subscription?.endpoint) return;

  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    // 410 Gone = subscription expired/removed, caller should remove it
    if (err.statusCode === 410 || err.statusCode === 404) {
      throw new Error('SUBSCRIPTION_EXPIRED');
    }
    console.error('[PushService] Failed to send push notification:', err.message);
  }
};

export const getVapidPublicKey = () => vapidPublicKey;

/**
 * Browser Notification Service for MediTrack
 * Handles permission requests, sending notifications, and managing notification state.
 */

// Check if the browser supports notifications
export const isSupported = () => {
    return 'Notification' in window;
};

// Get current permission status
export const getPermission = () => {
    if (!isSupported()) return 'denied';
    return Notification.permission;
};

/**
 * Request notification permission from the user.
 * Returns 'granted', 'denied', or 'default'
 */
export const requestPermission = async () => {
    if (!isSupported()) {
        console.warn('Browser notifications are not supported');
        return 'denied';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission === 'denied') {
        console.warn('Notifications have been denied by the user');
        return 'denied';
    }

    try {
        const permission = await Notification.requestPermission();
        return permission;
    } catch {
        console.error('Error requesting notification permission');
        return 'denied';
    }
};

/**
 * Send a browser notification.
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @param {string} options.body - Notification body text
 * @param {string} options.tag - Unique tag to prevent duplicates
 * @param {string} options.icon - Notification icon URL
 * @param {boolean} options.requireInteraction - Keep notification visible until user interacts
 * @param {number} options.autoCloseMs - Auto-close after N milliseconds (default: 15000)
 * @param {Function} options.onClick - Click handler
 */
export const sendNotification = (title, options = {}) => {
    if (!isSupported() || Notification.permission !== 'granted') {
        return null;
    }

    const {
        body = '',
        tag = '',
        icon = '/vite.svg',
        requireInteraction = false,
        autoCloseMs = 15000,
        onClick = null,
    } = options;

    try {
        const notification = new Notification(title, {
            body,
            tag,
            icon,
            badge: icon,
            requireInteraction,
            silent: false,
        });

        // Focus the window when notification is clicked
        notification.onclick = (event) => {
            event.preventDefault();
            window.focus();
            notification.close();
            if (onClick) onClick();
        };

        // Auto-close after timeout
        if (autoCloseMs > 0 && !requireInteraction) {
            setTimeout(() => {
                notification.close();
            }, autoCloseMs);
        }

        return notification;
    } catch (err) {
        console.error('Error sending notification:', err);
        return null;
    }
};

/**
 * Send a medicine reminder notification.
 * @param {string} medicineName - Name of the medicine
 * @param {string} dosage - Dosage string
 * @param {string} timing - Scheduled time (e.g., "08:00")
 * @param {'before20' | 'before5' | 'now'} type - Reminder type
 */
export const sendMedicineReminder = (medicineName, dosage, timing, type) => {
    const formatTime12h = (time24) => {
        const [h, m] = time24.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${m} ${ampm}`;
    };

    const timeFormatted = formatTime12h(timing);
    let title, body;

    switch (type) {
        case 'before20':
            title = `⏰ Medicine Reminder`;
            body = `${medicineName} (${dosage}) is due in 20 minutes at ${timeFormatted}`;
            break;
        case 'before5':
            title = `💊 Almost Time!`;
            body = `${medicineName} (${dosage}) is due in 5 minutes at ${timeFormatted}`;
            break;
        case 'now':
            title = `🔔 Time to Take Medicine`;
            body = `Take ${medicineName} (${dosage}) now — scheduled for ${timeFormatted}`;
            break;
        default:
            return null;
    }

    return sendNotification(title, {
        body,
        tag: `meditrack-${medicineName}-${timing}-${type}`,
        requireInteraction: type === 'now',
        autoCloseMs: type === 'now' ? 0 : 15000,
    });
};

export default {
    isSupported,
    getPermission,
    requestPermission,
    sendNotification,
    sendMedicineReminder,
};

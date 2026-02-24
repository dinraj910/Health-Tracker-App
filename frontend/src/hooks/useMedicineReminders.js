import { useState, useEffect, useRef, useCallback } from 'react';
import { getTodayMedicines } from '../services/medicineService';
import {
    requestPermission,
    sendMedicineReminder,
    isSupported,
    getPermission,
} from '../utils/notificationService';

/**
 * Custom hook to schedule browser notifications for medicine reminders.
 * 
 * Fires notifications at:
 *  - 20 minutes before each dose
 *  - 5 minutes before each dose
 *  - At exact dose time
 * 
 * Skips past timings and already-taken medicines.
 * Auto-refreshes medicine list every 30 minutes.
 */
export const useMedicineReminders = () => {
    const [permissionStatus, setPermissionStatus] = useState(getPermission());
    const [medicines, setMedicines] = useState([]);
    const [nextDose, setNextDose] = useState(null);
    const timeoutRefs = useRef([]);
    const refreshRef = useRef(null);
    const countdownRef = useRef(null);

    // Clear all scheduled timeouts
    const clearAllTimeouts = useCallback(() => {
        timeoutRefs.current.forEach(id => clearTimeout(id));
        timeoutRefs.current = [];
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    }, []);

    // Request permission on mount
    useEffect(() => {
        if (isSupported() && Notification.permission === 'default') {
            // Delay permission request by 3 seconds so the UI loads first
            const timer = setTimeout(async () => {
                const result = await requestPermission();
                setPermissionStatus(result);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    // Fetch medicines and schedule reminders
    const fetchAndSchedule = useCallback(async () => {
        try {
            const data = await getTodayMedicines();
            const medicineList = data.data?.medicines || data.medicines || [];
            setMedicines(medicineList);

            // Clear existing timeouts before scheduling new ones
            clearAllTimeouts();

            const now = new Date();
            let closestUpcoming = null;
            let closestMs = Infinity;

            medicineList.forEach((medicine) => {
                // Skip if reminders disabled or no timings
                if (!medicine.remindersEnabled || !medicine.timings?.length) return;

                medicine.timings.forEach((timing) => {
                    // Check if already taken for this timing
                    const alreadyLogged = medicine.todayLogs?.some(
                        (log) => log.scheduledTime === timing && log.status === 'taken'
                    );
                    if (alreadyLogged) return;

                    // Parse timing (e.g., "08:00" or "14:30")
                    const [hours, minutes] = timing.split(':').map(Number);
                    const doseTime = new Date();
                    doseTime.setHours(hours, minutes, 0, 0);

                    const diffMs = doseTime.getTime() - now.getTime();
                    const diffMinutes = diffMs / (1000 * 60);

                    // Track the closest upcoming dose
                    if (diffMs > 0 && diffMs < closestMs) {
                        closestMs = diffMs;
                        closestUpcoming = {
                            medicineName: medicine.medicineName,
                            dosage: medicine.dosage,
                            timing,
                            doseTime,
                            diffMs,
                        };
                    }

                    // Schedule notifications only for future timings
                    // 20 minutes before
                    if (diffMinutes > 20) {
                        const ms20 = diffMs - 20 * 60 * 1000;
                        const id = setTimeout(() => {
                            sendMedicineReminder(medicine.medicineName, medicine.dosage, timing, 'before20');
                        }, ms20);
                        timeoutRefs.current.push(id);
                    }

                    // 5 minutes before
                    if (diffMinutes > 5) {
                        const ms5 = diffMs - 5 * 60 * 1000;
                        const id = setTimeout(() => {
                            sendMedicineReminder(medicine.medicineName, medicine.dosage, timing, 'before5');
                        }, ms5);
                        timeoutRefs.current.push(id);
                    }

                    // At exact time
                    if (diffMinutes > 0) {
                        const id = setTimeout(() => {
                            sendMedicineReminder(medicine.medicineName, medicine.dosage, timing, 'now');
                        }, diffMs);
                        timeoutRefs.current.push(id);
                    }
                });
            });

            // Update next dose info
            if (closestUpcoming) {
                setNextDose(closestUpcoming);

                // Start a countdown interval to keep nextDose.diffMs updated
                countdownRef.current = setInterval(() => {
                    const remaining = closestUpcoming.doseTime.getTime() - Date.now();
                    if (remaining <= 0) {
                        setNextDose(null);
                        clearInterval(countdownRef.current);
                        countdownRef.current = null;
                    } else {
                        setNextDose(prev => prev ? { ...prev, diffMs: remaining } : null);
                    }
                }, 60000); // Update every minute
            } else {
                setNextDose(null);
            }

        } catch (err) {
            console.error('Error fetching medicines for reminders:', err);
        }
    }, [clearAllTimeouts]);

    // Fetch on mount and refresh every 30 minutes
    useEffect(() => {
        // Use setTimeout to avoid synchronous setState calls in effect body
        const initialFetch = setTimeout(() => {
            fetchAndSchedule();
        }, 0);

        refreshRef.current = setInterval(fetchAndSchedule, 30 * 60 * 1000);

        return () => {
            clearTimeout(initialFetch);
            clearAllTimeouts();
            if (refreshRef.current) clearInterval(refreshRef.current);
        };
    }, [fetchAndSchedule, clearAllTimeouts]);

    return {
        permissionStatus,
        medicines,
        nextDose,
        refetch: fetchAndSchedule,
    };
};

export default useMedicineReminders;

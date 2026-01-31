import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Routine } from '../models/routine.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor() {
        this.requestPermissions();
    }

    async requestPermissions() {
        try {
            await LocalNotifications.requestPermissions();
        } catch (e) {
            console.warn('Notification permissions not supported or failed', e);
        }
    }

    async scheduleRoutine(routine: Routine) {
        if (!routine.isActive) return;

        // Logic to schedule notifications
        // Since Capacitor Basic Local Notifications are limited in recurrence complex rules (like interval),
        // we will schedule for the next 7 occurrences as separate notifications for simplicity, 
        // or use the 'every' property if it fits 'day', 'week'.

        // For MVP, if it is DAILY, we use 'every: day'.

        // First, cancel existing for this routine (using group or ID pattern)
        // We will use integer ID generated from UUID hash or similar, because Capacitor uses Int IDs.
        // For simplicity, we just won't implement robust ID mapping in this MVP step, 
        // or we assume we clear all and reschedule all (inefficient but safe).
        // Let's rely on a simple hash of the UUID to get an Int ID.

        const notifId = this.hashCode(routine.id);
        const [hours, mins] = routine.time.split(':').map(Number);

        const scheduleOptions: any = {
            notifications: [
                {
                    title: 'Rutin Hatırlatıcı',
                    body: `Zamanı geldi: ${routine.title}`,
                    id: notifId,
                    schedule: {
                        at: new Date(), // Placeholder, needs calculation
                        allowWhileIdle: true
                    },
                    sound: undefined,
                    extra: { routineId: routine.id }
                }
            ]
        };

        if (routine.frequencyType === 'DAILY') {
            scheduleOptions.notifications[0].schedule = {
                on: { hour: hours, minute: mins },
                allowWhileIdle: true
            };
        } else {
            console.log('Only DAILY recurrence is fully supported in this demo version for Notifications.');
            return;
        }

        try {
            await LocalNotifications.schedule(scheduleOptions);
        } catch (e) {
            console.error('Failed to schedule notification', e);
        }
    }

    async cancelRoutine(routineId: string) {
        const notifId = this.hashCode(routineId);
        try {
            await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
        } catch (e) {
            console.warn('Failed to cancel', e);
        }
    }

    private hashCode(str: string): number {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash); // Ensure positive
    }
}

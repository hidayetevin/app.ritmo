import { Injectable } from '@angular/core';
import { LocalNotifications, ScheduleOptions, PendingResult } from '@capacitor/local-notifications';
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
            const permission = await LocalNotifications.checkPermissions();
            if (permission.display !== 'granted') {
                await LocalNotifications.requestPermissions();
            }
        } catch (e) {
            console.warn('Notification permissions lookup failed', e);
        }
    }

    async scheduleRoutine(routine: Routine) {
        if (!routine.isActive) return;

        // Clean up any existing notifications for this routine first
        await this.cancelRoutine(routine.id);

        const [hours, mins] = routine.time.split(':').map(Number);
        const baseId = this.hashCode(routine.id);
        const notifications: any[] = [];

        switch (routine.frequencyType) {
            case 'DAILY':
                notifications.push({
                    id: baseId,
                    title: 'Ritmo Hatırlatıcı',
                    body: `${routine.title} zamanı geldi!`,
                    schedule: {
                        on: { hour: hours, minute: mins },
                        allowWhileIdle: true,
                        repeats: true
                    }
                });
                break;

            case 'WEEKDAYS': // Mon - Fri (2 - 6 in Capacitor)
                for (let i = 2; i <= 6; i++) {
                    notifications.push({
                        id: baseId + i,
                        title: 'Ritmo Hatırlatıcı',
                        body: `${routine.title} zamanı geldi!`,
                        schedule: {
                            on: { weekday: i, hour: hours, minute: mins },
                            allowWhileIdle: true,
                            repeats: true
                        }
                    });
                }
                break;

            case 'WEEKENDS': // Sat, Sun (7, 1 in Capacitor)
                [1, 7].forEach(day => {
                    notifications.push({
                        id: baseId + day,
                        title: 'Ritmo Hatırlatıcı',
                        body: `${routine.title} zamanı geldi!`,
                        schedule: {
                            on: { weekday: day, hour: hours, minute: mins },
                            allowWhileIdle: true,
                            repeats: true
                        }
                    });
                });
                break;

            case 'SPECIFIC_DAYS': // 0=Sun (1), 1=Mon (2)...
                if (routine.specificDays) {
                    routine.specificDays.forEach(day => {
                        const capacitorDay = day === 0 ? 1 : day + 1;
                        notifications.push({
                            id: baseId + capacitorDay,
                            title: 'Ritmo Hatırlatıcı',
                            body: `${routine.title} zamanı geldi!`,
                            schedule: {
                                on: { weekday: capacitorDay, hour: hours, minute: mins },
                                allowWhileIdle: true,
                                repeats: true
                            }
                        });
                    });
                }
                break;

            case 'INTERVAL':
                // For Interval (e.g., every 3 days), we schedule the next 14 occurrences
                const startDate = new Date(routine.startDate);
                startDate.setHours(hours, mins, 0, 0);

                const interval = routine.intervalDays || 2;

                for (let i = 0; i < 14; i++) {
                    const scheduledDate = new Date(startDate);
                    scheduledDate.setDate(startDate.getDate() + (i * interval));

                    if (scheduledDate > new Date()) {
                        notifications.push({
                            id: baseId + 100 + i,
                            title: 'Ritmo Hatırlatıcı',
                            body: `${routine.title} zamanı geldi!`,
                            schedule: {
                                at: scheduledDate,
                                allowWhileIdle: true
                            }
                        });
                    }
                }
                break;
        }

        if (notifications.length > 0) {
            try {
                await LocalNotifications.schedule({ notifications });
            } catch (e) {
                console.error('Failed to schedule advanced notifications', e);
            }
        }
    }

    async cancelRoutine(routineId: string) {
        const baseId = this.hashCode(routineId);

        // Identify notifications to cancel
        // Since we don't have a list of active IDs specifically stored, 
        // we cancel the range of possible IDs we use for this routine.
        const idsToCancel = [
            baseId, // DAILY
            baseId + 1, baseId + 2, baseId + 3, baseId + 4, baseId + 5, baseId + 6, baseId + 7, // Weekdays/ends
        ];

        // Add interval IDs
        for (let i = 0; i < 14; i++) {
            idsToCancel.push(baseId + 100 + i);
        }

        try {
            await LocalNotifications.cancel({
                notifications: idsToCancel.map(id => ({ id }))
            });
        } catch (e) {
            console.warn('Failed to cancel notifications', e);
        }
    }

    private hashCode(str: string): number {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        // Multiply by 1000 to leave room for indexed sub-identifers
        return Math.abs(hash % 1000000) * 10;
    }
}

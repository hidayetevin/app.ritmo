import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Routine } from '../models/routine.model';
import { getOccurrenceTimesForDay } from '../utils/routine.utils';

// Android güvenli bildirim limiti (tüm rutinler toplamı için tavsiye edilen maksimum)
const MAX_NOTIFICATIONS_PER_HOURLY_ROUTINE = 100;

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor() { }

    async requestPermissions() {
        try {
            await this.createChannel();
            const perm = await LocalNotifications.requestPermissions();
            return perm.display === 'granted';
        } catch (e) {
            console.error('Permission Error:', e);
            return false;
        }
    }

    async createChannel() {
        try {
            await LocalNotifications.createChannel({
                id: 'rutin_channel',
                name: 'Rutin Bildirimleri',
                description: 'Rutin zamanı hatırlatmaları',
                importance: 5,
                visibility: 1,
                vibration: true,
                sound: 'beep.wav'
            });
        } catch (e) {
            console.error('Channel Error:', e);
        }
    }

    // String ID'den (UUID) Integer ID üretir (Hash)
    private getNotificationId(routineId: string, offset: number = 0): number {
        let hash = 0;
        for (let i = 0; i < routineId.length; i++) {
            const char = routineId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        // Negatifleri pozitife çevir ve offset ekle (aynı rutinin farklı zamanları için)
        return Math.abs(hash) + offset;
    }

    async scheduleRoutine(routine: Routine) {
        // Önce bu rutine ait eski bildirimleri temizle
        await this.cancelRoutine(routine);

        if (routine.isActive === false) return;

        const notifications: any[] = [];
        const [hours, mins] = routine.time.split(':').map(Number);

        // Temel bildirim şablonu
        const baseObj = {
            title: 'Rutin Zamanı! 🔔',
            body: `Hadi, "${routine.title}" rutinini yapma zamanı.`,
            channelId: 'rutin_channel',
            schedule: {
                allowWhileIdle: true
            }
        };

        switch (routine.frequencyType) {
            case 'DAILY':
                notifications.push({
                    id: this.getNotificationId(routine.id),
                    ...baseObj,
                    schedule: { on: { hour: hours, minute: mins }, allowWhileIdle: true }
                });
                break;

            case 'WEEKDAYS':
                // Pzt(2) - Cuma(6) arası 5 adet haftalık bildirim
                for (let day = 2; day <= 6; day++) {
                    notifications.push({
                        id: this.getNotificationId(routine.id, day),
                        ...baseObj,
                        schedule: { on: { weekday: day, hour: hours, minute: mins }, allowWhileIdle: true }
                    });
                }
                break;

            case 'WEEKENDS':
                // Cumartesi(7) ve Pazar(1)
                [7, 1].forEach(day => {
                    notifications.push({
                        id: this.getNotificationId(routine.id, day),
                        ...baseObj,
                        schedule: { on: { weekday: day, hour: hours, minute: mins }, allowWhileIdle: true }
                    });
                });
                break;

            case 'SPECIFIC_DAYS':
                // Seçilen günler (0=Pazar -> Capacitor 1=Pazar. Dönüşüm: day + 1)
                (routine.specificDays || []).forEach(dayIndex => {
                    const capDay = dayIndex + 1; // JS(0-6) -> Capacitor(1-7)
                    notifications.push({
                        id: this.getNotificationId(routine.id, capDay),
                        ...baseObj,
                        schedule: { on: { weekday: capDay, hour: hours, minute: mins }, allowWhileIdle: true }
                    });
                });
                break;

            case 'INTERVAL':
                if (!routine.intervalDays) break;
                // Önümüzdeki 60 gün için tek tek hesapla
                const today = new Date();
                const startDate = new Date(routine.startDate);
                const calcDate = new Date(startDate);

                // Başlangıç tarihi geçmişteyse bugüne en yakın gelecek tarihi bul
                if (calcDate < today) {
                    const diffTime = today.getTime() - startDate.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const remainder = diffDays % routine.intervalDays;
                    const daysToAdd = remainder === 0 ? 0 : (routine.intervalDays - remainder);
                    calcDate.setDate(today.getDate() + daysToAdd);
                }

                // 30 kullanım veya 60 gün ileriye kadar planla
                for (let i = 0; i < 30; i++) {
                    calcDate.setHours(hours, mins, 0, 0);

                    // Bitiş tarihi kontrolü
                    if (routine.endDate && calcDate > new Date(routine.endDate)) break;

                    notifications.push({
                        id: this.getNotificationId(routine.id, i),
                        ...baseObj,
                        schedule: { at: new Date(calcDate), allowWhileIdle: true }
                    });

                    calcDate.setDate(calcDate.getDate() + routine.intervalDays);
                }
                break;

            case 'HOURLY':
                this.buildHourlyNotifications(routine, notifications);
                break;
        }

        if (notifications.length > 0) {
            await LocalNotifications.schedule({ notifications });
            console.log(`🔔 ${notifications.length} bildirim planlandı: ${routine.title}`);
        }
    }

    /**
     * HOURLY rutinler için bildirim planlaması.
     * Önümüzdeki N günü aktif saat aralığında, seçilen interval'a göre planlar.
     * Android güvenlik limitini aşmamak için MAX_NOTIFICATIONS_PER_HOURLY_ROUTINE ile sınırlar.
     */
    private buildHourlyNotifications(routine: Routine, notifications: any[]) {
        const activeStart = routine.activeHoursStart || '08:00';
        const activeEnd = routine.activeHoursEnd || '22:00';

        const intervalMinutes = routine.intervalUnit === 'MINUTES'
            ? (routine.intervalValue || 30)
            : (routine.intervalValue || 1) * 60;

        const [endH, endM] = activeEnd.split(':').map(Number);
        const now = new Date();

        // Kaç gün ileriye planlanacağını interval büyüklüğüne göre dinamik belirle
        // Kısa intervallar için daha az gün (limit koruma)
        const occurrencesPerDay = getOccurrenceTimesForDay(routine).length;
        const planDays = occurrencesPerDay > 0
            ? Math.min(7, Math.floor((MAX_NOTIFICATIONS_PER_HOURLY_ROUTINE - 7) / occurrencesPerDay))
            : 7;
        const safePlanDays = Math.max(1, planDays); // En az 1 gün planla

        let notifIndex = 0;

        for (let dayOffset = 0; dayOffset < safePlanDays; dayOffset++) {
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() + dayOffset);

            // Bu gün için tüm occurrence zamanlarını hesapla
            const occurrenceTimes = getOccurrenceTimesForDay(routine);

            for (const time of occurrenceTimes) {
                if (notifIndex >= MAX_NOTIFICATIONS_PER_HOURLY_ROUTINE - safePlanDays) break; // Özet bildirimlere yer bırak

                const [h, m] = time.split(':').map(Number);
                const schedDate = new Date(targetDate);
                schedDate.setHours(h, m, 0, 0);

                // Geçmiş zamanları atla
                if (schedDate <= now) continue;

                notifications.push({
                    id: this.getNotificationId(routine.id, notifIndex),
                    title: `⏰ ${routine.title}`,
                    body: `"${routine.title}" zamanı geldi! (${time})`,
                    channelId: 'rutin_channel',
                    schedule: { at: new Date(schedDate), allowWhileIdle: true }
                });
                notifIndex++;
            }

            // Her günün sonuna özet bildirim ekle
            const summaryDate = new Date(targetDate);
            summaryDate.setHours(endH, endM, 0, 0);

            if (summaryDate > now) {
                notifications.push({
                    id: this.getNotificationId(routine.id, 900 + dayOffset), // 900+ = özet offset
                    title: '🎉 Rutin Oturumu Tamamlandı',
                    body: `"${routine.title}" için bugünkü bildirimler sona erdi. Yarın ${activeStart}'da devam edecek.`,
                    channelId: 'rutin_channel',
                    schedule: { at: new Date(summaryDate), allowWhileIdle: true }
                });
            }
        }
    }

    /**
     * HOURLY rutinleri yeniden planlar (uygulama her açıldığında çağrılmalı).
     * Bildirimler tükenmiş olabilir, bu metot bunları yeniler.
     */
    async refreshHourlyRoutines(routines: Routine[]) {
        const hourlyRoutines = routines.filter(r => r.frequencyType === 'HOURLY' && r.isActive !== false);
        for (const routine of hourlyRoutines) {
            await this.scheduleRoutine(routine);
        }
    }

    async cancelRoutine(routine: Routine) {
        const ids = [];

        if (routine.frequencyType === 'HOURLY') {
            // HOURLY: 0–MAX_NOTIFICATIONS + özet (900–909)
            for (let i = 0; i < MAX_NOTIFICATIONS_PER_HOURLY_ROUTINE; i++) {
                ids.push({ id: this.getNotificationId(routine.id, i) });
            }
            for (let i = 900; i < 910; i++) {
                ids.push({ id: this.getNotificationId(routine.id, i) });
            }
        } else {
            // Normal rutinler: Olası tüm ID'leri iptal et (Max 50 varsayımı)
            for (let i = 0; i < 50; i++) {
                ids.push({ id: this.getNotificationId(routine.id, i) });
            }
            // Hafta günleri için de (1-7)
            for (let i = 1; i <= 7; i++) {
                ids.push({ id: this.getNotificationId(routine.id, i) });
            }
        }

        await LocalNotifications.cancel({ notifications: ids });
    }
}

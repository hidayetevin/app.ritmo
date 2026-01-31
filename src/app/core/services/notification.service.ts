import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Routine } from '../models/routine.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor() { }

    async requestPermissions() {
        const perm = await LocalNotifications.requestPermissions();
        return perm.display === 'granted';
    }

    // String ID'den (UUID) Integer ID üretir (Hash)
    private getNotificationId(routineId: string, offset: number = 0): number {
        let hash = 0;
        for (let i = 0; i < routineId.length; i++) {
            const char = routineId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        // Negatifleri pozitife çevir ve offset ekle (aynı rutinin farklı günleri için)
        return Math.abs(hash) + offset;
    }

    async scheduleRoutine(routine: Routine) {
        // Önce bu rutine ait eski bildirimleri temizle
        await this.cancelRoutine(routine);

        if (!routine.isActive) return;

        const notifications: any[] = [];
        const [hours, mins] = routine.time.split(':').map(Number);

        // Temel bildirim şablonu
        const baseObj = {
            title: 'Rutin Zamanı! 🔔',
            body: `Hadi, "${routine.title}" rutinini yapma zamanı.`,
            sound: 'beep.wav', // Varsayılan ses
            schedule: {
                allowWhileIdle: true // Doze modunda bile çalsın
            }
        };

        switch (routine.frequencyType) {
            case 'DAILY':
                // Her gün tekrarla
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

                // 60 gün ileriye kadar (veya 30 kullanım) planla
                for (let i = 0; i < 30; i++) {
                    calcDate.setHours(hours, mins, 0, 0);

                    if (routine.endDate && calcDate > new Date(routine.endDate)) break;

                    notifications.push({
                        id: this.getNotificationId(routine.id, i),
                        ...baseObj,
                        schedule: { at: new Date(calcDate), allowWhileIdle: true }
                    });

                    // Bir sonraki tarih
                    calcDate.setDate(calcDate.getDate() + routine.intervalDays);
                }
                break;
        }

        if (notifications.length > 0) {
            await LocalNotifications.schedule({ notifications });
            console.log(`🔔 ${notifications.length} bildirim planlandı: ${routine.title}`);
        }
    }

    async cancelRoutine(routine: Routine) {
        // Olası tüm ID'leri iptal et (Max 50 varsayımı)
        const ids = [];
        for (let i = 0; i < 50; i++) {
            ids.push({ id: this.getNotificationId(routine.id, i) });
        }
        // Ekstra: Hafta günleri için de (1-7)
        for (let i = 1; i <= 7; i++) {
            ids.push({ id: this.getNotificationId(routine.id, i) });
        }

        await LocalNotifications.cancel({ notifications: ids });
    }
}

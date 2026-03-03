import { Routine } from '../models/routine.model';

/**
 * Bir HOURLY rutinin belirtilen gün için tüm occurrence zamanlarını döndürür.
 * @returns string[] — ['08:00', '10:00', '12:00', ...]
 */
export function getOccurrenceTimesForDay(routine: Routine): string[] {
    if (routine.frequencyType !== 'HOURLY') return [];

    const start = routine.activeHoursStart || '08:00';
    const end = routine.activeHoursEnd || '22:00';

    const intervalMinutes = routine.intervalUnit === 'MINUTES'
        ? (routine.intervalValue || 30)
        : (routine.intervalValue || 1) * 60;

    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;

    const times: string[] = [];
    let current = startTotalMinutes;

    while (current <= endTotalMinutes) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        current += intervalMinutes;
    }

    return times;
}

/**
 * Bir HOURLY rutinin belirtilen tarih için tamamlanmış occurrence'larını döndürür.
 * @param dateIso — 'YYYY-MM-DD'
 * @returns string[] — ['08:00', '10:00'] (tamamlanan saatler)
 */
export function getCompletedOccurrencesForDate(routine: Routine, dateIso: string): string[] {
    if (routine.frequencyType !== 'HOURLY') return [];

    const history = routine.completionHistory || [];
    const prefix = `${dateIso}T`;

    return history
        .filter(entry => entry.startsWith(prefix))
        .map(entry => entry.substring(prefix.length)); // 'HH:mm' parçasını döndür
}

/**
 * Bir HOURLY rutinin şu anki en güncel occurrence'ını döndürür.
 * (Şu andan önceki en son planlanmış zaman)
 * @returns 'HH:mm' | null
 */
export function getCurrentOccurrence(routine: Routine): string | null {
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    const times = getOccurrenceTimesForDay(routine);

    let current: string | null = null;
    for (const time of times) {
        const [h, m] = time.split(':').map(Number);
        const timeTotalMinutes = h * 60 + m;
        if (timeTotalMinutes <= currentTotalMinutes) {
            current = time;
        } else {
            break;
        }
    }
    return current;
}

/**
 * Bir HOURLY rutinin bir sonraki planlanmış occurrence'ını döndürür.
 * @returns 'HH:mm' | null (null = bugün için tüm occurrence'lar bitti)
 */
export function getNextOccurrence(routine: Routine): string | null {
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    const times = getOccurrenceTimesForDay(routine);

    for (const time of times) {
        const [h, m] = time.split(':').map(Number);
        const timeTotalMinutes = h * 60 + m;
        if (timeTotalMinutes > currentTotalMinutes) {
            return time;
        }
    }
    return null;
}

/**
 * HOURLY rutinin o günkü tamamlanma ilerlemesini döndürür.
 */
export function getHourlyProgress(routine: Routine, dateIso: string): { completed: number; total: number } {
    const times = getOccurrenceTimesForDay(routine);
    const completedTimes = getCompletedOccurrencesForDate(routine, dateIso);
    return { completed: completedTimes.length, total: times.length };
}

/**
 * HOURLY rutinin mevcut occurrence'ı tamamlanmış mı?
 */
export function isCurrentOccurrenceCompleted(routine: Routine, dateIso: string): boolean {
    const current = getCurrentOccurrence(routine);
    if (!current) return false;
    const key = `${dateIso}T${current}`;
    return (routine.completionHistory || []).includes(key);
}

/**
 * Interval label'ını üretir. (UI için)
 */
export function getHourlyLabel(routine: Routine, lang: 'tr' | 'en'): string {
    if (routine.frequencyType !== 'HOURLY') return '';

    const value = routine.intervalValue || 1;
    const unit = routine.intervalUnit || 'HOURS';

    if (lang === 'tr') {
        return unit === 'HOURS'
            ? `Her ${value} saatte bir (${routine.activeHoursStart}-${routine.activeHoursEnd})`
            : `Her ${value} dakikada bir (${routine.activeHoursStart}-${routine.activeHoursEnd})`;
    } else {
        return unit === 'HOURS'
            ? `Every ${value} hour(s) (${routine.activeHoursStart}-${routine.activeHoursEnd})`
            : `Every ${value} min(s) (${routine.activeHoursStart}-${routine.activeHoursEnd})`;
    }
}

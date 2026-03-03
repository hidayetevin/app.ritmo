export type FrequencyType = 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'SPECIFIC_DAYS' | 'INTERVAL' | 'HOURLY';
export type IntervalUnit = 'HOURS' | 'MINUTES';

export interface Routine {
    id: string; // UUID
    title: string;
    description?: string;
    color: string;
    frequencyType: FrequencyType;
    specificDays?: number[]; // 0=Sun, 1=Mon... (for SPECIFIC_DAYS)
    intervalDays?: number;   // Days between routines (for INTERVAL)
    startDate: string;       // ISO Date string
    endDate?: string;
    time: string;            // HH:mm — used by non-HOURLY types
    isActive: boolean;
    // completionHistory: ISO date strings 'YYYY-MM-DD' for normal types
    //                    'YYYY-MM-DDTHH:mm' for HOURLY type (granular per-occurrence)
    completionHistory: string[];

    // --- HOURLY specific fields ---
    intervalUnit?: IntervalUnit;    // 'HOURS' or 'MINUTES'
    intervalValue?: number;         // HOURS: 1–12 | MINUTES: 10, 20, 30, 40, 50
    activeHoursStart?: string;      // 'HH:mm' — daily active window start
    activeHoursEnd?: string;        // 'HH:mm' — daily active window end
}

export interface UserSettings {
    isDarkMode: boolean;
    language: 'tr' | 'en';
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
}

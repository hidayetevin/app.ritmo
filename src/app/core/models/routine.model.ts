export type FrequencyType = 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'SPECIFIC_DAYS' | 'INTERVAL';

export interface Routine {
    id: string; // UUID
    title: string;
    description?: string;
    color: string;
    frequencyType: FrequencyType;
    specificDays?: number[]; // 0=Sun, 1=Mon...
    intervalDays?: number; // Days between routines
    startDate: string; // ISO Date string
    endDate?: string;
    time: string; // HH:mm
    isActive: boolean;
    completionHistory: string[]; // ISO Date strings of completions
}

export interface UserSettings {
    isDarkMode: boolean;
    language: 'tr' | 'en';
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
}

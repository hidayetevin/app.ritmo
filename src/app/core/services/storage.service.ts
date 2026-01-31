import { Injectable, signal, effect, inject } from '@angular/core';
import { Routine, UserSettings } from '../models/routine.model';
import { v4 as uuidv4 } from 'uuid';
import { NotificationService } from './notification.service';

const STORAGE_KEYS = {
    ROUTINES: 'rutinapp_routines',
    SETTINGS: 'rutinapp_settings'
};

const DEFAULT_SETTINGS: UserSettings = {
    isDarkMode: false,
    language: 'tr',
    notificationsEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true
};

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private notificationService = inject(NotificationService);

    // Signals for reactive state management
    private routinesSignal = signal<Routine[]>([]);
    private settingsSignal = signal<UserSettings>(DEFAULT_SETTINGS);

    // Read-only signals for consumers
    routines = this.routinesSignal.asReadonly();
    settings = this.settingsSignal.asReadonly();

    constructor() {
        this.loadFromStorage();

        // Auto-save effect: Whenever signals change, save to local storage
        effect(() => {
            localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(this.routinesSignal()));
        });

        effect(() => {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settingsSignal()));
        });
    }

    private loadFromStorage() {
        const routinesData = localStorage.getItem(STORAGE_KEYS.ROUTINES);
        if (routinesData) {
            try {
                this.routinesSignal.set(JSON.parse(routinesData));
            } catch (e) {
                console.error('Falied to parse routines', e);
            }
        }

        const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (settingsData) {
            try {
                this.settingsSignal.set({ ...DEFAULT_SETTINGS, ...JSON.parse(settingsData) });
            } catch (e) {
                console.error('Failed to parse settings', e);
            }
        }
    }

    // --- Routine Operations ---

    addRoutine(routine: Omit<Routine, 'id' | 'completionHistory'>) {
        const newRoutine: Routine = {
            ...routine,
            id: uuidv4(),
            completionHistory: []
        };
        this.routinesSignal.update(list => [...list, newRoutine]);

        // Schedule Notification
        this.notificationService.scheduleRoutine(newRoutine);

        return newRoutine;
    }

    updateRoutine(updatedRoutine: Routine) {
        this.routinesSignal.update(list =>
            list.map(r => r.id === updatedRoutine.id ? updatedRoutine : r)
        );

        // Refresh Notification
        // cancelRoutine artık nesne bekliyor
        this.notificationService.scheduleRoutine(updatedRoutine);
    }

    deleteRoutine(id: string) {
        const routineToDelete = this.routinesSignal().find(r => r.id === id);

        if (routineToDelete) {
            this.notificationService.cancelRoutine(routineToDelete);
        }

        this.routinesSignal.update(list => list.filter(r => r.id !== id));
    }

    toggleRoutineCompletion(routineId: string, date: string) { // Date in ISO string YYYY-MM-DD
        this.routinesSignal.update(list =>
            list.map(r => {
                if (r.id !== routineId) return r;

                const history = r.completionHistory || [];
                const exists = history.includes(date);

                return {
                    ...r,
                    completionHistory: exists
                        ? history.filter(d => d !== date)
                        : [...history, date]
                };
            })
        );
    }

    // --- Settings Operations ---

    updateSettings(newSettings: Partial<UserSettings>) {
        this.settingsSignal.update(current => ({ ...current, ...newSettings }));
    }
}

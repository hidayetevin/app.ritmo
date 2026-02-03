import { Injectable, inject, computed } from '@angular/core';
import { StorageService } from './storage.service';

export type Lang = 'tr' | 'en';

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private storage = inject(StorageService);

    readonly currentLang = computed(() => this.storage.settings().language);

    private translations: Record<Lang, Record<string, string>> = {
        tr: {
            'APP_NAME': 'Ritmo',
            'HOME': 'Ana Sayfa',
            'CALENDAR': 'Takvim',
            'ROUTINES': 'Rutinler',
            'SETTINGS': 'Hesap',
            'STATISTICS': 'Başarı',
            'WELCOME': 'Hoş Geldin!',
            'MY_ROUTINES': 'Rutinlerim',
            'ADD_ROUTINE': 'Yeni Rutin Ekle',
            'EDIT_ROUTINE': 'Rutin Güncelle',
            'SAVE': 'Kaydet',
            'CANCEL': 'İptal',
            'DELETE': 'Sil',
            'TITLE': 'Başlık',
            'TIME': 'Saat',
            'FREQUENCY': 'Sıklık',
            'START_DATE': 'Başlangıç Tarihi',
            'COLOR': 'Renk Seç',
            'DAILY': 'Her Gün',
            'WEEKDAYS': 'Hafta İçi',
            'WEEKENDS': 'Hafta Sonu',
            'SPECIFIC_DAYS': 'Seçili Günler',
            'INTERVAL': 'Belirli Aralıkla',
            'NO_ROUTINES': 'Henüz rutin eklenmemiş.',
            'START_BY_CLICKING': 'Sağ üstteki + butonuna basarak başla.',
            'STAT_TOTAL_ROUTINES': 'Toplam Rutin',
            'STAT_COMPLETED': 'Tamamlanan',
            'STAT_WEEKLY_PERFORMANCE': 'Haftalık Performans',
            'STAT_BEST_ROUTINE': 'En İstikrarlı Rutin',
            'DARK_MODE': 'Karanlık Mod',
            'NOTIFICATIONS': 'Bildirimler',
            'SOUND': 'Sesler',
            'VIBRATION': 'Titreşim',
            'LANGUAGE': 'Uygulama Dili',
            'REKRUM_ALANI': 'Reklam Alanı',
            'TODAY': 'Bugün'
        },
        en: {
            'APP_NAME': 'Ritmo',
            'HOME': 'Home',
            'CALENDAR': 'Calendar',
            'ROUTINES': 'Routines',
            'SETTINGS': 'Account',
            'STATISTICS': 'Success',
            'WELCOME': 'Welcome!',
            'MY_ROUTINES': 'My Routines',
            'ADD_ROUTINE': 'Add New Routine',
            'EDIT_ROUTINE': 'Update Routine',
            'SAVE': 'Save',
            'CANCEL': 'Cancel',
            'DELETE': 'Delete',
            'TITLE': 'Title',
            'TIME': 'Time',
            'FREQUENCY': 'Frequency',
            'START_DATE': 'Start Date',
            'COLOR': 'Choose Color',
            'DAILY': 'Daily',
            'WEEKDAYS': 'Weekdays',
            'WEEKENDS': 'Weekends',
            'SPECIFIC_DAYS': 'Specific Days',
            'INTERVAL': 'Interval',
            'NO_ROUTINES': 'No routines added yet.',
            'START_BY_CLICKING': 'Start by clicking the + button above.',
            'STAT_TOTAL_ROUTINES': 'Total Routines',
            'STAT_COMPLETED': 'Completed',
            'STAT_WEEKLY_PERFORMANCE': 'Weekly Performance',
            'STAT_BEST_ROUTINE': 'Most Consistent Routine',
            'DARK_MODE': 'Dark Mode',
            'NOTIFICATIONS': 'Notifications',
            'SOUND': 'Sound',
            'VIBRATION': 'Vibration',
            'LANGUAGE': 'App Language',
            'REKRUM_ALANI': 'Ad Zone',
            'TODAY': 'Today'
        }
    };

    t(key: string): string {
        const lang = this.currentLang();
        return this.translations[lang][key] || key;
    }
}

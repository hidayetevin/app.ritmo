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
            'TODAY': 'Bugün',
            'TODAY_SUMMARY': 'Bugün {{completed}} / {{total}} rutin tamamlandı.',
            'WHATS_TODAY': 'BUGÜN NE VAR?',
            'STATUS_DONE': 'BİTTİ',
            'ADD_ROUTINE_SUBTITLE': 'Kişisel hedeflerin için bir adım at',
            'HOW_TO_USE': 'NASIL KULLANILIR?',
            'STEP_1_TITLE': 'Rutinlerini Tanımla',
            'STEP_1_DESC': '"+" butonuna basarak ilk rutini oluştur. Sıklığını ve saatini ayarla.',
            'STEP_2_TITLE': 'Takip Et ve Tamamla',
            'STEP_2_DESC': 'Ana sayfadaki listeden rutinine dokunarak "BİTTİ" olarak işaretle.',
            'STEP_3_TITLE': 'Gelişimini İzle',
            'STEP_3_DESC': '"Başarı" sekmesinden haftalık performansını ve en istikrarlı rutinlerini gör.',
            'TIP_OF_THE_DAY': 'GÜNÜN İPUCU',
            'TIP_TITLE': 'Küçük Adımlar',
            'TIP_DESC': 'Büyük değişimler, her gün yapılan küçük rutinlerle başlar.',
            'ALL_DONE_MSG': 'Harika! Bugün için planlanan tüm işlerini bitirdin.',
            'TAB_DAILY_LIST': 'Günlük Liste',
            'TAB_MONTHLY_VIEW': 'Aylık Görünüm',
            'NO_ROUTINES_FOR_DATE': 'Bu tarih için planlanmış rutin yok.',
            'CALENDAR_FOOTER_NOTE': 'Rutinin üzerine tıklayarak durumunu değiştirebilirsin.',
            'UPDATE': 'Güncelle',
            'EVERY_X_DAYS': '{{value}} günde bir',
            'EVERY_X_MINUTES': '{{value}} dakikada bir',
            'EVERY_X_HOURS': '{{value}} saatte bir',
            'UNIT_MINUTE': 'dakikada bir',
            'UNIT_HOUR': 'saatte bir',
            'UNIT_DAY': 'günde bir',
            'DELETE_CONFIRM': 'Rutini silmek istediğine emin misin?',
            'EVERY_HOW_MANY_DAYS': 'Kaç günde bir?',
            'DAYS_SUFFIX': 'günde bir',
            'DAYS_LABEL': 'Günler',
            'PLACEHOLDER_TITLE': 'Örn: Su İç, Kitap Oku...'
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
            'TODAY': 'Today',
            'TODAY_SUMMARY': 'Today {{completed}} / {{total}} routines completed.',
            'WHATS_TODAY': 'WHAT\'S ON TODAY?',
            'STATUS_DONE': 'DONE',
            'ADD_ROUTINE_SUBTITLE': 'Take a step for your personal goals',
            'HOW_TO_USE': 'HOW TO USE?',
            'STEP_1_TITLE': 'Define Your Routines',
            'STEP_1_DESC': 'Create your first routine by tapping the "+" button. Set frequency and time.',
            'STEP_2_TITLE': 'Track and Complete',
            'STEP_2_DESC': 'Mark routine as "DONE" by tapping it on the home list.',
            'STEP_3_TITLE': 'Track Progress',
            'STEP_3_DESC': 'See your weekly performance and most consistent routines in the "Success" tab.',
            'TIP_OF_THE_DAY': 'TIP OF THE DAY',
            'TIP_TITLE': 'Small Steps',
            'TIP_DESC': 'Big changes start with small daily routines.',
            'ALL_DONE_MSG': 'Great! You have completed all planned tasks for today.',
            'TAB_DAILY_LIST': 'Daily List',
            'TAB_MONTHLY_VIEW': 'Monthly View',
            'NO_ROUTINES_FOR_DATE': 'No planned routines for this date.',
            'CALENDAR_FOOTER_NOTE': 'You can change status by clicking on the routine.',
            'UPDATE': 'Update',
            'EVERY_X_DAYS': 'Every {{value}} days',
            'EVERY_X_MINUTES': 'Every {{value}} minutes',
            'EVERY_X_HOURS': 'Every {{value}} hours',
            'UNIT_MINUTE': 'minute(s)',
            'UNIT_HOUR': 'hour(s)',
            'UNIT_DAY': 'day(s)',
            'DELETE_CONFIRM': 'Are you sure you want to delete this routine?',
            'EVERY_HOW_MANY_DAYS': 'Interval',
            'DAYS_SUFFIX': 'days',
            'DAYS_LABEL': 'Days',
            'PLACEHOLDER_TITLE': 'E.g. Drink Water, Read Book...'
        }
    };

    t(key: string, params?: Record<string, any>): string {
        const lang = this.currentLang();
        let text = this.translations[lang][key] || key;

        if (params) {
            Object.keys(params).forEach(param => {
                text = text.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
            });
        }
        return text;
    }
}

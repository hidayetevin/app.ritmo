import { Component, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { TranslationService } from '../../core/services/translation.service';
import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Routine } from '../../core/models/routine.model';
import {
  getCurrentOccurrence,
  getNextOccurrence,
  getHourlyProgress,
  isCurrentOccurrenceCompleted
} from '../../core/utils/routine.utils';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  storage = inject(StorageService);
  t = inject(TranslationService);
  private adService = inject(AdService);
  private notifService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit() {
    this.adService.showBanner();
    this.notifService.requestPermissions();
    // HOURLY rutin bildirimlerini her uygulama açılışında yenile
    this.notifService.refreshHourlyRoutines(this.storage.routines());
  }

  ngOnDestroy() {
    this.adService.hideBanner();
  }

  today = new Date();
  todayIso = this.today.toISOString().split('T')[0];

  goToAdd() {
    this.adService.showRewardedAd().finally(() => {
      this.router.navigate(['/routines'], { queryParams: { add: 'true' } });
    });
  }

  // Bugünün rutinlerini filtrele
  todaysRoutines = computed(() => {
    const routines = this.storage.routines();

    const todayZero = new Date(this.today);
    todayZero.setHours(0, 0, 0, 0);

    const dayIndex = todayZero.getDay(); // 0=Pazar, 1=Pzt...

    return routines.filter(r => {
      if (r.isActive === false) return false;

      const startDate = new Date(r.startDate);
      startDate.setHours(0, 0, 0, 0);

      if (startDate > todayZero) return false;

      switch (r.frequencyType) {
        case 'DAILY': return true;
        case 'WEEKDAYS': return dayIndex >= 1 && dayIndex <= 5;
        case 'WEEKENDS': return dayIndex === 0 || dayIndex === 6;
        case 'SPECIFIC_DAYS': return r.specificDays?.includes(dayIndex) ?? false;
        case 'INTERVAL':
          const oneDay = 1000 * 60 * 60 * 24;
          const diffTime = todayZero.getTime() - startDate.getTime();
          const diffDays = Math.round(diffTime / oneDay);
          if (diffDays < 0) return false;
          return diffDays % (r.intervalDays || 1) === 0;
        case 'HOURLY':
          // HOURLY rutinler her gün gösterilir (active hours window içinde başlangıç tarihi geçmişse)
          return true;
        default: return false;
      }
    });
  });

  // ============================================================
  // Normal (non-HOURLY) rutin metodları — KESİNLİKLE DEĞİŞMEDİ
  // ============================================================

  isCompleted(routine: Routine): boolean {
    if (routine.frequencyType === 'HOURLY') return false; // HOURLY için ayrı metot var
    return routine.completionHistory?.includes(this.todayIso) || false;
  }

  toggleComplete(routine: Routine) {
    if (routine.frequencyType === 'HOURLY') return; // HOURLY için ayrı metot var
    this.storage.toggleRoutineCompletion(routine.id, this.todayIso);

    if (this.storage.settings().vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  // ============================================================
  // HOURLY rutin metodları
  // ============================================================

  getCurrentOccurrenceFor(routine: Routine): string | null {
    return getCurrentOccurrence(routine);
  }

  getNextOccurrenceFor(routine: Routine): string | null {
    return getNextOccurrence(routine);
  }

  getHourlyProgressFor(routine: Routine): { completed: number; total: number } {
    return getHourlyProgress(routine, this.todayIso);
  }

  getProgressPercent(routine: Routine): number {
    const p = getHourlyProgress(routine, this.todayIso);
    if (p.total === 0) return 0;
    return Math.round((p.completed / p.total) * 100);
  }

  isCurrentOccurrenceCompletedFor(routine: Routine): boolean {
    return isCurrentOccurrenceCompleted(routine, this.todayIso);
  }

  isBeforeActiveWindow(routine: Routine): boolean {
    const start = routine.activeHoursStart || '08:00';
    const now = new Date();
    const [h, m] = start.split(':').map(Number);
    return now.getHours() * 60 + now.getMinutes() < h * 60 + m;
  }

  isAfterActiveWindow(routine: Routine): boolean {
    const end = routine.activeHoursEnd || '22:00';
    const now = new Date();
    const [h, m] = end.split(':').map(Number);
    return now.getHours() * 60 + now.getMinutes() > h * 60 + m;
  }

  toggleHourlyComplete(routine: Routine) {
    const current = getCurrentOccurrence(routine);
    if (!current) return;

    const key = `${this.todayIso}T${current}`;
    this.storage.toggleRoutineCompletion(routine.id, key);

    if (this.storage.settings().vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  // ============================================================
  // Genel sayaçlar (hem HOURLY hem normal rutinleri hesaba katar)
  // ============================================================

  get activeRoutinesCount(): number {
    return this.todaysRoutines().length;
  }

  get completedCount(): number {
    return this.todaysRoutines().filter(r => {
      if (r.frequencyType === 'HOURLY') {
        // HOURLY için: bugün en az 1 occurrence tamamlandıysa "tamamlandı" say
        return getHourlyProgress(r, this.todayIso).completed > 0;
      }
      return this.isCompleted(r);
    }).length;
  }
}

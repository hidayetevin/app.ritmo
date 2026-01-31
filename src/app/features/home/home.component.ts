import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { TranslationService } from '../../core/services/translation.service';
import { AdService } from '../../core/services/ad.service';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Routine } from '../../core/models/routine.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  storage = inject(StorageService);
  t = inject(TranslationService);
  private adService = inject(AdService);
  private router = inject(Router);

  today = new Date();

  goToAdd() {
    this.adService.showRewardedAd().finally(() => {
      this.router.navigate(['/routines'], { queryParams: { add: 'true' } });
    });
  }
  todayIso = this.today.toISOString().split('T')[0];

  // Bugünün rutinlerini filtrele
  todaysRoutines = computed(() => {
    const routines = this.storage.routines();
    const dayIndex = this.today.getDay(); // 0=Pazar, 1=Pzt...

    return routines.filter(r => {
      if (!r.isActive) return false;

      // Sıklığa göre bugün görünmeli mi?
      switch (r.frequencyType) {
        case 'DAILY': return true;
        case 'WEEKDAYS': return dayIndex >= 1 && dayIndex <= 5;
        case 'WEEKENDS': return dayIndex === 0 || dayIndex === 6;
        case 'SPECIFIC_DAYS': return r.specificDays?.includes(dayIndex);
        case 'INTERVAL':
          const start = new Date(r.startDate);
          const diffTime = Math.abs(this.today.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays % (r.intervalDays || 1) === 0;
        default: return false;
      }
    });
  });

  // Tamamlanma durumunu kontrol et
  isCompleted(routine: Routine): boolean {
    return routine.completionHistory?.includes(this.todayIso) || false;
  }

  // Tamamla/Geri Al
  toggleComplete(routine: Routine) {
    this.storage.toggleRoutineCompletion(routine.id, this.todayIso);

    // Titreşim desteği (Opsiyonel)
    if (this.storage.settings().vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  get activeRoutinesCount() {
    return this.todaysRoutines().length;
  }

  get completedCount() {
    return this.todaysRoutines().filter(r => this.isCompleted(r)).length;
  }
}

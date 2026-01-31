import { Component, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { TranslationService } from '../../core/services/translation.service';
import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
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
export class HomeComponent implements OnInit, OnDestroy {
  storage = inject(StorageService);
  t = inject(TranslationService);
  private adService = inject(AdService);
  private notifService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit() {
    this.adService.showBanner();
    this.notifService.requestPermissions();
  }

  ngOnDestroy() {
    this.adService.hideBanner();
  }

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

    // Bugünü saatlerden arındırarak al
    const todayZero = new Date(this.today);
    todayZero.setHours(0, 0, 0, 0);

    const dayIndex = todayZero.getDay(); // 0=Pazar, 1=Pzt...

    return routines.filter(r => {
      // isActive undefined ise true kabul et (varsayılan: true)
      if (r.isActive === false) return false;

      // Başlangıç tarihini saatlerden arındır
      const startDate = new Date(r.startDate);
      startDate.setHours(0, 0, 0, 0);

      // KURAL 1: Başlangıç tarihi bugünden büyükse (gelecekteyse) GÖSTERME
      if (startDate > todayZero) return false;

      // KURAL 2: Bitiş tarihi varsa ve bugün geçildiyse GÖSTERME
      // if (r.endDate) {
      //   const endDate = new Date(r.endDate);
      //   endDate.setHours(0, 0, 0, 0);
      //   if (todayZero > endDate) return false;
      // }

      // Sıklık Kontrolü
      switch (r.frequencyType) {
        case 'DAILY': return true;
        case 'WEEKDAYS': return dayIndex >= 1 && dayIndex <= 5;
        case 'WEEKENDS': return dayIndex === 0 || dayIndex === 6;
        case 'SPECIFIC_DAYS': return r.specificDays?.includes(dayIndex);
        case 'INTERVAL':
          // Doğru gün farkı hesabı (Math.abs KULLANMA!)
          const oneDay = 1000 * 60 * 60 * 24;
          const diffTime = todayZero.getTime() - startDate.getTime();
          const diffDays = Math.round(diffTime / oneDay);

          if (diffDays < 0) return false; // Gelecek kontrolü (yukarıda yaptık ama garanti olsun)
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

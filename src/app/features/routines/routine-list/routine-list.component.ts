import { Component, inject, signal, OnInit } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { Routine } from '../../../core/models/routine.model';
import { AddRoutineModalComponent } from '../add-routine-modal/add-routine-modal.component';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../core/services/translation.service';
import { AdService } from '../../../core/services/ad.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-routine-list',
  standalone: true,
  imports: [CommonModule, AddRoutineModalComponent],
  templateUrl: './routine-list.component.html',
  styleUrl: './routine-list.component.scss'
})
export class RoutineListComponent implements OnInit {
  private storageService = inject(StorageService);
  private adService = inject(AdService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  t = inject(TranslationService);

  isModalOpen = signal(false);
  editingRoutine = signal<Routine | null>(null);

  routines = this.storageService.routines;

  ngOnInit() {
    // Check if we need to open add modal automatically
    this.route.queryParams.subscribe(params => {
      if (params['add'] === 'true') {
        // Clear params without reloading
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { add: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });

        // Open modal directly (user already watched ad on home page)
        this.editingRoutine.set(null);
        this.isModalOpen.set(true);
      }
    });
  }

  openAddModal() {
    this.adService.showRewardedAd().finally(() => {
      this.editingRoutine.set(null);
      this.isModalOpen.set(true);
    });
  }

  openEditModal(routine: Routine) {
    this.adService.showRewardedAd().finally(() => {
      this.editingRoutine.set(routine);
      this.isModalOpen.set(true);
    });
  }

  saveRoutine(routineData: Partial<Routine>) {
    if (this.editingRoutine()) {
      this.storageService.updateRoutine({ ...this.editingRoutine()!, ...routineData } as Routine);
    } else {
      this.storageService.addRoutine(routineData as any);
    }
    this.isModalOpen.set(false);
  }

  deleteRoutine(id: string, event: Event) {
    event.stopPropagation();
    if (confirm(this.t.t('DELETE_CONFIRM') || 'Rutini silmek istediğine emin misin?')) {
      this.adService.showRewardedAd().finally(() => {
        this.storageService.deleteRoutine(id);
      });
    }
  }

  getFrequencyLabel(routine: Routine): string {
    switch (routine.frequencyType) {
      case 'DAILY': return this.t.t('DAILY');
      case 'WEEKDAYS': return this.t.t('WEEKDAYS');
      case 'WEEKENDS': return this.t.t('WEEKENDS');
      case 'SPECIFIC_DAYS': return this.t.t('SPECIFIC_DAYS');
      case 'INTERVAL':
        const unit = routine.intervalUnit || 'DAY';
        const val = routine.intervalDays || 1;
        if (unit === 'MINUTE') return this.t.t('EVERY_X_MINUTES', { value: val });
        if (unit === 'HOUR') return this.t.t('EVERY_X_HOURS', { value: val });
        return this.t.t('EVERY_X_DAYS', { value: val });
      default: return '';
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { Routine } from '../../../core/models/routine.model';
import { AddRoutineModalComponent } from '../add-routine-modal/add-routine-modal.component';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../core/services/translation.service';
import { AdService } from '../../../core/services/ad.service';

@Component({
  selector: 'app-routine-list',
  standalone: true,
  imports: [CommonModule, AddRoutineModalComponent],
  templateUrl: './routine-list.component.html',
  styleUrl: './routine-list.component.scss'
})
export class RoutineListComponent {
  private storageService = inject(StorageService);
  private adService = inject(AdService);
  t = inject(TranslationService);

  isModalOpen = signal(false);
  editingRoutine = signal<Routine | null>(null);

  routines = this.storageService.routines;

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
      case 'INTERVAL': return `${routine.intervalDays} ${this.t.currentLang() === 'tr' ? 'günde bir' : 'days'}`;
      default: return '';
    }
  }
}

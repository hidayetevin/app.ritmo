import { Component, inject, signal } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { Routine } from '../../../core/models/routine.model';
import { AddRoutineModalComponent } from '../add-routine-modal/add-routine-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-routine-list',
  standalone: true,
  imports: [AddRoutineModalComponent, CommonModule],
  templateUrl: './routine-list.component.html',
  styleUrl: './routine-list.component.scss'
})
export class RoutineListComponent {
  storage = inject(StorageService);

  isModalOpen = signal(false);
  editingRoutine = signal<Routine | null>(null);

  routines = this.storage.routines;

  openAddModal() {
    this.editingRoutine.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(routine: Routine) {
    this.editingRoutine.set(routine);
    this.isModalOpen.set(true);
  }

  saveRoutine(routineData: Partial<Routine>) {
    if (this.editingRoutine()) {
      // Update
      this.storage.updateRoutine({ ...this.editingRoutine()!, ...routineData } as Routine);
    } else {
      // Create
      this.storage.addRoutine(routineData as any);
    }
    this.isModalOpen.set(false);
  }

  deleteRoutine(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Rutini silmek istediğine emin misin?')) {
      this.storage.deleteRoutine(id);
    }
  }

  getFrequencyLabel(routine: Routine): string {
    switch (routine.frequencyType) {
      case 'DAILY': return 'Her Gün';
      case 'WEEKDAYS': return 'Hafta İçi';
      case 'WEEKENDS': return 'Hafta Sonu';
      case 'SPECIFIC_DAYS': return 'Seçili Günler';
      case 'INTERVAL': return `${routine.intervalDays} günde bir`;
      default: return '';
    }
  }
}

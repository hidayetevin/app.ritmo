import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Routine, FrequencyType } from '../../../core/models/routine.model';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-add-routine-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-routine-modal.component.html',
  styleUrl: './add-routine-modal.component.scss'
})
export class AddRoutineModalComponent implements OnInit {
  @Input() routineToEdit: Routine | null = null;
  @Output() save = new EventEmitter<Partial<Routine>>();
  @Output() cancel = new EventEmitter<void>();

  fb = inject(FormBuilder);
  t = inject(TranslationService);
  form!: FormGroup;

  frequencies: { value: FrequencyType, label: string }[] = [
    { value: 'DAILY', label: this.t.t('DAILY') },
    { value: 'WEEKDAYS', label: this.t.t('WEEKDAYS') },
    { value: 'WEEKENDS', label: this.t.t('WEEKENDS') },
    { value: 'SPECIFIC_DAYS', label: this.t.t('SPECIFIC_DAYS') },
    { value: 'INTERVAL', label: this.t.t('INTERVAL') },
    { value: 'HOURLY', label: this.t.t('HOURLY') }   // YENİ
  ];

  colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A1', '#33FFF6', '#FFC300', '#DAF7A6'];

  days = [
    { index: 1, name: 'Pzt' }, { index: 2, name: 'Sal' }, { index: 3, name: 'Çar' },
    { index: 4, name: 'Per' }, { index: 5, name: 'Cum' }, { index: 6, name: 'Cmt' }, { index: 0, name: 'Paz' }
  ];

  // HOURLY - Dakika seçenekleri (sabit liste)
  minuteOptions = [10, 20, 30, 40, 50];

  // HOURLY - Saat seçenekleri (1-12)
  hourOptions = [1, 2, 3, 4, 6, 8, 12];

  ngOnInit() {
    this.initForm();
    if (this.routineToEdit) {
      this.form.patchValue({
        ...this.routineToEdit,
        startDate: this.routineToEdit.startDate.split('T')[0]
      });
    }
  }

  initForm() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      color: [this.colors[0], Validators.required],
      time: ['09:00', Validators.required],
      frequencyType: ['DAILY', Validators.required],
      specificDays: [[]],
      intervalDays: [2],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      // --- HOURLY alanları ---
      intervalUnit: ['HOURS'],
      intervalValue: [1],
      activeHoursStart: ['08:00'],
      activeHoursEnd: ['22:00']
    });
  }

  get isHourly(): boolean {
    return this.form.get('frequencyType')?.value === 'HOURLY';
  }

  get isHourUnit(): boolean {
    return this.form.get('intervalUnit')?.value === 'HOURS';
  }

  toggleDay(dayIndex: number) {
    const currentDays = this.form.value.specificDays as number[] || [];
    if (currentDays.includes(dayIndex)) {
      this.form.patchValue({ specificDays: currentDays.filter(d => d !== dayIndex) });
    } else {
      this.form.patchValue({ specificDays: [...currentDays, dayIndex] });
    }
  }

  onIntervalUnitChange(unit: 'HOURS' | 'MINUTES') {
    this.form.patchValue({ intervalUnit: unit, intervalValue: unit === 'HOURS' ? 1 : 10 });
  }

  onSubmit() {
    if (this.form.valid) {
      const value = this.form.value;

      // HOURLY rutinler için 'time' alanını activeHoursStart ile senkronize et
      if (value.frequencyType === 'HOURLY') {
        value.time = value.activeHoursStart || '08:00';
      }

      this.save.emit(value);
    }
  }
}

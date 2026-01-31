import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Routine, FrequencyType } from '../../../core/models/routine.model';
import { CommonModule } from '@angular/common';

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
  form!: FormGroup;

  frequencies: { value: FrequencyType, label: string }[] = [
    { value: 'DAILY', label: 'Her Gün' },
    { value: 'WEEKDAYS', label: 'Hafta İçi' },
    { value: 'WEEKENDS', label: 'Hafta Sonu' },
    { value: 'SPECIFIC_DAYS', label: 'Seçili Günler' },
    { value: 'INTERVAL', label: 'Belirli Aralıkla' }
  ];

  colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A1', '#33FFF6', '#FFC300', '#DAF7A6'];

  days = [
    { index: 1, name: 'Pzt' }, { index: 2, name: 'Sal' }, { index: 3, name: 'Çar' },
    { index: 4, name: 'Per' }, { index: 5, name: 'Cum' }, { index: 6, name: 'Cmt' }, { index: 0, name: 'Paz' }
  ];

  ngOnInit() {
    this.initForm();
    if (this.routineToEdit) {
      this.form.patchValue({
        ...this.routineToEdit,
        startDate: this.routineToEdit.startDate.split('T')[0] // Ensure date format
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
      startDate: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  toggleDay(dayIndex: number) {
    const currentDays = this.form.value.specificDays as number[] || [];
    if (currentDays.includes(dayIndex)) {
      this.form.patchValue({ specificDays: currentDays.filter(d => d !== dayIndex) });
    } else {
      this.form.patchValue({ specificDays: [...currentDays, dayIndex] });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }
}

import { Component, inject, signal, effect, computed } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { StorageService } from '../../core/services/storage.service';
import { Routine } from '../../core/models/routine.model';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';

registerLocaleData(localeTr);

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, CommonModule, DatePipe],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  storage = inject(StorageService);

  // Tabs: 'list' | 'calendar'
  activeTab = signal<'list' | 'calendar'>('list');

  // Selected Date for List Viewer
  selectedDate = signal<Date>(new Date());

  dailyRoutines = computed(() => {
    const list = this.storage.routines();
    const date = this.selectedDate();
    return list.filter(r => r.isActive !== false && this.isRoutineDue(r, date, new Date(r.startDate)));
  });

  calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'today'
    },
    events: this.loadEvents.bind(this),
    eventClick: (info) => {
      // Handle click on calendar event
      const routineId = info.event.extendedProps['routineId'];
      // Event start date is the specific instance date
      const dateStr = info.event.startStr.split('T')[0];

      if (confirm(`${info.event.title} rütinini ${dateStr} tarihi için tamamlandı/tamamlanmadı olarak değiştirmek istiyor musun?`)) {
        this.toggleCompletion(routineId, dateStr);
        info.event.setProp('backgroundColor', info.event.backgroundColor === '#28a745' ? info.event.extendedProps['originalColor'] : '#28a745');
      }
    },
    height: 'auto',
    locale: 'tr'
  });

  constructor() {
    // Refresh events when routines change
    effect(() => {
      const routines = this.storage.routines(); // dependency
      // Trigger calendar refresh
      this.calendarOptions.update(opts => ({
        ...opts,
        events: this.loadEvents.bind(this)
      }));
    });
  }

  // --- Actions ---

  changeTab(tab: 'list' | 'calendar') {
    this.activeTab.set(tab);
    // If switching to calendar, maybe we want to render it properly (sometimes sizing issues occur)
  }

  changeDate(days: number) {
    const newDate = new Date(this.selectedDate());
    newDate.setDate(newDate.getDate() + days);
    this.selectedDate.set(newDate);
  }

  toggleCompletion(routineId: string, dateStr?: string) {
    // If via List view, use selectedDate. If via Calendar, use passed date.
    const targetDate = dateStr || this.selectedDate().toISOString().split('T')[0];
    this.storage.toggleRoutineCompletion(routineId, targetDate);
  }

  checkCompletion(routine: Routine, date?: Date): boolean {
    const d = date || this.selectedDate();
    const isoDate = d.toISOString().split('T')[0];
    return (routine.completionHistory || []).includes(isoDate);
  }

  // --- Calendar Logic ---

  loadEvents(info: any, successCallback: any, failureCallback: any) {
    const routines = this.storage.routines();
    const events: EventInput[] = [];

    const startRange = new Date(info.start);
    const endRange = new Date(info.end);

    routines.forEach(routine => {
      if (!routine.isActive) return;

      const rStart = new Date(routine.startDate);
      rStart.setHours(0, 0, 0, 0);

      let current = new Date(startRange < rStart ? rStart : startRange);
      current.setHours(0, 0, 0, 0);

      const safetyLimit = 1000;
      let count = 0;

      while (current < endRange && count < safetyLimit) {
        count++;

        if (this.isRoutineDue(routine, current, rStart)) {
          const dateStr = current.toISOString().split('T')[0];
          const isDone = (routine.completionHistory || []).includes(dateStr);

          // Set time
          const [hours, mins] = routine.time.split(':').map(Number);
          const eventDate = new Date(current);
          eventDate.setHours(hours, mins);

          events.push({
            title: isDone ? `✔ ${routine.title}` : routine.title,
            start: eventDate.toISOString(),
            color: isDone ? '#28a745' : routine.color, // Green if done
            extendedProps: {
              routineId: routine.id,
              originalColor: routine.color
            },
            allDay: false
          });
        }

        // Next day
        current.setDate(current.getDate() + 1);
      }
    });

    successCallback(events);
  }

  isRoutineDue(routine: Routine, date: Date, startDate: Date): boolean {
    // Normalizasyon (Saatleri sıfırla)
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const rStart = new Date(startDate);
    rStart.setHours(0, 0, 0, 0);

    // KURAL 1: Henüz başlamamışsa gösterme
    if (checkDate.getTime() < rStart.getTime()) return false;

    // KURAL 2: Bitiş tarihi varsa ve geçildiyse gösterme
    // if (routine.endDate) {
    //   const endDate = new Date(routine.endDate);
    //   endDate.setHours(0, 0, 0, 0);
    //   if (checkDate.getTime() > endDate.getTime()) return false;
    // }

    const dayOfWeek = checkDate.getDay(); // 0=Pazar

    switch (routine.frequencyType) {
      case 'DAILY':
        return true;
      case 'WEEKDAYS':
        return dayOfWeek !== 0 && dayOfWeek !== 6;
      case 'WEEKENDS':
        return dayOfWeek === 0 || dayOfWeek === 6;
      case 'SPECIFIC_DAYS':
        return (routine.specificDays || []).includes(dayOfWeek);
      case 'INTERVAL':
        if (!routine.intervalDays) return false;

        // Math.abs YERİNE sadece geçen gün farkına bak
        const oneDay = 1000 * 60 * 60 * 24;
        const diffTime = checkDate.getTime() - rStart.getTime();
        const diffDays = Math.round(diffTime / oneDay);

        if (diffDays < 0) return false; // Başlamadı
        return diffDays % routine.intervalDays === 0;
      default:
        return false;
    }
  }
}

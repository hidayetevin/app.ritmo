import { Component, inject, signal, effect, computed } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { StorageService } from '../../core/services/storage.service';
import { TranslationService } from '../../core/services/translation.service';
import { Routine } from '../../core/models/routine.model';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';
import { getOccurrenceTimesForDay, getHourlyProgress } from '../../core/utils/routine.utils';

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
  t = inject(TranslationService);

  // Tabs: 'list' | 'calendar'
  activeTab = signal<'list' | 'calendar'>('list');

  // Selected Date for List Viewer
  selectedDate = signal<Date>(new Date());

  // HOURLY Tamamlama Modalı
  isHourlyModalOpen = signal(false);
  selectedHourlyRoutine = signal<Routine | null>(null);

  dailyRoutines = computed(() => {
    const list = this.storage.routines();
    const date = this.selectedDate();
    return list.filter(r => r.isActive !== false && this.isRoutineDue(r, date, new Date(r.startDate)));
  });

  calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    displayEventTime: false,
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
        events: this.loadEvents.bind(this),
        buttonText: {
          today: this.t.t('TODAY')
        }
      }));
    });

    // Listen for language changes to update calendar text
    effect(() => {
      const lang = this.t.currentLang(); // dependency
      this.calendarOptions.update(opts => ({
        ...opts,
        buttonText: {
          today: this.t.t('TODAY'),
          month: 'Ay',
          week: 'Hafta',
          day: 'Gün',
          list: 'Liste'
        },
        locale: lang
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

  // --- HOURLY: Günlük Liste yardımcı metodları ---

  getSelectedDateIso(): string {
    return this.selectedDate().toISOString().split('T')[0];
  }

  getHourlyProgressForDate(routine: Routine): { completed: number; total: number } {
    return getHourlyProgress(routine, this.getSelectedDateIso());
  }

  getHourlyProgressPercent(routine: Routine): number {
    const p = getHourlyProgress(routine, this.getSelectedDateIso());
    if (p.total === 0) return 0;
    return Math.round((p.completed / p.total) * 100);
  }

  // --- HOURLY Tamamlama Modalı ---

  openHourlyOccurrenceModal(routine: Routine) {
    this.selectedHourlyRoutine.set(routine);
    this.isHourlyModalOpen.set(true);
  }

  closeHourlyModal() {
    this.isHourlyModalOpen.set(false);
    this.selectedHourlyRoutine.set(null);
  }

  /** Tüm occurrence slotlarını tamamlanma durumuyla birlikte döndürür */
  getOccurrencesWithStatus(routine: Routine): { time: string; isDone: boolean; key: string; isPast: boolean }[] {
    if (routine.frequencyType !== 'HOURLY') return [];
    const dateIso = this.getSelectedDateIso();
    const times = getOccurrenceTimesForDay(routine);
    const now = new Date();
    const isToday = dateIso === now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return times.map(time => {
      const [h, m] = time.split(':').map(Number);
      const key = `${dateIso}T${time}`;
      const timeMinutes = h * 60 + m;
      return {
        time,
        isDone: (routine.completionHistory || []).includes(key),
        key,
        // Geçmiş: bugün ise ve zaman geçmişse, ya da bugün değilse (geçmiş gün)
        isPast: isToday ? timeMinutes <= currentMinutes : dateIso < now.toISOString().split('T')[0]
      };
    });
  }

  toggleOccurrenceCompletion(routineId: string, key: string) {
    this.storage.toggleRoutineCompletion(routineId, key);
  }

  // --- Calendar Logic ---

  loadEvents(info: any, successCallback: any, failureCallback: any) {
    const routines = this.storage.routines();
    const events: EventInput[] = [];

    const startRange = new Date(info.start);
    startRange.setHours(0, 0, 0, 0);

    const endRange = new Date(info.end);
    endRange.setHours(0, 0, 0, 0);

    routines.forEach(routine => {
      // Varsayılan isActive: true
      if (routine.isActive === false) return;

      const rStart = new Date(routine.startDate);
      rStart.setHours(0, 0, 0, 0);

      // Başlangıç tarihi, takvim aralığının sonundan büyükse hiç döngüye girme (Optimizasyon)
      if (rStart >= endRange) return;

      // Döngüyü optimum yerden başlat:
      // Eğer rutin başlangıcı, takvim başlangıcından sonraysa rutin başlangıcını baz al.
      // Değilse takvim başlangıcını baz al.
      let current = new Date(startRange < rStart ? rStart : startRange);
      current.setHours(0, 0, 0, 0);

      // Sonsuz döngü koruması (1 yıl)
      const safetyLimit = 366;
      let count = 0;

      while (current < endRange && count < safetyLimit) {
        count++;

        // isRoutineDue zaten tarih kontrollerini yapıyor
        if (this.isRoutineDue(routine, current, rStart)) {
          const dateStr = current.toISOString().split('T')[0];

          if (routine.frequencyType === 'HOURLY') {
            // HOURLY: Günlük TEK event — başlıkta X/Y progress sayacı
            const occurrenceTimes = getOccurrenceTimesForDay(routine);
            const total = occurrenceTimes.length;
            const completedCount = occurrenceTimes.filter(time =>
              (routine.completionHistory || []).includes(`${dateStr}T${time}`)
            ).length;

            // Renk: tamamına göre → yeşil / kısmen → rutin rengi / hiç → soluk
            const eventColor = completedCount === total && total > 0
              ? '#198754'
              : completedCount > 0
                ? routine.color
                : routine.color + '99'; // %60 opacity hex

            // Başlık: ilerleyişi göster
            const progressIcon = completedCount === total && total > 0 ? '✔ ' : '';
            const progressTitle = `${progressIcon}${routine.title} ${completedCount}/${total}`;

            // Olayı activeHoursStart zamanında başlat
            const [startH, startM] = (routine.activeHoursStart || '08:00').split(':').map(Number);
            const eventDate = new Date(current);
            eventDate.setHours(startH, startM);

            events.push({
              id: `${routine.id}-${dateStr}`,
              title: progressTitle,
              start: eventDate.toISOString(),
              color: eventColor,
              extendedProps: {
                routineId: routine.id,
                originalColor: routine.color,
                isHourly: true,
                completed: completedCount,
                total: total,
                dateStr: dateStr
              },
              allDay: false
            });
          } else {
            // Normal rutin: tek event
            const isDone = (routine.completionHistory || []).includes(dateStr);
            const [hours, mins] = routine.time.split(':').map(Number);
            const eventDate = new Date(current);
            eventDate.setHours(hours, mins);

            events.push({
              id: routine.id,
              title: isDone ? `✔ ${routine.title}` : routine.title,
              start: eventDate.toISOString(),
              color: isDone ? '#198754' : routine.color, // Bootstrap success color
              extendedProps: {
                routineId: routine.id,
                originalColor: routine.color,
                isDone: isDone
              },
              allDay: false
            });
          }
        }

        // Bir sonraki güne geç
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
      case 'HOURLY':
        // HOURLY rutinler başlangıç tarihinden itibaren her gün takvimde görünür
        return true;
      default:
        return false;
    }
  }
}

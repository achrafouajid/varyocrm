import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService } from '../services/crm-state.service';

interface CalendarDay {
  day: number;
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
  teamMembers: string[];
}

@Component({
  selector: 'app-partner-schedule-calendar',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="glass-card rounded-2xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Partner Schedule</h3>
        <div class="flex items-center gap-1">
          <button
            (click)="prevMonth()"
            class="w-8 h-8 rounded-full glass-button flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all border-0"
          >
            <mat-icon class="text-[18px] w-[18px] h-[18px] leading-none">chevron_left</mat-icon>
          </button>
          <span class="text-sm font-bold text-slate-800 min-w-[120px] text-center select-none">
            {{ monthNames[currentMonth()] }} {{ currentYear() }}
          </span>
          <button
            (click)="nextMonth()"
            class="w-8 h-8 rounded-full glass-button flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all border-0"
          >
            <mat-icon class="text-[18px] w-[18px] h-[18px] leading-none">chevron_right</mat-icon>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1.5 mb-2">
        @for (h of dayHeaders; track h) {
          <div class="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">{{ h }}</div>
        }
      </div>

      <div class="grid grid-cols-7 gap-1.5">
        @for (cell of calendarDays(); track cell ? cell.dateStr : $index) {
          @if (cell) {
            <div
              [class]="
                cell.isToday
                  ? 'ring-2 ring-indigo-500 bg-indigo-50/80'
                  : cell.isPast
                    ? 'bg-white/80'
                    : 'bg-white/30'
              "
              class="rounded-xl p-1.5 min-h-[72px] flex flex-col justify-between transition-all border border-white/40"
            >
              <div class="flex flex-wrap gap-0.5">
                @for (member of cell.teamMembers.slice(0, 4); track member) {
                  <span
                    class="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                    [style.background-color]="getUserColor(member)"
                    [title]="member"
                  >
                    {{ getInitials(member) }}
                  </span>
                }
                @if (cell.teamMembers.length > 4) {
                  <span class="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-500 bg-slate-200 shrink-0">
                    +{{ cell.teamMembers.length - 4 }}
                  </span>
                }
              </div>
              <div class="text-[11px] font-bold mt-1" [class]="cell.isToday ? 'text-indigo-700' : cell.isPast ? 'text-slate-700' : 'text-slate-400'">
                {{ cell.day }}
              </div>
            </div>
          } @else {
            <div class="min-h-[72px]"></div>
          }
        }
      </div>
    </div>
  `
})
export class PartnerScheduleCalendarComponent {
  state = inject(CrmStateService);

  currentMonth = signal(new Date().getMonth());
  currentYear = signal(new Date().getFullYear());

  monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  dayHeaders = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  private today = new Date();

  calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    const startOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days: (CalendarDay | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const date = new Date(year, month, d);
      const isToday = this.today.getFullYear() === year && this.today.getMonth() === month && this.today.getDate() === d;
      const isPast = date < new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());

      const teamMembers = this.getTeamMembersForDate(dateStr);

      days.push({ day: d, dateStr, isToday, isPast, teamMembers });
    }

    return days;
  });

  private getTeamMembersForDate(dateStr: string): string[] {
    const membersSet = new Set<string>();

    for (const task of this.state.tasks()) {
      if (task.deadline === dateStr && task.assignedTo) {
        membersSet.add(task.assignedTo);
      }
    }

    for (const deal of this.state.deals()) {
      for (const meeting of (deal.activityLog?.meetings || [])) {
        if (meeting.date === dateStr) {
          for (const attendee of meeting.attendees) {
            membersSet.add(attendee);
          }
        }
      }
    }

    return Array.from(membersSet);
  }

  prevMonth() {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
  }

  nextMonth() {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getUserColor(name: string): string {
    const colors = [
      '#6366f1', '#10b981', '#f59e0b', '#ef4444',
      '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
      '#3b82f6', '#84cc16'
    ];
    const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
}

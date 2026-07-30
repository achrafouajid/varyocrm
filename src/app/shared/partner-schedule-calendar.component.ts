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
    <div class="card rounded-2xl p-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-[11px] font-bold text-zinc-700 uppercase tracking-wide">Partner Schedule</h3>
        <div class="flex items-center gap-0.5">
          <button
            (click)="prevMonth()"
            class="w-7 h-7 rounded-full btn-secondary flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all border-0"
          >
            <mat-icon class="text-[16px] w-[16px] h-[16px] leading-none">chevron_left</mat-icon>
          </button>
          <span class="text-xs font-bold text-zinc-800 min-w-[110px] text-center select-none">
            {{ monthNames[currentMonth()] }} {{ currentYear() }}
          </span>
          <button
            (click)="nextMonth()"
            class="w-7 h-7 rounded-full btn-secondary flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-all border-0"
          >
            <mat-icon class="text-[16px] w-[16px] h-[16px] leading-none">chevron_right</mat-icon>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1 mb-1">
        @for (h of dayHeaders; track h) {
          <div class="text-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider py-0.5">{{ h }}</div>
        }
      </div>

      <div class="grid grid-cols-7 gap-1">
        @for (cell of calendarDays(); track cell ? cell.dateStr : $index) {
          @if (cell) {
            <div
              [class]="
                cell.isToday
                  ? 'ring-2 ring-zinc-700 bg-zinc-100/80'
                  : cell.isPast
                    ? 'bg-white/80'
                    : 'bg-white/30'
              "
              class="rounded-xl p-1 min-h-[48px] flex flex-col justify-between transition-all border border-white/40"
            >
              <div class="flex flex-wrap gap-0.5">
                @for (member of cell.teamMembers.slice(0, 4); track member) {
                  <span
                    class="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0"
                    [style.background-color]="getUserColor(member)"
                    [title]="member"
                  >
                    {{ getInitials(member) }}
                  </span>
                }
                @if (cell.teamMembers.length > 4) {
                  <span class="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-zinc-500 bg-zinc-200 shrink-0">
                    +{{ cell.teamMembers.length - 4 }}
                  </span>
                }
              </div>
              <div class="text-[10px] font-bold" [class]="cell.isToday ? 'text-zinc-950' : cell.isPast ? 'text-zinc-700' : 'text-zinc-400'">
                {{ cell.day }}
              </div>
            </div>
          } @else {
            <div class="min-h-[48px]"></div>
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

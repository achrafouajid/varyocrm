import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { CrmStateService, Task, Ticket, TaskStatus } from '../services/crm-state.service';
import { Router } from '@angular/router';
import { PartnerScheduleCalendarComponent } from '../shared/partner-schedule-calendar.component';

interface KpiTile {
  id: string;
  label: string;
  icon: string;
  value: string;
  delta: { pct: number; direction: 'up' | 'down' | 'flat' } | null;
  deltaLabel: string;
  sparkline: number[];
}

interface TodayItem {
  kind: 'task' | 'deal' | 'ticket';
  id: string;
  icon: string;
  title: string;
  meta: string;
  actionLabel: string;
  action: () => void;
}

@Component({
  selector: 'app-dashboard',
  imports: [MatIconModule, CommonModule, DragDropModule, PartnerScheduleCalendarComponent],
  template: `
    <div class="space-y-3 mb-6">

      <!-- Bento Grid: hero, pipeline, late payers, schedule, distribution charts -->
      <div class="bento-grid">
        <!-- Hero: Today -->
        <div class="tile-hero card p-4 flex flex-col">
          <div class="flex items-center gap-2 mb-3">
            <div class="h-7 w-7 bg-zinc-900 text-white rounded-lg flex items-center justify-center">
              <mat-icon class="text-[15px]">wb_sunny</mat-icon>
            </div>
            <h3 class="text-sm font-bold text-zinc-900">Today</h3>
          </div>
          <div class="flex-1 space-y-2">
            @for (item of todayItems(); track item.kind + item.id) {
              <div class="flex items-start gap-2.5 bg-zinc-50 border border-zinc-200 rounded-xl p-2.5">
                <mat-icon class="text-[16px] w-4 h-4 mt-0.5 shrink-0 text-zinc-500">{{ item.icon }}</mat-icon>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-semibold text-zinc-800 truncate">{{ item.title }}</div>
                  <div class="text-meta text-zinc-400 font-medium truncate">{{ item.meta }}</div>
                </div>
                <button (click)="item.action()" class="shrink-0 text-meta font-bold text-zinc-900 bg-white border border-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors rounded-lg px-2 py-1">
                  {{ item.actionLabel }}
                </button>
              </div>
            } @empty {
              <div class="h-full flex flex-col items-center justify-center text-center py-6">
                <mat-icon class="text-[24px] w-6 h-6 text-zinc-300 mb-1">task_alt</mat-icon>
                <div class="text-xs text-zinc-400 font-medium">Nothing urgent — you're caught up.</div>
              </div>
            }
          </div>
        </div>

        <!-- Pipeline: wide tile with area chart -->
        <div class="tile-pipeline card p-4 flex flex-col">
          <div class="flex items-center justify-between mb-1">
            <h3 class="text-meta font-bold text-zinc-700 uppercase tracking-wide">Pipeline Value</h3>
            @if (pipelineDelta(); as d) {
              <span class="text-meta font-bold flex items-center gap-0.5" [class]="d.direction === 'up' ? 'text-emerald-600' : d.direction === 'down' ? 'text-red-500' : 'text-zinc-400'">
                <mat-icon class="text-[12px] w-3 h-3">{{ d.direction === 'up' ? 'trending_up' : d.direction === 'down' ? 'trending_down' : 'trending_flat' }}</mat-icon>
                {{ d.pct > 0 ? '+' : '' }}{{ d.pct }}% vs last month
              </span>
            }
          </div>
          <div class="text-xl font-bold text-zinc-900">{{ formatCurrency(totalPipelineValue()) }}</div>

          <svg viewBox="0 0 280 70" class="w-full h-16 mt-1" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pipelineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="currentColor" stop-opacity="0.25" class="text-blue-500" />
                <stop offset="100%" stop-color="currentColor" stop-opacity="0" class="text-blue-500" />
              </linearGradient>
            </defs>
            <path [attr.d]="pipelineAreaPath()" fill="url(#pipelineFill)"></path>
            <polyline [attr.points]="sparklinePoints(pipelineSeries(), 280, 70)" fill="none" class="text-blue-500" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
          </svg>

          <div class="text-meta font-bold text-zinc-400 uppercase tracking-wider mt-2 mb-1.5">Top Deals</div>
          <div class="space-y-1.5">
            @for (deal of topPipelineDeals(); track deal.id; let i = $index) {
              <div class="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl p-1.5">
                <div class="w-5 h-5 rounded-full flex items-center justify-center text-meta font-bold shrink-0 bg-zinc-200 text-zinc-950">
                  {{ i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉' }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-meta font-semibold text-zinc-800 truncate">{{ getPartnerName(deal.partnerId) }}</div>
                </div>
                <div class="text-meta font-bold font-sans text-zinc-900 shrink-0">{{ formatCurrency(deal.amount) }}</div>
              </div>
            } @empty {
              <div class="text-center py-3 text-meta text-zinc-400">No active deals in pipeline</div>
            }
          </div>
        </div>

        <!-- Late Payers: compact red-accented tile -->
        <div class="tile-late card p-4 flex flex-col bg-red-50/40 border-red-200!">
          <div class="flex items-center justify-between mb-1.5">
            <h3 class="text-meta font-bold text-red-700 uppercase tracking-wide">Late Payers</h3>
            <div class="h-6 w-6 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
              <mat-icon class="text-[13px]">warning</mat-icon>
            </div>
          </div>
          <div class="text-xl font-bold text-red-700">{{ latePayersCount() }}</div>
          @if (latePayersDelta(); as d) {
            <div class="text-meta font-bold mt-0.5 flex items-center gap-0.5" [class]="d.direction === 'up' ? 'text-red-600' : d.direction === 'down' ? 'text-emerald-600' : 'text-zinc-400'">
              <mat-icon class="text-[11px] w-3 h-3">{{ d.direction === 'up' ? 'trending_up' : d.direction === 'down' ? 'trending_down' : 'trending_flat' }}</mat-icon>
              {{ d.pct > 0 ? '+' : '' }}{{ d.pct }}% vs last month
            </div>
          }
          <svg viewBox="0 0 100 24" class="w-full h-6 mt-auto pt-2" preserveAspectRatio="none">
            <polyline [attr.points]="sparklinePoints(latePayersSeries(), 100, 24)" fill="none" class="text-red-400" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
          </svg>
        </div>

        <!-- Partner Directory donut -->
        <div class="tile-partners card p-4">
          <h3 class="text-meta font-bold text-zinc-700 uppercase tracking-wide mb-3">Partner Directory</h3>
          <div class="flex items-center">
            <div class="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.9155" class="text-white/30" stroke-width="4" stroke="currentColor" fill="none"></circle>
                @for (slice of partnerSlices(); track slice.label) {
                  <circle
                    cx="18" cy="18" r="15.9155"
                    [class]="slice.stroke" stroke-width="4"
                    [attr.stroke-dasharray]="slice.dasharray"
                    [attr.stroke-dashoffset]="slice.dashoffset"
                    stroke="currentColor" fill="none">
                  </circle>
                }
              </svg>
            </div>
            <div class="ml-3 w-full space-y-1">
              @for (slice of partnerSlices(); track slice.label) {
                <div class="flex items-center justify-between text-meta">
                  <div class="flex items-center">
                    <span class="w-2.5 h-2.5 rounded-full mr-1.5" [class]="slice.color"></span>
                    <span class="text-zinc-600 font-semibold">{{slice.label}}</span>
                  </div>
                  <span class="text-zinc-900 font-bold">{{slice.count}}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Today's Schedule: tall tile -->
        <div class="tile-schedule">
          <app-partner-schedule-calendar />
        </div>

        <!-- Tasks Status donut -->
        <div class="tile-tasks card p-4">
          <h3 class="text-meta font-bold text-zinc-700 uppercase tracking-wide mb-3">Tasks Status</h3>
          <div class="flex items-center">
            <div class="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.9155" class="text-white/30" stroke-width="4" stroke="currentColor" fill="none"></circle>
                @for (slice of taskSlices(); track slice.label) {
                  <circle
                    cx="18" cy="18" r="15.9155"
                    [class]="slice.stroke" stroke-width="4"
                    [attr.stroke-dasharray]="slice.dasharray"
                    [attr.stroke-dashoffset]="slice.dashoffset"
                    stroke="currentColor" fill="none">
                  </circle>
                }
              </svg>
            </div>
            <div class="ml-3 w-full space-y-1">
              @for (slice of taskSlices(); track slice.label) {
                <div class="flex items-center justify-between text-meta">
                  <div class="flex items-center">
                    <span class="w-2.5 h-2.5 rounded-full mr-1.5" [class]="slice.color"></span>
                    <span class="text-zinc-600 font-semibold">{{slice.label}}</span>
                  </div>
                  <span class="text-zinc-900 font-bold">{{slice.count}}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content + Right Sidebar -->
      <div class="flex gap-4">
        <!-- Left: draggable KPI tiles -->
        <div class="flex-1 min-w-0 space-y-3">
          @if (state.isCustomizing() && hiddenKpis().length > 0) {
            <div class="card p-3">
              <h4 class="text-meta font-bold text-zinc-400 uppercase tracking-wider mb-2">Add a KPI</h4>
              <div class="flex flex-wrap gap-1.5">
                @for (kpi of hiddenKpis(); track kpi.id) {
                  <button (click)="toggleKpi(kpi.id)" class="btn-secondary text-zinc-500 text-xs">
                    <mat-icon class="text-[13px] w-3.5 h-3.5">add</mat-icon>
                    {{ kpi.name }}
                  </button>
                }
              </div>
            </div>
          }

          <div
            cdkDropList
            (cdkDropListDropped)="onKpiDrop($event)"
            class="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            @for (tile of kpiTiles(); track tile.id) {
              <div
                cdkDrag
                [cdkDragDisabled]="!state.isCustomizing()"
                class="stat-card flex flex-col relative"
                [class.cursor-move]="state.isCustomizing()"
              >
                @if (state.isCustomizing()) {
                  <button (click)="toggleKpi(tile.id)" class="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center z-10">
                    <mat-icon class="text-[12px] w-3 h-3">close</mat-icon>
                  </button>
                }
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="section-label !px-0">{{ tile.label }}</h3>
                  <div class="h-7 w-7 bg-zinc-100 text-zinc-900 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-[14px]">{{ tile.icon }}</mat-icon>
                  </div>
                </div>
                <div class="text-sm lg:text-base font-bold text-zinc-900 truncate">{{ tile.value }}</div>
                <div class="mt-1.5 pt-1.5 border-t border-zinc-100 flex items-center justify-between gap-2">
                  @if (tile.delta; as d) {
                    <span class="text-meta font-bold flex items-center gap-0.5 shrink-0" [class]="d.direction === 'up' ? 'text-emerald-600' : d.direction === 'down' ? 'text-red-500' : 'text-zinc-400'">
                      <mat-icon class="text-[11px]! leading-none! w-3 h-3">{{ d.direction === 'up' ? 'trending_up' : d.direction === 'down' ? 'trending_down' : 'trending_flat' }}</mat-icon>
                      {{ d.pct > 0 ? '+' : '' }}{{ d.pct }}%
                    </span>
                  } @else {
                    <span></span>
                  }
                  <svg viewBox="0 0 64 20" class="w-14 h-5 shrink-0" preserveAspectRatio="none">
                    <polyline [attr.points]="sparklinePoints(tile.sparkline, 64, 20)" fill="none" class="text-zinc-300" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
                  </svg>
                </div>
              </div>
            } @empty {
              <div class="col-span-full text-center py-6 text-xs text-zinc-400">No KPIs selected — enable customizing to add some.</div>
            }
          </div>
        </div>

        <!-- Right Sidebar: Pending Tasks + Pending Tickets -->
        <div class="w-80 shrink-0 sticky top-0 self-start">
          <!-- Pending Tasks Card -->
          <div class="card p-4 mb-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <mat-icon class="text-[16px] w-4 h-4">task_alt</mat-icon>
                <h3 class="text-xs font-bold text-zinc-800">Pending Tasks</h3>
                <span class="text-meta font-medium text-white bg-zinc-700 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{{ pendingTasksCount() }}</span>
              </div>
            </div>

            <div class="max-h-[260px] overflow-y-auto space-y-1 -mr-2 pr-2">
              <!-- Urgent tasks -->
                @let urgentTasks = groupedPendingTasks().urgent;
                @if (urgentTasks.length > 0) {
                  <div>
                    <button (click)="navigateToFilteredTasks('Urgent')" class="flex items-center gap-1.5 text-meta font-bold text-zinc-900 uppercase tracking-wider mb-1 px-1 hover:text-zinc-950 hover:underline transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Urgent
                      <span class="text-meta text-zinc-500 font-semibold ml-auto">{{ urgentTasks.length }}</span>
                    </button>
                    @for (task of urgentTasks; track task.id) {
                      <div
                        class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-100/60 transition-colors group"
                        [class.bg-zinc-100/60]="selectedTaskIds().has(task.id)"
                      >
                        <mat-icon
                          (click)="$event.stopPropagation(); toggleTaskSelection(task.id)"
                          class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                          [class.text-zinc-700]="selectedTaskIds().has(task.id)"
                          [class.text-zinc-300]="!selectedTaskIds().has(task.id)"
                        >
                          {{ selectedTaskIds().has(task.id) ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                        <div (click)="navigateToTasks()" class="flex-1 min-w-0 flex items-center gap-2 cursor-pointer">
                          <span class="text-xs font-medium text-zinc-700 truncate flex-1 hover:underline">{{ task.title }}</span>
                          <div class="flex flex-col items-end gap-0.5 shrink-0">
                            @if (task.deadline) {
                              <span class="text-meta font-sans leading-tight" [class]="deadlineClass(task.deadline)">{{ formatDate(task.deadline) }}</span>
                            }
                            <span class="text-meta text-red-600 px-1.5 py-0.5 rounded">Urgent</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- Medium tasks -->
                @let mediumTasks = groupedPendingTasks().medium;
                @if (mediumTasks.length > 0) {
                  <div>
                    <button (click)="navigateToFilteredTasks('Medium')" class="flex items-center gap-1.5 text-meta font-bold text-zinc-900 uppercase tracking-wider mb-1 px-1 hover:text-zinc-950 hover:underline transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Medium
                      <span class="text-meta text-zinc-500 font-semibold ml-auto">{{ mediumTasks.length }}</span>
                    </button>
                    @for (task of mediumTasks; track task.id) {
                      <div
                        class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-100/60 transition-colors group"
                        [class.bg-zinc-100/60]="selectedTaskIds().has(task.id)"
                      >
                        <mat-icon
                          (click)="$event.stopPropagation(); toggleTaskSelection(task.id)"
                          class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                          [class.text-zinc-700]="selectedTaskIds().has(task.id)"
                          [class.text-zinc-300]="!selectedTaskIds().has(task.id)"
                        >
                          {{ selectedTaskIds().has(task.id) ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                        <div (click)="navigateToTasks()" class="flex-1 min-w-0 flex items-center gap-2 cursor-pointer">
                          <span class="text-xs font-medium text-zinc-700 truncate flex-1 hover:underline">{{ task.title }}</span>
                          <div class="flex flex-col items-end gap-0.5 shrink-0">
                            @if (task.deadline) {
                              <span class="text-meta font-sans leading-tight" [class]="deadlineClass(task.deadline)">{{ formatDate(task.deadline) }}</span>
                            }
                            <span class="text-meta text-amber-600 px-1.5 py-0.5 rounded">Medium</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- Low tasks -->
                @let lowTasks = groupedPendingTasks().low;
                @if (lowTasks.length > 0) {
                  <div>
                    <button (click)="navigateToFilteredTasks('Low')" class="flex items-center gap-1.5 text-meta font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1 hover:text-zinc-700 hover:underline transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Low
                      <span class="text-meta text-zinc-400 font-semibold ml-auto">{{ lowTasks.length }}</span>
                    </button>
                    @for (task of lowTasks; track task.id) {
                      <div
                        class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-50/60 transition-colors group"
                        [class.bg-zinc-50/60]="selectedTaskIds().has(task.id)"
                      >
                        <mat-icon
                          (click)="$event.stopPropagation(); toggleTaskSelection(task.id)"
                          class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                          [class.text-zinc-700]="selectedTaskIds().has(task.id)"
                          [class.text-zinc-300]="!selectedTaskIds().has(task.id)"
                        >
                          {{ selectedTaskIds().has(task.id) ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                        <div (click)="navigateToTasks()" class="flex-1 min-w-0 flex items-center gap-2 cursor-pointer">
                          <span class="text-xs font-medium text-zinc-700 truncate flex-1 hover:underline">{{ task.title }}</span>
                          <div class="flex flex-col items-end gap-0.5 shrink-0">
                            @if (task.deadline) {
                              <span class="text-meta font-sans leading-tight" [class]="deadlineClass(task.deadline)">{{ formatDate(task.deadline) }}</span>
                            }
                            <span class="text-meta text-emerald-600 px-1.5 py-0.5 rounded">Low</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }

                @if (urgentTasks.length === 0 && mediumTasks.length === 0 && lowTasks.length === 0) {
                  <div class="text-center py-4 text-xs text-zinc-400">No pending tasks</div>
                }
              </div>
          </div>

          <!-- Pending Tickets Card -->
          <div class="card p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <mat-icon class="text-[16px] w-4 h-4">support_agent</mat-icon>
                <h3 class="text-xs font-bold text-zinc-800">Pending Tickets</h3>
                <span class="text-meta font-medium text-white bg-zinc-700 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{{ pendingTicketsCount() }}</span>
              </div>
            </div>

            <div class="max-h-[260px] overflow-y-auto space-y-1 -mr-2 pr-2">
              <!-- High priority -->
                @let highTickets = groupedPendingTickets().high;
                @if (highTickets.length > 0) {
                  <div>
                    <button (click)="navigateToFilteredTickets('High')" class="flex items-center gap-1.5 text-meta font-bold text-zinc-900 uppercase tracking-wider mb-1 px-1 hover:text-zinc-950 hover:underline transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      High
                      <span class="text-meta text-zinc-500 font-semibold ml-auto">{{ highTickets.length }}</span>
                    </button>
                    @for (ticket of highTickets; track ticket.id) {
                      <div
                        class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-100/60 transition-colors group"
                        [class.bg-zinc-100/60]="selectedTicketIds().has(ticket.id)"
                      >
                        <mat-icon
                          (click)="$event.stopPropagation(); toggleTicketSelection(ticket.id)"
                          class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                          [class.text-zinc-700]="selectedTicketIds().has(ticket.id)"
                          [class.text-zinc-300]="!selectedTicketIds().has(ticket.id)"
                        >
                          {{ selectedTicketIds().has(ticket.id) ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                        <div (click)="navigateToTickets()" class="flex-1 min-w-0 cursor-pointer">
                          <div class="flex items-center gap-1.5">
                            <span class="text-xs font-medium text-zinc-700 truncate hover:underline">{{ ticket.title }}</span>
                            @if (ticket.deadline) {
                              <span class="text-meta font-sans shrink-0 leading-tight ml-auto" [class]="deadlineClass(ticket.deadline)">{{ formatDate(ticket.deadline) }}</span>
                            }
                          </div>
                          <div class="flex items-center justify-between">
                            <span class="text-meta text-zinc-400 font-sans">#{{ ticket.id }}</span>
                            <span class="text-meta text-red-600 px-1.5 py-0.5 rounded">High</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- Medium priority -->
                @let mediumTickets = groupedPendingTickets().medium;
                @if (mediumTickets.length > 0) {
                  <div>
                    <button (click)="navigateToFilteredTickets('Medium')" class="flex items-center gap-1.5 text-meta font-bold text-zinc-900 uppercase tracking-wider mb-1 px-1 hover:text-zinc-950 hover:underline transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Medium
                      <span class="text-meta text-zinc-500 font-semibold ml-auto">{{ mediumTickets.length }}</span>
                    </button>
                    @for (ticket of mediumTickets; track ticket.id) {
                      <div
                        class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-100/60 transition-colors group"
                        [class.bg-zinc-100/60]="selectedTicketIds().has(ticket.id)"
                      >
                        <mat-icon
                          (click)="$event.stopPropagation(); toggleTicketSelection(ticket.id)"
                          class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                          [class.text-zinc-700]="selectedTicketIds().has(ticket.id)"
                          [class.text-zinc-300]="!selectedTicketIds().has(ticket.id)"
                        >
                          {{ selectedTicketIds().has(ticket.id) ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                        <div (click)="navigateToTickets()" class="flex-1 min-w-0 cursor-pointer">
                          <div class="flex items-center gap-1.5">
                            <span class="text-xs font-medium text-zinc-700 truncate hover:underline">{{ ticket.title }}</span>
                            @if (ticket.deadline) {
                              <span class="text-meta font-sans shrink-0 leading-tight ml-auto" [class]="deadlineClass(ticket.deadline)">{{ formatDate(ticket.deadline) }}</span>
                            }
                          </div>
                          <div class="flex items-center justify-between">
                            <span class="text-meta text-zinc-400 font-sans">#{{ ticket.id }}</span>
                            <span class="text-meta text-amber-600 px-1.5 py-0.5 rounded">Medium</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- Low priority -->
                @let lowTickets = groupedPendingTickets().low;
                @if (lowTickets.length > 0) {
                  <div>
                    <button (click)="navigateToFilteredTickets('Low')" class="flex items-center gap-1.5 text-meta font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1 hover:text-zinc-700 hover:underline transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Low
                      <span class="text-meta text-zinc-400 font-semibold ml-auto">{{ lowTickets.length }}</span>
                    </button>
                    @for (ticket of lowTickets; track ticket.id) {
                      <div
                        class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-50/60 transition-colors group"
                        [class.bg-zinc-50/60]="selectedTicketIds().has(ticket.id)"
                      >
                        <mat-icon
                          (click)="$event.stopPropagation(); toggleTicketSelection(ticket.id)"
                          class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                          [class.text-zinc-700]="selectedTicketIds().has(ticket.id)"
                          [class.text-zinc-300]="!selectedTicketIds().has(ticket.id)"
                        >
                          {{ selectedTicketIds().has(ticket.id) ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                        <div (click)="navigateToTickets()" class="flex-1 min-w-0 cursor-pointer">
                          <div class="flex items-center gap-1.5">
                            <span class="text-xs font-medium text-zinc-700 truncate hover:underline">{{ ticket.title }}</span>
                            @if (ticket.deadline) {
                              <span class="text-meta font-sans shrink-0 leading-tight ml-auto" [class]="deadlineClass(ticket.deadline)">{{ formatDate(ticket.deadline) }}</span>
                            }
                          </div>
                          <div class="flex items-center justify-between">
                            <span class="text-meta text-zinc-400 font-sans">#{{ ticket.id }}</span>
                            <span class="text-meta text-emerald-600 px-1.5 py-0.5 rounded">Low</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }

                @if (highTickets.length === 0 && mediumTickets.length === 0 && lowTickets.length === 0) {
                  <div class="text-center py-4 text-xs text-zinc-400">No pending tickets</div>
                }
              </div>
          </div>
        </div>
      </div>

    </div>

  `,
  styles: [`
    mat-icon {
      color: #3B82F6;
    }

    .bento-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      grid-template-areas:
        "hero hero pipeline pipeline"
        "hero hero pipeline pipeline"
        "schedule late partners tasks"
        "schedule . . .";
      gap: 12px;
    }

    .tile-hero { grid-area: hero; min-height: 260px; }
    .tile-pipeline { grid-area: pipeline; }
    .tile-late { grid-area: late; }
    .tile-partners { grid-area: partners; }
    .tile-schedule { grid-area: schedule; }
    .tile-tasks { grid-area: tasks; }

    @media (max-width: 1024px) {
      .bento-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-areas:
          "hero hero"
          "hero hero"
          "pipeline pipeline"
          "late partners"
          "schedule tasks";
      }
    }

    @media (max-width: 640px) {
      .bento-grid {
        grid-template-columns: 1fr;
        grid-template-areas:
          "hero"
          "pipeline"
          "late"
          "partners"
          "schedule"
          "tasks";
      }
    }

    .cdk-drag-preview {
      box-shadow: var(--shadow-lg);
      border-radius: var(--radius-lg);
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
    }

    .cdk-drag-animating {
      transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class DashboardComponent {
  state = inject(CrmStateService);
  private router = inject(Router);

  // Selection states
  selectedTaskIds = signal<Set<string>>(new Set());
  selectedTicketIds = signal<Set<string>>(new Set());

  /** Catalog of all KPI tiles that can be toggled on/off the dashboard */
  availableKpis = [
    { id: 'totalDeals', name: 'Total Deals', icon: 'monetization_on' },
    { id: 'marketingSpend', name: 'Campaign Reach', icon: 'campaign' },
    { id: 'activeCampaigns', name: 'Active Campaigns', icon: 'email' },
    { id: 'openTickets', name: 'Open Tickets', icon: 'support_agent' },
    { id: 'totalProspects', name: 'Total Prospects', icon: 'person_search' },
    { id: 'newDeals', name: 'New Deals', icon: 'handshake' },
    { id: 'newProspects', name: 'New Prospects', icon: 'group_add' },
    { id: 'lostProspects', name: 'Lost Prospects', icon: 'do_not_disturb_on' },
    { id: 'todaysDeal', name: "Today's Deal", icon: 'star' },
    { id: 'newTasksWeek', name: 'New Tasks (Week)', icon: 'assignment_add' }
  ];

  hiddenKpis = computed(() => {
    const active = new Set(this.state.dashboardKpis());
    return this.availableKpis.filter(k => !active.has(k.id));
  });

  latePayersCount = () => this.state.overdueInvoices().length;
  activeCampaignsCount = () => this.state.campaigns().filter(c => c.status === 'Active').length;
  openTicketsCount = () => this.state.tickets().filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
  prospectsCount = () => this.state.prospects().length;

  // ────────────────────────────────────────────────────────
  // "Today" hero tile — overdue tasks + stale deals + unanswered tickets
  // ────────────────────────────────────────────────────────
  todayItems = computed((): TodayItem[] => {
    const todayStr = new Date().toISOString().split('T')[0];
    const staleCutoff = new Date();
    staleCutoff.setDate(staleCutoff.getDate() - 14);

    const overdueTasks: TodayItem[] = this.state.tasks()
      .filter(t => t.status !== 'Completed' && t.deadline && t.deadline < todayStr)
      .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
      .map(t => ({
        kind: 'task',
        id: t.id,
        icon: 'assignment_late',
        title: t.title,
        meta: `Overdue since ${this.formatDate(t.deadline)}`,
        actionLabel: 'Mark done',
        action: () => this.state.updateTaskStatus(t.id, 'Completed' as TaskStatus)
      }));

    const staleDeals: TodayItem[] = this.state.deals()
      .filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost' && new Date(d.createdAt) < staleCutoff)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(d => ({
        kind: 'deal',
        id: d.id,
        icon: 'hourglass_bottom',
        title: d.title,
        meta: `No movement since ${this.formatDate(d.createdAt)}`,
        actionLabel: 'Review',
        action: () => this.router.navigate(['/sales/deals', d.id])
      }));

    const unansweredTickets: TodayItem[] = this.state.tickets()
      .filter(t => t.status === 'OPEN' && !t.assignedToUserId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(t => ({
        kind: 'ticket',
        id: t.id,
        icon: 'support_agent',
        title: t.title,
        meta: `Unassigned · opened ${this.formatDate(t.createdAt)}`,
        actionLabel: 'Take it',
        action: () => this.state.updateTicket(t.id, { status: 'IN_PROGRESS', assignedToUserId: this.state.currentUserId() })
      }));

    const picks: TodayItem[] = [];
    if (overdueTasks[0]) picks.push(overdueTasks[0]);
    if (staleDeals[0]) picks.push(staleDeals[0]);
    if (unansweredTickets[0]) picks.push(unansweredTickets[0]);

    const leftovers = [...overdueTasks.slice(1), ...staleDeals.slice(1), ...unansweredTickets.slice(1)];
    while (picks.length < 3 && leftovers.length) picks.push(leftovers.shift()!);

    return picks.slice(0, 3);
  });

  /** All pending (non-completed) tasks */
  private pendingTasks = computed(() => this.state.tasks().filter(t => t.status === 'Pending'));

  /** Count of pending tasks */
  pendingTasksCount = computed(() => this.pendingTasks().length);

  /** Group pending tasks by priority, sorted by urgency (deadline) within each group */
  groupedPendingTasks = computed(() => {
    const tasks = this.pendingTasks();
    const sortByDeadline = (a: Task, b: Task) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    };
    return {
      urgent: tasks.filter(t => t.priority === 'Urgent').sort(sortByDeadline),
      medium: tasks.filter(t => t.priority === 'Medium' || !t.priority).sort(sortByDeadline),
      low: tasks.filter(t => t.priority === 'Low').sort(sortByDeadline)
    };
  });

  /** All open/in-progress tickets */
  private pendingTickets = computed(() =>
    this.state.tickets().filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS')
  );

  /** Count of pending tickets */
  pendingTicketsCount = computed(() => this.pendingTickets().length);

  /** Group pending tickets by priority, sorted by urgency (deadline) within each group */
  groupedPendingTickets = computed(() => {
    const tickets = this.pendingTickets();
    const sortByDeadline = (a: Ticket, b: Ticket) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    };
    return {
      high: tickets.filter(t => t.priority === 'URGENT').sort(sortByDeadline),
      medium: tickets.filter(t => t.priority === 'MEDIUM').sort(sortByDeadline),
      low: tickets.filter(t => t.priority === 'LOW').sort(sortByDeadline)
    };
  });

  /** Deals still in active pipeline (not Closed Won/Lost), sorted by amount descending, top 3 */
  topPipelineDeals = computed(() => {
    return this.state.deals()
      .filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  });

  /** Sum of all pipeline deal amounts */
  totalPipelineValue = computed(() => {
    return this.state.deals()
      .filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')
      .reduce((sum, d) => sum + d.amount, 0);
  });

  /** Monthly (12-pt) pipeline value additions, most recent last */
  pipelineSeries = computed(() => this.monthlySeries(
    this.state.deals()
      .filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')
      .map(d => ({ date: d.orderDate || d.createdAt, value: d.amount }))
  ));

  pipelineDelta = computed(() => this.deltaFromSeries(this.pipelineSeries()));

  pipelineAreaPath = computed(() => this.areaPath(this.pipelineSeries(), 280, 70));

  /** Monthly (12-pt) count of invoices that became overdue, most recent last */
  latePayersSeries = computed(() => this.monthlySeries(
    this.state.overdueInvoices().map(i => ({ date: i.dueDate, value: 1 }))
  ));

  latePayersDelta = computed(() => this.deltaFromSeries(this.latePayersSeries()));

  partnerSlices = computed(() => {
    const customers = this.state.customers().length;
    const prospects = this.state.prospects().length;
    const vendors = this.state.vendors().length;
    const total = customers + prospects + vendors || 1;

    const slices = [
      { label: 'Customers', count: customers, color: 'bg-blue-700', stroke: 'text-blue-700' },
      { label: 'Prospects', count: prospects, color: 'bg-blue-500', stroke: 'text-blue-500' },
      { label: 'Vendors', count: vendors, color: 'bg-blue-400', stroke: 'text-blue-400' }
    ].filter(s => s.count > 0);

    let cumulativePercent = 0;
    return slices.map(s => {
      const percent = (s.count / total) * 100;
      const slice = {
        ...s,
        dasharray: `${percent} ${100 - percent}`,
        dashoffset: cumulativePercent === 0 ? 0 : -(cumulativePercent)
      };
      cumulativePercent += percent;
      return slice;
    });
  });

  taskSlices = computed(() => {
    const tasks = this.state.tasks();
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const total = tasks.length || 1;

    const slices = [
      { label: 'Completed', count: completed, color: 'bg-blue-700', stroke: 'text-blue-700' },
      { label: 'In Progress', count: inProgress, color: 'bg-blue-500', stroke: 'text-blue-500' },
      { label: 'Pending', count: pending, color: 'bg-blue-300', stroke: 'text-blue-300' }
    ].filter(s => s.count > 0);

    let cumulativePercent = 0;
    return slices.map(s => {
      const percent = (s.count / total) * 100;
      const slice = {
        ...s,
        dasharray: `${percent} ${100 - percent}`,
        dashoffset: cumulativePercent === 0 ? 0 : -(cumulativePercent)
      };
      cumulativePercent += percent;
      return slice;
    });
  });

  // ────────────────────────────────────────────────────────
  // KPI tiles: value + delta vs previous period + 12-pt sparkline
  // ────────────────────────────────────────────────────────
  kpiTiles = computed((): KpiTile[] => {
    return this.state.dashboardKpis()
      .map(id => this.buildKpiTile(id))
      .filter((t): t is KpiTile => t !== null);
  });

  private buildKpiTile(id: string): KpiTile | null {
    switch (id) {
      case 'totalDeals': {
        const monthly = this.monthlySeries(this.state.deals().map(d => ({ date: d.orderDate || d.createdAt, value: d.amount })));
        const series = this.cumulative(monthly);
        return {
          id, label: 'Total Deals Value', icon: 'monetization_on',
          value: this.formatCurrency(series[series.length - 1] || 0),
          delta: this.deltaFromSeries(series), deltaLabel: 'vs last month', sparkline: series
        };
      }
      case 'marketingSpend': {
        const monthly = this.monthlySeries(this.state.campaigns().map(c => ({ date: c.createdAt, value: c.sentCount })));
        return {
          id, label: 'Campaign Reach', icon: 'campaign',
          value: `${this.formatNumber(monthly[monthly.length - 1] || 0)} sent`,
          delta: this.deltaFromSeries(monthly), deltaLabel: 'vs last month', sparkline: monthly
        };
      }
      case 'activeCampaigns': {
        const monthly = this.monthlySeries(this.state.campaigns().filter(c => c.status === 'Active').map(c => ({ date: c.createdAt, value: 1 })));
        return {
          id, label: 'Active Campaigns', icon: 'email',
          value: `${this.activeCampaignsCount()}`,
          delta: this.deltaFromSeries(monthly), deltaLabel: 'vs last month', sparkline: monthly
        };
      }
      case 'openTickets': {
        const monthly = this.monthlySeries(this.state.tickets().map(t => ({ date: t.createdAt, value: 1 })));
        return {
          id, label: 'Open Tickets', icon: 'support_agent',
          value: `${this.openTicketsCount()}`,
          delta: this.deltaFromSeries(monthly), deltaLabel: 'vs last month', sparkline: monthly
        };
      }
      case 'totalProspects': {
        const monthly = this.monthlySeries(this.state.partners().filter(p => p.type === 'Prospect').map(p => ({ date: p.createdAt, value: 1 })));
        return {
          id, label: 'Total Prospects', icon: 'person_search',
          value: `${this.prospectsCount()}`,
          delta: this.deltaFromSeries(monthly), deltaLabel: 'vs last month', sparkline: monthly
        };
      }
      case 'newDeals': {
        const monthly = this.monthlySeries(this.state.deals().map(d => ({ date: d.orderDate || d.createdAt, value: 1 })));
        return {
          id, label: 'New Deals', icon: 'handshake',
          value: `${monthly[monthly.length - 1] || 0} deals`,
          delta: this.deltaFromSeries(monthly), deltaLabel: 'vs last month', sparkline: monthly
        };
      }
      case 'newProspects': {
        const monthly = this.monthlySeries(this.state.partners().filter(p => p.type === 'Prospect').map(p => ({ date: p.createdAt, value: 1 })));
        return {
          id, label: 'New Prospects', icon: 'group_add',
          value: `${monthly[monthly.length - 1] || 0} prospects`,
          delta: this.deltaFromSeries(monthly), deltaLabel: 'vs last month', sparkline: monthly
        };
      }
      case 'lostProspects': {
        const monthly = this.monthlySeries(this.state.deals().filter(d => d.stage === 'Closed Lost').map(d => ({ date: d.orderDate || d.createdAt, value: d.amount })));
        return {
          id, label: 'Lost Prospects', icon: 'do_not_disturb_on',
          value: this.formatCurrency(monthly[monthly.length - 1] || 0),
          delta: this.deltaFromSeries(monthly), deltaLabel: 'vs last month', sparkline: monthly
        };
      }
      case 'todaysDeal': {
        const today = new Date().toISOString().split('T')[0];
        const todays = this.state.deals().filter(d => d.orderDate === today).sort((a, b) => b.amount - a.amount);
        const daily = this.dailySeries(this.state.deals().map(d => ({ date: d.orderDate, value: 1 })), 12);
        return {
          id, label: "Today's Deal", icon: 'star',
          value: todays[0] ? this.formatCurrency(todays[0].amount) : 'No deal yet',
          delta: null, deltaLabel: '', sparkline: daily
        };
      }
      case 'newTasksWeek': {
        const weekly = this.weeklySeries(this.state.tasks().map(t => ({ date: t.createdAt, value: 1 })));
        return {
          id, label: 'New Tasks (Week)', icon: 'assignment_add',
          value: `${weekly[weekly.length - 1] || 0} tasks`,
          delta: this.deltaFromSeries(weekly), deltaLabel: 'vs last week', sparkline: weekly
        };
      }
      default:
        return null;
    }
  }

  onKpiDrop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex === event.currentIndex) return;
    this.state.reorderDashboardKpis(event.previousIndex, event.currentIndex);
  }

  // ────────────────────────────────────────────────────────
  // Time-series helpers: bucket real records into periods, compute deltas
  // ────────────────────────────────────────────────────────
  private parseDate(date: string | undefined): Date | null {
    if (!date) return null;
    const d = new Date(date.length <= 10 ? `${date}T00:00:00` : date);
    return isNaN(d.getTime()) ? null : d;
  }

  /** 12 monthly buckets (oldest to newest, current month last) summing `value` per item's `date`. */
  private monthlySeries(items: { date: string | undefined; value: number }[], months = 12): number[] {
    const now = new Date();
    const buckets = new Array(months).fill(0);
    for (const item of items) {
      const d = this.parseDate(item.date);
      if (!d) continue;
      const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      const idx = months - 1 - diff;
      if (idx >= 0 && idx < months) buckets[idx] += item.value;
    }
    return buckets;
  }

  /** 12 weekly buckets (Mon-Sun, oldest to newest, current week last) summing `value` per item's `date`. */
  private weeklySeries(items: { date: string | undefined; value: number }[], weeks = 12): number[] {
    const startOfWeek = (d: Date) => {
      const x = new Date(d);
      const day = x.getDay();
      x.setDate(x.getDate() - (day === 0 ? 6 : day - 1));
      x.setHours(0, 0, 0, 0);
      return x;
    };
    const thisWeekStart = startOfWeek(new Date());
    const buckets = new Array(weeks).fill(0);
    for (const item of items) {
      const d = this.parseDate(item.date);
      if (!d) continue;
      const diffWeeks = Math.round((thisWeekStart.getTime() - startOfWeek(d).getTime()) / (7 * 86400000));
      const idx = weeks - 1 - diffWeeks;
      if (idx >= 0 && idx < weeks) buckets[idx] += item.value;
    }
    return buckets;
  }

  /** N daily buckets (oldest to newest, today last) summing `value` per item's `date`. */
  private dailySeries(items: { date: string | undefined; value: number }[], days = 12): number[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const buckets = new Array(days).fill(0);
    for (const item of items) {
      const d = this.parseDate(item.date);
      if (!d) continue;
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
      const idx = days - 1 - diff;
      if (idx >= 0 && idx < days) buckets[idx] += item.value;
    }
    return buckets;
  }

  private cumulative(series: number[]): number[] {
    let sum = 0;
    return series.map(v => (sum += v));
  }

  /** % change between the last two points of a series. Null when there's nothing real to report. */
  private deltaFromSeries(series: number[]): { pct: number; direction: 'up' | 'down' | 'flat' } | null {
    if (series.length < 2) return null;
    const curr = series[series.length - 1];
    const prev = series[series.length - 2];
    if (prev === 0) {
      if (curr === 0) return null;
      return { pct: 100, direction: 'up' };
    }
    const pct = Math.round(((curr - prev) / Math.abs(prev)) * 100);
    return { pct, direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' };
  }

  sparklinePoints(values: number[], w = 64, h = 24): string {
    if (!values.length) return '';
    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const step = w / (values.length - 1 || 1);
    return values.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`).join(' ');
  }

  private areaPath(values: number[], w = 280, h = 70): string {
    if (!values.length) return '';
    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const step = w / (values.length - 1 || 1);
    const pts = values.map((v, i) => [i * step, h - ((v - min) / range) * h]);
    const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    return `${line} L${w},${h} L0,${h} Z`;
  }

  toggleTaskSelection(taskId: string) {
    this.selectedTaskIds.update(set => {
      const next = new Set(set);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  toggleTicketSelection(ticketId: string) {
    this.selectedTicketIds.update(set => {
      const next = new Set(set);
      if (next.has(ticketId)) next.delete(ticketId);
      else next.add(ticketId);
      return next;
    });
  }

  deadlineClass(deadline: string | undefined): string {
    if (!deadline) return '';
    const today = new Date().toISOString().split('T')[0];
    return deadline < today ? 'text-red-500' : 'text-zinc-400';
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  navigateToFilteredTasks(priority: string) {
    this.state.taskFilter.set({ priority });
    this.router.navigate(['/tasks']);
  }

  navigateToFilteredTickets(priority: string) {
    this.state.ticketFilter.set({ priority });
    this.router.navigate(['/tickets']);
  }

  navigateToTasks() {
    this.router.navigate(['/tasks']);
  }

  navigateToTickets() {
    this.router.navigate(['/tickets']);
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(value);
  }

  formatNumber(value: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 0 }).format(value);
  }

  isKpiActive(id: string) {
    return this.state.dashboardKpis().includes(id);
  }

  toggleKpi(id: string) {
    this.state.toggleDashboardKpi(id);
  }

  getPartnerName(id: string): string {
    return this.state.partners().find(p => p.id === id)?.name || 'Unknown';
  }
}

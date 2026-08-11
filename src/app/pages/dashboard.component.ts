import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CrmStateService, Task, Ticket } from '../services/crm-state.service';
import { Router } from '@angular/router';
import { PartnerScheduleCalendarComponent } from '../shared/partner-schedule-calendar.component';

@Component({
  selector: 'app-dashboard',
  imports: [MatIconModule, CommonModule, PartnerScheduleCalendarComponent],
  template: `
    <div class="space-y-3 mb-6">

      @if (state.isCustomizing()) {
        <div class="card p-4">
          <h3 class="text-xs font-bold text-zinc-700 mb-2 flex items-center">
            <mat-icon class="mr-2 text-[16px] w-4 h-4">view_carousel</mat-icon>
            Select KPIs to display
          </h3>
          <div class="flex flex-wrap gap-2">
             @for (kpi of availableKpis; track kpi.id) {
                <button 
                  (click)="toggleKpi(kpi.id)"
                  [class]="isKpiActive(kpi.id) ? 'btn-primary' : 'btn-secondary text-zinc-600'"
                  class="transition-all text-xs">
                  <mat-icon class="text-[14px] w-3.5 h-3.5" [class.text-zinc-300]="isKpiActive(kpi.id)">{{ kpi.icon }}</mat-icon>
                  {{ kpi.name }}
                </button>
             }
          </div>
        </div>
      }

      <!-- Main Content + Right Sidebar -->
      <div class="flex gap-4">
        <!-- Left: KPI Cards + Charts -->
        <div class="flex-1 min-w-0 space-y-3">
          <!-- Dynamic KPIs -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            @if (isKpiActive('totalDeals')) {
              <div class="stat-card flex flex-col transition-all">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="section-label !px-0">Total Deals Value</h3>
                  <div class="h-7 w-7 bg-zinc-100 text-zinc-900 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-[14px]">monetization_on</mat-icon>
                  </div>
                </div>
                <div class="text-sm lg:text-base font-bold text-zinc-900 truncate">{{ formatCurrency(totalDealsValue()) }}</div>
                <div class="text-[11px] text-zinc-900 font-semibold mt-1 flex items-center">
                  <mat-icon class="text-[11px]! leading-none! w-3 h-3 mr-1">trending_up</mat-icon>
                  Active Pipeline
                </div>
              </div>
            }

            @if (isKpiActive('marketingSpend')) {
              <div class="stat-card flex flex-col transition-all">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="section-label !px-0">Marketing Spend</h3>
                  <div class="h-7 w-7 bg-zinc-100 text-zinc-900 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-[14px]">campaign</mat-icon>
                  </div>
                </div>
                <div class="text-sm lg:text-base font-bold text-zinc-900 truncate">{{ formatCurrency(12450) }}</div>
                <div class="text-[11px] text-zinc-500 font-semibold mt-1 flex items-center">
                  <mat-icon class="text-[11px]! leading-none! w-3 h-3 mr-1">trending_flat</mat-icon>
                  Stable across channels
                </div>
              </div>
            }

            @if (isKpiActive('latePayers')) {
              <div class="stat-card flex flex-col transition-all">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="section-label !px-0">Late Payers</h3>
                  <div class="h-7 w-7 bg-zinc-100 text-zinc-900 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-[14px]">warning</mat-icon>
                  </div>
                </div>
                <div class="text-sm lg:text-base font-bold text-zinc-900 truncate">{{ latePayersCount() }}</div>
                <div class="text-[11px] text-zinc-900 font-semibold mt-1 flex items-center">
                  <mat-icon class="text-[11px]! leading-none! w-3 h-3 mr-1">trending_down</mat-icon>
                  Needs attention
                </div>
              </div>
            }
            
            @if (isKpiActive('activeCampaigns')) {
              <div class="stat-card flex flex-col transition-all">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="section-label !px-0">Active Campaigns</h3>
                  <div class="h-7 w-7 bg-zinc-100 text-zinc-900 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-[14px]">email</mat-icon>
                  </div>
                </div>
                <div class="text-sm lg:text-base font-bold text-zinc-900 truncate">{{ activeCampaignsCount() }}</div>
                <div class="text-[11px] text-zinc-900 font-semibold mt-1 flex items-center">
                  <mat-icon class="text-[11px]! leading-none! w-3 h-3 mr-1">check_circle</mat-icon>
                  Running smoothly
                </div>
              </div>
            }
            
            @if (isKpiActive('openTickets')) {
              <div class="stat-card flex flex-col transition-all">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="section-label !px-0">Open Tickets</h3>
                  <div class="h-7 w-7 bg-zinc-100 text-zinc-900 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-[14px]">support_agent</mat-icon>
                  </div>
                </div>
                <div class="text-sm lg:text-base font-bold text-zinc-900 truncate">{{ openTicketsCount() }}</div>
                <div class="text-[11px] text-zinc-900 font-semibold mt-1 flex items-center">
                  <mat-icon class="text-[11px]! leading-none! w-3 h-3 mr-1">pending_actions</mat-icon>
                  Pending resolution
                </div>
              </div>
            }
            
            @if (isKpiActive('totalProspects')) {
              <div class="stat-card flex flex-col transition-all">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="section-label !px-0">Total Prospects</h3>
                  <div class="h-7 w-7 bg-zinc-100 text-zinc-900 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-[14px]">person_search</mat-icon>
                  </div>
                </div>
                <div class="text-sm lg:text-base font-bold text-zinc-900 truncate">{{ prospectsCount() }}</div>
                <div class="text-[11px] text-zinc-900 font-semibold mt-1 flex items-center">
                  <mat-icon class="text-[11px]! leading-none! w-3 h-3 mr-1">trending_up</mat-icon>
                  Growing pipeline
                </div>
              </div>
            }

            @if (isKpiActive('newDeals')) {
              <div class="stat-card flex flex-col transition-all">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="section-label !px-0">New Deals</h3>
                  <div class="h-7 w-7 bg-zinc-100 text-zinc-900 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-[13px]">handshake</mat-icon>
                  </div>
                </div>
                <div class="text-sm lg:text-base font-bold text-zinc-900 truncate">{{ newDealsKPI().count }} <span class="text-[10px] font-semibold text-zinc-400">deals</span></div>
                <div class="mt-1 pt-1.5 border-t border-white/30 flex items-center justify-between">
                  <div class="text-[10px] text-zinc-900 font-bold flex items-center gap-0.5">
                    <mat-icon class="text-[12px] w-3 h-3">trending_up</mat-icon> This month's profit
                  </div>
                  <span class="text-[11px] font-bold font-sans text-zinc-700">{{ formatNumber(newDealsKPI().profit) }} <span class="text-zinc-400 font-normal">{{ state.globalCurrency() }}</span></span>
                </div>
              </div>
            }

            @if (isKpiActive('newProspects')) {
              <div class="stat-card flex flex-col transition-all">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="section-label !px-0">New Prospects</h3>
                  <div class="h-7 w-7 bg-zinc-100 text-zinc-900 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-[13px]">group_add</mat-icon>
                  </div>
                </div>
                <div class="text-sm lg:text-base font-bold text-zinc-900 truncate">{{ newProspectsKPI().count }} <span class="text-[10px] font-semibold text-zinc-400">prospects</span></div>
                <div class="mt-1 pt-1.5 border-t border-white/30 flex items-center justify-between">
                  <div class="text-[10px] text-zinc-900 font-bold flex items-center gap-0.5">
                    <mat-icon class="text-[12px] w-3 h-3">insights</mat-icon> Pipeline potential
                  </div>
                  <span class="text-[11px] font-bold font-sans text-zinc-700">{{ formatNumber(newProspectsKPI().potential) }} <span class="text-zinc-400 font-normal">{{ state.globalCurrency() }}</span></span>
                </div>
              </div>
            }

            @if (isKpiActive('lostProspects')) {
              <div class="stat-card flex flex-col transition-all">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="section-label !px-0">Lost Prospects</h3>
                  <div class="h-7 w-7 bg-zinc-100 text-zinc-700 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-[13px]">do_not_disturb_on</mat-icon>
                  </div>
                </div>
                <div class="text-sm lg:text-base font-bold text-zinc-900 truncate">{{ lostProspectsKPI().count }} <span class="text-[10px] font-semibold text-zinc-400">closed lost</span></div>
                <div class="mt-1 pt-1.5 border-t border-white/30 flex items-center justify-between">
                  <div class="text-[10px] text-zinc-700 font-bold flex items-center gap-0.5">
                    <mat-icon class="text-[12px] w-3 h-3">trending_down</mat-icon> Value lost
                  </div>
                  <span class="text-[11px] font-bold font-sans text-zinc-700">{{ formatNumber(lostProspectsKPI().potentialLost) }} <span class="text-zinc-400 font-normal">{{ state.globalCurrency() }}</span></span>
                </div>
              </div>
            }

            @if (isKpiActive('todaysDeal')) {
              <div class="stat-card flex flex-col transition-all">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="section-label !px-0">Today's Deal</h3>
                  <div class="h-7 w-7 bg-zinc-100 text-zinc-900 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-[13px]">star</mat-icon>
                  </div>
                </div>
                @if (todaysDealKPI(); as deal) {
                  <div class="text-xs font-bold text-zinc-900 truncate" [title]="deal.name">{{ deal.name }}</div>
                  <div class="mt-1 pt-1.5 border-t border-white/30 flex items-center justify-between">
                    <div class="text-[10px] text-zinc-900 font-bold flex items-center gap-0.5">
                      <mat-icon class="text-[12px] w-3 h-3">bolt</mat-icon> Deal value
                    </div>
                    <span class="text-[11px] font-bold font-sans text-zinc-700">{{ formatNumber(deal.profit) }} <span class="text-zinc-400 font-normal">{{ state.globalCurrency() }}</span></span>
                  </div>
                } @else {
                  <div class="text-xs font-semibold text-zinc-400">No transactions today</div>
                  <div class="mt-1 pt-1.5 border-t border-white/30">
                    <div class="text-[10px] text-zinc-300 font-bold flex items-center gap-0.5">
                      <mat-icon class="text-[12px] w-3 h-3">bolt</mat-icon> Check back later
                    </div>
                  </div>
                }
              </div>
            }

            @if (isKpiActive('newTasksWeek')) {
              <div class="stat-card flex flex-col transition-all">
                <div class="flex items-center justify-between mb-1.5">
                  <h3 class="section-label !px-0">New Tasks (Week)</h3>
                  <div class="h-7 w-7 bg-zinc-100 text-zinc-900 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-[13px]">assignment_add</mat-icon>
                  </div>
                </div>
                <div class="text-sm lg:text-base font-bold text-zinc-900 truncate">{{ formatNumber(newTasksWeek().weekCount) }} <span class="text-[10px] font-semibold text-zinc-400">tasks</span></div>
                <div class="mt-1 pt-1.5 border-t border-white/30 flex items-center justify-between">
                  <div class="text-[10px] text-zinc-900 font-bold flex items-center gap-0.5">
                    <mat-icon class="text-[12px] w-3 h-3">trending_up</mat-icon> This week
                  </div>
                  <span class="text-[11px] font-bold font-sans text-zinc-900">+{{ newTasksWeek().todayCount }} Today</span>
                </div>
              </div>
            }
          </div>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Partner Distribution -->
            <div class="card p-4">
              <h3 class="text-sm font-bold text-zinc-800 mb-3">Partner Directory</h3>
              <div class="flex items-center">
                <div class="relative w-24 h-24 shrink-0">
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
                <div class="ml-4 w-full space-y-1">
                  @for (slice of partnerSlices(); track slice.label) {
                    <div class="flex items-center justify-between text-xs">
                      <div class="flex items-center">
                        <span class="w-3 h-3 rounded-full mr-2" [class]="slice.color"></span>
                        <span class="text-zinc-600 font-semibold">{{slice.label}}</span>
                      </div>
                      <span class="text-zinc-900 font-bold">{{slice.count}}</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- System Task Distribution -->
            <div class="card p-4">
              <h3 class="text-sm font-bold text-zinc-800 mb-3">Tasks Status</h3>
              <div class="flex items-center">
                <div class="relative w-24 h-24 shrink-0">
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
                <div class="ml-4 w-full space-y-1">
                   @for (slice of taskSlices(); track slice.label) {
                    <div class="flex items-center justify-between text-xs">
                      <div class="flex items-center">
                        <span class="w-3 h-3 rounded-full mr-2" [class]="slice.color"></span>
                        <span class="text-zinc-600 font-semibold">{{slice.label}}</span>
                      </div>
                      <span class="text-zinc-900 font-bold">{{slice.count}}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Partner Schedule Calendar + Pipeline Overview -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <app-partner-schedule-calendar />

            <div class="card p-4 flex flex-col">
              <h3 class="text-[11px] font-bold text-zinc-700 uppercase tracking-wide mb-2">Pipeline Overview</h3>

              <div class="bg-zinc-50 rounded-xl p-3 mb-3 border border-zinc-200">
                <div class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total in Pipeline</div>
                <div class="text-lg font-bold text-zinc-900 mt-0.5">{{ formatCurrency(totalPipelineValue()) }}</div>
              </div>

              <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Top Deals</div>
              <div class="flex-1 space-y-1.5">
                @for (deal of topPipelineDeals(); track deal.id; let i = $index) {
                  <div class="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl p-2">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      [class]="i === 0 ? 'bg-zinc-200 text-zinc-950' : i === 1 ? 'bg-zinc-100 text-zinc-500' : 'bg-zinc-200 text-zinc-950'"
                    >
                      {{ i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉' }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-xs font-semibold text-zinc-800 truncate">{{ getPartnerName(deal.partnerId) }}</div>
                      <div class="text-[10px] text-zinc-400 font-medium truncate">{{ deal.title }}</div>
                    </div>
                    <div class="text-xs font-bold font-sans text-zinc-900 shrink-0">{{ formatCurrency(deal.amount) }}</div>
                  </div>
                } @empty {
                  <div class="text-center py-4 text-xs text-zinc-400">No active deals in pipeline</div>
                }
              </div>
            </div>
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
                <span class="text-[10px] font-medium text-white bg-zinc-700 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{{ pendingTasksCount() }}</span>
              </div>
            </div>

            <div class="max-h-[260px] overflow-y-auto space-y-1 -mr-2 pr-2">
              <!-- Urgent tasks -->
                @let urgentTasks = groupedPendingTasks().urgent;
                @if (urgentTasks.length > 0) {
                  <div>
                    <button (click)="navigateToFilteredTasks('Urgent')" class="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900 uppercase tracking-wider mb-1 px-1 hover:text-zinc-950 hover:underline transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Urgent
                      <span class="text-[10px] text-zinc-500 font-semibold ml-auto">{{ urgentTasks.length }}</span>
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
                              <span class="text-[10px] font-sans leading-tight" [class]="deadlineClass(task.deadline)">{{ formatDate(task.deadline) }}</span>
                            }
                            <span class="text-[10px] text-red-600 px-1.5 py-0.5 rounded">Urgent</span>
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
                    <button (click)="navigateToFilteredTasks('Medium')" class="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900 uppercase tracking-wider mb-1 px-1 hover:text-zinc-950 hover:underline transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Medium
                      <span class="text-[10px] text-zinc-500 font-semibold ml-auto">{{ mediumTasks.length }}</span>
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
                              <span class="text-[10px] font-sans leading-tight" [class]="deadlineClass(task.deadline)">{{ formatDate(task.deadline) }}</span>
                            }
                            <span class="text-[10px] text-amber-600 px-1.5 py-0.5 rounded">Medium</span>
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
                    <button (click)="navigateToFilteredTasks('Low')" class="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1 hover:text-zinc-700 hover:underline transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Low
                      <span class="text-[10px] text-zinc-400 font-semibold ml-auto">{{ lowTasks.length }}</span>
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
                              <span class="text-[10px] font-sans leading-tight" [class]="deadlineClass(task.deadline)">{{ formatDate(task.deadline) }}</span>
                            }
                            <span class="text-[10px] text-emerald-600 px-1.5 py-0.5 rounded">Low</span>
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
                <span class="text-[10px] font-medium text-white bg-zinc-700 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{{ pendingTicketsCount() }}</span>
              </div>
            </div>

            <div class="max-h-[260px] overflow-y-auto space-y-1 -mr-2 pr-2">
              <!-- High priority -->
                @let highTickets = groupedPendingTickets().high;
                @if (highTickets.length > 0) {
                  <div>
                    <button (click)="navigateToFilteredTickets('High')" class="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900 uppercase tracking-wider mb-1 px-1 hover:text-zinc-950 hover:underline transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      High
                      <span class="text-[10px] text-zinc-500 font-semibold ml-auto">{{ highTickets.length }}</span>
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
                              <span class="text-[10px] font-sans shrink-0 leading-tight ml-auto" [class]="deadlineClass(ticket.deadline)">{{ formatDate(ticket.deadline) }}</span>
                            }
                          </div>
                          <div class="flex items-center justify-between">
                            <span class="text-[10px] text-zinc-400 font-sans">#{{ ticket.id }}</span>
                            <span class="text-[10px] text-red-600 px-1.5 py-0.5 rounded">High</span>
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
                    <button (click)="navigateToFilteredTickets('Medium')" class="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900 uppercase tracking-wider mb-1 px-1 hover:text-zinc-950 hover:underline transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Medium
                      <span class="text-[10px] text-zinc-500 font-semibold ml-auto">{{ mediumTickets.length }}</span>
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
                              <span class="text-[10px] font-sans shrink-0 leading-tight ml-auto" [class]="deadlineClass(ticket.deadline)">{{ formatDate(ticket.deadline) }}</span>
                            }
                          </div>
                          <div class="flex items-center justify-between">
                            <span class="text-[10px] text-zinc-400 font-sans">#{{ ticket.id }}</span>
                            <span class="text-[10px] text-amber-600 px-1.5 py-0.5 rounded">Medium</span>
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
                    <button (click)="navigateToFilteredTickets('Low')" class="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1 hover:text-zinc-700 hover:underline transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Low
                      <span class="text-[10px] text-zinc-400 font-semibold ml-auto">{{ lowTickets.length }}</span>
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
                              <span class="text-[10px] font-sans shrink-0 leading-tight ml-auto" [class]="deadlineClass(ticket.deadline)">{{ formatDate(ticket.deadline) }}</span>
                            }
                          </div>
                          <div class="flex items-center justify-between">
                            <span class="text-[10px] text-zinc-400 font-sans">#{{ ticket.id }}</span>
                            <span class="text-[10px] text-emerald-600 px-1.5 py-0.5 rounded">Low</span>
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
  `]
})
export class DashboardComponent {
  state = inject(CrmStateService);
  private router = inject(Router);

  // Selection states
  selectedTaskIds = signal<Set<string>>(new Set());
  selectedTicketIds = signal<Set<string>>(new Set());

  availableKpis = [
    { id: 'totalDeals', name: 'Total Deals', icon: 'monetization_on' },
    { id: 'marketingSpend', name: 'Marketing Spend', icon: 'campaign' },
    { id: 'latePayers', name: 'Late Payers', icon: 'warning' },
    { id: 'activeCampaigns', name: 'Active Campaigns', icon: 'email' },
    { id: 'openTickets', name: 'Open Tickets', icon: 'support_agent' },
    { id: 'totalProspects', name: 'Total Prospects', icon: 'person_search' },
    { id: 'newDeals', name: 'New Deals', icon: 'handshake' },
    { id: 'newProspects', name: 'New Prospects', icon: 'group_add' },
    { id: 'lostProspects', name: 'Lost Prospects', icon: 'do_not_disturb_on' },
    { id: 'todaysDeal', name: "Today's Deal", icon: 'star' },
    { id: 'newTasksWeek', name: 'New Tasks (Week)', icon: 'assignment_add' }
  ];

  totalDealsValue = () => this.state.deals().reduce((acc, deal) => acc + deal.amount, 0);
  latePayersCount = () => this.state.overdueInvoices().length;
  activeCampaignsCount = () => this.state.campaigns().filter(c => c.status === 'Active').length;
  openTicketsCount = () => this.state.tickets().filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
  prospectsCount = () => this.state.prospects().length;

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

  /** Deals created in the current calendar month */
  newDealsKPI = computed(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const periodDeals = this.state.deals().filter(d => {
      if (!d.orderDate) return false;
      const dt = new Date(d.orderDate);
      return dt.getFullYear() === year && dt.getMonth() === month;
    });
    return {
      count: periodDeals.length,
      profit: periodDeals.reduce((s, d) => s + d.amount, 0)
    };
  });

  /** Partners with type === 'Prospect', aggregating linked proposal opportunity values */
  newProspectsKPI = computed(() => {
    const prospects = this.state.partners().filter(p => p.type === 'Prospect');
    const proposals = this.state.proposals();
    const potential = prospects.reduce((sum, p) => {
      const linked = proposals.filter(pr => pr.partnerId === p.id);
      const val = linked.reduce((s, pr) => s + ((pr as any).opportunityValue ?? pr.amount ?? 0), 0);
      return sum + val;
    }, 0);
    return { count: prospects.length, potential };
  });

  /** Deals with stage 'Closed Lost' — count and total value lost */
  lostProspectsKPI = computed(() => {
    const lost = this.state.deals().filter(d => d.stage === 'Closed Lost');
    return {
      count: lost.length,
      potentialLost: lost.reduce((s, d) => s + d.amount, 0)
    };
  });

  /** Tasks created in the current week, with today's count */
  newTasksWeek = computed(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const todayStr = now.toISOString().split('T')[0];

    const weekTasks = this.state.tasks().filter(t => {
      const d = new Date(t.createdAt + 'T00:00:00');
      return d >= monday && d <= sunday;
    });

    const todayCount = weekTasks.filter(t => t.createdAt === todayStr).length;

    return { weekCount: weekTasks.length, todayCount };
  });

  /** Highest-value deal with an orderDate matching today */
  todaysDealKPI = computed((): { name: string; profit: number } | null => {
    const today = new Date().toISOString().split('T')[0];
    const todays = this.state.deals()
      .filter(d => d.orderDate === today)
      .sort((a, b) => b.amount - a.amount);
    if (!todays.length) return null;
    const top = todays[0];
    return {
      name: (top as any).customerAccount || top.title,
      profit: top.amount
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

import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CrmStateService, Task, Ticket } from '../services/crm-state.service';
import { RouterModule, Router } from '@angular/router';
import { PartnerScheduleCalendarComponent } from '../shared/partner-schedule-calendar.component';

@Component({
  selector: 'app-dashboard',
  imports: [MatIconModule, CommonModule, RouterModule, PartnerScheduleCalendarComponent],
  template: `
    <div class="space-y-6">

      @if (state.isCustomizing()) {
        <div class="glass rounded-xl p-5">
          <h3 class="text-sm font-bold text-slate-700 mb-3 flex items-center">
            <mat-icon class="mr-2 text-[18px] w-4.5 h-4.5 text-slate-400">view_carousel</mat-icon>
            Select KPIs to display
          </h3>
          <div class="flex flex-wrap gap-3">
             @for (kpi of availableKpis; track kpi.id) {
                <button 
                  (click)="toggleKpi(kpi.id)"
                  [class]="isKpiActive(kpi.id) ? 'bg-indigo-600/80 text-white shadow-sm backdrop-blur-sm' : 'glass-button text-slate-600'"
                  class="px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2">
                  <mat-icon class="text-[18px] w-4.5 h-4.5" [class.text-indigo-200]="isKpiActive(kpi.id)">{{ kpi.icon }}</mat-icon>
                  {{ kpi.name }}
                </button>
             }
          </div>
        </div>
      }

      <!-- Main Content + Right Sidebar -->
      <div class="flex gap-6">
        <!-- Left: Quick Actions + KPI Cards + Charts -->
        <div class="flex-1 min-w-0 space-y-5">
          <!-- Quick Actions (compact) -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a routerLink="/sales" class="glass-card rounded-xl p-3 flex flex-col items-center justify-center transition-all group cursor-pointer no-underline text-indigo-700 hover:text-indigo-600">
              <div class="glass-strong text-indigo-600 w-9 h-9 rounded-lg mb-1.5 group-hover:scale-110 transition-transform flex items-center justify-center">
                <mat-icon class="leading-none! flex items-center justify-center w-5 h-5 text-[20px]!">add_business</mat-icon>
              </div>
              <span class="font-semibold text-[11px]">New Proposal</span>
            </a>
            <a routerLink="/partners" class="glass-card rounded-xl p-3 flex flex-col items-center justify-center transition-all group cursor-pointer no-underline text-emerald-700 hover:text-emerald-600">
              <div class="glass-strong text-emerald-600 w-9 h-9 rounded-lg mb-1.5 group-hover:scale-110 transition-transform flex items-center justify-center">
                <mat-icon class="leading-none! flex items-center justify-center w-5 h-5 text-[20px]!">person_add</mat-icon>
              </div>
              <span class="font-semibold text-[11px]">Add Partner</span>
            </a>
            <a routerLink="/marketing" class="glass-card rounded-xl p-3 flex flex-col items-center justify-center transition-all group cursor-pointer no-underline text-amber-700 hover:text-amber-600">
              <div class="glass-strong text-amber-500 w-9 h-9 rounded-lg mb-1.5 group-hover:scale-110 transition-transform flex items-center justify-center">
                <mat-icon class="leading-none! flex items-center justify-center w-5 h-5 text-[20px]!">campaign</mat-icon>
              </div>
              <span class="font-semibold text-[11px]">New Campaign</span>
            </a>
            <a routerLink="/tickets" class="glass-card rounded-xl p-3 flex flex-col items-center justify-center transition-all group cursor-pointer no-underline text-rose-700 hover:text-rose-600">
              <div class="glass-strong text-rose-500 w-9 h-9 rounded-lg mb-1.5 group-hover:scale-110 transition-transform flex items-center justify-center">
                <mat-icon class="leading-none! flex items-center justify-center w-5 h-5 text-[20px]!">support_agent</mat-icon>
              </div>
              <span class="font-semibold text-[11px]">Create Ticket</span>
            </a>
          </div>

          <!-- Dynamic KPIs -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            @if (isKpiActive('totalDeals')) {
              <div class="glass-card rounded-2xl p-6 flex flex-col transition-all">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Deals Value</h3>
                  <div class="h-10 w-10 glass-strong text-indigo-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-[20px]">monetization_on</mat-icon>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900">{{ formatCurrency(totalDealsValue()) }}</div>
                <div class="text-sm text-emerald-600 font-semibold mt-2 flex items-center">
                  <mat-icon class="text-sm! leading-none! w-4 h-4 mr-1">trending_up</mat-icon>
                  Active Pipeline
                </div>
              </div>
            }

            @if (isKpiActive('marketingSpend')) {
              <div class="glass-card rounded-2xl p-6 flex flex-col transition-all">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Marketing Spend</h3>
                  <div class="h-10 w-10 glass-strong text-pink-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-[20px]">campaign</mat-icon>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900">{{ formatCurrency(12450) }}</div>
                <div class="text-sm text-slate-500 font-semibold mt-2 flex items-center">
                  <mat-icon class="text-sm! leading-none! w-4 h-4 mr-1">trending_flat</mat-icon>
                  Stable across channels
                </div>
              </div>
            }

            @if (isKpiActive('latePayers')) {
              <div class="glass-card rounded-2xl p-6 flex flex-col transition-all">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Late Payers</h3>
                  <div class="h-10 w-10 glass-strong text-rose-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-[20px]">warning</mat-icon>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900">{{ latePayersCount() }}</div>
                <div class="text-sm text-rose-600 font-semibold mt-2 flex items-center">
                  <mat-icon class="text-sm! leading-none! w-4 h-4 mr-1">trending_down</mat-icon>
                  Needs attention
                </div>
              </div>
            }
            
            @if (isKpiActive('activeCampaigns')) {
              <div class="glass-card rounded-2xl p-6 flex flex-col transition-all">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Campaigns</h3>
                  <div class="h-10 w-10 glass-strong text-emerald-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-[20px]">email</mat-icon>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900">{{ activeCampaignsCount() }}</div>
                <div class="text-sm text-emerald-600 font-semibold mt-2 flex items-center">
                  <mat-icon class="text-sm! leading-none! w-4 h-4 mr-1">check_circle</mat-icon>
                  Running smoothly
                </div>
              </div>
            }
            
            @if (isKpiActive('openTickets')) {
              <div class="glass-card rounded-2xl p-6 flex flex-col transition-all">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Tickets</h3>
                  <div class="h-10 w-10 glass-strong text-amber-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-[20px]">support_agent</mat-icon>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900">{{ openTicketsCount() }}</div>
                <div class="text-sm text-amber-600 font-semibold mt-2 flex items-center">
                  <mat-icon class="text-sm! leading-none! w-4 h-4 mr-1">pending_actions</mat-icon>
                  Pending resolution
                </div>
              </div>
            }
            
            @if (isKpiActive('totalProspects')) {
              <div class="glass-card rounded-2xl p-6 flex flex-col transition-all">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Prospects</h3>
                  <div class="h-10 w-10 glass-strong text-blue-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-[20px]">person_search</mat-icon>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900">{{ prospectsCount() }}</div>
                <div class="text-sm text-emerald-600 font-semibold mt-2 flex items-center">
                  <mat-icon class="text-sm! leading-none! w-4 h-4 mr-1">trending_up</mat-icon>
                  Growing pipeline
                </div>
              </div>
            }

            @if (isKpiActive('newDeals')) {
              <div class="glass-card rounded-2xl p-6 flex flex-col transition-all">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">New Deals</h3>
                  <div class="h-10 w-10 glass-strong text-indigo-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-[18px]">handshake</mat-icon>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900">{{ newDealsKPI().count }} <span class="text-sm font-semibold text-slate-400">deals</span></div>
                <div class="mt-2 pt-3 border-t border-white/30 flex items-center justify-between">
                  <div class="text-[10px] text-indigo-600 font-bold flex items-center gap-0.5">
                    <mat-icon class="text-[12px] w-3 h-3">trending_up</mat-icon> This month's profit
                  </div>
                  <span class="text-[11px] font-bold font-mono text-slate-700">{{ formatNumber(newDealsKPI().profit) }} <span class="text-slate-400 font-normal">{{ state.globalCurrency() }}</span></span>
                </div>
              </div>
            }

            @if (isKpiActive('newProspects')) {
              <div class="glass-card rounded-2xl p-6 flex flex-col transition-all">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">New Prospects</h3>
                  <div class="h-10 w-10 glass-strong text-emerald-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-[18px]">group_add</mat-icon>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900">{{ newProspectsKPI().count }} <span class="text-sm font-semibold text-slate-400">prospects</span></div>
                <div class="mt-2 pt-3 border-t border-white/30 flex items-center justify-between">
                  <div class="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <mat-icon class="text-[12px] w-3 h-3">insights</mat-icon> Pipeline potential
                  </div>
                  <span class="text-[11px] font-bold font-mono text-slate-700">{{ formatNumber(newProspectsKPI().potential) }} <span class="text-slate-400 font-normal">{{ state.globalCurrency() }}</span></span>
                </div>
              </div>
            }

            @if (isKpiActive('lostProspects')) {
              <div class="glass-card rounded-2xl p-6 flex flex-col transition-all">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lost Prospects</h3>
                  <div class="h-10 w-10 glass-strong text-red-500 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-[18px]">do_not_disturb_on</mat-icon>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900">{{ lostProspectsKPI().count }} <span class="text-sm font-semibold text-slate-400">closed lost</span></div>
                <div class="mt-2 pt-3 border-t border-white/30 flex items-center justify-between">
                  <div class="text-[10px] text-red-500 font-bold flex items-center gap-0.5">
                    <mat-icon class="text-[12px] w-3 h-3">trending_down</mat-icon> Value lost
                  </div>
                  <span class="text-[11px] font-bold font-mono text-slate-700">{{ formatNumber(lostProspectsKPI().potentialLost) }} <span class="text-slate-400 font-normal">{{ state.globalCurrency() }}</span></span>
                </div>
              </div>
            }

            @if (isKpiActive('todaysDeal')) {
              <div class="glass-card rounded-2xl p-6 flex flex-col transition-all">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Deal</h3>
                  <div class="h-10 w-10 glass-strong text-amber-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-[18px]">star</mat-icon>
                  </div>
                </div>
                @if (todaysDealKPI(); as deal) {
                  <div class="text-base font-bold text-slate-900 truncate" [title]="deal.name">{{ deal.name }}</div>
                  <div class="mt-2 pt-3 border-t border-white/30 flex items-center justify-between">
                    <div class="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                      <mat-icon class="text-[12px] w-3 h-3">bolt</mat-icon> Deal value
                    </div>
                    <span class="text-[11px] font-bold font-mono text-slate-700">{{ formatNumber(deal.profit) }} <span class="text-slate-400 font-normal">{{ state.globalCurrency() }}</span></span>
                  </div>
                } @else {
                  <div class="text-sm font-semibold text-slate-400">No transactions today</div>
                  <div class="mt-2 pt-3 border-t border-white/30">
                    <div class="text-[10px] text-slate-300 font-bold flex items-center gap-0.5">
                      <mat-icon class="text-[12px] w-3 h-3">bolt</mat-icon> Check back later
                    </div>
                  </div>
                }
              </div>
            }

            @if (isKpiActive('newTasksWeek')) {
              <div class="glass-card rounded-2xl p-6 flex flex-col transition-all">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">New Tasks (Week)</h3>
                  <div class="h-10 w-10 glass-strong text-violet-600 rounded-xl flex items-center justify-center">
                    <mat-icon class="text-[18px]">assignment_add</mat-icon>
                  </div>
                </div>
                <div class="text-3xl font-bold text-slate-900">{{ formatNumber(newTasksWeek().weekCount) }} <span class="text-sm font-semibold text-slate-400">tasks</span></div>
                <div class="mt-2 pt-3 border-t border-white/30 flex items-center justify-between">
                  <div class="text-[10px] text-violet-600 font-bold flex items-center gap-0.5">
                    <mat-icon class="text-[12px] w-3 h-3">trending_up</mat-icon> This week
                  </div>
                  <span class="text-[11px] font-bold font-mono text-emerald-600">+{{ newTasksWeek().todayCount }} Today</span>
                </div>
              </div>
            }
          </div>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Partner Distribution -->
            <div class="glass-card rounded-2xl p-6">
              <h3 class="text-base font-bold text-slate-800 mb-6">Partner Directory</h3>
              <div class="flex items-center">
                <div class="relative w-32 h-32 shrink-0">
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
                <div class="ml-8 w-full space-y-3">
                  @for (slice of partnerSlices(); track slice.label) {
                    <div class="flex items-center justify-between text-sm">
                      <div class="flex items-center">
                        <span class="w-3 h-3 rounded-full mr-2" [class]="slice.color"></span>
                        <span class="text-slate-600 font-semibold">{{slice.label}}</span>
                      </div>
                      <span class="text-slate-900 font-bold">{{slice.count}}</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- System Task Distribution -->
            <div class="glass-card rounded-2xl p-6">
              <h3 class="text-base font-bold text-slate-800 mb-6">Tasks Status</h3>
              <div class="flex items-center">
                <div class="relative w-32 h-32 shrink-0">
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
                <div class="ml-8 w-full space-y-3">
                   @for (slice of taskSlices(); track slice.label) {
                    <div class="flex items-center justify-between text-sm">
                      <div class="flex items-center">
                        <span class="w-3 h-3 rounded-full mr-2" [class]="slice.color"></span>
                        <span class="text-slate-600 font-semibold">{{slice.label}}</span>
                      </div>
                      <span class="text-slate-900 font-bold">{{slice.count}}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Partner Schedule Calendar + Pipeline Overview -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <app-partner-schedule-calendar />

            <div class="glass-card rounded-2xl p-6 flex flex-col">
              <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Pipeline Overview</h3>

              <div class="glass rounded-xl p-4 mb-4">
                <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total in Pipeline</div>
                <div class="text-2xl font-bold text-slate-900 mt-1">{{ formatCurrency(totalPipelineValue()) }}</div>
              </div>

              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Top Deals</div>
              <div class="flex-1 space-y-2">
                @for (deal of topPipelineDeals(); track deal.id; let i = $index) {
                  <div class="flex items-center gap-3 glass rounded-xl p-3">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      [class]="i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-500' : 'bg-orange-100 text-orange-700'"
                    >
                      {{ i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉' }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-semibold text-slate-800 truncate">{{ getPartnerName(deal.partnerId) }}</div>
                      <div class="text-[11px] text-slate-400 font-medium truncate">{{ deal.title }}</div>
                    </div>
                    <div class="text-sm font-bold font-mono text-slate-900 shrink-0">{{ formatCurrency(deal.amount) }}</div>
                  </div>
                } @empty {
                  <div class="text-center py-6 text-xs text-slate-400">No active deals in pipeline</div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar: Pending Tasks + Pending Tickets -->
        <div class="w-96 shrink-0 space-y-5">
          <!-- Pending Tasks Card -->
          <div class="glass-card rounded-2xl p-5">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <mat-icon class="text-indigo-500 text-[20px] w-5 h-5">task_alt</mat-icon>
                <h3 class="text-sm font-bold text-slate-800">Pending Tasks</h3>
                <span class="text-[10px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{{ pendingTasksCount() }}</span>
              </div>
              <div class="flex bg-slate-100 rounded-lg p-0.5 text-[11px] font-semibold">
                <button
                  (click)="taskSort.set('priority')"
                  [class]="taskSort() === 'priority' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
                  class="px-2.5 py-1 rounded-md transition-all"
                >Priority</button>
                <button
                  (click)="taskSort.set('urgency')"
                  [class]="taskSort() === 'urgency' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
                  class="px-2.5 py-1 rounded-md transition-all"
                >Urgency</button>
              </div>
            </div>

            <div class="max-h-80 overflow-y-auto space-y-1 -mr-2 pr-2">
              @if (taskSort() === 'priority') {
                <!-- Urgent tasks -->
                @let urgentTasks = groupedPendingTasks().urgent;
                @if (urgentTasks.length > 0) {
                  <div>
                    <button (click)="navigateToFilteredTasks('Urgent')" class="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1 px-1 hover:text-rose-700 transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Urgent
                      <span class="text-[10px] text-rose-400 font-semibold ml-auto">{{ urgentTasks.length }}</span>
                    </button>
                    @for (task of urgentTasks; track task.id) {
                      <div
                        class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-50/60 transition-colors group"
                        [class.bg-rose-50/60]="selectedTaskIds().has(task.id)"
                      >
                        <mat-icon
                          (click)="$event.stopPropagation(); toggleTaskSelection(task.id)"
                          class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                          [class.text-indigo-500]="selectedTaskIds().has(task.id)"
                          [class.text-slate-300]="!selectedTaskIds().has(task.id)"
                        >
                          {{ selectedTaskIds().has(task.id) ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                        <div (click)="navigateToTasks()" class="flex-1 min-w-0 flex items-center gap-2 cursor-pointer">
                          <span class="text-xs font-medium text-slate-700 truncate flex-1">{{ task.title }}</span>
                          <div class="flex flex-col items-end gap-0.5 shrink-0">
                            @if (task.deadline) {
                              <span class="text-[10px] font-mono leading-tight" [class]="deadlineClass(task.deadline)">{{ formatDate(task.deadline) }}</span>
                            }
                            <span class="text-[10px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded">Urgent</span>
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
                    <button (click)="navigateToFilteredTasks('Medium')" class="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1 px-1 hover:text-amber-700 transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Medium
                      <span class="text-[10px] text-amber-400 font-semibold ml-auto">{{ mediumTasks.length }}</span>
                    </button>
                    @for (task of mediumTasks; track task.id) {
                      <div
                        class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-50/60 transition-colors group"
                        [class.bg-amber-50/60]="selectedTaskIds().has(task.id)"
                      >
                        <mat-icon
                          (click)="$event.stopPropagation(); toggleTaskSelection(task.id)"
                          class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                          [class.text-indigo-500]="selectedTaskIds().has(task.id)"
                          [class.text-slate-300]="!selectedTaskIds().has(task.id)"
                        >
                          {{ selectedTaskIds().has(task.id) ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                        <div (click)="navigateToTasks()" class="flex-1 min-w-0 flex items-center gap-2 cursor-pointer">
                          <span class="text-xs font-medium text-slate-700 truncate flex-1">{{ task.title }}</span>
                          <div class="flex flex-col items-end gap-0.5 shrink-0">
                            @if (task.deadline) {
                              <span class="text-[10px] font-mono leading-tight" [class]="deadlineClass(task.deadline)">{{ formatDate(task.deadline) }}</span>
                            }
                            <span class="text-[10px] font-bold text-white bg-amber-500 px-1.5 py-0.5 rounded">Medium</span>
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
                    <button (click)="navigateToFilteredTasks('Low')" class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-1 hover:text-slate-700 transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Low
                      <span class="text-[10px] text-slate-400 font-semibold ml-auto">{{ lowTasks.length }}</span>
                    </button>
                    @for (task of lowTasks; track task.id) {
                      <div
                        class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50/60 transition-colors group"
                        [class.bg-slate-50/60]="selectedTaskIds().has(task.id)"
                      >
                        <mat-icon
                          (click)="$event.stopPropagation(); toggleTaskSelection(task.id)"
                          class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                          [class.text-indigo-500]="selectedTaskIds().has(task.id)"
                          [class.text-slate-300]="!selectedTaskIds().has(task.id)"
                        >
                          {{ selectedTaskIds().has(task.id) ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                        <div (click)="navigateToTasks()" class="flex-1 min-w-0 flex items-center gap-2 cursor-pointer">
                          <span class="text-xs font-medium text-slate-700 truncate flex-1">{{ task.title }}</span>
                          <div class="flex flex-col items-end gap-0.5 shrink-0">
                            @if (task.deadline) {
                              <span class="text-[10px] font-mono leading-tight" [class]="deadlineClass(task.deadline)">{{ formatDate(task.deadline) }}</span>
                            }
                            <span class="text-[10px] font-bold text-white bg-slate-400 px-1.5 py-0.5 rounded">Low</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }

                @if (urgentTasks.length === 0 && mediumTasks.length === 0 && lowTasks.length === 0) {
                  <div class="text-center py-6 text-xs text-slate-400">No pending tasks</div>
                }
              } @else {
                <!-- Sorted by urgency (createdAt ascending = oldest first) -->
                @for (task of pendingTasksByUrgency(); track task.id) {
                  <div
                    class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50/60 transition-colors group"
                    [class.bg-slate-50/60]="selectedTaskIds().has(task.id)"
                  >
                    <mat-icon
                      (click)="$event.stopPropagation(); toggleTaskSelection(task.id)"
                      class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                      [class.text-indigo-500]="selectedTaskIds().has(task.id)"
                      [class.text-slate-300]="!selectedTaskIds().has(task.id)"
                    >
                      {{ selectedTaskIds().has(task.id) ? 'check_circle' : 'radio_button_unchecked' }}
                    </mat-icon>
                    <div (click)="navigateToTasks()" class="flex-1 min-w-0 flex items-center gap-2 cursor-pointer">
                      <span class="text-xs font-medium text-slate-700 truncate flex-1">{{ task.title }}</span>
                      <div class="flex flex-col items-end gap-0.5 shrink-0">
                        @if (task.deadline) {
                          <span class="text-[10px] font-mono leading-tight" [class]="deadlineClass(task.deadline)">{{ formatDate(task.deadline) }}</span>
                        }
                        <span
                          class="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          [class]="task.priority === 'Urgent' ? 'text-white bg-rose-500' : task.priority === 'Medium' ? 'text-white bg-amber-500' : 'text-white bg-slate-400'"
                        >{{ task.priority || 'Low' }}</span>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="text-center py-6 text-xs text-slate-400">No pending tasks</div>
                }
              }
            </div>
          </div>

          <!-- Pending Tickets Card -->
          <div class="glass-card rounded-2xl p-5">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <mat-icon class="text-amber-500 text-[20px] w-5 h-5">support_agent</mat-icon>
                <h3 class="text-sm font-bold text-slate-800">Pending Tickets</h3>
                <span class="text-[10px] font-bold text-white bg-amber-500 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{{ pendingTicketsCount() }}</span>
              </div>
              <div class="flex bg-slate-100 rounded-lg p-0.5 text-[11px] font-semibold">
                <button
                  (click)="ticketSort.set('priority')"
                  [class]="ticketSort() === 'priority' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
                  class="px-2.5 py-1 rounded-md transition-all"
                >Priority</button>
                <button
                  (click)="ticketSort.set('urgency')"
                  [class]="ticketSort() === 'urgency' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
                  class="px-2.5 py-1 rounded-md transition-all"
                >Urgency</button>
              </div>
            </div>

            <div class="max-h-80 overflow-y-auto space-y-1 -mr-2 pr-2">
              @if (ticketSort() === 'priority') {
                <!-- High priority -->
                @let highTickets = groupedPendingTickets().high;
                @if (highTickets.length > 0) {
                  <div>
                    <button (click)="navigateToFilteredTickets('High')" class="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1 px-1 hover:text-rose-700 transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      High
                      <span class="text-[10px] text-rose-400 font-semibold ml-auto">{{ highTickets.length }}</span>
                    </button>
                    @for (ticket of highTickets; track ticket.id) {
                      <div
                        class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-50/60 transition-colors group"
                        [class.bg-rose-50/60]="selectedTicketIds().has(ticket.id)"
                      >
                        <mat-icon
                          (click)="$event.stopPropagation(); toggleTicketSelection(ticket.id)"
                          class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                          [class.text-amber-500]="selectedTicketIds().has(ticket.id)"
                          [class.text-slate-300]="!selectedTicketIds().has(ticket.id)"
                        >
                          {{ selectedTicketIds().has(ticket.id) ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                        <div (click)="navigateToTickets()" class="flex-1 min-w-0 cursor-pointer">
                          <div class="flex items-center gap-1.5">
                            <span class="text-xs font-medium text-slate-700 truncate">{{ ticket.title }}</span>
                            @if (ticket.deadline) {
                              <span class="text-[10px] font-mono shrink-0 leading-tight ml-auto" [class]="deadlineClass(ticket.deadline)">{{ formatDate(ticket.deadline) }}</span>
                            }
                          </div>
                          <div class="flex items-center justify-between">
                            <span class="text-[10px] text-slate-400 font-mono">#{{ ticket.id }}</span>
                            <span class="text-[10px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded">High</span>
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
                    <button (click)="navigateToFilteredTickets('Medium')" class="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1 px-1 hover:text-amber-700 transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Medium
                      <span class="text-[10px] text-amber-400 font-semibold ml-auto">{{ mediumTickets.length }}</span>
                    </button>
                    @for (ticket of mediumTickets; track ticket.id) {
                      <div
                        class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-50/60 transition-colors group"
                        [class.bg-amber-50/60]="selectedTicketIds().has(ticket.id)"
                      >
                        <mat-icon
                          (click)="$event.stopPropagation(); toggleTicketSelection(ticket.id)"
                          class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                          [class.text-amber-500]="selectedTicketIds().has(ticket.id)"
                          [class.text-slate-300]="!selectedTicketIds().has(ticket.id)"
                        >
                          {{ selectedTicketIds().has(ticket.id) ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                        <div (click)="navigateToTickets()" class="flex-1 min-w-0 cursor-pointer">
                          <div class="flex items-center gap-1.5">
                            <span class="text-xs font-medium text-slate-700 truncate">{{ ticket.title }}</span>
                            @if (ticket.deadline) {
                              <span class="text-[10px] font-mono shrink-0 leading-tight ml-auto" [class]="deadlineClass(ticket.deadline)">{{ formatDate(ticket.deadline) }}</span>
                            }
                          </div>
                          <div class="flex items-center justify-between">
                            <span class="text-[10px] text-slate-400 font-mono">#{{ ticket.id }}</span>
                            <span class="text-[10px] font-bold text-white bg-amber-500 px-1.5 py-0.5 rounded">Medium</span>
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
                    <button (click)="navigateToFilteredTickets('Low')" class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-1 hover:text-slate-700 transition-colors">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">flag</mat-icon>
                      Low
                      <span class="text-[10px] text-slate-400 font-semibold ml-auto">{{ lowTickets.length }}</span>
                    </button>
                    @for (ticket of lowTickets; track ticket.id) {
                      <div
                        class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50/60 transition-colors group"
                        [class.bg-slate-50/60]="selectedTicketIds().has(ticket.id)"
                      >
                        <mat-icon
                          (click)="$event.stopPropagation(); toggleTicketSelection(ticket.id)"
                          class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                          [class.text-amber-500]="selectedTicketIds().has(ticket.id)"
                          [class.text-slate-300]="!selectedTicketIds().has(ticket.id)"
                        >
                          {{ selectedTicketIds().has(ticket.id) ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                        <div (click)="navigateToTickets()" class="flex-1 min-w-0 cursor-pointer">
                          <div class="flex items-center gap-1.5">
                            <span class="text-xs font-medium text-slate-700 truncate">{{ ticket.title }}</span>
                            @if (ticket.deadline) {
                              <span class="text-[10px] font-mono shrink-0 leading-tight ml-auto" [class]="deadlineClass(ticket.deadline)">{{ formatDate(ticket.deadline) }}</span>
                            }
                          </div>
                          <div class="flex items-center justify-between">
                            <span class="text-[10px] text-slate-400 font-mono">#{{ ticket.id }}</span>
                            <span class="text-[10px] font-bold text-white bg-slate-400 px-1.5 py-0.5 rounded">Low</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }

                @if (highTickets.length === 0 && mediumTickets.length === 0 && lowTickets.length === 0) {
                  <div class="text-center py-6 text-xs text-slate-400">No pending tickets</div>
                }
              } @else {
                <!-- Sorted by urgency (createdAt ascending) -->
                @for (ticket of pendingTicketsByUrgency(); track ticket.id) {
                  <div
                    class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50/60 transition-colors group"
                    [class.bg-slate-50/60]="selectedTicketIds().has(ticket.id)"
                  >
                    <mat-icon
                      (click)="$event.stopPropagation(); toggleTicketSelection(ticket.id)"
                      class="text-[16px] w-4 h-4 shrink-0 transition-colors cursor-pointer"
                      [class.text-amber-500]="selectedTicketIds().has(ticket.id)"
                      [class.text-slate-300]="!selectedTicketIds().has(ticket.id)"
                    >
                      {{ selectedTicketIds().has(ticket.id) ? 'check_circle' : 'radio_button_unchecked' }}
                    </mat-icon>
                    <div (click)="navigateToTickets()" class="flex-1 min-w-0 cursor-pointer">
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs font-medium text-slate-700 truncate">{{ ticket.title }}</span>
                        @if (ticket.deadline) {
                          <span class="text-[10px] font-mono shrink-0 leading-tight ml-auto" [class]="deadlineClass(ticket.deadline)">{{ formatDate(ticket.deadline) }}</span>
                        }
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] text-slate-400 font-mono">#{{ ticket.id }}</span>
                        <span
                          class="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          [class]="ticket.priority === 'High' ? 'text-white bg-rose-500' : ticket.priority === 'Medium' ? 'text-white bg-amber-500' : 'text-white bg-slate-400'"
                        >{{ ticket.priority }}</span>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="text-center py-6 text-xs text-slate-400">No pending tickets</div>
                }
              }
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent {
  state = inject(CrmStateService);
  private router = inject(Router);
  // Sort states
  taskSort = signal<'priority' | 'urgency'>('priority');
  ticketSort = signal<'priority' | 'urgency'>('priority');

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
  openTicketsCount = () => this.state.tickets().filter(c => c.status === 'Open' || c.status === 'In Progress').length;
  prospectsCount = () => this.state.prospects().length;

  /** All pending (non-completed) tasks */
  private pendingTasks = computed(() => this.state.tasks().filter(t => t.status === 'Pending'));

  /** Count of pending tasks */
  pendingTasksCount = computed(() => this.pendingTasks().length);

  /** Group pending tasks by priority */
  groupedPendingTasks = computed(() => {
    const tasks = this.pendingTasks();
    return {
      urgent: tasks.filter(t => t.priority === 'Urgent'),
      medium: tasks.filter(t => t.priority === 'Medium' || !t.priority),
      low: tasks.filter(t => t.priority === 'Low')
    };
  });

  /** Pending tasks sorted by urgency (oldest createdAt first) */
  pendingTasksByUrgency = computed(() =>
    this.pendingTasks().sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  );

  /** All open/in-progress tickets */
  private pendingTickets = computed(() =>
    this.state.tickets().filter(t => t.status === 'Open' || t.status === 'In Progress')
  );

  /** Count of pending tickets */
  pendingTicketsCount = computed(() => this.pendingTickets().length);

  /** Group pending tickets by priority */
  groupedPendingTickets = computed(() => {
    const tickets = this.pendingTickets();
    return {
      high: tickets.filter(t => t.priority === 'High'),
      medium: tickets.filter(t => t.priority === 'Medium'),
      low: tickets.filter(t => t.priority === 'Low')
    };
  });

  /** Pending tickets sorted by urgency (oldest createdAt first) */
  pendingTicketsByUrgency = computed(() =>
    this.pendingTickets().sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  );

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

    let currentOffset = 0;
    return [
      { label: 'Customers', count: customers, color: 'bg-indigo-500', stroke: 'text-indigo-500', dasharray: this.getDash(customers, total), dashoffset: this.getOffset(currentOffset, false, (currentOffset += customers)) },
      { label: 'Prospects', count: prospects, color: 'bg-emerald-400', stroke: 'text-emerald-400', dasharray: this.getDash(prospects, total), dashoffset: this.getOffset(currentOffset - prospects, false, (currentOffset += prospects)) },
      { label: 'Vendors', count: vendors, color: 'bg-amber-400', stroke: 'text-amber-400', dasharray: this.getDash(vendors, total), dashoffset: this.getOffset(currentOffset - vendors, false) }
    ].filter(s => s.count > 0);
  });

  taskSlices = computed(() => {
    const tasks = this.state.tasks();
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const total = tasks.length || 1;

    let currentOffset = 0;
    return [
      { label: 'Completed', count: completed, color: 'bg-emerald-500', stroke: 'text-emerald-500', dasharray: this.getDash(completed, total), dashoffset: this.getOffset(currentOffset, false, (currentOffset += completed)) },
      { label: 'In Progress', count: inProgress, color: 'bg-indigo-400', stroke: 'text-indigo-400', dasharray: this.getDash(inProgress, total), dashoffset: this.getOffset(currentOffset - inProgress, false, (currentOffset += inProgress)) },
      { label: 'Pending', count: pending, color: 'bg-slate-300', stroke: 'text-slate-300', dasharray: this.getDash(pending, total), dashoffset: this.getOffset(currentOffset - pending, false) }
    ].filter(s => s.count > 0);
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
    return deadline < today ? 'text-rose-500' : 'text-slate-400';
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

  private getDash(value: number, total: number) {
    const percent = (value / total) * 100;
    return `${percent} ${100 - percent}`;
  }

  private getOffset(previousTotal: number, _dummy: boolean, dummy2?: number) {
     return previousTotal === 0 ? 0 : -((previousTotal) / (this.state.partners().length || 1) * 100); 
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

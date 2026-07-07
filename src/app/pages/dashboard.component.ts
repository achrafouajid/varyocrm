import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [MatIconModule, CommonModule, RouterModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-6">

      <!-- Customize KPIs -->
      <div class="flex justify-end">
        <button (click)="isCustomizing.set(!isCustomizing())" class="glass-button rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-all flex items-center gap-1.5">
          <mat-icon class="text-[14px] w-3.5 h-3.5">{{ isCustomizing() ? 'check' : 'edit_square' }}</mat-icon>
          {{ isCustomizing() ? 'Done Customizing' : 'Customize KPIs' }}
        </button>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a routerLink="/sales" class="glass-card rounded-2xl p-5 flex flex-col items-center justify-center transition-all group cursor-pointer no-underline text-indigo-700 hover:text-indigo-600">
          <div class="glass-strong text-indigo-600 w-12 h-12 rounded-xl mb-3 group-hover:scale-110 transition-transform flex items-center justify-center">
            <mat-icon class="leading-none! flex items-center justify-center w-6 h-6 text-[24px]!">add_business</mat-icon>
          </div>
          <span class="font-semibold text-sm">New Proposal</span>
        </a>
        <a routerLink="/partners" class="glass-card rounded-2xl p-5 flex flex-col items-center justify-center transition-all group cursor-pointer no-underline text-emerald-700 hover:text-emerald-600">
          <div class="glass-strong text-emerald-600 w-12 h-12 rounded-xl mb-3 group-hover:scale-110 transition-transform flex items-center justify-center">
            <mat-icon class="leading-none! flex items-center justify-center w-6 h-6 text-[24px]!">person_add</mat-icon>
          </div>
          <span class="font-semibold text-sm">Add Partner</span>
        </a>
        <a routerLink="/marketing" class="glass-card rounded-2xl p-5 flex flex-col items-center justify-center transition-all group cursor-pointer no-underline text-amber-700 hover:text-amber-600">
          <div class="glass-strong text-amber-500 w-12 h-12 rounded-xl mb-3 group-hover:scale-110 transition-transform flex items-center justify-center">
            <mat-icon class="leading-none! flex items-center justify-center w-6 h-6 text-[24px]!">campaign</mat-icon>
          </div>
          <span class="font-semibold text-sm">New Campaign</span>
        </a>
        <a routerLink="/tickets" class="glass-card rounded-2xl p-5 flex flex-col items-center justify-center transition-all group cursor-pointer no-underline text-rose-700 hover:text-rose-600">
          <div class="glass-strong text-rose-500 w-12 h-12 rounded-xl mb-3 group-hover:scale-110 transition-transform flex items-center justify-center">
            <mat-icon class="leading-none! flex items-center justify-center w-6 h-6 text-[24px]!">support_agent</mat-icon>
          </div>
          <span class="font-semibold text-sm">Create Ticket</span>
        </a>
      </div>

      @if (isCustomizing()) {
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

      <!-- Dynamic KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
              <span class="text-[11px] font-bold font-mono text-slate-700">{{ newDealsKPI().profit | number:'1.0-0' }} <span class="text-slate-400 font-normal">{{ state.globalCurrency() }}</span></span>
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
              <span class="text-[11px] font-bold font-mono text-slate-700">{{ newProspectsKPI().potential | number:'1.0-0' }} <span class="text-slate-400 font-normal">{{ state.globalCurrency() }}</span></span>
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
              <span class="text-[11px] font-bold font-mono text-slate-700">{{ lostProspectsKPI().potentialLost | number:'1.0-0' }} <span class="text-slate-400 font-normal">{{ state.globalCurrency() }}</span></span>
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
                <span class="text-[11px] font-bold font-mono text-slate-700">{{ deal.profit | number:'1.0-0' }} <span class="text-slate-400 font-normal">{{ state.globalCurrency() }}</span></span>
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

    </div>
  `
})
export class DashboardComponent {
  state = inject(CrmStateService);
  isCustomizing = signal(false);

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
    { id: 'todaysDeal', name: "Today's Deal", icon: 'star' }
  ];

  totalDealsValue = () => this.state.deals().reduce((acc, deal) => acc + deal.amount, 0);
  latePayersCount = () => this.state.overdueInvoices().length;
  activeCampaignsCount = () => this.state.campaigns().filter(c => c.status === 'Active').length;
  openTicketsCount = () => this.state.tickets().filter(c => c.status === 'Open' || c.status === 'In Progress').length;
  prospectsCount = () => this.state.prospects().length;

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

  private getDash(value: number, total: number) {
    const percent = (value / total) * 100;
    return `${percent} ${100 - percent}`;
  }

  private getOffset(previousTotal: number, _dummy: boolean, dummy2?: number) {
     // SVG dashoffset goes backwards when positive
     return previousTotal === 0 ? 0 : -((previousTotal) / (this.state.partners().length || 1) * 100); 
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(value);
  }

  isKpiActive(id: string) {
    return this.state.dashboardKpis().includes(id);
  }

  toggleKpi(id: string) {
    this.state.toggleDashboardKpi(id);
  }
}


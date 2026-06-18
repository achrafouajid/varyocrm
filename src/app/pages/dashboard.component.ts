import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [MatIconModule, CommonModule, RouterModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8">
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Home</h2>
          <p class="text-slate-500 mt-1">Your customizable daily summary. Select which KPIs to track.</p>
        </div>
        <button (click)="isCustomizing.set(!isCustomizing())" class="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
          <mat-icon class="mr-2 text-sm! w-5 h-5 leading-none!">{{ isCustomizing() ? 'check' : 'edit_square' }}</mat-icon>
          {{ isCustomizing() ? 'Done Customizing' : 'Customize KPIs' }}
        </button>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a routerLink="/sales" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-5 rounded-2xl flex flex-col items-center justify-center transition-all group shadow-sm border border-indigo-100/50 cursor-pointer no-underline">
          <div class="bg-white text-indigo-600 w-12 h-12 rounded-full mb-3 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center">
            <mat-icon class="leading-none! flex items-center justify-center w-6 h-6 text-[24px]!">add_business</mat-icon>
          </div>
          <span class="font-medium text-sm">New Deal</span>
        </a>
        <a routerLink="/partners" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-5 rounded-2xl flex flex-col items-center justify-center transition-all group shadow-sm border border-emerald-100/50 cursor-pointer no-underline">
          <div class="bg-white text-emerald-600 w-12 h-12 rounded-full mb-3 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center">
            <mat-icon class="leading-none! flex items-center justify-center w-6 h-6 text-[24px]!">person_add</mat-icon>
          </div>
          <span class="font-medium text-sm">Add Partner</span>
        </a>
        <a routerLink="/marketing" class="bg-amber-50 hover:bg-amber-100 text-amber-700 p-5 rounded-2xl flex flex-col items-center justify-center transition-all group shadow-sm border border-amber-100/50 cursor-pointer no-underline">
          <div class="bg-white text-amber-500 w-12 h-12 rounded-full mb-3 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center">
            <mat-icon class="leading-none! flex items-center justify-center w-6 h-6 text-[24px]!">campaign</mat-icon>
          </div>
          <span class="font-medium text-sm">New Campaign</span>
        </a>
        <a routerLink="/tickets" class="bg-rose-50 hover:bg-rose-100 text-rose-700 p-5 rounded-2xl flex flex-col items-center justify-center transition-all group shadow-sm border border-rose-100/50 cursor-pointer no-underline">
          <div class="bg-white text-rose-500 w-12 h-12 rounded-full mb-3 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center">
            <mat-icon class="leading-none! flex items-center justify-center w-6 h-6 text-[24px]!">support_agent</mat-icon>
          </div>
          <span class="font-medium text-sm">Create Ticket</span>
        </a>
      </div>

      @if (isCustomizing()) {
        <div class="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 class="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <mat-icon class="mr-2 text-[18px] w-4.5 h-4.5 text-slate-500">view_carousel</mat-icon>
            Select KPIs to display
          </h3>
          <div class="flex flex-wrap gap-3">
             @for (kpi of availableKpis; track kpi.id) {
               <button 
                 (click)="toggleKpi(kpi.id)"
                 [class]="isKpiActive(kpi.id) ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400 border-dashed'"
                 class="border px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center">
                 <mat-icon class="mr-2 text-[18px] w-4.5 h-4.5" [class.text-indigo-200]="isKpiActive(kpi.id)">{{ kpi.icon }}</mat-icon>
                 {{ kpi.name }}
               </button>
             }
          </div>
        </div>
      }

      <!-- Dynamic KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @if (isKpiActive('totalDeals')) {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Deals Value</h3>
              <div class="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <mat-icon>monetization_on</mat-icon>
              </div>
            </div>
            <div class="text-3xl font-semibold text-slate-900">{{ formatCurrency(totalDealsValue()) }}</div>
            <div class="text-sm text-emerald-600 font-medium mt-2 flex items-center">
              <mat-icon class="text-sm! leading-none! w-4 h-4 mr-1">trending_up</mat-icon>
              Active Pipeline
            </div>
          </div>
        }

        @if (isKpiActive('marketingSpend')) {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-slate-500 uppercase tracking-wider">Marketing Spend</h3>
              <div class="h-10 w-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
                <mat-icon>campaign</mat-icon>
              </div>
            </div>
            <div class="text-3xl font-semibold text-slate-900">{{ formatCurrency(12450) }}</div>
            <div class="text-sm text-slate-500 font-medium mt-2 flex items-center">
              <mat-icon class="text-sm! leading-none! w-4 h-4 mr-1">trending_flat</mat-icon>
              Stable across channels
            </div>
          </div>
        }

        @if (isKpiActive('latePayers')) {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-slate-500 uppercase tracking-wider">Late Payers</h3>
              <div class="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                <mat-icon>warning</mat-icon>
              </div>
            </div>
            <div class="text-3xl font-semibold text-slate-900">{{ latePayersCount() }}</div>
            <div class="text-sm text-rose-600 font-medium mt-2 flex items-center">
              <mat-icon class="text-sm! leading-none! w-4 h-4 mr-1">trending_down</mat-icon>
              Needs attention
            </div>
          </div>
        }
        
        @if (isKpiActive('activeCampaigns')) {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Campaigns</h3>
              <div class="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <mat-icon>email</mat-icon>
              </div>
            </div>
            <div class="text-3xl font-semibold text-slate-900">{{ activeCampaignsCount() }}</div>
            <div class="text-sm text-emerald-600 font-medium mt-2 flex items-center">
              <mat-icon class="text-sm! leading-none! w-4 h-4 mr-1">check_circle</mat-icon>
              Running smoothly
            </div>
          </div>
        }
        
        @if (isKpiActive('openTickets')) {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-slate-500 uppercase tracking-wider">Open Tickets</h3>
              <div class="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <mat-icon>support_agent</mat-icon>
              </div>
            </div>
            <div class="text-3xl font-semibold text-slate-900">{{ openTicketsCount() }}</div>
            <div class="text-sm text-amber-600 font-medium mt-2 flex items-center">
              <mat-icon class="text-sm! leading-none! w-4 h-4 mr-1">pending_actions</mat-icon>
              Pending resolution
            </div>
          </div>
        }
        
        @if (isKpiActive('totalProspects')) {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Prospects</h3>
              <div class="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <mat-icon>person_search</mat-icon>
              </div>
            </div>
            <div class="text-3xl font-semibold text-slate-900">{{ prospectsCount() }}</div>
            <div class="text-sm text-emerald-600 font-medium mt-2 flex items-center">
              <mat-icon class="text-sm! leading-none! w-4 h-4 mr-1">trending_up</mat-icon>
              Growing pipeline
            </div>
          </div>
        }
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <!-- Partner Distribution -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-lg font-medium text-slate-900 mb-6 font-sans">Partner Directory</h3>
          <div class="flex items-center">
            <div class="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.9155" class="text-slate-100" stroke-width="4" stroke="currentColor" fill="none"></circle>
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
                    <span class="text-slate-600 font-medium">{{slice.label}}</span>
                  </div>
                  <span class="text-slate-900 font-semibold">{{slice.count}}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- System Task Distribution -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-lg font-medium text-slate-900 mb-6 font-sans">Tasks Status</h3>
          <div class="flex items-center">
            <div class="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
                 <circle cx="18" cy="18" r="15.9155" class="text-slate-100" stroke-width="4" stroke="currentColor" fill="none"></circle>
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
                    <span class="text-slate-600 font-medium">{{slice.label}}</span>
                  </div>
                  <span class="text-slate-900 font-semibold">{{slice.count}}</span>
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
    { id: 'totalProspects', name: 'Total Prospects', icon: 'person_search' }
  ];

  totalDealsValue = () => this.state.deals().reduce((acc, deal) => acc + deal.amount, 0);
  latePayersCount = () => this.state.overdueInvoices().length;
  activeCampaignsCount = () => this.state.campaigns().filter(c => c.status === 'Active').length;
  openTicketsCount = () => this.state.tickets().filter(c => c.status === 'Open' || c.status === 'In Progress').length;
  prospectsCount = () => this.state.prospects().length;

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


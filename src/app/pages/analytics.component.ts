import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  imports: [MatIconModule, CommonModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Analytics Dashboard</h2>
        <p class="text-slate-500 mt-1">Key performance indicators and metrics.</p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Deals Value</h3>
            <div class="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <mat-icon>monetization_on</mat-icon>
            </div>
          </div>
          <div class="text-3xl font-semibold text-slate-900">{{ formatCurrency(totalDealsValue()) }}</div>
          <div class="text-sm text-emerald-600 font-medium mt-2 flex items-center">
            <mat-icon class="text-sm! leading-none! w-4 h-4 mr-1">trending_up</mat-icon>
            +14% from last month
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
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

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
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
      </div>

      <!-- Overview Chart Placeholder -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 class="text-lg font-medium text-slate-900 mb-6">Revenue Overview</h3>
        <div class="h-64 flex items-end justify-between space-x-2">
          @for (bar of [40, 65, 45, 80, 55, 90, 75, 100, 85, 110, 95, 120]; track $index) {
            <div class="w-full bg-indigo-100 rounded-t-sm relative group">
              <div class="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all duration-300" [style.height.%]="bar"></div>
            </div>
          }
        </div>
        <div class="flex justify-between mt-4 text-xs font-medium text-slate-400">
          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
        </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent {
  state = inject(CrmStateService);

  totalDealsValue = () => this.state.deals().reduce((acc, deal) => acc + deal.amount, 0);
  latePayersCount = () => this.state.overdueInvoices().length;

  formatCurrency(value: number) {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(value);
  }
}

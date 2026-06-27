import { Component, inject, ViewChild, ElementRef, AfterViewInit, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';

declare var Chart: any;

@Component({
  selector: 'app-analytics',
  imports: [MatIconModule, CommonModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-3xl font-semibold tracking-tight text-slate-900 font-sans">Analytics Dashboard</h2>
          <p class="text-slate-500 mt-1 font-sans">Real-time performance indicators and sales insights.</p>
        </div>
        <div class="text-xs text-slate-400 font-mono flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live state sync
        </div>
      </div>

      <!-- Sub-Tab Switcher -->
      <div class="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
        <button
          id="tab-overview"
          (click)="activeTab.set('overview')"
          [class]="activeTab() === 'overview'
            ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
            : 'text-slate-500 hover:text-slate-700'"
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm font-sans transition-all duration-150 cursor-pointer focus:outline-none"
        >
          <mat-icon class="text-base" style="width:18px;height:18px;font-size:18px;display:flex;align-items:center">dashboard</mat-icon>
          Overview
        </button>
        <button
          id="tab-customers360"
          (click)="activeTab.set('customers360')"
          [class]="activeTab() === 'customers360'
            ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
            : 'text-slate-500 hover:text-slate-700'"
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm font-sans transition-all duration-150 cursor-pointer focus:outline-none"
        >
          <mat-icon class="text-base" style="width:18px;height:18px;font-size:18px;display:flex;align-items:center">contact_page</mat-icon>
          Customers 360°
        </button>
      </div>

      <!-- ────────────────────────────────────────────────────────
           OVERVIEW TAB (CSS hidden to preserve Chart.js canvases)
           ──────────────────────────────────────────────────────── -->
      <div [class.hidden]="activeTab() !== 'overview'" class="space-y-8">

        <!-- New KPI Row — Deal & Prospect Intelligence -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <!-- Card 1: New Deals -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">New Deals</h3>
              <div class="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                <mat-icon class="text-base" style="width:18px;height:18px;font-size:18px;display:flex;align-items:center">handshake</mat-icon>
              </div>
            </div>
            <div class="text-2xl font-bold text-slate-900 font-mono">{{ newDealsKPI().count }} <span class="text-sm font-semibold text-slate-400 font-sans">deals</span></div>
            <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div class="text-[10px] text-indigo-600 font-bold flex items-center gap-0.5 font-sans">
                <mat-icon class="text-[12px]" style="width:12px;height:12px;font-size:12px;display:flex;align-items:center">trending_up</mat-icon> This month's profit
              </div>
              <span class="text-[11px] font-bold font-mono text-slate-700">{{ newDealsKPI().profit | number:'1.0-0' }} <span class="text-slate-400 font-normal">{{ state.globalCurrency() }}</span></span>
            </div>
          </div>

          <!-- Card 2: New Prospects -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">New Prospects</h3>
              <div class="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                <mat-icon class="text-base" style="width:18px;height:18px;font-size:18px;display:flex;align-items:center">group_add</mat-icon>
              </div>
            </div>
            <div class="text-2xl font-bold text-slate-900 font-mono">{{ newProspectsKPI().count }} <span class="text-sm font-semibold text-slate-400 font-sans">prospects</span></div>
            <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div class="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 font-sans">
                <mat-icon class="text-[12px]" style="width:12px;height:12px;font-size:12px;display:flex;align-items:center">insights</mat-icon> Pipeline potential
              </div>
              <span class="text-[11px] font-bold font-mono text-slate-700">{{ newProspectsKPI().potential | number:'1.0-0' }} <span class="text-slate-400 font-normal">{{ state.globalCurrency() }}</span></span>
            </div>
          </div>

          <!-- Card 3: Lost Prospects -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">Lost Prospects</h3>
              <div class="h-9 w-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100">
                <mat-icon class="text-base" style="width:18px;height:18px;font-size:18px;display:flex;align-items:center">do_not_disturb_on</mat-icon>
              </div>
            </div>
            <div class="text-2xl font-bold text-slate-900 font-mono">{{ lostProspectsKPI().count }} <span class="text-sm font-semibold text-slate-400 font-sans">closed lost</span></div>
            <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div class="text-[10px] text-red-500 font-bold flex items-center gap-0.5 font-sans">
                <mat-icon class="text-[12px]" style="width:12px;height:12px;font-size:12px;display:flex;align-items:center">trending_down</mat-icon> Value lost
              </div>
              <span class="text-[11px] font-bold font-mono text-slate-700">{{ lostProspectsKPI().potentialLost | number:'1.0-0' }} <span class="text-slate-400 font-normal">{{ state.globalCurrency() }}</span></span>
            </div>
          </div>

          <!-- Card 4: Today's Deal -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">Today's Deal</h3>
              <div class="h-9 w-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                <mat-icon class="text-base" style="width:18px;height:18px;font-size:18px;display:flex;align-items:center">star</mat-icon>
              </div>
            </div>
            @if (todaysDealKPI(); as deal) {
              <div class="text-base font-bold text-slate-900 font-sans truncate" [title]="deal.name">{{ deal.name }}</div>
              <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <div class="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 font-sans">
                  <mat-icon class="text-[12px]" style="width:12px;height:12px;font-size:12px;display:flex;align-items:center">bolt</mat-icon> Deal value
                </div>
                <span class="text-[11px] font-bold font-mono text-slate-700">{{ deal.profit | number:'1.0-0' }} <span class="text-slate-400 font-normal">{{ state.globalCurrency() }}</span></span>
              </div>
            } @else {
              <div class="text-sm font-semibold text-slate-400 font-sans">No transactions today</div>
              <div class="mt-2 pt-2 border-t border-slate-100">
                <div class="text-[10px] text-slate-300 font-bold flex items-center gap-0.5 font-sans">
                  <mat-icon class="text-[12px]" style="width:12px;height:12px;font-size:12px;display:flex;align-items:center">bolt</mat-icon> Check back later
                </div>
              </div>
            }
          </div>

        </div><!-- /new KPI row -->

        <!-- Currency Toggle — matches tab switcher style -->
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-slate-400 font-mono uppercase tracking-wider mr-1">Currency</span>
          <div class="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            @for (cur of ['MAD', 'USD', 'EUR']; track cur) {
              <button
                id="currency-toggle-{{ cur }}"
                (click)="state.globalCurrency.set(cur)"
                [class]="state.globalCurrency() === cur
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'"
                class="px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono transition-all duration-150 cursor-pointer focus:outline-none"
              >{{ cur }}</button>
            }
          </div>
        </div>


        <!-- KPI Summary Cards (4 Columns) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Sales This Month -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">Sales This Month</h3>
              <div class="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                <mat-icon class="text-base w-4.5 h-4.5 flex items-center justify-center">paid</mat-icon>
              </div>
            </div>
            <div class="text-2xl font-bold text-slate-900 font-mono">{{ formatCurrency(state.salesThisMonth()) }}</div>
            <div class="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-0.5 font-sans">
              <mat-icon class="text-[12px] w-3 h-3 flex items-center justify-center">trending_up</mat-icon> Current month won/confirmed
            </div>
          </div>

          <!-- Conversion Rate -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">Conversion Rate</h3>
              <div class="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
                <mat-icon class="text-base w-4.5 h-4.5 flex items-center justify-center">query_stats</mat-icon>
              </div>
            </div>
            <div class="text-2xl font-bold text-slate-900 font-mono">{{ state.conversionRate() }}%</div>
            <div class="text-[10px] text-indigo-600 font-bold mt-2 flex items-center gap-0.5 font-sans">
              <mat-icon class="text-[12px] w-3 h-3 flex items-center justify-center">insights</mat-icon> Active vs Total pipeline
            </div>
          </div>

          <!-- Win Rate -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">Win Rate</h3>
              <div class="h-9 w-9 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center border border-violet-100">
                <mat-icon class="text-base w-4.5 h-4.5 flex items-center justify-center">emoji_events</mat-icon>
              </div>
            </div>
            <div class="text-2xl font-bold text-slate-900 font-mono">{{ state.winRate() }}%</div>
            <div class="text-[10px] text-violet-600 font-bold mt-2 flex items-center gap-0.5 font-sans">
              <mat-icon class="text-[12px] w-3 h-3 flex items-center justify-center">check_circle</mat-icon> Won vs Lost deals
            </div>
          </div>

          <!-- Average Deal Size -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">Avg Deal Size</h3>
              <div class="h-9 w-9 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center border border-sky-100">
                <mat-icon class="text-base w-4.5 h-4.5 flex items-center justify-center">monetization_on</mat-icon>
              </div>
            </div>
            <div class="text-2xl font-bold text-slate-900 font-mono">{{ formatCurrency(state.avgDealSize()) }}</div>
            <div class="text-[10px] text-sky-600 font-bold mt-2 flex items-center gap-0.5 font-sans">
              <mat-icon class="text-[12px] w-3 h-3 flex items-center justify-center">analytics</mat-icon> Excludes lost opportunities
            </div>
          </div>
        </div>

        <!-- Charts Section (2 Columns) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Sales Forecasting -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div>
              <h3 class="text-base font-semibold text-slate-900 font-sans">Sales Forecasting</h3>
              <p class="text-xs text-slate-500 mt-0.5 font-sans">Expected monthly revenue per salesperson (excludes lost deals)</p>
            </div>
            <div class="h-64 relative">
              <canvas #forecastChart></canvas>
            </div>
          </div>

          <!-- Sales by Region -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div>
              <h3 class="text-base font-semibold text-slate-900 font-sans">Sales by Region</h3>
              <p class="text-xs text-slate-500 mt-0.5 font-sans">Total won &amp; confirmed sales volume by geographical region</p>
            </div>
            <div class="h-64 relative">
              <canvas #regionChart></canvas>
            </div>
          </div>
        </div>

        <!-- Lists & Table Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Top Customers -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div>
              <h3 class="text-base font-semibold text-slate-900 font-sans">Top Customers</h3>
              <p class="text-xs text-slate-500 mt-0.5 font-sans">Ranked by total confirmed deal value</p>
            </div>
            <div class="space-y-3 pt-2">
              @for (cust of state.topCustomers(); track cust.name) {
                <div class="flex items-center justify-between gap-4 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div class="flex items-center gap-3 shrink-0">
                    <div class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 uppercase font-sans">
                      {{ cust.name.substring(0, 2) }}
                    </div>
                    <div>
                      <span class="font-bold text-xs text-slate-800 block font-sans">{{ cust.name }}</span>
                      <span class="text-[10px] text-slate-400 font-semibold font-sans">{{ cust.dealCount }} won deals</span>
                    </div>
                  </div>
                  <span class="font-bold font-mono text-xs text-indigo-600 shrink-0">{{ formatCurrency(cust.totalValue) }}</span>
                </div>
              } @empty {
                <div class="text-center py-8 text-slate-400 text-xs font-sans">No customer sales data available.</div>
              }
            </div>
          </div>

          <!-- Lost Opportunities -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div>
              <h3 class="text-base font-semibold text-slate-900 font-sans">Lost Opportunities</h3>
              <p class="text-xs text-slate-500 mt-0.5 font-sans">Pipelines marked as Closed Lost</p>
            </div>
            <div class="overflow-hidden border border-slate-200 rounded-xl bg-slate-50/50">
              <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-100">
                  <tr>
                    <th scope="col" class="px-4 py-2.5 text-left font-bold text-[10px] text-slate-500 uppercase tracking-wider font-sans">Opportunity</th>
                    <th scope="col" class="px-4 py-2.5 text-left font-bold text-[10px] text-slate-500 uppercase tracking-wider font-sans">Owner</th>
                    <th scope="col" class="px-4 py-2.5 text-right font-bold text-[10px] text-slate-500 uppercase tracking-wider font-sans">Value</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-slate-200 text-xs">
                  @for (lost of state.lostOpportunities(); track lost.id) {
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="px-4 py-2.5">
                        <span class="font-bold text-slate-800 block truncate max-w-[160px] font-sans">{{ lost.title }}</span>
                        <span class="text-[9px] text-slate-400 font-mono">{{ getPartnerName(lost.partnerId) }}</span>
                      </td>
                      <td class="px-4 py-2.5 text-slate-500 font-medium font-sans">
                        {{ lost.salesPerson || 'Unassigned' }}
                      </td>
                      <td class="px-4 py-2.5 text-right font-bold font-mono text-slate-600">
                        {{ formatCurrency(lost.amount) }}
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="3" class="px-4 py-6 text-center text-slate-400 text-xs font-medium font-sans">No lost opportunities logged. Great job!</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div><!-- /overview -->

      <!-- ────────────────────────────────────────────────────────
           CUSTOMERS 360° TAB
           ──────────────────────────────────────────────────────── -->
      @if (activeTab() === 'customers360') {
        <div class="space-y-6">

          <!-- Customer Selector Banner -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-base font-semibold text-slate-900 font-sans">Customer 360° Profile</h3>
              <p class="text-xs text-slate-500 mt-0.5 font-sans">Select a customer to view their complete profile and interaction history.</p>
            </div>
            <div class="relative shrink-0">
              <select
                id="customer-selector"
                [value]="selectedCustomerId() || ''"
                (change)="onCustomerChange($event)"
                class="w-64 pl-3 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 hover:bg-white transition-colors font-sans font-semibold text-slate-700 appearance-none cursor-pointer shadow-xs"
              >
                @for (p of getCustomers(); track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <mat-icon style="font-size:18px;width:18px;height:18px">keyboard_arrow_down</mat-icon>
              </div>
            </div>
          </div>

          @if (selectedCustomer360(); as view) {

            <!-- ── Identity Card ── -->
            <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 hover:shadow-md transition-all">
              <div class="flex flex-col md:flex-row md:items-center gap-6">
                <!-- Avatar + Name -->
                <div class="flex items-center gap-4 shrink-0">
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-extrabold text-2xl uppercase shadow-lg">
                    {{ view.partner.name.substring(0, 2) }}
                  </div>
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <h2 class="text-xl font-extrabold text-slate-950 font-sans">{{ view.partner.name }}</h2>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 font-sans uppercase tracking-wide">
                        {{ view.partner.type }}
                      </span>
                    </div>
                    <p class="text-[10px] text-slate-400 font-mono mt-1">ID: {{ view.partner.id }}</p>
                  </div>
                </div>

                <!-- Contact Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  <div>
                    <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans block mb-0.5">City</span>
                    <span class="text-sm font-semibold text-slate-800 font-sans">{{ view.partner.city || '—' }}</span>
                  </div>
                  <div>
                    <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans block mb-0.5">Email</span>
                    <span class="text-sm font-semibold text-slate-800 font-sans truncate block" [title]="view.partner.email || ''">{{ view.partner.email || '—' }}</span>
                  </div>
                  <div>
                    <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans block mb-0.5">Phone</span>
                    <span class="text-sm font-semibold text-slate-800 font-sans">{{ view.partner.phone || '—' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── 4-Column Grid: Contacts | Orders | Meetings | Tickets ── -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <!-- Contacts / Personnel -->
              <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-4 hover:shadow-md transition-all">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <div class="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <mat-icon style="font-size:16px;width:16px;height:16px">people</mat-icon>
                    </div>
                    <h4 class="font-bold text-slate-900 text-sm font-sans">Contacts &amp; Personnel</h4>
                  </div>
                  <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold font-sans">{{ view.contacts.length }}</span>
                </div>
                <div class="space-y-2">
                  @for (c of view.contacts; track c.name) {
                    <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 hover:bg-indigo-50/30 transition-colors">
                      <div class="flex items-center justify-between gap-2 flex-wrap">
                        <span class="font-bold text-xs text-slate-800 font-sans">{{ c.name }}</span>
                        <span class="text-[9px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md font-semibold font-sans shadow-xs">{{ c.jobTitle }}</span>
                      </div>
                      <div class="flex items-center gap-4 text-[10px] text-slate-400 font-sans">
                        <span class="flex items-center gap-1 min-w-0">
                          <mat-icon style="font-size:11px;width:11px;height:11px">mail</mat-icon>
                          <span class="truncate" [title]="c.email || ''">{{ c.email || 'No email' }}</span>
                        </span>
                        <span class="flex items-center gap-1 min-w-0 shrink-0">
                          <mat-icon style="font-size:11px;width:11px;height:11px">call</mat-icon>
                          <span>{{ c.phone || '—' }}</span>
                        </span>
                      </div>
                    </div>
                  } @empty {
                    <div class="text-center py-6 text-slate-400 text-xs italic font-sans">None on record</div>
                  }
                </div>
              </div>

              <!-- Orders / Deals -->
              <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-4 hover:shadow-md transition-all">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <div class="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <mat-icon style="font-size:16px;width:16px;height:16px">shopping_bag</mat-icon>
                    </div>
                    <h4 class="font-bold text-slate-900 text-sm font-sans">Deals &amp; Orders</h4>
                  </div>
                  <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold font-sans">{{ view.orders.length }}</span>
                </div>
                <div class="space-y-2">
                  @for (o of view.orders; track o.id) {
                    <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 hover:bg-emerald-50/30 transition-colors">
                      <div class="min-w-0 flex-1">
                        <span class="font-bold text-xs text-slate-800 font-sans block truncate" [title]="o.title">{{ o.title }}</span>
                        <span class="text-[9px] text-slate-400 font-mono block mt-0.5">{{ o.date || 'No date' }}</span>
                      </div>
                      <div class="flex items-center gap-2 shrink-0">
                        <span [class]="getStageBadgeClass(o.stage)" class="text-[9px] px-2 py-0.5 rounded-full font-bold font-sans uppercase border">{{ o.stage }}</span>
                        <span class="font-bold font-mono text-xs text-slate-700">{{ formatCurrency(o.amount) }}</span>
                      </div>
                    </div>
                  } @empty {
                    <div class="text-center py-6 text-slate-400 text-xs italic font-sans">None on record</div>
                  }
                </div>
              </div>

              <!-- Meetings -->
              <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-4 hover:shadow-md transition-all">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <div class="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                      <mat-icon style="font-size:16px;width:16px;height:16px">event</mat-icon>
                    </div>
                    <h4 class="font-bold text-slate-900 text-sm font-sans">Meetings &amp; Activities</h4>
                  </div>
                  <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold font-sans">{{ view.meetings.length }}</span>
                </div>
                <div class="space-y-2">
                  @for (m of view.meetings; track m.id) {
                    <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 hover:bg-amber-50/30 transition-colors">
                      <div class="min-w-0 flex-1">
                        <span class="font-bold text-xs text-slate-800 font-sans block truncate" [title]="m.title">{{ m.title }}</span>
                        <span class="text-[9px] text-slate-400 font-mono block mt-0.5">{{ m.date }}</span>
                      </div>
                      <span class="text-[9px] bg-white text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-bold font-sans uppercase flex items-center gap-1 shrink-0">
                        <mat-icon style="font-size:10px;width:10px;height:10px">
                          {{ m.type === 'teams' ? 'video_camera_front' : m.type === 'in-person' ? 'location_on' : 'laptop_mac' }}
                        </mat-icon>
                        {{ m.type }}
                      </span>
                    </div>
                  } @empty {
                    <div class="text-center py-6 text-slate-400 text-xs italic font-sans">None on record</div>
                  }
                </div>
              </div>

              <!-- Support Tickets -->
              <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-4 hover:shadow-md transition-all">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div class="flex items-center gap-2">
                    <div class="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
                      <mat-icon style="font-size:16px;width:16px;height:16px">confirmation_number</mat-icon>
                    </div>
                    <h4 class="font-bold text-slate-900 text-sm font-sans">Support Tickets</h4>
                  </div>
                  <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold font-sans">{{ view.tickets.length }}</span>
                </div>
                <div class="space-y-2">
                  @for (t of view.tickets; track t.id) {
                    <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 hover:bg-violet-50/30 transition-colors">
                      <div class="min-w-0 flex-1">
                        <span class="font-bold text-xs text-slate-800 font-sans block truncate" [title]="t.title">{{ t.title }}</span>
                        <span class="text-[9px] text-slate-400 font-mono block mt-0.5">{{ t.id }}</span>
                      </div>
                      <div class="flex items-center gap-2 shrink-0">
                        <span [class]="getPriorityBadgeClass(t.priority)" class="text-[9px] px-2 py-0.5 rounded-full font-bold font-sans uppercase border">{{ t.priority }}</span>
                        <span [class]="getTicketStatusBadgeClass(t.status)" class="text-[9px] px-2 py-0.5 rounded-full font-bold font-sans uppercase border">{{ t.status }}</span>
                      </div>
                    </div>
                  } @empty {
                    <div class="text-center py-6 text-slate-400 text-xs italic font-sans">None on record</div>
                  }
                </div>
              </div>

            </div><!-- /4-grid -->

            <!-- ── Invoices (Full Width) ── -->
            <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-4 hover:shadow-md transition-all">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
                    <mat-icon style="font-size:16px;width:16px;height:16px">receipt_long</mat-icon>
                  </div>
                  <h4 class="font-bold text-slate-900 text-sm font-sans">Billing &amp; Invoices</h4>
                </div>
                <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold font-sans">{{ view.invoices.length }}</span>
              </div>

              <div class="overflow-hidden border border-slate-200 rounded-xl">
                <table class="min-w-full divide-y divide-slate-200">
                  <thead class="bg-slate-100">
                    <tr>
                      <th scope="col" class="px-4 py-2.5 text-left font-bold text-[10px] text-slate-500 uppercase tracking-wider font-sans">Invoice ID</th>
                      <th scope="col" class="px-4 py-2.5 text-left font-bold text-[10px] text-slate-500 uppercase tracking-wider font-sans">Due Date</th>
                      <th scope="col" class="px-4 py-2.5 text-center font-bold text-[10px] text-slate-500 uppercase tracking-wider font-sans">Status</th>
                      <th scope="col" class="px-4 py-2.5 text-right font-bold text-[10px] text-slate-500 uppercase tracking-wider font-sans">Amount</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-slate-200 text-xs">
                    @for (inv of view.invoices; track inv.id) {
                      <tr class="hover:bg-slate-50 transition-colors">
                        <td class="px-4 py-3 font-mono font-bold text-slate-800">{{ inv.id }}</td>
                        <td class="px-4 py-3 text-slate-500 font-medium font-sans">{{ inv.dueDate }}</td>
                        <td class="px-4 py-3 text-center">
                          <span [class]="getInvoiceStatusBadgeClass(inv.status)" class="text-[9px] px-2.5 py-0.5 rounded-full font-bold font-sans uppercase border">{{ inv.status }}</span>
                        </td>
                        <td class="px-4 py-3 text-right font-bold font-mono text-slate-900">{{ formatCurrency(inv.amount) }}</td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="4" class="px-4 py-6 text-center text-slate-400 text-xs italic font-sans">No invoices logged.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

          } @else {
            <!-- No customer selected / no data -->
            <div class="bg-white rounded-2xl shadow-xs border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
              <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <mat-icon style="font-size:32px;width:32px;height:32px">contact_page</mat-icon>
              </div>
              <h3 class="text-base font-bold text-slate-900 font-sans">No Profile Found</h3>
              <p class="text-xs text-slate-500 mt-1 font-sans max-w-xs">
                Select a customer from the dropdown above to view their unified 360° profile.
              </p>
            </div>
          }

        </div>
      }<!-- /customers360 -->

    </div>
  `
})
export class AnalyticsComponent implements AfterViewInit {
  state = inject(CrmStateService);

  // ── Sub-tab state ──────────────────────────────────────────
  activeTab = signal<'overview' | 'customers360'>('overview');

  // ── Customer 360 state ─────────────────────────────────────
  selectedCustomerId = signal<string | null>(null);

  selectedCustomer360 = computed(() => {
    const id = this.selectedCustomerId();
    return id ? this.state.getCustomer360(id) : null;
  });

  // ── New KPI Computed Signals ────────────────────────────────

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
      const val = linked.reduce((s, pr) => s + (pr.opportunityValue ?? pr.amount ?? 0), 0);
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
      name: top.customerAccount || top.title,
      profit: top.amount
    };
  });

  // ── Chart refs ─────────────────────────────────────────────
  @ViewChild('forecastChart') forecastCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('regionChart') regionCanvas!: ElementRef<HTMLCanvasElement>;

  forecastChartInstance: any;
  regionChartInstance: any;

  constructor() {
    // Auto-select first customer for immediate richness
    const first = this.state.partners().find(p => p.type === 'Customer');
    if (first) this.selectedCustomerId.set(first.id);
  }

  ngAfterViewInit() {
    this.initForecastChart();
    this.initRegionChart();
  }

  // ── Helpers ────────────────────────────────────────────────
  getCustomers() {
    return this.state.partners().filter(p => p.type === 'Customer');
  }

  onCustomerChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedCustomerId.set(val || null);
  }

  // ── Badge helpers ──────────────────────────────────────────
  getStageBadgeClass(stage: string): string {
    switch (stage) {
      case 'Confirmed':
      case 'Closed Won':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Awaiting Invoicing':
      case 'Invoiced':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'New':
      case 'Proposal sent':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Closed Lost':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  getTicketStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Open':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-700 border-red-100';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Low': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  getInvoiceStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Overdue': return 'bg-red-50 text-red-700 border-red-100';
      case 'Draft': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  // ── Charts ─────────────────────────────────────────────────
  initForecastChart() {
    const ctx = this.forecastCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const forecastData = this.state.salesForecast();
    const months = Array.from(new Set(forecastData.map(d => d.month))).sort();
    const reps = Array.from(new Set(forecastData.map(d => d.salesperson)));

    const colors = [
      'rgba(79, 70, 229, 1)',
      'rgba(147, 51, 234, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(16, 185, 129, 1)'
    ];

    const datasets = reps.map((rep, idx) => {
      const dataPoints = months.map(m => {
        const match = forecastData.find(d => d.month === m && d.salesperson === rep);
        return match ? match.total : 0;
      });
      return {
        label: rep,
        data: dataPoints,
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length].replace(', 1)', ', 0.05)'),
        borderWidth: 2,
        tension: 0.35,
        fill: true
      };
    });

    this.forecastChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months.map(m => {
          const parts = m.split('-');
          if (parts.length === 2) {
            const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
            return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
          }
          return m;
        }),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Outfit, Inter, sans-serif', size: 10 } } }
        },
        scales: {
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { font: { family: 'Outfit, Inter, sans-serif', size: 9 }, callback: (val: number) => this.formatCompactMAD(val) }
          },
          x: { grid: { display: false }, ticks: { font: { family: 'Outfit, Inter, sans-serif', size: 9 } } }
        }
      }
    });
  }

  initRegionChart() {
    const ctx = this.regionCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const regionData = this.state.dealsByRegion();

    this.regionChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: regionData.map(r => r.region),
        datasets: [{
          label: 'Won/Confirmed Revenue',
          data: regionData.map(r => r.total),
          backgroundColor: 'rgba(79, 70, 229, 0.85)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: '#f1f5f9' },
            ticks: { font: { family: 'Outfit, Inter, sans-serif', size: 9 }, callback: (val: number) => this.formatCompactMAD(val) }
          },
          y: { grid: { display: false }, ticks: { font: { family: 'Outfit, Inter, sans-serif', size: 9 } } }
        }
      }
    });
  }

  // ── Formatters ─────────────────────────────────────────────
  formatCurrency(value: number) {
    const cur = this.state.globalCurrency();
    const locale = cur === 'MAD' ? 'fr-MA' : cur === 'EUR' ? 'fr-FR' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(value);
  }

  formatCompactMAD(value: number) {
    const cur = this.state.globalCurrency();
    const suffix = cur === 'MAD' ? ' DH' : cur === 'EUR' ? ' €' : ' $';
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M' + suffix;
    if (value >= 1000) return (value / 1000).toFixed(0) + 'k' + suffix;
    return value + suffix;
  }

  getPartnerName(id: string) {
    return this.state.partners().find(p => p.id === id)?.name || 'Unknown';
  }
}

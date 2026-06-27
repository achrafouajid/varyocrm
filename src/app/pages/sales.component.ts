import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService, Partner, Task, Proposal, Deal, PurchaseOrder } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sales',
  imports: [MatIconModule, CommonModule, FormsModule],
  template: `
    <div class="flex gap-6">
      <!-- Left Sidebar Navigation -->
      <aside class="w-44 shrink-0 hidden lg:block">
        <nav class="space-y-1 sticky top-24">
          <button 
            (click)="activeTab.set('deals')" 
            [class]="activeTab() === 'deals' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">monetization_on</mat-icon>
            Deals
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.deals().length }}</span>
          </button>
          <button 
            (click)="activeTab.set('proposals')" 
            [class]="activeTab() === 'proposals' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">description</mat-icon>
            Proposals
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.proposals().length }}</span>
          </button>
          <button 
            (click)="activeTab.set('tasks')" 
            [class]="activeTab() === 'tasks' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">task</mat-icon>
            Tasks
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.tasks().length }}</span>
          </button>
          <button 
            (click)="activeTab.set('pos')" 
            [class]="activeTab() === 'pos' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">shopping_cart</mat-icon>
            Purchase Orders
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.purchaseOrders().length }}</span>
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 min-w-0 space-y-8">
        <div class="flex justify-between items-end">
          <div>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Sales & Operations</h2>
            <p class="text-slate-500 mt-1">Manage proposals, deals, purchase orders, and team tasks.</p>
          </div>
          <div class="flex gap-2">
            @if (activeTab() === 'deals') {
              <button (click)="openCreateDealModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                <mat-icon class="w-5 h-5 text-[20px]! leading-none! flex items-center justify-center">add</mat-icon>
                New Deal
              </button>
            } @else if (activeTab() === 'proposals') {
              <button (click)="openCreateProposalModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                <mat-icon class="w-5 h-5 text-[20px]! leading-none! flex items-center justify-center">add</mat-icon>
                New Proposal
              </button>
            } @else if (activeTab() === 'tasks') {
              <button (click)="openCreateTaskModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                <mat-icon class="w-5 h-5 text-[20px]! leading-none! flex items-center justify-center">add</mat-icon>
                New Task
              </button>
            }
          </div>
        </div>

      <!-- Deals View -->
      @if (activeTab() === 'deals') {
        <div class="grid grid-cols-1 gap-6">
          @for (deal of state.deals(); track deal.id) {
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all space-y-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-lg font-semibold text-slate-900">{{deal.title}}</h3>
                  <p class="text-sm text-slate-500 mt-0.5">Client: {{getPartnerName(deal.partnerId)}}</p>
                </div>
                <div class="flex flex-col items-end gap-1.5">
                  <span class="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {{deal.stage}}
                  </span>
                  @if (deal.estimatedDeliveryDate) {
                    <span class="text-xs text-emerald-600 flex items-center font-medium">
                      <mat-icon class="text-[14px] w-3.5 h-3.5 mr-0.5">local_shipping</mat-icon> Est. Delivery: {{deal.estimatedDeliveryDate}}
                    </span>
                  }
                </div>
              </div>

              <!-- Deal Details -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-100">
                <div>
                  <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount Details</span>
                  <div class="mt-1">
                    <span class="text-xl font-bold text-slate-900 font-mono">{{formatCurrency(deal.amount)}}</span>
                    @if (deal.discount) {
                      <span class="text-xs text-emerald-600 font-semibold ml-2">({{deal.discount}}% Discount applied)</span>
                    }
                  </div>
                </div>

                <div>
                  <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Comments / Notes</span>
                  <p class="text-xs text-slate-600 mt-1 line-clamp-2">{{deal.comments || 'No comments.'}}</p>
                </div>

                <div>
                  <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Attached Proposal</span>
                  <div class="text-xs text-slate-600 mt-1">
                    #{{deal.proposalId || 'N/A'}} - {{ getProposalTitle(deal.proposalId) }}
                  </div>
                </div>
              </div>

              <!-- Email Exchange Log -->
              @if (deal.emailExchange) {
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs font-mono space-y-1">
                  <div class="text-slate-400 font-sans font-bold flex items-center gap-1 mb-1">
                    <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none">email</mat-icon> Email Exchange & Confirmation Logs
                  </div>
                  <pre class="whitespace-pre-wrap text-[10px] text-slate-700 leading-relaxed font-sans">{{deal.emailExchange}}</pre>
                </div>
              }

              <!-- Expanded Deal Details -->
              @if (expandedDeals()[deal.id]) {
                <div class="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs bg-slate-50/50 p-4 rounded-xl border border-slate-100 animate-in slide-in-from-top-2 duration-200">
                  <!-- Identification & Dates -->
                  <div class="space-y-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200/60 pb-1">1. Identification & Dates</span>
                    <div class="grid grid-cols-2 gap-y-1 text-slate-600">
                      <span class="font-medium">Order Number:</span> <span class="font-mono text-slate-900 font-semibold">{{ deal.orderNumber || 'N/A' }}</span>
                      <span class="font-medium">Deal Number:</span> <span class="font-mono text-slate-900 font-semibold">{{ deal.dealNumber || 'N/A' }}</span>
                      <span class="font-medium">Order Date:</span> <span class="text-slate-900 font-mono">{{ deal.orderDate || 'N/A' }}</span>
                      <span class="font-medium">Req. Delivery:</span> <span class="text-slate-900 font-mono">{{ deal.requestedDeliveryDate || 'N/A' }}</span>
                      <span class="font-medium">Order Status:</span> 
                      <span>
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {{ deal.orderStatus || 'N/A' }}
                        </span>
                      </span>
                    </div>
                  </div>

                  <!-- Customer & Delivery -->
                  <div class="space-y-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200/60 pb-1">2. Customer & Delivery</span>
                    <div class="grid grid-cols-3 gap-y-1 text-slate-600">
                      <span class="font-medium col-span-1">Account:</span> <span class="col-span-2 text-slate-900 font-mono">{{ deal.customerAccount || 'N/A' }}</span>
                      <span class="font-medium col-span-1">Contact:</span> <span class="col-span-2 text-slate-900 font-medium">{{ deal.contactPerson || 'N/A' }}</span>
                      <span class="font-medium col-span-1">Email:</span> <span class="col-span-2 text-slate-900 font-mono truncate" [title]="deal.contactEmail">{{ deal.contactEmail || 'N/A' }}</span>
                      <span class="font-medium col-span-1">Phone:</span> <span class="col-span-2 text-slate-900 font-mono">{{ deal.contactPhone || 'N/A' }}</span>
                    </div>
                    <div class="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                      <div><strong class="text-slate-700">Billing:</strong> {{ deal.billingAddress || 'N/A' }}</div>
                      <div><strong class="text-slate-700">Delivery:</strong> {{ deal.deliveryAddress || 'N/A' }}</div>
                    </div>
                  </div>

                  <!-- Sales & Commercial -->
                  <div class="space-y-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200/60 pb-1">3. Sales & Commercial</span>
                    <div class="grid grid-cols-2 gap-y-1 text-slate-600">
                      <span class="font-medium">Sales Person:</span> <span class="text-slate-900 font-medium">{{ deal.salesPerson || 'N/A' }}</span>
                      <span class="font-medium">Region:</span> <span class="text-slate-900">{{ deal.salesRegion || 'N/A' }}</span>
                      <span class="font-medium">Currency:</span> <span class="text-slate-900 font-bold font-mono">{{ deal.currency || 'MAD' }}</span>
                      <span class="font-medium">Payment Terms:</span> <span class="text-slate-900">{{ deal.paymentTerms || 'N/A' }}</span>
                      <span class="font-medium">Total Amount:</span> <span class="text-slate-900 font-mono font-bold">{{ formatCurrency(deal.orderTotalAmount || deal.amount) }}</span>
                    </div>
                  </div>

                  <!-- Vendor & Logistics -->
                  @if (deal.vendorAccount || deal.purchaseOrderRef || deal.warehouseAddress) {
                    <div class="col-span-1 md:col-span-2 lg:col-span-3 space-y-2 pt-2 border-t border-slate-200/60">
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">4. Vendor & Logistics (if applicable)</span>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-600">
                        <div>
                          <span class="font-medium block text-[10px] uppercase text-slate-400">Vendor Account</span>
                          <span class="text-slate-900 font-mono font-semibold">{{ deal.vendorAccount || 'N/A' }}</span>
                        </div>
                        <div>
                          <span class="font-medium block text-[10px] uppercase text-slate-400">PO Reference</span>
                          <span class="text-slate-900 font-mono font-semibold">{{ deal.purchaseOrderRef || 'N/A' }}</span>
                        </div>
                        <div>
                          <span class="font-medium block text-[10px] uppercase text-slate-400">Warehouse Address</span>
                          <span class="text-slate-900">{{ deal.warehouseAddress || 'N/A' }}</span>
                        </div>
                        <div>
                          <span class="font-medium block text-[10px] uppercase text-slate-400">Transport / Expected Dates</span>
                          <div class="text-[11px]">
                            <div class="text-slate-900 font-semibold">{{ deal.transportationService || 'N/A' }}</div>
                            <div class="text-[10px] font-mono mt-0.5 text-slate-500">
                              Vendor Est: {{ deal.expectedDeliveryDateVendor || 'N/A' }}<br>
                              Customer Del: {{ deal.deliveryDate || 'N/A' }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }

                  <!-- Activity Hub -->
                  <div class="col-span-1 md:col-span-2 lg:col-span-3 border-t border-slate-200/60 pt-4 mt-2">
                    <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
                      <mat-icon class="text-[16px] w-4 h-4 text-indigo-600 flex items-center justify-center">forum</mat-icon> Deal Activity Hub
                    </h5>
                    
                    <!-- Tabs Header -->
                    <div class="flex flex-wrap gap-1 border-b border-slate-200 mb-4 bg-slate-50/50 p-1 rounded-lg">
                      <button type="button" (click)="setDealTab(deal.id, 'calls')"
                        [class]="getDealTab(deal.id) === 'calls' ? 'bg-white text-indigo-600 shadow-xs border-slate-200' : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'"
                        class="px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5">
                        <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none flex items-center justify-center">call</mat-icon>
                        Calls
                        <span class="bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded-full text-[9px] font-semibold">{{ deal.activityLog?.calls?.length || 0 }}</span>
                      </button>
                      <button type="button" (click)="setDealTab(deal.id, 'emails')"
                        [class]="getDealTab(deal.id) === 'emails' ? 'bg-white text-indigo-600 shadow-xs border-slate-200' : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'"
                        class="px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5">
                        <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none flex items-center justify-center">email</mat-icon>
                        Emails
                        <span class="bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded-full text-[9px] font-semibold">{{ deal.activityLog?.emails?.length || 0 }}</span>
                      </button>
                      <button type="button" (click)="setDealTab(deal.id, 'meetings')"
                        [class]="getDealTab(deal.id) === 'meetings' ? 'bg-white text-indigo-600 shadow-xs border-slate-200' : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'"
                        class="px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5">
                        <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none flex items-center justify-center">groups</mat-icon>
                        Meetings
                        <span class="bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded-full text-[9px] font-semibold">{{ deal.activityLog?.meetings?.length || 0 }}</span>
                      </button>
                      <button type="button" (click)="setDealTab(deal.id, 'recordings')"
                        [class]="getDealTab(deal.id) === 'recordings' ? 'bg-white text-indigo-600 shadow-xs border-slate-200' : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'"
                        class="px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5">
                        <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none flex items-center justify-center">videocam</mat-icon>
                        Teams Recordings
                        <span class="bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded-full text-[9px] font-semibold">{{ deal.activityLog?.recordings?.length || 0 }}</span>
                      </button>
                      <button type="button" (click)="setDealTab(deal.id, 'notes')"
                        [class]="getDealTab(deal.id) === 'notes' ? 'bg-white text-indigo-600 shadow-xs border-slate-200' : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'"
                        class="px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5">
                        <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none flex items-center justify-center">note_alt</mat-icon>
                        Notes
                        <span class="bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded-full text-[9px] font-semibold">{{ deal.activityLog?.notes?.length || 0 }}</span>
                      </button>
                      <button type="button" (click)="setDealTab(deal.id, 'tasks')"
                        [class]="getDealTab(deal.id) === 'tasks' ? 'bg-white text-indigo-600 shadow-xs border-slate-200' : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'"
                        class="px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5">
                        <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none flex items-center justify-center">assignment</mat-icon>
                        Tasks
                        <span class="bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded-full text-[9px] font-semibold">{{ getLinkedTasksCount(deal.title) }}</span>
                      </button>
                      <button type="button" (click)="setDealTab(deal.id, 'followups')"
                        [class]="getDealTab(deal.id) === 'followups' ? 'bg-white text-indigo-600 shadow-xs border-slate-200' : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'"
                        class="px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5">
                        <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none flex items-center justify-center">notification_important</mat-icon>
                        Follow-ups
                        <span class="bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded-full text-[9px] font-semibold">{{ deal.activityLog?.followUps?.length || 0 }}</span>
                      </button>
                      <button type="button" (click)="setDealTab(deal.id, 'calendar')"
                        [class]="getDealTab(deal.id) === 'calendar' ? 'bg-white text-indigo-600 shadow-xs border-slate-200' : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'"
                        class="px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5">
                        <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none flex items-center justify-center">calendar_month</mat-icon>
                        Calendar
                      </button>
                    </div>

                    <!-- Active Tab Panel -->
                    <div class="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 min-h-[180px]">
                      
                      <!-- CALLS TAB -->
                      @if (getDealTab(deal.id) === 'calls') {
                        <div class="space-y-4">
                          <div class="flex justify-between items-center">
                            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Phone Calls History</span>
                            <button type="button" (click)="openAddActivityModal(deal.id, 'calls')" class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-0.5">
                              <mat-icon class="text-[16px] w-4 h-4 flex items-center justify-center">add</mat-icon> Log Call
                            </button>
                          </div>
                          
                          <div class="space-y-3">
                            @for (call of deal.activityLog?.calls; track call.id) {
                              <div class="bg-white border border-slate-150 rounded-lg p-3 shadow-xs space-y-1.5">
                                <div class="flex justify-between items-start">
                                  <div class="flex items-center gap-2">
                                    <span class="font-bold text-slate-800">{{ call.callerName }}</span>
                                    <span class="text-slate-400 font-mono text-[10px]">{{ call.date }} ({{ call.duration }} min)</span>
                                  </div>
                                  <span [class]="call.outcome === 'Interested' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                 call.outcome === 'Follow-up' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                                 'bg-slate-100 text-slate-600 border-slate-200'"
                                        class="px-2 py-0.5 rounded text-[10px] font-semibold border">
                                    {{ call.outcome }}
                                  </span>
                                </div>
                                <p class="text-[11px] text-slate-600 font-sans leading-relaxed">{{ call.summary }}</p>
                              </div>
                            } @empty {
                              <div class="text-center py-6 text-slate-400 text-xs">No calls logged yet.</div>
                            }
                          </div>
                        </div>
                      }

                      <!-- EMAILS TAB -->
                      @if (getDealTab(deal.id) === 'emails') {
                        <div class="space-y-4">
                          <div class="flex justify-between items-center">
                            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email Correspondence Thread</span>
                            <button type="button" (click)="openAddActivityModal(deal.id, 'emails')" class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-0.5">
                              <mat-icon class="text-[16px] w-4 h-4 flex items-center justify-center">add</mat-icon> Log Email
                            </button>
                          </div>

                          <div class="space-y-3">
                            @for (email of deal.activityLog?.emails; track email.id) {
                              <div [class]="email.direction === 'sent' ? 'bg-indigo-50/40 border-indigo-100 ml-6' : 'bg-white border-slate-150 mr-6'"
                                   class="border rounded-lg p-3 shadow-xs space-y-1.5 transition-all">
                                <div class="flex justify-between items-start">
                                  <div>
                                    <span class="font-bold text-slate-800 text-xs">{{ email.subject }}</span>
                                    <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                                      From: {{ email.from }} | To: {{ email.to }}
                                    </div>
                                  </div>
                                  <span class="text-[10px] font-mono text-slate-400">{{ email.date }}</span>
                                </div>
                                <p class="text-[11px] text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">{{ email.body }}</p>
                              </div>
                            }
                            
                            <!-- Legacy emails text snippet fallback -->
                            @if (deal.emailExchange && (!deal.activityLog || deal.activityLog.emails.length === 0)) {
                              <div class="bg-white border border-slate-150 rounded-lg p-3 shadow-xs font-mono text-[11px] text-slate-700 leading-relaxed">
                                <div class="text-slate-400 font-sans font-bold flex items-center gap-1 mb-2">
                                  <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none">history</mat-icon> Imported Exchange Logs
                                </div>
                                <pre class="whitespace-pre-wrap text-[10px] font-sans leading-relaxed">{{ deal.emailExchange }}</pre>
                              </div>
                            }
                            
                            @if (!deal.emailExchange && (!deal.activityLog || deal.activityLog.emails.length === 0)) {
                              <div class="text-center py-6 text-slate-400 text-xs">No email exchanges logged yet.</div>
                            }
                          </div>
                        </div>
                      }

                      <!-- MEETINGS TAB -->
                      @if (getDealTab(deal.id) === 'meetings') {
                        <div class="space-y-4">
                          <div class="flex justify-between items-center">
                            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Meetings & Technical Demos</span>
                            <button type="button" (click)="openAddActivityModal(deal.id, 'meetings')" class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-0.5">
                              <mat-icon class="text-[16px] w-4 h-4 flex items-center justify-center">add</mat-icon> Log Meeting
                            </button>
                          </div>

                          <div class="space-y-3">
                            @for (meeting of deal.activityLog?.meetings; track meeting.id) {
                              <div class="bg-white border border-slate-150 rounded-lg p-3 shadow-xs space-y-2">
                                <div class="flex justify-between items-start">
                                  <div class="flex items-center gap-2">
                                    <span class="font-bold text-slate-800 text-xs">{{ meeting.title }}</span>
                                    <span [class]="meeting.type === 'teams' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                                   meeting.type === 'demo' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                                   'bg-slate-50 text-slate-700 border-slate-200'"
                                          class="px-1.5 py-0.2 rounded text-[9px] font-semibold border uppercase">
                                      {{ meeting.type }}
                                    </span>
                                  </div>
                                  <span class="text-[10px] text-slate-400 font-mono">{{ meeting.date }} à {{ meeting.time }}</span>
                                </div>
                                
                                <div class="text-[10px] text-slate-500">
                                  <strong>Location:</strong> {{ meeting.location }} | 
                                  <strong>Attendees:</strong> 
                                  @for (att of meeting.attendees; track $index) {
                                    <span class="inline-block bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full mx-0.5">{{ att }}</span>
                                  }
                                </div>
                                <p class="text-[11px] text-slate-600 font-sans leading-relaxed border-t border-slate-50 pt-1.5">{{ meeting.summary }}</p>
                              </div>
                            } @empty {
                              <div class="text-center py-6 text-slate-400 text-xs">No meetings logged yet.</div>
                            }
                          </div>
                        </div>
                      }

                      <!-- RECORDINGS TAB -->
                      @if (getDealTab(deal.id) === 'recordings') {
                        <div class="space-y-4">
                          <div class="flex justify-between items-center">
                            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Teams Meeting Records</span>
                            <button type="button" (click)="openAddActivityModal(deal.id, 'recordings')" class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-0.5">
                              <mat-icon class="text-[16px] w-4 h-4 flex items-center justify-center">add</mat-icon> Add Link
                            </button>
                          </div>

                          <div class="space-y-2">
                            @for (rec of deal.activityLog?.recordings; track rec.id) {
                              <div class="bg-white border border-slate-150 rounded-lg p-3 shadow-xs flex items-center justify-between gap-4">
                                <div class="flex items-center gap-3">
                                  <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                    <mat-icon class="text-base w-4.5 h-4.5 flex items-center justify-center">videocam</mat-icon>
                                  </div>
                                  <div>
                                    <span class="font-bold text-slate-800 text-xs block">{{ rec.title }}</span>
                                    <span class="text-[10px] text-slate-400 font-mono">{{ rec.date }} | Duration: {{ rec.duration }}</span>
                                  </div>
                                </div>
                                
                                <div class="flex gap-2">
                                  <a [href]="rec.meetingLink" target="_blank" class="px-2.5 py-1 text-[10px] font-semibold rounded bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 flex items-center gap-0.5">
                                    <mat-icon class="text-[12px] w-3 h-3">link</mat-icon> Teams
                                  </a>
                                  <a [href]="rec.recordingLink" target="_blank" class="px-2.5 py-1 text-[10px] font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-0.5">
                                    <mat-icon class="text-[12px] w-3 h-3 flex items-center justify-center">play_arrow</mat-icon> Record
                                  </a>
                                </div>
                              </div>
                            } @empty {
                              <div class="text-center py-6 text-slate-400 text-xs">No recording links added yet.</div>
                            }
                          </div>
                        </div>
                      }

                      <!-- NOTES TAB -->
                      @if (getDealTab(deal.id) === 'notes') {
                        <div class="space-y-4">
                          <div class="flex justify-between items-center">
                            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sales Notes & Comments</span>
                            <button type="button" (click)="openAddActivityModal(deal.id, 'notes')" class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-0.5">
                              <mat-icon class="text-[16px] w-4 h-4 flex items-center justify-center">add</mat-icon> Add Note
                            </button>
                          </div>

                          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            @for (note of deal.activityLog?.notes; track note.id) {
                              <div class="bg-amber-50/50 border border-amber-100 rounded-lg p-3 shadow-xs space-y-1.5 relative overflow-hidden font-sans">
                                <div class="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                                <div class="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                  <span>By: {{ note.author }}</span>
                                  <span>{{ note.date }}</span>
                                </div>
                                <p class="text-[11px] text-slate-700 leading-relaxed font-sans">{{ note.content }}</p>
                              </div>
                            } @empty {
                              <div class="col-span-2 text-center py-6 text-slate-400 text-xs">No notes added yet.</div>
                            }
                          </div>
                        </div>
                      }

                      <!-- TASKS TAB -->
                      @if (getDealTab(deal.id) === 'tasks') {
                        <div class="space-y-4">
                          <div class="flex justify-between items-center">
                            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operation & Hand-off Tasks</span>
                            <button type="button" (click)="openCreateTaskForDeal(deal.title)" class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-0.5">
                              <mat-icon class="text-[16px] w-4 h-4 flex items-center justify-center">add</mat-icon> New Task
                            </button>
                          </div>

                          <div class="space-y-2">
                            @for (t of getLinkedTasks(deal.title); track t.id) {
                              <div class="bg-white border border-slate-150 rounded-lg p-3 shadow-xs flex items-center justify-between gap-4">
                                <div class="flex items-center gap-3">
                                  <button type="button" (click)="toggleTaskStatus(t.id, t.status)" class="text-slate-400 hover:text-indigo-600">
                                    <mat-icon class="text-base w-4.5 h-4.5 flex items-center justify-center">{{ t.status === 'Completed' ? 'check_box' : 'check_box_outline_blank' }}</mat-icon>
                                  </button>
                                  <div>
                                    <span [class.line-through]="t.status === 'Completed'" [class.text-slate-400]="t.status === 'Completed'" class="font-bold text-slate-800 text-xs block font-sans">{{ t.title }}</span>
                                    <span class="text-[10px] text-slate-400 font-sans">Team: {{ t.assignedTeam }} | Assigned: {{ t.assignedTo || 'Unassigned' }}</span>
                                  </div>
                                </div>
                                
                                <span [class]="t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'" class="px-2 py-0.5 border text-[9px] font-bold uppercase rounded font-mono">
                                  {{ t.status }}
                                </span>
                              </div>
                            } @empty {
                              <div class="text-center py-6 text-slate-400 text-xs">No tasks linked to this deal yet.</div>
                            }
                          </div>
                        </div>
                      }

                      <!-- FOLLOW-UPS TAB -->
                      @if (getDealTab(deal.id) === 'followups') {
                        <div class="space-y-4">
                          <div class="flex justify-between items-center">
                            <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-sans">Upcoming Alerts & Action Reminders</span>
                            <button type="button" (click)="openAddActivityModal(deal.id, 'followups')" class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-0.5">
                              <mat-icon class="text-[16px] w-4 h-4 flex items-center justify-center">add</mat-icon> Add Follow-up
                            </button>
                          </div>

                          <div class="space-y-2">
                            @for (f of deal.activityLog?.followUps; track f.id) {
                              <div class="bg-white border border-slate-150 rounded-lg p-3 shadow-xs flex items-center justify-between gap-4">
                                <div class="flex items-center gap-3">
                                  <button type="button" (click)="toggleFollowUpStatus(deal.id, f.id, f.status)" class="text-slate-400 hover:text-indigo-600">
                                    <mat-icon class="text-base w-4.5 h-4.5 flex items-center justify-center">{{ f.status === 'done' ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                                  </button>
                                  <div>
                                    <span [class.line-through]="f.status === 'done'" [class.text-slate-400]="f.status === 'done'" class="font-bold text-slate-800 text-xs block font-sans">{{ f.title }}</span>
                                    <span class="text-[10px] text-slate-400 font-mono">Due date: {{ f.dueDate }} | Owner: {{ f.assignedTo }}</span>
                                  </div>
                                </div>
                                
                                <span [class]="f.status === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'" class="px-2 py-0.5 border text-[9px] font-bold uppercase rounded font-mono">
                                  {{ f.status === 'done' ? 'Completed' : 'Pending' }}
                                </span>
                              </div>
                            } @empty {
                              <div class="text-center py-6 text-slate-400 text-xs">No follow-ups scheduled yet.</div>
                            }
                          </div>
                        </div>
                      }

                      <!-- CALENDAR TAB -->
                      @if (getDealTab(deal.id) === 'calendar') {
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div class="flex justify-between items-center mb-2 px-1">
                              <span class="text-[11px] font-bold text-slate-700 uppercase">Juin 2026</span>
                              <span class="text-[9px] text-slate-400 flex items-center gap-0.5 font-semibold">
                                <span class="w-1.5 h-1.5 bg-indigo-600 rounded-full inline-block"></span> Outlook Sync TBD
                              </span>
                            </div>

                            <!-- Calendar Grid -->
                            <div class="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs">
                              <div class="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-slate-400 mb-1 border-b border-slate-50 pb-1">
                                @for (h of calendarHeaders; track h) {
                                  <div>{{ h }}</div>
                                }
                              </div>
                              <div class="grid grid-cols-7 gap-1.5">
                                @for (day of calendarDays; track day) {
                                  <button type="button" (click)="selectCalendarDay(deal.id, day)"
                                          [class]="isSelectedCalendarDay(deal.id, day) ? 'bg-indigo-600 text-white font-bold' : 
                                                   hasEventsOnDay(deal, day) ? 'bg-indigo-50 text-indigo-700 font-bold border-indigo-200' : 
                                                   'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-105 border-slate-100'"
                                          class="w-full aspect-square rounded-lg text-[10px] font-semibold border flex flex-col items-center justify-center relative transition-all">
                                    {{ day }}
                                    @if (hasEventsOnDay(deal, day) && !isSelectedCalendarDay(deal.id, day)) {
                                      <span class="absolute bottom-1 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                                    }
                                  </button>
                                }
                              </div>
                            </div>
                          </div>

                          <!-- Selected Day Details -->
                          <div class="flex flex-col justify-between">
                            <div class="space-y-2">
                              <span class="text-[11px] font-bold text-slate-700 block mb-2 uppercase">
                                Events: {{ getSelectedCalendarDay(deal.id) ? 'Day ' + getSelectedCalendarDay(deal.id) + ' June' : 'Select a day' }}
                              </span>

                              <div class="space-y-2">
                                @for (m of getEventsOnDay(deal, getSelectedCalendarDay(deal.id) || 15); track m.id) {
                                  <div class="bg-white border border-indigo-100 rounded-lg p-2.5 shadow-xs">
                                    <div class="flex justify-between items-center mb-1">
                                      <span class="font-bold text-slate-900 text-xs">{{ m.title }}</span>
                                      <span class="text-[9px] text-slate-400 font-mono">{{ m.time }}</span>
                                    </div>
                                    <div class="text-[9px] text-slate-500 uppercase tracking-wider mb-1 font-sans">
                                      Type: {{ m.type }} | Location: {{ m.location }}
                                    </div>
                                    <p class="text-[10px] text-slate-600 line-clamp-2 leading-relaxed font-sans">{{ m.summary }}</p>
                                  </div>
                                } @empty {
                                  <div class="text-center py-8 text-slate-400 text-[11px] bg-white border border-slate-150 rounded-xl font-sans">
                                    No meetings scheduled on this day.
                                  </div>
                                }
                              </div>
                            </div>

                            <div class="text-[10px] bg-slate-100 text-slate-500 rounded-lg p-2.5 border border-slate-150 mt-4 leading-relaxed font-sans">
                              💡 <strong>Tip:</strong> Meetings logged in the <strong>Meetings</strong> tab automatically populate this calendar view.
                            </div>
                          </div>
                        </div>
                      }

                    </div>
                  </div>
                </div>
              }

              <!-- Action buttons for Operations / Delivery -->
              <div class="flex justify-between items-center pt-4 border-t border-slate-100">
                <div class="flex items-center gap-4">
                  <span class="text-xs text-slate-400">Lines: {{ deal.orderLines?.length || 0 }} items</span>
                  <button (click)="toggleDealDetails(deal.id)" class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-0.5 transition-colors">
                    <mat-icon class="text-[16px] w-4 h-4">{{ expandedDeals()[deal.id] ? 'expand_less' : 'expand_more' }}</mat-icon>
                    {{ expandedDeals()[deal.id] ? 'Hide Full Details' : 'View Full Details' }}
                  </button>
                </div>
                <div class="flex gap-2">
                  <!-- Create PO trigger if none exists for this deal -->
                  @if (!hasPOForDeal(deal.id)) {
                    <button (click)="openCreatePOModal(deal)" class="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center">
                      <mat-icon class="mr-1 text-[16px] w-4 h-4">add_shopping_cart</mat-icon> Create PO (Operations)
                    </button>
                  }
                  @if (deal.stage === 'New') {
                    <button (click)="state.updateDealStage(deal.id, 'Confirmed')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center">
                      <mat-icon class="mr-1 text-[16px] w-4 h-4">check</mat-icon> Confirm Deal
                    </button>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="bg-white rounded-2xl p-8 text-center text-slate-500 shadow-sm border border-slate-200">No deals found. Create a confirmed proposal to start.</div>
          }
        </div>
      }

      <!-- Proposals View -->
      @if (activeTab() === 'proposals') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (prop of state.proposals(); track prop.id) {
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
              <div class="space-y-3">
                <div class="flex justify-between items-start">
                  <span class="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase"
                    [class]="prop.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : (prop.status === 'Sent' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800')">
                    {{prop.status}}
                  </span>
                  <span class="font-mono text-sm text-slate-400">#{{prop.id}}</span>
                </div>
                <h3 class="text-lg font-semibold text-slate-900">{{prop.title}}</h3>
                <p class="text-xs text-slate-500">Prospect: {{getPartnerName(prop.partnerId)}}</p>

                <!-- Lines -->
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lines & Pricing</span>
                  @for (line of prop.lines; track $index) {
                    <div class="flex justify-between text-xs text-slate-700">
                      <span>{{line.qty}}x {{line.product}}</span>
                      <span class="font-mono">{{formatCurrency(line.total)}}</span>
                    </div>
                  }
                  <div class="flex justify-between border-t border-slate-200 pt-1.5 text-xs font-bold text-slate-900 font-mono">
                    <span>Total Proposal Amount</span>
                    <span>{{formatCurrency(prop.amount)}}</span>
                  </div>
                </div>
              </div>

              <div class="mt-5 pt-3 border-t border-slate-100 flex justify-between gap-2">
                @if (prop.status === 'Draft') {
                  <button (click)="state.updateProposalStatus(prop.id, 'Sent')" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                    Send to Prospect
                  </button>
                } @else if (prop.status === 'Sent') {
                  <button (click)="state.updateProposalStatus(prop.id, 'Confirmed')" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                    <mat-icon class="text-[16px] w-4 h-4">task_alt</mat-icon> Confirm (Signs BC)
                  </button>
                } @else {
                  <button (click)="convertProposalToDeal(prop)"
                    class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 group">
                    <mat-icon class="text-[16px] w-4 h-4 transition-transform group-hover:scale-110">swap_horiz</mat-icon>
                    Convert to Deal &amp; Customer
                  </button>
                }
              </div>
            </div>
          } @empty {
            <div class="col-span-2 bg-white rounded-2xl p-8 text-center text-slate-500 shadow-sm border border-slate-200">No proposals found.</div>
          }
        </div>
      }

      <!-- Tasks View -->
      @if (activeTab() === 'tasks') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (task of state.tasks(); track task.id) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div class="flex justify-between items-start mb-3">
                  <span [class]="getStatusColor(task.status)" class="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full">
                    {{task.status}}
                  </span>
                  <span class="text-xs text-slate-400 font-mono">#{{task.id}}</span>
                </div>
                <h4 class="text-slate-900 font-semibold text-base mb-1">{{task.title}}</h4>
                <p class="text-xs text-slate-500 mb-3">{{task.description}}</p>

                @if (task.relatedTo) {
                  <div class="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg p-1.5 px-2 mb-4 inline-flex items-center gap-1 font-medium">
                    <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none">link</mat-icon>
                    {{task.relatedTo}}
                  </div>
                }
              </div>

              <div class="border-t border-slate-100 pt-3 flex flex-col gap-3 mt-4">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-400 font-medium">Assigned Team:</span>
                  <span class="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{{task.assignedTeam || 'Sales'}}</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-400 font-medium">Assigned Person:</span>
                  <span class="font-bold text-slate-700">{{task.assignedTo || 'Unassigned'}}</span>
                </div>
                
                <!-- Manual reassignment & status change -->
                <div class="flex gap-2 pt-2 border-t border-slate-50">
                  @if (task.status === 'Pending') {
                    <button (click)="state.updateTaskStatus(task.id, 'In Progress')" class="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-indigo-600 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                      Start Task
                    </button>
                  } @else if (task.status === 'In Progress') {
                    <button (click)="state.updateTaskStatus(task.id, 'Completed')" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors">
                      Complete Task
                    </button>
                  } @else {
                    <span class="text-emerald-600 text-xs font-bold py-1.5 text-center w-full flex items-center justify-center">
                      <mat-icon class="text-[16px] w-4 h-4 mr-0.5">check_circle</mat-icon> Completed
                    </span>
                  }
                  
                  <!-- Assign Option -->
                  @if (task.status !== 'Completed') {
                    <button (click)="openAssignModal(task)" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center">
                      <mat-icon class="text-[16px] w-4 h-4">person</mat-icon> Assign
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Purchase Orders View -->
      @if (activeTab() === 'pos') {
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">PO Ref</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Vendor</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Deal</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Amount</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Delivery Date</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Status</th>
                <th scope="col" class="px-6 py-3 text-right font-medium text-slate-500 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              @for (po of state.purchaseOrders(); track po.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-slate-900 font-mono">#{{po.id}}</div>
                    @if (po.sentVia) {
                      <span class="text-[10px] text-slate-400 font-medium">Sent: {{po.sentVia}}</span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-950 font-medium">{{getPartnerName(po.vendorId)}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-500">{{getDealTitle(po.dealId)}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-900 font-mono font-bold">{{formatCurrency(po.amount)}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-600 font-mono">{{po.deliveryDate || 'Pending Conf.'}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full"
                      [class]="po.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : (po.status === 'Sent' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800')">
                      {{po.status}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold space-x-1.5">
                    @if (po.status === 'Sent') {
                      <button (click)="openSetDeliveryDatePOModal(po)" class="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-50">Set Del. Date</button>
                      <button (click)="state.updatePurchaseOrderStatus(po.id, 'Delivered')" class="bg-indigo-600 text-white px-2 py-1 rounded-lg hover:bg-indigo-700">Receive Goods</button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-6 py-8 text-center text-slate-500 text-sm">No Purchase Orders generated yet.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
      </div>
    </div>

    <!-- Modals -->
    <!-- Assign Modal -->
    @if (assignModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Assign Task: {{selectedTask()?.title}}</h3>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Assignee</label>
            <select [(ngModel)]="reassignedUser" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
              @for (user of state.users(); track user.name) {
                <option [value]="user.name">{{user.name}} ({{user.role}})</option>
              }
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button (click)="assignModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
            <button (click)="saveAssignment()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">Assign</button>
          </div>
        </div>
      </div>
    }

    <!-- Create Proposal Modal -->
    @if (proposalModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Create Proposal</h3>
          
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Prospect / Client</label>
              <select [(ngModel)]="newProposal.partnerId" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                @for (p of state.partners(); track p.id) {
                  <option [value]="p.id">{{p.name}} ({{p.type}})</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Proposal Title</label>
              <input [(ngModel)]="newProposal.title" type="text" placeholder="e.g. Standard Enterprise Cloud Infrastructure" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Template</label>
              <select [(ngModel)]="selectedTemplateId" (change)="applyTemplate()" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                <option value="">-- Manual/No Template --</option>
                @for (temp of state.proposalTemplates(); track temp.id) {
                  <option [value]="temp.id">{{temp.name}}</option>
                }
              </select>
            </div>

            <!-- Line Items -->
            <div class="space-y-2 border-t border-slate-100 pt-2">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Line Items</span>
              @for (line of newProposal.lines; track $index) {
                <div class="grid grid-cols-12 gap-2 items-center">
                  <input class="col-span-4 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600" [(ngModel)]="line.product" placeholder="Product">
                  <input class="col-span-4 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600" [(ngModel)]="line.description" placeholder="Description">
                  <input class="col-span-1 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600 text-center" type="number" [(ngModel)]="line.qty" (change)="recalcLine(line)">
                  <input class="col-span-2 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600 font-mono text-right" type="number" [(ngModel)]="line.unitPrice" (change)="recalcLine(line)">
                  <button type="button" (click)="removeLine($index)" class="col-span-1 text-rose-500 hover:bg-rose-50 p-1 rounded"><mat-icon class="text-[16px] w-4 h-4 leading-none">delete</mat-icon></button>
                </div>
              }
              <button (click)="addLineItem()" class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center mt-1">
                <mat-icon class="text-[16px] w-4 h-4 mr-0.5">add_circle</mat-icon> Add Line Item
              </button>
            </div>
          </div>

          <div class="flex justify-between items-center border-t border-slate-100 pt-4">
            <div class="text-sm">
              <span class="text-slate-500">Total Amount:</span>
              <strong class="ml-1 text-slate-900 font-mono">{{formatCurrency(getNewProposalTotal())}}</strong>
            </div>
            <div class="flex gap-2">
              <button (click)="proposalModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
              <button (click)="saveProposal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">Create Proposal</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Create Deal Modal -->
    @if (dealModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-7xl w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3 shrink-0">
            <h3 class="text-xl font-bold text-slate-950">Create Deal</h3>
            <span class="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full font-medium">Extended Fields Active</span>
          </div>
          
          <!-- HEADER SECTION: All form fields in scrollable 2-column grid -->
          <div class="overflow-y-auto pr-2 shrink-0 max-h-[35vh]">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Left Column: Core Deal info, Customer details, Commercials -->
              <div class="space-y-6">
                <!-- SECTION 1: Identification & Dates -->
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <mat-icon class="text-[16px] w-4 h-4">tag</mat-icon> Identification & Dates
                  </h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Select Client (Must be Customer)</label>
                      <select [(ngModel)]="newDeal.partnerId" (change)="onPartnerChange()" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                        @for (c of state.customers(); track c.id) {
                          <option [value]="c.id">{{c.name}}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Linked Proposal</label>
                      <select [(ngModel)]="newDeal.proposalId" (change)="onProposalChange()" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                        <option value="">None</option>
                        @for (p of state.proposals(); track p.id) {
                          <option [value]="p.id">#{{p.id}} - {{p.title}}</option>
                        }
                      </select>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Deal Title</label>
                      <input [(ngModel)]="newDeal.title" type="text" placeholder="e.g. Atlas Cloud Migration Project" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Order Status</label>
                      <select [(ngModel)]="newDeal.orderStatus" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                        <option value="Draft">Draft</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-4 gap-3">
                    <div class="col-span-2">
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Order Number</label>
                      <input [(ngModel)]="newDeal.orderNumber" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div class="col-span-2">
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Deal Number</label>
                      <input [(ngModel)]="newDeal.dealNumber" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Order Date</label>
                      <input [(ngModel)]="newDeal.orderDate" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Requested Delivery Date</label>
                      <input [(ngModel)]="newDeal.requestedDeliveryDate" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                  </div>
                </div>

                <!-- SECTION 2: Customer & Delivery -->
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <mat-icon class="text-[16px] w-4 h-4">business</mat-icon> Customer & Delivery
                  </h4>
                  <div class="grid grid-cols-3 gap-3">
                    <div class="col-span-1">
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Customer Account</label>
                      <input [(ngModel)]="newDeal.customerAccount" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div class="col-span-2">
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Contact Person</label>
                      <input [(ngModel)]="newDeal.contactPerson" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Contact Email</label>
                      <input [(ngModel)]="newDeal.contactEmail" type="email" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Contact Phone Number</label>
                      <input [(ngModel)]="newDeal.contactPhone" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Billing Address</label>
                      <textarea [(ngModel)]="newDeal.billingAddress" rows="2" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Delivery Address</label>
                      <textarea [(ngModel)]="newDeal.deliveryAddress" rows="2" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
                    </div>
                  </div>
                </div>

                <!-- SECTION 3: Sales & Ownership -->
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <mat-icon class="text-[16px] w-4 h-4">person</mat-icon> Sales & Ownership
                  </h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Sales Person</label>
                      <select [(ngModel)]="newDeal.salesPerson" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                        @for (u of state.users(); track u.name) {
                          @if (u.team === 'Sales') {
                            <option [value]="u.name">{{u.name}}</option>
                          }
                        }
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Sales Organization / Region</label>
                      <input [(ngModel)]="newDeal.salesRegion" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
                    </div>
                  </div>
                </div>

                <!-- SECTION 4: Commercial Basics -->
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <mat-icon class="text-[16px] w-4 h-4">monetization_on</mat-icon> Commercial Basics
                  </h4>
                  <div class="grid grid-cols-4 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Currency</label>
                      <select [(ngModel)]="newDeal.currency" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                        <option value="MAD">MAD</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Amount (Raw)</label>
                      <input [(ngModel)]="newDeal.amount" type="number" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Discount (%)</label>
                      <input [(ngModel)]="newDeal.discount" type="number" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Payment Terms</label>
                      <input [(ngModel)]="newDeal.paymentTerms" type="text" placeholder="e.g. 30 Days Net" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Vendor/Partner & Logs/Comments -->
              <div class="space-y-6">
                <!-- SECTION 5: Vendor / Partner (Logistics) -->
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <mat-icon class="text-[16px] w-4 h-4">local_shipping</mat-icon> Vendor / Partner (Logistics)
                  </h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Vendor Account</label>
                      <input [(ngModel)]="newDeal.vendorAccount" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Purchase Order Reference</label>
                      <input [(ngModel)]="newDeal.purchaseOrderRef" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Warehouse Address</label>
                      <input [(ngModel)]="newDeal.warehouseAddress" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Transportation Service</label>
                      <input [(ngModel)]="newDeal.transportationService" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Expected Delivery Date (Vendor)</label>
                      <input [(ngModel)]="newDeal.expectedDeliveryDateVendor" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Delivery Date (Customer)</label>
                      <input [(ngModel)]="newDeal.deliveryDate" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                  </div>
                </div>

                <!-- SECTION 6: Logs & Comments -->
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <mat-icon class="text-[16px] w-4 h-4">notes</mat-icon> Logs & Comments
                  </h4>
                  <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Email Exchange logs & Confirmations</label>
                    <textarea [(ngModel)]="newDeal.emailExchange" rows="3" placeholder="Paste copy of signed email confirmations..." class="w-full border border-slate-200 rounded-lg p-2 text-[11px] font-mono focus:outline-indigo-600"></textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Customer Comments</label>
                    <textarea [(ngModel)]="newDeal.comments" rows="2" placeholder="Comments..." class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Horizontal Divider -->
          <hr class="border-slate-200 shrink-0">

          <!-- LINE ITEMS SECTION: Full-width data table -->
          <div class="space-y-3 min-h-0 flex flex-col overflow-hidden">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <mat-icon class="text-[16px] w-4 h-4">list</mat-icon> Line Items
            </h4>
            <div class="overflow-x-auto border border-slate-200 rounded-xl flex-1">
              <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">#</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Description</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Quantity</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-36">Unit Price</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-52">Vendor</th>
                    <th class="px-4 py-3 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-slate-200">
                  @for (line of newDeal.lines; track $index) {
                    <tr class="hover:bg-slate-50/50">
                      <td class="px-4 py-2 text-sm text-slate-400 font-mono text-center">{{$index + 1}}</td>
                      <td class="px-4 py-2">
                        <input class="w-full border border-slate-200 rounded-lg p-1.5 text-sm focus:outline-indigo-600" [(ngModel)]="line.description" placeholder="Item description">
                      </td>
                      <td class="px-4 py-2">
                        <input class="w-full border border-slate-200 rounded-lg p-1.5 text-sm focus:outline-indigo-600 text-right font-mono" type="number" [(ngModel)]="line.qty" (change)="recalcDealLine(line)">
                      </td>
                      <td class="px-4 py-2">
                        <input class="w-full border border-slate-200 rounded-lg p-1.5 text-sm focus:outline-indigo-600 text-right font-mono" type="number" [(ngModel)]="line.unitPrice" (change)="recalcDealLine(line)">
                      </td>
                      <td class="px-4 py-2">
                        <select class="w-full border border-slate-200 rounded-lg p-1.5 text-sm bg-white focus:outline-indigo-600" [(ngModel)]="line.vendor">
                          <option value="">-- Select Vendor --</option>
                          @for (v of state.vendors(); track v.id) {
                            <option [value]="v.name">{{v.name}}</option>
                          }
                        </select>
                      </td>
                      <td class="px-4 py-2 text-center">
                        <button type="button" (click)="removeDealLine($index)" class="text-rose-500 hover:bg-rose-50 p-1 rounded">
                          <mat-icon class="text-[16px] w-4 h-4 leading-none">delete</mat-icon>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <button (click)="addDealLineItem()" class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center shrink-0">
              <mat-icon class="text-[16px] w-4 h-4 mr-0.5">add_circle</mat-icon> Add Line Item
            </button>
          </div>

          <!-- Footer -->
          <div class="flex justify-between items-center border-t border-slate-100 pt-4 shrink-0">
            <div class="text-sm">
              <span class="text-slate-500">Calculated Total:</span>
              <strong class="ml-1 text-slate-900 font-mono">
                {{ formatCurrency(newDeal.amount - (newDeal.amount * (newDeal.discount / 100))) }}
              </strong>
            </div>
            <div class="flex gap-2">
              <button (click)="dealModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
              <button (click)="saveDeal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">Save Deal</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Create PO Modal (Operations) -->
    @if (poModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Create Purchase Order</h3>
          <p class="text-xs text-slate-500">Creating Purchase Order linked to: <strong>{{selectedDealForPO()?.title}}</strong></p>
          
          <div class="space-y-3">
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="block text-xs font-semibold text-slate-500 uppercase">Vendor</label>
                <button (click)="showNewVendorForm.set(!showNewVendorForm())" class="text-indigo-600 hover:text-indigo-700 text-[10px] font-bold uppercase">
                  {{ showNewVendorForm() ? 'Select Existing' : '+ Create New Vendor Inline' }}
                </button>
              </div>
              
              @if (showNewVendorForm()) {
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                  <input [(ngModel)]="newVendorData.name" placeholder="Vendor Company Name" class="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white">
                  <input [(ngModel)]="newVendorData.email" placeholder="Vendor Email" class="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white">
                  <input [(ngModel)]="newVendorData.phone" placeholder="Vendor Phone" class="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white">
                  <select [(ngModel)]="newVendorData.city" class="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white">
                    <option value="Casablanca">Casablanca</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Marrakech">Marrakech</option>
                  </select>
                </div>
              } @else {
                <select [(ngModel)]="selectedVendorId" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  @for (v of state.vendors(); track v.id) {
                    <option [value]="v.id">{{v.name}} ({{v.city}})</option>
                  }
                </select>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">PO Total Cost (MAD)</label>
              <input [(ngModel)]="newPoCost" type="number" class="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-indigo-600">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Expected Vendor Delivery Date</label>
              <input [(ngModel)]="newPoDeliveryDate" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-indigo-600">
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button (click)="poModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
            <button (click)="savePurchaseOrder()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">Send PO via Email</button>
          </div>
        </div>
      </div>
    }

    <!-- Set Delivery Date PO Modal -->
    @if (setDeliveryDateModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Log Vendor Expected Delivery Date</h3>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Expected Delivery Date</label>
            <input [(ngModel)]="loggedDeliveryDate" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-indigo-600">
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button (click)="setDeliveryDateModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
            <button (click)="saveDeliveryDate()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">Save</button>
          </div>
        </div>
      </div>
    }

    <!-- Create Task Modal -->
    @if (taskModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Create New Task</h3>
          
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Task Title</label>
              <input [(ngModel)]="newTaskData.title" type="text" placeholder="e.g. Generate Customer Invoice" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
              <textarea [(ngModel)]="newTaskData.description" rows="2" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Assigned Team</label>
                <select [(ngModel)]="newTaskData.assignedTeam" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Support">Support</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Assigned Person</label>
                <select [(ngModel)]="newTaskData.assignedTo" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  <option value="">Unassigned</option>
                  @for (user of state.users(); track user.name) {
                    <option [value]="user.name">{{user.name}}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Related To</label>
              <input [(ngModel)]="newTaskData.relatedTo" type="text" placeholder="e.g. Deal: Atlas Digital Project" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button (click)="taskModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 font-sans">Cancel</button>
            <button (click)="saveTask()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm font-sans">Save Task</button>
          </div>
        </div>
      </div>
    }

    <!-- Quick Add Activity Modal -->
    @if (addActivityModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950 capitalize">Log New {{ addActivityModalOpen()?.type === 'followups' ? 'Follow-up' : addActivityModalOpen()?.type }}</h3>
          
          <!-- Calls Fields -->
          @if (addActivityModalOpen()?.type === 'calls') {
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                <input [(ngModel)]="newActivityInput.calls.date" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Duration (mins)</label>
                  <input [(ngModel)]="newActivityInput.calls.duration" type="number" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Caller Name</label>
                  <input [(ngModel)]="newActivityInput.calls.callerName" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Outcome</label>
                <select [(ngModel)]="newActivityInput.calls.outcome" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  <option value="Interested">Interested</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Summary / Log</label>
                <textarea [(ngModel)]="newActivityInput.calls.summary" rows="3" placeholder="Describe the discussion..." class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
              </div>
            </div>
          }

          <!-- Emails Fields -->
          @if (addActivityModalOpen()?.type === 'emails') {
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                  <input [(ngModel)]="newActivityInput.emails.date" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Direction</label>
                  <select [(ngModel)]="newActivityInput.emails.direction" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                    <option value="sent">Sent to Client</option>
                    <option value="received">Received from Client</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">From</label>
                  <input [(ngModel)]="newActivityInput.emails.from" type="email" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">To</label>
                  <input [(ngModel)]="newActivityInput.emails.to" type="email" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Subject</label>
                <input [(ngModel)]="newActivityInput.emails.subject" type="text" placeholder="Subject..." class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-semibold font-sans">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Email Body</label>
                <textarea [(ngModel)]="newActivityInput.emails.body" rows="4" placeholder="Body copy..." class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono text-xs"></textarea>
              </div>
            </div>
          }

          <!-- Meetings Fields -->
          @if (addActivityModalOpen()?.type === 'meetings') {
            <div class="space-y-3 overflow-y-auto max-h-[50vh]">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Meeting Title</label>
                <input [(ngModel)]="newActivityInput.meetings.title" type="text" placeholder="e.g. Technical Kickoff" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-semibold">
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                  <input [(ngModel)]="newActivityInput.meetings.date" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Time</label>
                  <input [(ngModel)]="newActivityInput.meetings.time" type="text" placeholder="10:00" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Type</label>
                  <select [(ngModel)]="newActivityInput.meetings.type" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                    <option value="teams">Teams Meeting</option>
                    <option value="demo">Product Demo</option>
                    <option value="in-person">In-person Meeting</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Location</label>
                  <input [(ngModel)]="newActivityInput.meetings.location" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Attendees (Comma Separated)</label>
                <input [(ngModel)]="newActivityInput.meetings.attendees" type="text" placeholder="Youssef, Karim Atlas" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-medium">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Minutes / Summary</label>
                <textarea [(ngModel)]="newActivityInput.meetings.summary" rows="3" placeholder="Key outcomes..." class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
              </div>
            </div>
          }

          <!-- Recordings Fields -->
          @if (addActivityModalOpen()?.type === 'recordings') {
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                <input [(ngModel)]="newActivityInput.recordings.date" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Title</label>
                <input [(ngModel)]="newActivityInput.recordings.title" type="text" placeholder="e.g. Scoping Call Recording" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-semibold font-sans">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Duration (e.g. '45 mins')</label>
                <input [(ngModel)]="newActivityInput.recordings.duration" type="text" placeholder="45 mins" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Teams Meeting Link</label>
                <input [(ngModel)]="newActivityInput.recordings.meetingLink" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono text-xs">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Recording Share Link</label>
                <input [(ngModel)]="newActivityInput.recordings.recordingLink" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono text-xs">
              </div>
            </div>
          }

          <!-- Notes Fields -->
          @if (addActivityModalOpen()?.type === 'notes') {
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                  <input [(ngModel)]="newActivityInput.notes.date" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Author</label>
                  <input [(ngModel)]="newActivityInput.notes.author" type="text" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Note Content</label>
                <textarea [(ngModel)]="newActivityInput.notes.content" rows="4" placeholder="Write internal notes..." class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
              </div>
            </div>
          }

          <!-- Follow-ups Fields -->
          @if (addActivityModalOpen()?.type === 'followups') {
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Due Date</label>
                <input [(ngModel)]="newActivityInput.followups.dueDate" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Reminder Title</label>
                <input [(ngModel)]="newActivityInput.followups.title" type="text" placeholder="e.g. Call client for feedback" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-semibold font-sans">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Assigned Owner</label>
                <select [(ngModel)]="newActivityInput.followups.assignedTo" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  @for (user of state.users(); track user.name) {
                    <option [value]="user.name">{{ user.name }} ({{ user.team }})</option>
                  }
                </select>
              </div>
            </div>
          }

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
            <button type="button" (click)="addActivityModalOpen.set(null)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 font-sans">Cancel</button>
            <button type="button" (click)="saveActivityEntry()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm font-sans">Save Entry</button>
          </div>
        </div>
      </div>
    }
  `
})
export class SalesComponent {
  state = inject(CrmStateService);
  activeTab = signal<'deals' | 'proposals' | 'tasks' | 'pos'>('deals');

  // Modals state
  assignModalOpen = signal(false);
  proposalModalOpen = signal(false);
  dealModalOpen = signal(false);
  poModalOpen = signal(false);
  setDeliveryDateModalOpen = signal(false);
  taskModalOpen = signal(false);

  // Activity Hub Signals
  activeDealTabs = signal<Record<string, string>>({});
  addActivityModalOpen = signal<{ dealId: string; type: 'calls' | 'emails' | 'meetings' | 'recordings' | 'notes' | 'followups' } | null>(null);
  selectedCalendarDay = signal<Record<string, number>>({});

  calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);
  calendarHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  newActivityInput = {
    calls: { date: '2026-06-27', duration: 15, callerName: 'Youssef El Alami', summary: '', outcome: 'Interested' },
    emails: { date: '2026-06-27', from: 'youssef@acme.ma', to: 'contact@atlasdigital.ma', subject: '', body: '', direction: 'sent' as const },
    meetings: { date: '2026-06-27', time: '10:00', title: '', type: 'teams' as const, attendees: '', location: 'Teams Meeting', summary: '' },
    recordings: { date: '2026-06-27', title: '', meetingLink: 'https://teams.microsoft.com/l/meetup-join/123456', recordingLink: 'https://share.acme.ma/rec/recording-06-27', duration: '30 mins' },
    notes: { date: '2026-06-27', author: 'Youssef El Alami', content: '' },
    followups: { dueDate: '2026-06-27', title: '', assignedTo: 'Omar (Finance)' }
  };

  // Modal data properties
  selectedTask = signal<Task | null>(null);
  reassignedUser = '';

  selectedDealForPO = signal<Deal | null>(null);
  showNewVendorForm = signal(false);
  selectedVendorId = '';
  newVendorData = { name: '', email: '', phone: '', city: 'Casablanca' };
  newPoCost = 9000;
  newPoDeliveryDate = '';

  selectedPOForDelivery = signal<PurchaseOrder | null>(null);
  loggedDeliveryDate = '';

  newProposal = {
    title: '',
    partnerId: '',
    lines: [] as { product: string; description: string; qty: number; unitPrice: number; total: number; vendor: string }[]
  };
  selectedTemplateId = '';

  newDeal = {
    title: '',
    partnerId: '',
    amount: 0,
    discount: 0,
    proposalId: '',
    emailExchange: '',
    comments: '',
    lines: [] as { product: string; description: string; qty: number; unitPrice: number; total: number; vendor: string }[],

    // Identification & Dates
    orderNumber: '',
    dealNumber: '',
    orderDate: '',
    requestedDeliveryDate: '',
    orderStatus: 'Draft',

    // Customer & Delivery
    customerAccount: '',
    billingAddress: '',
    deliveryAddress: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',

    // Sales & Ownership
    salesPerson: '',
    salesRegion: '',

    // Commercial Basics
    currency: 'MAD',
    paymentTerms: '',
    orderTotalAmount: 0,

    // Vendor / Partner
    vendorAccount: '',
    purchaseOrderRef: '',
    warehouseAddress: '',
    transportationService: '',
    expectedDeliveryDateVendor: '',
    deliveryDate: ''
  };

  expandedDeals = signal<{ [key: string]: boolean }>({});

  toggleDealDetails(dealId: string) {
    this.expandedDeals.update(val => ({ ...val, [dealId]: !val[dealId] }));
  }

  onPartnerChange() {
    const partner = this.state.partners().find(p => p.id === this.newDeal.partnerId);
    if (partner) {
      this.newDeal.customerAccount = 'ACC-' + partner.name.substring(0, 5).toUpperCase().replace(/[^A-Z]/g, '') + '-' + partner.id.toUpperCase();
      
      let baseCity = partner.city || 'Casablanca';
      this.newDeal.billingAddress = `N° 45 Boulevard de la Résistance, ${baseCity}, Morocco`;
      this.newDeal.deliveryAddress = `Zone Industrielle, ${baseCity}, Morocco`;
      this.newDeal.contactPerson = partner.name.includes(' ') ? partner.name.split(' ')[0] + ' Sefrioui' : 'Karim ' + partner.name;
      this.newDeal.contactEmail = partner.email || 'contact@company.ma';
      this.newDeal.contactPhone = partner.phone || '+212-661-000000';
    }
  }

  onProposalChange() {
    const prop = this.state.proposals().find(p => p.id === this.newDeal.proposalId);
    if (prop) {
      this.newDeal.amount = prop.amount;
      this.newDeal.orderTotalAmount = prop.amount;
      this.newDeal.lines = prop.lines.map(l => ({ ...l, vendor: l.vendor || '' }));
      if (prop.partnerId) {
        this.newDeal.partnerId = prop.partnerId;
        this.onPartnerChange();
      }
    } else {
      this.newDeal.lines = [];
    }
  }

  newTaskData = {
    title: '',
    description: '',
    assignedTeam: 'Sales' as 'Sales' | 'Operations' | 'Finance' | 'Support',
    assignedTo: '',
    relatedTo: ''
  };

  getPartnerName(id: string) {
    return this.state.partners().find(p => p.id === id)?.name || 'Unknown';
  }

  getProposalTitle(id?: string) {
    return this.state.proposals().find(p => p.id === id)?.title || 'N/A';
  }

  getDealTitle(id?: string) {
    return this.state.deals().find(d => d.id === id)?.title || 'N/A';
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(value);
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'In Progress': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      default: return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  }

  hasPOForDeal(dealId: string) {
    return this.state.purchaseOrders().some(po => po.dealId === dealId);
  }

  // Task assignment
  openAssignModal(task: Task) {
    this.selectedTask.set(task);
    this.reassignedUser = task.assignedTo || '';
    this.assignModalOpen.set(true);
  }

  saveAssignment() {
    const task = this.selectedTask();
    if (task) {
      this.state.updateTaskStatus(task.id, task.status, this.reassignedUser);
      this.assignModalOpen.set(false);
    }
  }

  // Proposal Creation
  openCreateProposalModal() {
    this.newProposal = {
      title: '',
      partnerId: this.state.partners()[0]?.id || '',
      lines: [
        { product: '', description: '', qty: 1, unitPrice: 0, total: 0, vendor: '' }
      ]
    };
    this.selectedTemplateId = '';
    this.proposalModalOpen.set(true);
  }

  applyTemplate() {
    if (this.selectedTemplateId) {
      const template = this.state.proposalTemplates().find(t => t.id === this.selectedTemplateId);
      if (template) {
        this.newProposal.title = template.name;
        this.newProposal.lines = template.lines.map(l => ({ ...l, vendor: l.vendor || '' }));
      }
    }
  }

  addLineItem() {
    this.newProposal.lines.push({ product: '', description: '', qty: 1, unitPrice: 0, total: 0, vendor: '' });
  }

  removeLine(index: number) {
    this.newProposal.lines.splice(index, 1);
  }

  recalcLine(line: any) {
    line.total = line.qty * line.unitPrice;
  }

  getNewProposalTotal() {
    return this.newProposal.lines.reduce((acc, line) => acc + (line.qty * line.unitPrice), 0);
  }

  saveProposal() {
    const total = this.getNewProposalTotal();
    this.state.addProposal({
      title: this.newProposal.title || 'Draft Proposal',
      partnerId: this.newProposal.partnerId,
      amount: total,
      status: 'Draft',
      templateId: this.selectedTemplateId || undefined,
      lines: this.newProposal.lines
    });
    this.proposalModalOpen.set(false);
  }

  // Deal Creation
  openCreateDealModal() {
    const defaultCust = this.state.customers()[0]?.id || '';
    const today = new Date().toISOString().split('T')[0];
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 30);
    const formattedDeliveryDate = deliveryDate.toISOString().split('T')[0];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    this.newDeal = {
      title: '',
      partnerId: defaultCust,
      amount: 0,
      discount: 0,
      proposalId: '',
      emailExchange: '',
      comments: '',
    lines: [] as { product: string; description: string; qty: number; unitPrice: number; total: number; vendor: string }[],

      orderNumber: 'ORD-2026-' + randomSuffix,
      dealNumber: 'DL-2026-' + randomSuffix,
      orderDate: today,
      requestedDeliveryDate: formattedDeliveryDate,
      orderStatus: 'Draft',

      customerAccount: '',
      billingAddress: '',
      deliveryAddress: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',

      salesPerson: this.state.users().find(u => u.team === 'Sales')?.name || 'Youssef El Alami',
      salesRegion: 'Casablanca-Settat / Maroc',

      currency: 'MAD',
      paymentTerms: '30 Days Net',
      orderTotalAmount: 0,

      vendorAccount: 'VND-CASA-04',
      purchaseOrderRef: 'PO-2026-' + randomSuffix,
      warehouseAddress: 'Zone Industrielle Sapino, Nouaceur, Maroc',
      transportationService: 'Maroc Express Logistics',
      expectedDeliveryDateVendor: formattedDeliveryDate,
      deliveryDate: formattedDeliveryDate
    };

    if (defaultCust) {
      this.onPartnerChange();
    }
    this.dealModalOpen.set(true);
  }

  addDealLineItem() {
    this.newDeal.lines.push({ product: '', description: '', qty: 1, unitPrice: 0, total: 0, vendor: '' });
    this.recalcDealTotal();
  }

  removeDealLine(index: number) {
    this.newDeal.lines.splice(index, 1);
    this.recalcDealTotal();
  }

  recalcDealLine(line: any) {
    line.total = line.qty * line.unitPrice;
    this.recalcDealTotal();
  }

  recalcDealTotal() {
    const total = this.newDeal.lines.reduce((acc, line) => acc + (line.qty * line.unitPrice), 0);
    this.newDeal.amount = total;
    this.newDeal.orderTotalAmount = total;
  }

  saveDeal() {
    const finalAmount = this.newDeal.amount - (this.newDeal.amount * (this.newDeal.discount / 100));
    this.state.addDeal({
      title: this.newDeal.title || 'New Deal',
      partnerId: this.newDeal.partnerId,
      amount: finalAmount,
      stage: 'New',
      comments: this.newDeal.comments,
      proposalId: this.newDeal.proposalId || undefined,
      discount: this.newDeal.discount || undefined,
      emailExchange: this.newDeal.emailExchange || undefined,
      orderLines: this.newDeal.lines,

      // Identification & Dates
      orderNumber: this.newDeal.orderNumber,
      dealNumber: this.newDeal.dealNumber,
      orderDate: this.newDeal.orderDate,
      requestedDeliveryDate: this.newDeal.requestedDeliveryDate,
      orderStatus: this.newDeal.orderStatus,

      // Customer & Delivery
      customerAccount: this.newDeal.customerAccount,
      billingAddress: this.newDeal.billingAddress,
      deliveryAddress: this.newDeal.deliveryAddress,
      contactPerson: this.newDeal.contactPerson,
      contactEmail: this.newDeal.contactEmail,
      contactPhone: this.newDeal.contactPhone,

      // Sales & Ownership
      salesPerson: this.newDeal.salesPerson,
      salesRegion: this.newDeal.salesRegion,

      // Commercial Basics
      currency: this.newDeal.currency,
      paymentTerms: this.newDeal.paymentTerms,
      orderTotalAmount: finalAmount,

      // Vendor / Partner
      vendorAccount: this.newDeal.vendorAccount,
      purchaseOrderRef: this.newDeal.purchaseOrderRef,
      warehouseAddress: this.newDeal.warehouseAddress,
      transportationService: this.newDeal.transportationService,
      expectedDeliveryDateVendor: this.newDeal.expectedDeliveryDateVendor,
      deliveryDate: this.newDeal.deliveryDate
    });
    this.dealModalOpen.set(false);
  }

  // Purchase Order
  openCreatePOModal(deal: Deal) {
    this.selectedDealForPO.set(deal);
    this.selectedVendorId = this.state.vendors()[0]?.id || '';
    this.showNewVendorForm.set(false);
    this.newPoCost = Math.round(deal.amount * 0.7); // Estimate 70% cost of goods
    this.newPoDeliveryDate = '';
    this.poModalOpen.set(true);
  }

  savePurchaseOrder() {
    const deal = this.selectedDealForPO();
    if (!deal) return;

    let vendorId = this.selectedVendorId;

    if (this.showNewVendorForm()) {
      if (this.newVendorData.name.trim()) {
        const newVendor = this.state.addPartner({
          name: this.newVendorData.name,
          type: 'Vendor',
          email: this.newVendorData.email,
          phone: this.newVendorData.phone,
          city: this.newVendorData.city,
          comments: 'Created inline from PO generation.'
        });
        vendorId = newVendor.id;
      } else {
        alert('Please specify a vendor name');
        return;
      }
    }

    // Add PO
    this.state.addPurchaseOrder({
      dealId: deal.id,
      vendorId: vendorId,
      amount: this.newPoCost,
      status: 'Sent',
      deliveryDate: this.newPoDeliveryDate || undefined,
      sentVia: 'Email via CRM',
      lines: [
        { product: 'Goods for ' + deal.title, qty: 1, cost: this.newPoCost }
      ]
    });

    // Automatically update deal stage to PO Sent
    this.state.updateDealStage(deal.id, 'Confirmed');

    this.poModalOpen.set(false);
    this.activeTab.set('pos');
  }

  // PO Delivery Dates
  openSetDeliveryDatePOModal(po: PurchaseOrder) {
    this.selectedPOForDelivery.set(po);
    this.loggedDeliveryDate = po.deliveryDate || '';
    this.setDeliveryDateModalOpen.set(true);
  }

  saveDeliveryDate() {
    const po = this.selectedPOForDelivery();
    if (po) {
      this.state.updatePurchaseOrderStatus(po.id, po.status, this.loggedDeliveryDate);
      
      // Update Deal's estimated delivery date
      const deal = this.state.deals().find(d => d.id === po.dealId);
      if (deal) {
        // Estimate customer delivery 3 days after vendor delivery
        const parts = this.loggedDeliveryDate.split('-');
        if (parts.length === 3) {
          const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          date.setDate(date.getDate() + 3);
          const customerEst = date.toISOString().substring(0, 10);
          
          this.state.deals.update(deals =>
            deals.map(d => d.id === deal.id ? { ...d, estimatedDeliveryDate: customerEst } : d)
          );
        }
      }
      
      this.setDeliveryDateModalOpen.set(false);
    }
  }

  // Create Task manually
  openCreateTaskModal() {
    this.newTaskData = {
      title: '',
      description: '',
      assignedTeam: 'Sales',
      assignedTo: '',
      relatedTo: ''
    };
    this.taskModalOpen.set(true);
  }

  saveTask() {
    this.state.addTask({
      title: this.newTaskData.title,
      description: this.newTaskData.description,
      assignedTeam: this.newTaskData.assignedTeam,
      assignedTo: this.newTaskData.assignedTo || undefined,
      status: 'Pending',
      relatedTo: this.newTaskData.relatedTo || undefined
    });
    this.taskModalOpen.set(false);
  }

  // Activity Hub Helpers
  getDealTab(dealId: string): string {
    return this.activeDealTabs()[dealId] || 'calls';
  }

  setDealTab(dealId: string, tab: string): void {
    this.activeDealTabs.update(tabs => ({ ...tabs, [dealId]: tab }));
  }

  getLinkedTasksCount(dealTitle: string): number {
    return this.state.tasks().filter(t => t.relatedTo === 'Deal: ' + dealTitle || t.relatedTo === dealTitle).length;
  }

  getLinkedTasks(dealTitle: string): Task[] {
    return this.state.tasks().filter(t => t.relatedTo === 'Deal: ' + dealTitle || t.relatedTo === dealTitle);
  }

  openCreateTaskForDeal(dealTitle: string): void {
    this.newTaskData = {
      title: '',
      description: '',
      assignedTeam: 'Operations',
      assignedTo: '',
      relatedTo: 'Deal: ' + dealTitle
    };
    this.taskModalOpen.set(true);
  }

  toggleTaskStatus(taskId: string, currentStatus: string): void {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    this.state.updateTaskStatus(taskId, nextStatus);
  }

  toggleFollowUpStatus(dealId: string, followUpId: string, currentStatus: string): void {
    const nextStatus = currentStatus === 'done' ? 'pending' : 'done';
    this.state.updateFollowUpStatus(dealId, followUpId, nextStatus);
  }

  openAddActivityModal(dealId: string, type: 'calls' | 'emails' | 'meetings' | 'recordings' | 'notes' | 'followups') {
    this.addActivityModalOpen.set({ dealId, type });
    const me = this.state.users().find(u => u.team === 'Sales')?.name || 'Youssef El Alami';
    const deal = this.state.deals().find(d => d.id === dealId);
    const clientEmail = deal?.contactEmail || 'contact@client.ma';
    
    this.newActivityInput = {
      calls: { date: '2026-06-27', duration: 15, callerName: me, summary: '', outcome: 'Interested' },
      emails: { date: '2026-06-27', from: 'youssef@acme.ma', to: clientEmail, subject: 'Follow up: ' + (deal?.title || ''), body: '', direction: 'sent' },
      meetings: { date: '2026-06-27', time: '10:00', title: '', type: 'teams', attendees: me, location: 'Teams Meeting', summary: '' },
      recordings: { date: '2026-06-27', title: 'Meeting Recording', meetingLink: 'https://teams.microsoft.com/l/meetup-join/123456', recordingLink: 'https://share.acme.ma/rec/recording-06-27', duration: '30 mins' },
      notes: { date: '2026-06-27', author: me, content: '' },
      followups: { dueDate: '2026-06-27', title: '', assignedTo: me }
    };
  }

  saveActivityEntry() {
    const modal = this.addActivityModalOpen();
    if (!modal) return;

    const { dealId, type } = modal;
    if (type === 'calls') {
      this.state.addCallLog(dealId, { ...this.newActivityInput.calls });
    } else if (type === 'emails') {
      this.state.addEmailLog(dealId, { ...this.newActivityInput.emails });
    } else if (type === 'meetings') {
      const atts = this.newActivityInput.meetings.attendees.split(',').map(s => s.trim()).filter(Boolean);
      this.state.addMeeting(dealId, {
        ...this.newActivityInput.meetings,
        attendees: atts
      });
    } else if (type === 'recordings') {
      this.state.addRecording(dealId, { ...this.newActivityInput.recordings });
    } else if (type === 'notes') {
      this.state.addNote(dealId, { ...this.newActivityInput.notes });
    } else if (type === 'followups') {
      this.state.addFollowUp(dealId, {
        ...this.newActivityInput.followups,
        status: 'pending'
      });
    }

    this.addActivityModalOpen.set(null);
  }

  selectCalendarDay(dealId: string, day: number): void {
    this.selectedCalendarDay.update(days => ({ ...days, [dealId]: day }));
  }

  getSelectedCalendarDay(dealId: string): number {
    return this.selectedCalendarDay()[dealId] || 15; // default to 15th
  }

  isSelectedCalendarDay(dealId: string, day: number): boolean {
    return this.getSelectedCalendarDay(dealId) === day;
  }

  hasEventsOnDay(deal: Deal, day: number): boolean {
    if (!deal.activityLog || !deal.activityLog.meetings) return false;
    const dateStr = `2026-06-${String(day).padStart(2, '0')}`;
    return deal.activityLog.meetings.some(m => m.date === dateStr);
  }

  getEventsOnDay(deal: Deal, day: number): any[] {
    if (!deal.activityLog || !deal.activityLog.meetings) return [];
    const dateStr = `2026-06-${String(day).padStart(2, '0')}`;
    return deal.activityLog.meetings.filter(m => m.date === dateStr);
  }

  // Convert a Confirmed Proposal → Deal + Prospect → Customer
  convertProposalToDeal(prop: Proposal) {
    const today = new Date().toISOString().split('T')[0];
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 30);
    const formattedDelivery = deliveryDate.toISOString().split('T')[0];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    // (A) Promote the associated Prospect → Customer
    this.state.convertToCustomer(prop.partnerId);

    // (B) Create a Deal inheriting all line items from the Proposal
    this.state.addDeal({
      title: prop.title + ' — Deal',
      partnerId: prop.partnerId,
      amount: prop.amount,
      stage: 'New',
      comments: 'Converted automatically from confirmed proposal #' + prop.id,
      proposalId: prop.id,
      orderLines: prop.lines.map(l => ({ ...l })),
      orderNumber: 'ORD-' + new Date().getFullYear() + '-' + randomSuffix,
      dealNumber: 'DL-' + new Date().getFullYear() + '-' + randomSuffix,
      orderDate: today,
      requestedDeliveryDate: formattedDelivery,
      orderStatus: 'Confirmed',
      currency: 'MAD',
      paymentTerms: '30 Days Net',
      orderTotalAmount: prop.amount,
      salesPerson: this.state.users().find(u => u.team === 'Sales')?.name || '',
      salesRegion: 'Casablanca-Settat / Maroc'
    });

    // Remove the proposal from the list (moves to Deals tab)
    this.state.proposals.update(props => props.filter(p => p.id !== prop.id));

    // Switch to Deals tab so the user sees the result immediately
    this.activeTab.set('deals');
  }
}

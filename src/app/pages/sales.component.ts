import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService, Partner, Proposal, Deal, PurchaseOrder, Task } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CreatedByBadgeComponent } from '../shared/created-by-badge.component';

export type SalesStage = 'New Lead' | 'Qualified' | 'Meeting Scheduled' | 'Proposal Sent' | 'Negotiation' | 'Won / Lost';

@Component({
  selector: 'app-sales',
  imports: [MatIconModule, CommonModule, FormsModule, RouterLink, CreatedByBadgeComponent],
  template: `
    <div class="flex gap-6">
      <!-- Left Sidebar Navigation -->
      <aside class="w-44 shrink-0 hidden lg:block">
        <nav class="space-y-1 sticky top-24">
          <button 
            (click)="activeTab.set('deals'); state.breadcrumbLabel.set('Deals')" 
            [class]="activeTab() === 'deals' ? 'glass-strong text-indigo-700 font-semibold' : 'glass-button text-slate-500 hover:text-indigo-600'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">monetization_on</mat-icon>
            Deals
            <span class="ml-auto text-xs glass-chip text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.deals().length }}</span>
          </button>
          <button 
            (click)="activeTab.set('proposals'); state.breadcrumbLabel.set('Proposals')" 
            [class]="activeTab() === 'proposals' ? 'glass-strong text-indigo-700 font-semibold' : 'glass-button text-slate-500 hover:text-indigo-600'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">description</mat-icon>
            Proposals
            <span class="ml-auto text-xs glass-chip text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.proposals().length }}</span>
          </button>

          <button 
            (click)="activeTab.set('pos'); state.breadcrumbLabel.set('Purchase Orders')" 
            [class]="activeTab() === 'pos' ? 'glass-strong text-indigo-700 font-semibold' : 'glass-button text-slate-500 hover:text-indigo-600'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">shopping_cart</mat-icon>
            Purchase Orders
            <span class="ml-auto text-xs glass-chip text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.purchaseOrders().length }}</span>
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 min-w-0 space-y-8">
        <div class="flex justify-between items-end">
          <div>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Sales & Operations</h2>
            <p class="text-slate-500 mt-1">Manage deals, proposals, and purchase orders.</p>
          </div>
          <div class="flex gap-2">
            @if (activeTab() === 'deals') {
              <button (click)="openCreateDealModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200">
                <mat-icon class="w-5 h-5 text-[20px]! leading-none! flex items-center justify-center">add</mat-icon>
                New Deal
              </button>
            } @else if (activeTab() === 'proposals') {
              <button (click)="openCreateProposalModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200">
                <mat-icon class="w-5 h-5 text-[20px]! leading-none! flex items-center justify-center">add</mat-icon>
                New Proposal
              </button>
            }
          </div>
        </div>

      <!-- Deals View -->
      @if (activeTab() === 'deals') {
        <div class="glass-card rounded-2xl overflow-hidden">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Deal Title</th>
                <th scope="col" class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Client</th>
                <th scope="col" class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Amount</th>
                <th scope="col" class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Stage</th>
                <th scope="col" class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Est. Delivery</th>
                <th scope="col" class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Order Status</th>
                <th scope="col" class="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Created By</th>
                <th scope="col" class="px-6 py-3 text-right font-semibold text-slate-500 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-100">
              @for (deal of state.deals(); track deal.id) {
                <tr (click)="openDealDrawer(deal)" class="hover:bg-slate-50/80 cursor-pointer transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-slate-900">{{deal.title}}</div>
                    @if (deal.dealNumber) {
                      <div class="text-[10px] text-slate-400 font-mono font-medium">{{deal.dealNumber}}</div>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-600 font-medium">{{getPartnerName(deal.partnerId)}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-900 font-mono font-bold">{{formatCurrency(deal.amount)}}</div>
                    @if (deal.discount) {
                      <div class="text-[10px] text-emerald-600 font-semibold">-{{deal.discount}}%</div>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {{deal.stage}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                    {{deal.estimatedDeliveryDate || 'N/A'}}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {{deal.orderStatus || 'N/A'}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <app-created-by-badge [createdBy]="deal.createdBy" [createdAt]="deal.createdAt" />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                    <a [routerLink]="['/sales/deals', deal.id]" class="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 ml-auto" (click)="$event.stopPropagation()">
                      View details <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">chevron_right</mat-icon>
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="px-6 py-8 text-center text-slate-500 text-sm">No deals found. Create a confirmed proposal to start.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Proposals View -->
      @if (activeTab() === 'proposals') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (prop of state.proposals(); track prop.id) {
            <div class="glass-card rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all">
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
                <div class="flex items-center gap-3 text-xs text-slate-400">
                  <app-created-by-badge [createdBy]="prop.createdBy" [createdAt]="prop.createdAt" [size]="22" />
                </div>

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

                <!-- Sales Intelligence / Funnel Metadata -->
                <div class="border-t border-slate-100 pt-3">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Sales Intelligence</span>
                  <div class="grid grid-cols-2 gap-3 glass p-3 rounded-xl border border-slate-150/60 text-xs">
                    <div>
                      <span class="text-slate-400 block text-[10px] font-medium">Opportunity Value</span>
                      <span class="font-bold text-slate-900 font-mono">{{ formatCurrency(prop.opportunityValue || 0) }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10px] font-medium">Probability</span>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <div class="w-full bg-slate-200 rounded-full h-1.5 max-w-[60px]">
                          <div class="bg-indigo-600 h-1.5 rounded-full" [style.width.%]="prop.closingProbability || 0"></div>
                        </div>
                        <span class="font-bold text-slate-900 font-mono">{{ prop.closingProbability || 0 }}%</span>
                      </div>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10px] font-medium">Expected Close</span>
                      <span class="font-semibold text-slate-700 font-mono">{{ prop.expectedClosingDate || 'TBD' }}</span>
                    </div>
                    <div>
                      <span class="text-slate-400 block text-[10px] font-medium">Sales Stage</span>
                      <span class="inline-block px-2 py-0.5 text-[10px] font-bold rounded border uppercase mt-0.5" [class]="getStageBadgeClass(prop.stage)">
                        {{ prop.stage || 'New Lead' }}
                      </span>
                    </div>
                    <div class="col-span-2">
                      <span class="text-slate-400 block text-[10px] font-medium">Competitors</span>
                      @if (prop.competitors && prop.competitors.length > 0) {
                        <div class="flex flex-wrap gap-1 mt-1">
                          @for (comp of prop.competitors; track comp) {
                            <span class="bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-medium">{{comp}}</span>
                          }
                        </div>
                      } @else {
                        <span class="text-slate-500 font-medium italic">No competitors logged.</span>
                      }
                    </div>
                  </div>
                </div>
                
                <!-- Confirmation Info (if confirmed) -->
                @if (prop.status === 'Confirmed' && prop.confirmationMethod) {
                  <div class="border-t border-slate-100 pt-3 mt-3">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Confirmation Proof</span>
                    <div class="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-950 space-y-2">
                      <div class="flex items-center gap-1.5 font-semibold text-emerald-800 text-[11px]">
                        @if (prop.confirmationMethod === 'Email') {
                          <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">email</mat-icon>
                          <span>Email confirmation</span>
                        } @else if (prop.confirmationMethod === 'WhatsApp') {
                          <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">chat</mat-icon>
                          <span>WhatsApp screenshot</span>
                        } @else {
                          <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">phone</mat-icon>
                          <span>Call Summary</span>
                        }
                        @if (prop.confirmedAt) {
                          <span class="text-[10px] text-emerald-600 font-normal ml-auto font-mono">{{ prop.confirmedAt }}</span>
                        }
                      </div>

                      @if (prop.confirmationAttachmentName) {
                        <div class="flex items-center gap-1.5 bg-white border border-emerald-200/60 p-2 rounded-lg text-emerald-900 font-mono text-[10px] truncate">
                          <mat-icon class="text-[14px] w-3.5 h-3.5 text-emerald-600">attach_file</mat-icon>
                          <span class="truncate flex-1">{{ prop.confirmationAttachmentName }}</span>
                          @if (prop.confirmationAttachmentData) {
                            <a [href]="prop.confirmationAttachmentData" [download]="prop.confirmationAttachmentName"
                               class="text-indigo-650 hover:underline font-sans font-semibold ml-1 shrink-0">Download</a>
                          }
                        </div>
                      }

                      @if (prop.confirmationNote) {
                        <p class="text-[11px] text-slate-650 leading-relaxed bg-white border border-emerald-150 p-2 rounded-lg italic">
                          "{{ prop.confirmationNote }}"
                        </p>
                      }
                    </div>
                  </div>
                }
              </div>

              <div class="mt-5 pt-3 border-t border-slate-100 flex justify-between gap-2">
                <button (click)="openEditProposalModal(prop)" class="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 p-2 rounded-lg transition-colors flex items-center justify-center shrink-0" title="Edit Proposal">
                  <mat-icon class="text-[18px] w-[18px] h-[18px] flex items-center justify-center">edit</mat-icon>
                </button>

                @if (prop.status === 'Draft') {
                  <button (click)="openAssignTaskModal('proposal', prop.id, prop.title)" class="bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors flex items-center justify-center shrink-0" title="Assign Task">
                    <mat-icon class="text-[18px] w-[18px] h-[18px] flex items-center justify-center">assignment</mat-icon>
                  </button>
                  <button (click)="openSendProposalModal(prop)" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors shadow-lg shadow-indigo-200">
                    Send to Prospect
                  </button>
                } @else if (prop.status === 'Sent') {
                  <button (click)="openConfirmProposalModal(prop)" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                    <mat-icon class="text-[16px] w-4 h-4">task_alt</mat-icon> Confirm (Signs BC)
                  </button>
                } @else {
                  <button (click)="openConvertProposalModal(prop)"
                    class="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 group">
                    <mat-icon class="text-[16px] w-4 h-4 transition-transform group-hover:scale-110">swap_horiz</mat-icon>
                    Convert to Deal &amp; Customer
                  </button>
                }
              </div>
            </div>
          } @empty {
            <div class="col-span-2 glass-card rounded-2xl p-8 text-center text-slate-500">No proposals found.</div>
          }
        </div>
      }

      <!-- Purchase Orders View -->
      @if (activeTab() === 'pos') {
        <div class="glass-card rounded-2xl overflow-hidden">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">PO Ref</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Vendor</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Deal</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Amount</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Delivery Date</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Status</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Created By</th>
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
                  <td class="px-6 py-4 whitespace-nowrap">
                    <app-created-by-badge [createdBy]="po.createdBy" [createdAt]="po.createdAt" />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold space-x-1.5">
                    <button (click)="openAssignTaskModal('po', po.id, 'PO #' + po.id)" class="bg-white border border-slate-200 text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 flex items-center gap-1 ml-auto" title="Assign Task">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">assignment</mat-icon> Assign
                    </button>
                    @if (po.status === 'Sent') {
                      <button (click)="openSetDeliveryDatePOModal(po)" class="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-50">Set Del. Date</button>
                      <button (click)="state.updatePurchaseOrderStatus(po.id, 'Delivered')" class="bg-indigo-600 text-white px-2 py-1 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200">Receive Goods</button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="px-6 py-8 text-center text-slate-500 text-sm">No Purchase Orders generated yet.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
      </div>
    </div>

    <!-- Modals -->
    <!-- Send Proposal Modal -->
    @if (sendingProposalId()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="glass-dialog rounded-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-950">Send Proposal</h3>
            <button (click)="sendingProposalId.set(null)" class="text-slate-400 hover:text-slate-600 transition-colors">
              <mat-icon class="text-[20px] w-5 h-5">close</mat-icon>
            </button>
          </div>

          <!-- Target Organization -->
          <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
            <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-0.5">Target Organization</span>
            <span class="text-sm font-bold text-indigo-900">{{ currentProposalPartnerName() }}</span>
          </div>

          <!-- Channel Selection (multi-select toggle) -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Sending Channel(s) — select one or both</label>
            <div class="grid grid-cols-2 gap-3">
              <button type="button" (click)="toggleChannel('email')"
                [class]="isChannelSelected('email')
                  ? 'flex flex-col items-center justify-center p-4 border-2 border-indigo-500 bg-indigo-50 text-indigo-700 rounded-xl gap-2 font-semibold transition-all shadow-sm'
                  : 'flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-slate-50/50 hover:text-indigo-600 transition-all gap-2 text-slate-600'">
                <mat-icon class="text-3xl w-8 h-8 flex items-center justify-center">email</mat-icon>
                <span class="text-sm font-semibold">Email</span>
                @if (isChannelSelected('email')) {
                  <span class="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">Selected</span>
                }
              </button>
              <button type="button" (click)="toggleChannel('whatsapp')"
                [class]="isChannelSelected('whatsapp')
                  ? 'flex flex-col items-center justify-center p-4 border-2 border-emerald-500 bg-emerald-50 text-emerald-700 rounded-xl gap-2 font-semibold transition-all shadow-sm'
                  : 'flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-slate-50/50 hover:text-emerald-600 transition-all gap-2 text-slate-600'">
                <mat-icon class="text-3xl w-8 h-8 flex items-center justify-center">chat</mat-icon>
                <span class="text-sm font-semibold">WhatsApp</span>
                @if (isChannelSelected('whatsapp')) {
                  <span class="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">Selected</span>
                }
              </button>
            </div>
          </div>

          <!-- Add other contacts from same org -->
          @if (proposalOrgContacts().length > 0) {
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Add other contacts from this organization:</label>
              <select (change)="addContactToRecipients($event)" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                <option value="">— Select a contact —</option>
                @for (contact of proposalOrgContacts(); track contact.id) {
                  <option [value]="contact.id">{{ contact.fullName }} · {{ contact.jobTitle }}</option>
                }
              </select>
            </div>
          }

          <!-- Recipients list -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Recipients</label>
            @for (recipient of recipients(); track $index) {
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-slate-700 truncate max-w-[200px]">{{ recipient.name || 'New Contact' }}</span>
                  @if ($index > 0) {
                    <button type="button" (click)="removeRecipient($index)" class="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded transition-colors">
                      <mat-icon class="text-base w-4 h-4">close</mat-icon>
                    </button>
                  }
                </div>
                @if (isChannelSelected('email')) {
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-[14px] w-3.5 h-3.5 text-indigo-400 shrink-0">email</mat-icon>
                    <input [value]="recipient.email || ''" (input)="updateRecipientEmail($index, $event)"
                      type="email" placeholder="Email address"
                      class="flex-1 glass-input rounded-lg p-1.5 text-xs focus:outline-indigo-600 bg-white">
                  </div>
                }
                @if (isChannelSelected('whatsapp')) {
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-[14px] w-3.5 h-3.5 text-emerald-500 shrink-0">chat</mat-icon>
                    <input [value]="recipient.phone || ''" (input)="updateRecipientPhone($index, $event)"
                      type="tel" placeholder="Phone / WhatsApp number"
                      class="flex-1 glass-input rounded-lg p-1.5 text-xs focus:outline-indigo-600 bg-white">
                  </div>
                }
              </div>
            } @empty {
              <div class="text-center py-4 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No recipients yet. The primary contact will be added automatically.
              </div>
            }
            <button type="button" (click)="addManualRecipient()" class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors">
              <mat-icon class="text-base w-4 h-4">add_circle</mat-icon> Add Recipient
            </button>
          </div>

          <!-- Footer actions -->
          <div class="flex justify-between gap-2 pt-2 border-t border-slate-100">
            <button (click)="sendingProposalId.set(null)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button (click)="submitSendProposal()"
              [disabled]="selectedChannels().size === 0 || recipients().length === 0"
              class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
              <mat-icon class="text-[16px] w-4 h-4">send</mat-icon>
              Send Proposal
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Create Proposal Modal -->
    @if (proposalModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="glass-dialog rounded-2xl max-w-xl w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
          <h3 class="text-lg font-bold text-slate-950 shrink-0">{{ editingProposalId() ? 'Edit Proposal' : 'Create Proposal' }}</h3>
          
          <div class="space-y-4 overflow-y-auto pr-1 flex-1">
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Prospect / Client</label>
                <select [(ngModel)]="newProposal.partnerId" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  @for (partner of salesEligiblePartners(); track partner.id) {
                    <option [value]="partner.id">{{ partner.name }} ({{ partner.type }})</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Proposal Title</label>
                <input [(ngModel)]="newProposal.title" type="text" placeholder="e.g. Standard Enterprise Cloud Infrastructure" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Template</label>
                <select [(ngModel)]="selectedTemplateId" (change)="applyTemplate()" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  <option value="">-- Manual/No Template --</option>
                  @for (temp of state.proposalTemplates(); track temp.id) {
                    <option [value]="temp.id">{{temp.name}}</option>
                  }
                </select>
              </div>

              <!-- Sales Funnel & Intelligence Section -->
              <div class="border-t border-slate-100 pt-3 space-y-3">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sales Intelligence</span>
                
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Opportunity Value</label>
                    <div class="relative rounded-lg shadow-xs">
                      <input [(ngModel)]="newProposal.opportunityValue" type="number" placeholder="0" class="w-full glass-input rounded-lg p-2 pr-12 text-sm focus:outline-indigo-600 font-mono">
                      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span class="text-gray-400 text-xs font-semibold">MAD</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Probability of Closing</label>
                    <div class="relative rounded-lg shadow-xs">
                      <input [(ngModel)]="newProposal.closingProbability" type="number" min="0" max="100" placeholder="50" class="w-full glass-input rounded-lg p-2 pr-8 text-sm focus:outline-indigo-600 font-mono">
                      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span class="text-gray-400 text-xs font-semibold">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Expected Closing Date</label>
                    <input [(ngModel)]="newProposal.expectedClosingDate" type="date" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                  </div>
                  
                  <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Sales Stage</label>
                    <select [(ngModel)]="newProposal.stage" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                      <option value="New Lead">New Lead</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Meeting Scheduled">Meeting Scheduled</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Won / Lost">Won / Lost</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-500 mb-1">Competitors (comma separated)</label>
                  <input [(ngModel)]="newProposal.competitors" type="text" placeholder="e.g. AWS, Azure, Local Telecom" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                </div>
              </div>

              <!-- Line Items -->
              <div class="space-y-2 border-t border-slate-100 pt-2">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Line Items</span>
                @for (line of newProposal.lines; track $index) {
                  <div class="grid grid-cols-12 gap-2 items-center">
                    <input class="col-span-4 glass-input rounded-lg p-1.5 text-xs focus:outline-indigo-600" [(ngModel)]="line.product" placeholder="Product">
                    <input class="col-span-4 glass-input rounded-lg p-1.5 text-xs focus:outline-indigo-600" [(ngModel)]="line.description" placeholder="Description">
                    <input class="col-span-1 glass-input rounded-lg p-1.5 text-xs focus:outline-indigo-600 text-center" type="number" [(ngModel)]="line.qty" (change)="recalcLine(line)">
                    <input class="col-span-2 glass-input rounded-lg p-1.5 text-xs focus:outline-indigo-600 font-mono text-right" type="number" [(ngModel)]="line.unitPrice" (change)="recalcLine(line)">
                    <button type="button" (click)="removeLine($index)" class="col-span-1 text-rose-500 hover:bg-rose-50 p-1 rounded"><mat-icon class="text-[16px] w-4 h-4 leading-none">delete</mat-icon></button>
                  </div>
                }
                <button (click)="addLineItem()" class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center mt-1">
                  <mat-icon class="text-[16px] w-4 h-4 mr-0.5">add_circle</mat-icon> Add Line Item
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center border-t border-slate-100 pt-4 shrink-0">
            <div class="text-sm">
              <span class="text-slate-500">Total Amount:</span>
              <strong class="ml-1 text-slate-900 font-mono">{{formatCurrency(getNewProposalTotal())}}</strong>
            </div>
            <div class="flex gap-2">
              <button (click)="proposalModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
              <button (click)="saveProposal(true)" class="px-4 py-2 border border-slate-200 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold rounded-lg flex items-center gap-1.5">
                <mat-icon class="text-[16px] w-4 h-4">assignment</mat-icon> {{ editingProposalId() ? 'Save &amp; Assign Task' : 'Create &amp; Assign Task' }}
              </button>
              <button (click)="saveProposal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-200">{{ editingProposalId() ? 'Save Changes' : 'Create Proposal' }}</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Create Deal Modal -->
    @if (dealModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="glass-dialog rounded-2xl max-w-7xl w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
          <div class="flex justify-between items-center border-b border-white/30 pb-3 shrink-0">
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
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/30 pb-1 flex items-center gap-1.5">
                    <mat-icon class="text-[16px] w-4 h-4">tag</mat-icon> Identification & Dates
                  </h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Select Client (Must be Customer)</label>
                      <select [(ngModel)]="newDeal.partnerId" (change)="onPartnerChange()" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                        @for (c of state.customers(); track c.id) {
                          <option [value]="c.id">{{c.name}}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Linked Proposal</label>
                      <select [(ngModel)]="newDeal.proposalId" (change)="onProposalChange()" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
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
                      <input [(ngModel)]="newDeal.title" type="text" placeholder="e.g. Atlas Cloud Migration Project" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Order Status</label>
                      <select [(ngModel)]="newDeal.orderStatus" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
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
                      <input [(ngModel)]="newDeal.orderNumber" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div class="col-span-2">
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Deal Number</label>
                      <input [(ngModel)]="newDeal.dealNumber" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Order Date</label>
                      <input [(ngModel)]="newDeal.orderDate" type="date" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Requested Delivery Date</label>
                      <input [(ngModel)]="newDeal.requestedDeliveryDate" type="date" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                  </div>
                </div>

                <!-- SECTION 2: Customer & Delivery -->
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/30 pb-1 flex items-center gap-1.5">
                    <mat-icon class="text-[16px] w-4 h-4">business</mat-icon> Customer & Delivery
                  </h4>
                  <div class="grid grid-cols-3 gap-3">
                    <div class="col-span-1">
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Customer Account</label>
                      <input [(ngModel)]="newDeal.customerAccount" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div class="col-span-2">
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Contact Person</label>
                      <input [(ngModel)]="newDeal.contactPerson" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Contact Email</label>
                      <input [(ngModel)]="newDeal.contactEmail" type="email" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Contact Phone Number</label>
                      <input [(ngModel)]="newDeal.contactPhone" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Billing Address</label>
                      <textarea [(ngModel)]="newDeal.billingAddress" rows="2" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Delivery Address</label>
                      <textarea [(ngModel)]="newDeal.deliveryAddress" rows="2" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
                    </div>
                  </div>
                </div>

                <!-- SECTION 3: Sales & Ownership -->
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/30 pb-1 flex items-center gap-1.5">
                    <mat-icon class="text-[16px] w-4 h-4">person</mat-icon> Sales & Ownership
                  </h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Sales Person</label>
                      <select [(ngModel)]="newDeal.salesPerson" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                        @for (u of state.users(); track u.name) {
                          @if (u.team === 'Sales') {
                            <option [value]="u.name">{{u.name}}</option>
                          }
                        }
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Sales Organization / Region</label>
                      <input [(ngModel)]="newDeal.salesRegion" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                    </div>
                  </div>
                </div>

                <!-- SECTION 4: Commercial Basics -->
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/30 pb-1 flex items-center gap-1.5">
                    <mat-icon class="text-[16px] w-4 h-4">monetization_on</mat-icon> Commercial Basics
                  </h4>
                  <div class="grid grid-cols-4 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Currency</label>
                      <select [(ngModel)]="newDeal.currency" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                        <option value="MAD">MAD</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Amount (Raw)</label>
                      <input [(ngModel)]="newDeal.amount" type="number" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Discount (%)</label>
                      <input [(ngModel)]="newDeal.discount" type="number" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Payment Terms</label>
                      <input [(ngModel)]="newDeal.paymentTerms" type="text" placeholder="e.g. 30 Days Net" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Vendor/Partner & Logs/Comments -->
              <div class="space-y-6">
                <!-- SECTION 5: Vendor / Partner (Logistics) -->
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/30 pb-1 flex items-center gap-1.5">
                    <mat-icon class="text-[16px] w-4 h-4">local_shipping</mat-icon> Vendor / Partner (Logistics)
                  </h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Vendor Account</label>
                      <input [(ngModel)]="newDeal.vendorAccount" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Purchase Order Reference</label>
                      <input [(ngModel)]="newDeal.purchaseOrderRef" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Warehouse Address</label>
                      <input [(ngModel)]="newDeal.warehouseAddress" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Transportation Service</label>
                      <input [(ngModel)]="newDeal.transportationService" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Expected Delivery Date (Vendor)</label>
                      <input [(ngModel)]="newDeal.expectedDeliveryDateVendor" type="date" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-500 mb-1">Delivery Date (Customer)</label>
                      <input [(ngModel)]="newDeal.deliveryDate" type="date" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                    </div>
                  </div>
                </div>

                <!-- SECTION 6: Logs & Comments -->
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/30 pb-1 flex items-center gap-1.5">
                    <mat-icon class="text-[16px] w-4 h-4">notes</mat-icon> Logs & Comments
                  </h4>
                  <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Email Exchange logs & Confirmations</label>
                    <textarea [(ngModel)]="newDeal.emailExchange" rows="3" placeholder="Paste copy of signed email confirmations..." class="w-full glass-input rounded-lg p-2 text-[11px] font-mono focus:outline-indigo-600"></textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Customer Comments</label>
                    <textarea [(ngModel)]="newDeal.comments" rows="2" placeholder="Comments..." class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
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
                        <input class="w-full glass-input rounded-lg p-1.5 text-sm focus:outline-indigo-600" [(ngModel)]="line.description" placeholder="Item description">
                      </td>
                      <td class="px-4 py-2">
                        <input class="w-full glass-input rounded-lg p-1.5 text-sm focus:outline-indigo-600 text-right font-mono" type="number" [(ngModel)]="line.qty" (change)="recalcDealLine(line)">
                      </td>
                      <td class="px-4 py-2">
                        <input class="w-full glass-input rounded-lg p-1.5 text-sm focus:outline-indigo-600 text-right font-mono" type="number" [(ngModel)]="line.unitPrice" (change)="recalcDealLine(line)">
                      </td>
                      <td class="px-4 py-2">
                        <select class="w-full glass-input rounded-lg p-1.5 text-sm bg-white focus:outline-indigo-600" [(ngModel)]="line.vendor">
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
              <button (click)="saveDeal(true)" class="px-4 py-2 border border-slate-200 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold rounded-lg flex items-center gap-1.5">
                <mat-icon class="text-[16px] w-4 h-4">assignment</mat-icon> Save &amp; Assign Task
              </button>
              <button (click)="saveDeal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-200">Save Deal</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Create PO Modal (Operations) -->
    @if (poModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="glass-dialog rounded-2xl max-w-3xl w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          <h3 class="text-lg font-bold text-slate-950 shrink-0">Create Purchase Order</h3>
          <p class="text-xs text-slate-500 shrink-0">Creating Purchase Order linked to: <strong>{{selectedDealForPO()?.title}}</strong></p>
          
          <div class="space-y-4 overflow-y-auto pr-1 flex-1">
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="block text-xs font-semibold text-slate-500 uppercase">Vendor</label>
                <button (click)="showNewVendorForm.set(!showNewVendorForm())" class="text-indigo-600 hover:text-indigo-700 text-[10px] font-bold uppercase">
                  {{ showNewVendorForm() ? 'Select Existing' : '+ Create New Vendor Inline' }}
                </button>
              </div>
              
              @if (showNewVendorForm()) {
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                  <input [(ngModel)]="newVendorData.name" placeholder="Vendor Company Name" class="w-full glass-input rounded-lg p-1.5 text-xs bg-white focus:outline-indigo-600">
                  <input [(ngModel)]="newVendorData.email" placeholder="Vendor Email" class="w-full glass-input rounded-lg p-1.5 text-xs bg-white focus:outline-indigo-600 font-mono">
                  <input [(ngModel)]="newVendorData.phone" placeholder="Vendor Phone" class="w-full glass-input rounded-lg p-1.5 text-xs bg-white focus:outline-indigo-600 font-mono">
                  <select [(ngModel)]="newVendorData.city" class="w-full glass-input rounded-lg p-1.5 text-xs bg-white focus:outline-indigo-600">
                    <option value="Casablanca">Casablanca</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Marrakech">Marrakech</option>
                  </select>
                </div>
              } @else {
                <select [ngModel]="selectedVendorId()" (ngModelChange)="selectedVendorId.set($event)" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  @for (vendor of state.vendors(); track vendor.id) {
                    <option [value]="vendor.id">{{vendor.name}}</option>
                  }
                </select>
              }
            </div>

            <!-- Order Lines Section -->
            <div class="space-y-2 border-t border-slate-100 pt-3">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Order Line Items</span>
              
              <div class="space-y-3">
                @for (line of poLines(); track $index; let i = $index) {
                  <div class="glass hover:bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-2.5 relative transition-all">
                    <!-- Line Header -->
                    <div class="flex justify-between items-center">
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line #{{ i + 1 }}</span>
                      @if (poLines().length > 1) {
                        <button type="button" (click)="removePoLine(i)" class="text-rose-500 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors flex items-center justify-center" title="Remove Line">
                          <mat-icon class="text-[16px] w-4 h-4 flex items-center justify-center">delete</mat-icon>
                        </button>
                      }
                    </div>

                    <!-- Row Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <!-- Item Name -->
                      <div class="md:col-span-4">
                        <label class="block text-[10px] font-semibold text-slate-400 mb-1">Item Name</label>
                        <input [(ngModel)]="line.item" type="text" placeholder="e.g. Dell PowerEdge Server" class="w-full glass-input rounded-lg p-1.5 text-xs bg-white focus:outline-indigo-600">
                      </div>

                      <!-- Description -->
                      <div class="md:col-span-8">
                        <label class="block text-[10px] font-semibold text-slate-400 mb-1">Description (Optional)</label>
                        <input [(ngModel)]="line.description" type="text" placeholder="e.g. Core i7, 32GB RAM" class="w-full glass-input rounded-lg p-1.5 text-xs bg-white focus:outline-indigo-600">
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <!-- Quantity -->
                      <div class="md:col-span-3">
                        <label class="block text-[10px] font-semibold text-slate-400 mb-1">Quantity</label>
                        <input [(ngModel)]="line.qty" type="number" min="1" class="w-full glass-input rounded-lg p-1.5 text-xs bg-white text-center font-semibold focus:outline-indigo-600 font-mono">
                      </div>

                      <!-- Unit Price -->
                      <div class="md:col-span-5">
                        <label class="block text-[10px] font-semibold text-slate-400 mb-1">Unit Price (MAD)</label>
                        <input [(ngModel)]="line.unitPrice" type="number" class="w-full glass-input rounded-lg p-1.5 text-xs bg-white font-mono text-right focus:outline-indigo-600">
                      </div>

                      <!-- Item Type -->
                      <div class="md:col-span-4">
                        <label class="block text-[10px] font-semibold text-slate-400 mb-1">Item Type</label>
                        <select [(ngModel)]="line.type" class="w-full glass-input rounded-lg p-1.5 text-xs bg-white focus:outline-indigo-600">
                          <option value="software">Software</option>
                          <option value="hardware">Hardware</option>
                          <option value="service">Service</option>
                        </select>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <button type="button" (click)="addPoLineItem()" class="w-full py-2 border border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/40 text-indigo-600 hover:text-indigo-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 mt-2">
                <mat-icon class="text-[16px] w-4 h-4 flex items-center justify-center">add_circle</mat-icon>
                + Add Item Line
              </button>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Expected Vendor Delivery Date</label>
              <input [(ngModel)]="newPoDeliveryDate" type="date" class="w-full glass-input rounded-lg p-2 text-sm font-mono focus:outline-indigo-600">
            </div>
          </div>

          <div class="flex justify-between items-center border-t border-slate-100 pt-4 shrink-0">
            <div class="text-sm font-semibold text-slate-700">
              PO Total: <span class="font-mono text-indigo-600 font-bold ml-1">{{ formatCurrency(getPoTotal()) }}</span>
            </div>
            <div class="flex gap-2">
              <button (click)="poModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
              <button (click)="saveDraftPO()" class="px-4 py-2 border border-slate-200 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold rounded-lg shadow-sm">Create Draft</button>
              <button (click)="savePurchaseOrder()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-200">Send PO via Email</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Set Delivery Date PO Modal -->
    @if (setDeliveryDateModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="glass-dialog rounded-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Log Vendor Expected Delivery Date</h3>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Expected Delivery Date</label>
            <input [(ngModel)]="loggedDeliveryDate" type="date" class="w-full glass-input rounded-lg p-2 text-sm font-mono focus:outline-indigo-600">
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button (click)="setDeliveryDateModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
            <button (click)="saveDeliveryDate()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-200">Save</button>
          </div>
        </div>
      </div>
    }

    <!-- Quick Add Activity Modal -->
    @if (addActivityModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="glass-dialog rounded-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950 capitalize">Log New {{ addActivityModalOpen()?.type === 'followups' ? 'Follow-up' : addActivityModalOpen()?.type }}</h3>
          
          <!-- Calls Fields -->
          @if (addActivityModalOpen()?.type === 'calls') {
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                <input [(ngModel)]="newActivityInput.calls.date" type="date" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Duration (mins)</label>
                  <input [(ngModel)]="newActivityInput.calls.duration" type="number" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Caller Name</label>
                  <input [(ngModel)]="newActivityInput.calls.callerName" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Outcome</label>
                <select [(ngModel)]="newActivityInput.calls.outcome" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  <option value="Interested">Interested</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Summary / Log</label>
                <textarea [(ngModel)]="newActivityInput.calls.summary" rows="3" placeholder="Describe the discussion..." class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
              </div>
            </div>
          }

          <!-- Emails Fields -->
          @if (addActivityModalOpen()?.type === 'emails') {
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                  <input [(ngModel)]="newActivityInput.emails.date" type="date" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Direction</label>
                  <select [(ngModel)]="newActivityInput.emails.direction" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                    <option value="sent">Sent to Client</option>
                    <option value="received">Received from Client</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">From</label>
                  <input [(ngModel)]="newActivityInput.emails.from" type="email" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">To</label>
                  <input [(ngModel)]="newActivityInput.emails.to" type="email" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Subject</label>
                <input [(ngModel)]="newActivityInput.emails.subject" type="text" placeholder="Subject..." class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-semibold font-sans">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Email Body</label>
                <textarea [(ngModel)]="newActivityInput.emails.body" rows="4" placeholder="Body copy..." class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono text-xs"></textarea>
              </div>
            </div>
          }

          <!-- Meetings Fields -->
          @if (addActivityModalOpen()?.type === 'meetings') {
            <div class="space-y-3 overflow-y-auto max-h-[50vh]">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Meeting Title</label>
                <input [(ngModel)]="newActivityInput.meetings.title" type="text" placeholder="e.g. Technical Kickoff" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-semibold">
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div class="col-span-2">
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                  <input [(ngModel)]="newActivityInput.meetings.date" type="date" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Time</label>
                  <input [(ngModel)]="newActivityInput.meetings.time" type="text" placeholder="10:00" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Type</label>
                  <select [(ngModel)]="newActivityInput.meetings.type" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                    <option value="teams">Teams Meeting</option>
                    <option value="demo">Product Demo</option>
                    <option value="in-person">In-person Meeting</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Location</label>
                  <input [(ngModel)]="newActivityInput.meetings.location" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Attendees (Comma Separated)</label>
                <input [(ngModel)]="newActivityInput.meetings.attendees" type="text" placeholder="Youssef, Karim Atlas" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-medium">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Minutes / Summary</label>
                <textarea [(ngModel)]="newActivityInput.meetings.summary" rows="3" placeholder="Key outcomes..." class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
              </div>
            </div>
          }

          <!-- Recordings Fields -->
          @if (addActivityModalOpen()?.type === 'recordings') {
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                <input [(ngModel)]="newActivityInput.recordings.date" type="date" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Title</label>
                <input [(ngModel)]="newActivityInput.recordings.title" type="text" placeholder="e.g. Scoping Call Recording" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-semibold font-sans">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Duration (e.g. '45 mins')</label>
                <input [(ngModel)]="newActivityInput.recordings.duration" type="text" placeholder="45 mins" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Teams Meeting Link</label>
                <input [(ngModel)]="newActivityInput.recordings.meetingLink" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono text-xs">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Recording Share Link</label>
                <input [(ngModel)]="newActivityInput.recordings.recordingLink" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono text-xs">
              </div>
            </div>
          }

          <!-- Notes Fields -->
          @if (addActivityModalOpen()?.type === 'notes') {
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                  <input [(ngModel)]="newActivityInput.notes.date" type="date" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Author</label>
                  <input [(ngModel)]="newActivityInput.notes.author" type="text" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Note Content</label>
                <textarea [(ngModel)]="newActivityInput.notes.content" rows="4" placeholder="Write internal notes..." class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
              </div>
            </div>
          }

          <!-- Follow-ups Fields -->
          @if (addActivityModalOpen()?.type === 'followups') {
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Due Date</label>
                <input [(ngModel)]="newActivityInput.followups.dueDate" type="date" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Reminder Title</label>
                <input [(ngModel)]="newActivityInput.followups.title" type="text" placeholder="e.g. Call client for feedback" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-semibold font-sans">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Assigned Owner</label>
                <select [(ngModel)]="newActivityInput.followups.assignedTo" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  @for (user of state.users(); track user.name) {
                    <option [value]="user.name">{{ user.name }} ({{ user.team }})</option>
                  }
                </select>
              </div>
            </div>
          }

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
            <button type="button" (click)="addActivityModalOpen.set(null)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 font-sans">Cancel</button>
            <button type="button" (click)="saveActivityEntry()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-200 font-sans">Save Entry</button>
          </div>
        </div>
      </div>
    }

    <!-- Confirm Proposal Modal -->
    @if (showConfirmProposalModal()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="glass-dialog rounded-2xl max-w-md w-full p-6 space-y-6 animate-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center pb-2 border-b border-white/30">
            <h3 class="text-lg font-bold text-slate-950">Confirm Proposal #{{ proposalToConfirm()?.id }}</h3>
            <button (click)="showConfirmProposalModal.set(false)" class="text-slate-400 hover:text-slate-600 transition-colors">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="space-y-4 font-sans">
            <!-- Method Selector -->
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirmation Channel</label>
              <div class="grid grid-cols-3 gap-2">
                <button type="button" (click)="confirmMethod.set('Email')"
                  [class]="confirmMethod() === 'Email' 
                    ? 'flex flex-col items-center justify-center py-2 px-3 border-2 border-indigo-500 bg-indigo-55/40 text-indigo-700 rounded-xl gap-1 font-semibold transition-all text-xs' 
                    : 'flex flex-col items-center justify-center py-2 px-3 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-650 transition-all gap-1 text-slate-500 text-xs'">
                  <mat-icon class="text-xl w-5 h-5 flex items-center justify-center">email</mat-icon>
                  <span>Email</span>
                </button>
                <button type="button" (click)="confirmMethod.set('WhatsApp')"
                  [class]="confirmMethod() === 'WhatsApp' 
                    ? 'flex flex-col items-center justify-center py-2 px-3 border-2 border-emerald-500 bg-emerald-55/40 text-emerald-800 rounded-xl gap-1 font-semibold transition-all text-xs' 
                    : 'flex flex-col items-center justify-center py-2 px-3 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-slate-50 hover:text-emerald-650 transition-all gap-1 text-slate-500 text-xs'">
                  <mat-icon class="text-xl w-5 h-5 flex items-center justify-center">chat</mat-icon>
                  <span>WhatsApp</span>
                </button>
                <button type="button" (click)="confirmMethod.set('Call')"
                  [class]="confirmMethod() === 'Call' 
                    ? 'flex flex-col items-center justify-center py-2 px-3 border-2 border-amber-500 bg-amber-55/40 text-amber-800 rounded-xl gap-1 font-semibold transition-all text-xs' 
                    : 'flex flex-col items-center justify-center py-2 px-3 border border-slate-200 rounded-xl hover:border-amber-300 hover:bg-slate-50 hover:text-amber-650 transition-all gap-1 text-slate-500 text-xs'">
                  <mat-icon class="text-xl w-5 h-5 flex items-center justify-center">phone</mat-icon>
                  <span>Call Log</span>
                </button>
              </div>
            </div>

            <!-- Upload fields or Notes -->
            @if (confirmMethod() === 'Email' || confirmMethod() === 'WhatsApp') {
              <div class="space-y-3">
                <label class="block text-xs font-semibold text-slate-650 uppercase">
                  Attach {{ confirmMethod() }} Confirmation Screenshot / PDF
                </label>
                
                <div class="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center glass hover:bg-slate-50 transition-all relative">
                  <input type="file" (change)="onConfirmFileSelected($event)" accept="image/*,application/pdf"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                  <mat-icon class="text-slate-400 text-3xl w-8 h-8 mb-1">cloud_upload</mat-icon>
                  <span class="text-xs text-slate-500 font-semibold">Click or drag image screenshot / document here</span>
                  <span class="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, PDF</span>
                </div>

                @if (confirmAttachmentName()) {
                  <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-xs text-emerald-800">
                    <mat-icon class="text-emerald-600 text-sm w-4 h-4">task_alt</mat-icon>
                    <span class="font-semibold truncate flex-1">{{ confirmAttachmentName() }}</span>
                    <button type="button" (click)="confirmAttachmentName.set(''); confirmAttachmentData.set('');" 
                      class="text-emerald-700 hover:text-rose-600 p-0.5 rounded-full transition-colors">
                      <mat-icon class="text-sm w-4 h-4">close</mat-icon>
                    </button>
                  </div>
                }

                <div class="space-y-2">
                  <label class="block text-xs font-semibold text-slate-650 uppercase">Note</label>
                  <textarea [(ngModel)]="confirmNote" name="confirmNote" rows="3"
                    placeholder="Add a note about this confirmation..."
                    class="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-indigo-650 bg-white placeholder-slate-400 shadow-sm"></textarea>
                </div>
              </div>
            } @else {
              <div class="space-y-2">
                <label class="block text-xs font-semibold text-slate-650 uppercase">
                  Call Summary &amp; Notes
                </label>
                <textarea [(ngModel)]="confirmNote" name="confirmNote" rows="4" 
                  placeholder="Summary of conversation, agreed pricing details, customer approval details..."
                  class="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-indigo-650 bg-white placeholder-slate-400 shadow-sm"></textarea>
              </div>
            }

            <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" (click)="showConfirmProposalModal.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
              <button type="button" (click)="submitConfirmProposal()"
                [disabled]="(confirmMethod() !== 'Call' && !confirmAttachmentName()) || (confirmMethod() === 'Call' && !confirmNote().trim())"
                class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5">
                <mat-icon class="text-[18px] w-[18.5px] h-[18.5px]">task_alt</mat-icon>
                Confirm Proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Convert Proposal to Deal & Customer Modal -->
    @if (showConvertProposalModal()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="glass-dialog rounded-2xl max-w-md w-full p-6 space-y-6">
          <div class="flex justify-between items-center pb-2 border-b border-white/30">
            <h3 class="text-lg font-semibold text-slate-950">Convert Prospect to Customer</h3>
            <button (click)="showConvertProposalModal.set(false)" class="text-slate-400 hover:text-slate-600">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <form (ngSubmit)="submitConvertProposal()" class="space-y-4 font-sans">
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Company / Contact Name</label>
              <input [(ngModel)]="newPartner.name" name="name" type="text" placeholder="e.g. Casablanca Technologies" required class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Email</label>
              <input [(ngModel)]="newPartner.email" name="email" type="email" placeholder="e.g. contact@domain.ma" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone</label>
              <input [(ngModel)]="newPartner.phone" name="phone" type="text" placeholder="e.g. +212-522-XXXXXX" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">City</label>
              <select [(ngModel)]="newPartner.city" name="city" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 bg-white">
                <option value="Casablanca">Casablanca</option>
                <option value="Rabat">Rabat</option>
                <option value="Marrakech">Marrakech</option>
                <option value="Tangier">Tangier</option>
                <option value="Fès">Fès</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">ICE (15 digits) *</label>
              <input [(ngModel)]="newPartner.ICE" name="ICE" type="text" maxlength="15" placeholder="e.g. 123456789012345" required class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Identifiant Fiscal (IF) *</label>
              <input [(ngModel)]="newPartner.IF" name="IF" type="text" placeholder="e.g. 123456" required class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Registre de Commerce (RC) *</label>
              <input [(ngModel)]="newPartner.RC" name="RC" type="text" placeholder="e.g. 123456" required class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Comments / Notes</label>
              <textarea [(ngModel)]="newPartner.comments" name="comments" rows="3" placeholder="Additional details..." class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" (click)="showConvertProposalModal.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
              <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-200">Convert to Customer &amp; Deal</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Assign Task Modal -->
    @if (assignTaskModalOpen(); as ctx) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="glass-dialog rounded-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-950">Assign Task</h3>
            <button (click)="assignTaskModalOpen.set(null)" class="text-slate-400 hover:text-slate-600 transition-colors">
              <mat-icon class="text-[20px] w-5 h-5">close</mat-icon>
            </button>
          </div>

          <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
            <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-0.5">Related to</span>
            <span class="text-sm font-bold text-indigo-900">{{ ctx.entityTitle }}</span>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Task Title</label>
              <input [(ngModel)]="assignTaskData.title" type="text" placeholder="e.g. Follow up with client" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Description (optional)</label>
              <textarea [(ngModel)]="assignTaskData.description" rows="3" placeholder="Describe the task..." class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Assigned Team</label>
              <select [(ngModel)]="assignTaskData.assignedTeam" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Support">Support</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Assigned Person</label>
              <select [(ngModel)]="assignTaskData.assignedTo" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                <option value="">-- Select --</option>
                @for (user of state.users(); track user.name) {
                  <option [value]="user.name">{{ user.name }} ({{ user.team }})</option>
                }
              </select>
            </div>
          </div>

          <div class="flex justify-between gap-2 pt-2 border-t border-slate-100">
            <button (click)="assignTaskModalOpen.set(null)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
            <button (click)="saveAssignTask()"
              [disabled]="!assignTaskData.title.trim() || !assignTaskData.assignedTo"
              class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
              <mat-icon class="text-[16px] w-4 h-4">assignment</mat-icon>
              Create &amp; Assign Task
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Slide-Over Drawer for Deal Details -->
    @if (selectedDeal(); as deal) {
      <div class="fixed inset-0 z-50 overflow-hidden" aria-labelledby="deal-drawer-title" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div (click)="closeDealDrawer()" class="absolute inset-0 overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
        
        <div class="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div class="w-screen max-w-3xl bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right-12 duration-300">
            <!-- Header -->
            <div class="px-6 py-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div>
                <h2 class="text-lg font-bold text-slate-900" id="deal-drawer-title">{{deal.title}}</h2>
                <p class="text-xs text-slate-500 mt-0.5">Client: {{getPartnerName(deal.partnerId)}}</p>
              </div>
              <div class="flex items-center gap-3">
                <span class="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {{deal.stage}}
                </span>
                <a [routerLink]="['/sales/deals', deal.id]" (click)="closeDealDrawer()" class="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                  <mat-icon class="text-sm w-4 h-4">open_in_new</mat-icon> Open page
                </a>
                <button (click)="closeDealDrawer()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- General Info & Amounts -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4 border-b border-white/30">
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
                  <p class="text-xs text-slate-600 mt-1">{{deal.comments || 'No comments.'}}</p>
                </div>

                <div>
                  <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Attached Proposal</span>
                  <div class="text-xs text-slate-600 mt-1">
                    #{{deal.proposalId || 'N/A'}} - {{ getProposalTitle(deal.proposalId) }}
                  </div>
                </div>
              </div>

              <!-- Identification & Dates -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div class="space-y-2">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200/60 pb-1">1. Identification & Dates</span>
                  <div class="grid grid-cols-2 gap-y-1.5 text-slate-600 font-sans">
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
                  <div class="grid grid-cols-3 gap-y-1.5 text-slate-600 font-sans">
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
                  <div class="grid grid-cols-2 gap-y-1.5 text-slate-600 font-sans">
                    <span class="font-medium">Sales Person:</span> <span class="text-slate-900 font-medium">{{ deal.salesPerson || 'N/A' }}</span>
                    <span class="font-medium">Region:</span> <span class="text-slate-900">{{ deal.salesRegion || 'N/A' }}</span>
                    <span class="font-medium">Currency:</span> <span class="text-slate-900 font-bold font-mono">{{ deal.currency || 'MAD' }}</span>
                    <span class="font-medium">Payment Terms:</span> <span class="text-slate-900">{{ deal.paymentTerms || 'N/A' }}</span>
                    <span class="font-medium">Total Amount:</span> <span class="text-slate-900 font-mono font-bold">{{ formatCurrency(deal.orderTotalAmount || deal.amount) }}</span>
                  </div>
                </div>

                <!-- Vendor & Logistics -->
                <div class="space-y-2">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200/60 pb-1">4. Vendor & Logistics</span>
                  <div class="grid grid-cols-2 gap-y-1.5 text-slate-600 font-sans">
                    <span class="font-medium">Vendor Account:</span> <span class="font-mono text-slate-900 font-semibold">{{ deal.vendorAccount || 'N/A' }}</span>
                    <span class="font-medium">PO Reference:</span> <span class="font-mono text-slate-900 font-semibold">{{ deal.purchaseOrderRef || 'N/A' }}</span>
                    <span class="font-medium">Warehouse:</span> <span class="text-slate-900">{{ deal.warehouseAddress || 'N/A' }}</span>
                    <span class="font-medium">Transport:</span> <span class="text-slate-900">{{ deal.transportationService || 'N/A' }}</span>
                  </div>
                </div>
              </div>

              <!-- Email Exchange Log -->
              @if (deal.emailExchange) {
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs font-mono space-y-1.5">
                  <div class="text-slate-400 font-sans font-bold flex items-center gap-1 mb-1">
                    <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none">email</mat-icon> Email Exchange & Confirmation Logs
                  </div>
                  <pre class="whitespace-pre-wrap text-[10px] text-slate-700 leading-relaxed font-sans">{{deal.emailExchange}}</pre>
                </div>
              }

              <!-- Activity Hub -->
              <div class="border-t border-slate-200 pt-4">
                <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-sans">
                  <mat-icon class="text-[16px] w-4 h-4 text-indigo-600 flex items-center justify-center">forum</mat-icon> Deal Activity Hub
                </h5>
                
                <!-- Tabs Header -->
                <div class="flex flex-wrap gap-1 border-b border-slate-200 mb-4 glass p-1 rounded-lg">
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
                    Recordings
                    <span class="bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded-full text-[9px] font-semibold">{{ deal.activityLog?.recordings?.length || 0 }}</span>
                  </button>
                  <button type="button" (click)="setDealTab(deal.id, 'notes')"
                    [class]="getDealTab(deal.id) === 'notes' ? 'bg-white text-indigo-600 shadow-xs border-slate-200' : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100'"
                    class="px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5">
                    <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none flex items-center justify-center">note_alt</mat-icon>
                    Notes
                    <span class="bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded-full text-[9px] font-semibold">{{ deal.activityLog?.notes?.length || 0 }}</span>
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
                <div class="glass border border-slate-200/60 rounded-xl p-4 min-h-[180px]">
                  
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

                        <div class="text-[10px] glass-chip text-slate-500 rounded-lg p-2.5 border border-slate-150 mt-4 leading-relaxed font-sans">
                          💡 <strong>Tip:</strong> Meetings logged in the <strong>Meetings</strong> tab automatically populate this calendar view.
                        </div>
                      </div>
                    </div>
                  }

                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 font-sans">
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-500">Lines: {{ deal.orderLines?.length || 0 }} items</span>
              </div>
              <div class="flex gap-2">
                <!-- Create PO trigger if none exists for this deal -->
                @if (!hasPOForDeal(deal.id)) {
                  <button (click)="openCreatePOModal(deal)" class="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center">
                    <mat-icon class="mr-1 text-[16px] w-4 h-4">add_shopping_cart</mat-icon> Create PO (Operations)
                  </button>
                }
                <button (click)="openAssignTaskModal('deal', deal.id, deal.title)" class="bg-white border border-slate-300 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                  <mat-icon class="text-[16px] w-4 h-4">assignment</mat-icon> Assign Task
                </button>
                @if (deal.stage === 'New') {
                  <button (click)="state.updateDealStage(deal.id, 'Confirmed')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center">
                    <mat-icon class="mr-1 text-[16px] w-4 h-4">check</mat-icon> Confirm Deal
                  </button>
                }
                <button (click)="closeDealDrawer()" class="bg-white border border-slate-300 text-slate-700 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class SalesComponent {
  state = inject(CrmStateService);
  private router = inject(Router);
  activeTab = signal<'deals' | 'proposals' | 'pos'>('deals');

  constructor() {
    const tab = this.state.navigateTab();
    if (tab) {
      this.activeTab.set(tab as 'deals' | 'proposals' | 'pos');
      this.state.navigateTab.set(null);
    }
    const label = this.activeTab() === 'deals' ? 'Deals' : this.activeTab() === 'proposals' ? 'Proposals' : 'Purchase Orders';
    this.state.breadcrumbLabel.set(label);
  }

  // Convert Proposal to Deal & Customer Modal State
  showConvertProposalModal = signal(false);
  proposalToConvert = signal<Proposal | null>(null);
  newPartner = {
    id: '' as string | undefined,
    name: '',
    type: 'Customer' as const,
    email: '',
    phone: '',
    city: 'Casablanca',
    comments: '',
    ICE: '',
    IF: '',
    RC: '',
    score: undefined as number | undefined,
    source: 'Website form' as const,
    assignedTo: ''
  };

  salesEligiblePartners = computed(() => 
    this.state.partners().filter(p => p.type === 'Prospect' || p.type === 'Customer')
  );

  // Modals state
  sendingProposalId = signal<string | null>(null);
  selectedChannels = signal<Set<'email' | 'whatsapp'>>(new Set());
  recipients = signal<{ name: string; email?: string; phone?: string }[]>([]);

  // Confirm Proposal Modal State
  showConfirmProposalModal = signal(false);
  proposalToConfirm = signal<Proposal | null>(null);
  confirmMethod = signal<'Email' | 'WhatsApp' | 'Call'>('Email');
  confirmAttachmentName = signal<string>('');
  confirmAttachmentData = signal<string>('');
  confirmNote = signal<string>('');

  currentProposalPartner = computed(() => {
    const prop = this.state.proposals().find(p => p.id === this.sendingProposalId());
    return this.state.partners().find(p => p.id === prop?.partnerId) ?? null;
  });

  currentProposalPartnerName = computed(() => {
    return this.currentProposalPartner()?.name ?? 'Unknown Prospect';
  });

  /** Contacts from the same organization as the proposal's partner (via CustomerCard.personnel) */
  proposalOrgContacts = computed(() => {
    const partner = this.currentProposalPartner();
    if (!partner) return [];
    const card = this.state.customerCards().find(c => c.partnerId === partner.id);
    return card ? card.personnel : [];
  });

  /** All other partners of the same type (Prospect) for cross-org additions */
  availableProspects = computed(() => this.state.partners().filter(p => p.type === 'Prospect'));
  editingProposalId = signal<string | null>(null);
  proposalModalOpen = signal(false);
  dealModalOpen = signal(false);
  poModalOpen = signal(false);
  setDeliveryDateModalOpen = signal(false);
  leadModalOpen = signal(false);

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

  // Assign Task Modal
  assignTaskModalOpen = signal<{
    entityType: 'deal' | 'proposal' | 'po';
    entityId: string;
    entityTitle: string;
  } | null>(null);
  assignTaskData = {
    title: '',
    description: '',
    assignedTeam: 'Sales' as 'Sales' | 'Operations' | 'Finance' | 'Support',
    assignedTo: ''
  };

  // Modal data properties
  newLeadData = {
    name: '',
    email: '',
    phone: '',
    city: 'Casablanca',
    score: 50,
    source: 'Website form',
    assignedTo: ''
  };

  selectedDealForPO = signal<Deal | null>(null);
  showNewVendorForm = signal(false);
  selectedVendorId = signal<string>('');
  newVendorData = { name: '', email: '', phone: '', city: 'Casablanca' };
  poLines = signal<{ item: string; description?: string; qty: number; unitPrice: number; type: 'software' | 'hardware' | 'service' }[]>([{ item: '', qty: 1, unitPrice: 0, type: 'software' }]);
  newPoDeliveryDate = '';

  selectedPOForDelivery = signal<PurchaseOrder | null>(null);
  loggedDeliveryDate = '';

  newProposal = {
    title: '',
    partnerId: '',
    lines: [] as { product: string; description: string; qty: number; unitPrice: number; total: number; vendor: string }[],
    opportunityValue: 0,
    closingProbability: 50,
    expectedClosingDate: '',
    competitors: '',
    stage: 'New Lead' as SalesStage
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

  selectedDealForDrawer = signal<Deal | null>(null);
  selectedDeal = computed(() => {
    const id = this.selectedDealForDrawer()?.id;
    if (!id) return null;
    return this.state.deals().find(d => d.id === id) || null;
  });

  openDealDrawer(deal: Deal) {
    this.selectedDealForDrawer.set(deal);
  }

  closeDealDrawer() {
    this.selectedDealForDrawer.set(null);
  }

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

  getStageBadgeClass(stage?: string) {
    switch (stage) {
      case 'New Lead':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Qualified':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Meeting Scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Proposal Sent':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Negotiation':
        return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100';
      case 'Won / Lost':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  }

  hasPOForDeal(dealId: string) {
    return this.state.purchaseOrders().some(po => po.dealId === dealId);
  }

  // Proposal Creation
  openSendProposalModal(prop: Proposal) {
    this.sendingProposalId.set(prop.id);
    this.selectedChannels.set(new Set());
    // Pre-populate primary recipient from the proposal's partner
    const partner = this.state.partners().find(p => p.id === prop.partnerId);
    if (partner) {
      this.recipients.set([{ name: partner.name, email: partner.email, phone: partner.phone }]);
    } else {
      this.recipients.set([]);
    }
  }

  toggleChannel(channel: 'email' | 'whatsapp') {
    this.selectedChannels.update(set => {
      const next = new Set(set);
      if (next.has(channel)) {
        next.delete(channel);
      } else {
        next.add(channel);
      }
      return next;
    });
  }

  isChannelSelected(channel: 'email' | 'whatsapp'): boolean {
    return this.selectedChannels().has(channel);
  }

  addContactToRecipients(event: Event) {
    const target = event.target as HTMLSelectElement;
    const personnelId = target.value;
    if (!personnelId) return;

    // First check org contacts (CustomerCard.personnel)
    const orgContacts = this.proposalOrgContacts();
    const personnel = orgContacts.find(p => p.id === personnelId);
    if (personnel) {
      // Avoid duplicates
      const alreadyAdded = this.recipients().some(r => r.name === personnel.fullName);
      if (!alreadyAdded) {
        this.recipients.update(arr => [...arr, {
          name: personnel.fullName,
          email: personnel.directEmail,
          phone: personnel.directMobile
        }]);
      }
    }
    target.value = '';
  }

  updateRecipientEmail(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    this.recipients.update(arr => {
      const copy = [...arr];
      copy[index] = { ...copy[index], email: input.value };
      return copy;
    });
  }

  updateRecipientPhone(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    this.recipients.update(arr => {
      const copy = [...arr];
      copy[index] = { ...copy[index], phone: input.value };
      return copy;
    });
  }

  removeRecipient(index: number) {
    this.recipients.update(arr => arr.filter((_, i) => i !== index));
  }

  addManualRecipient() {
    this.recipients.update(arr => [...arr, { name: '', email: '', phone: '' }]);
  }

  submitSendProposal() {
    const propId = this.sendingProposalId();
    if (propId) {
      this.state.updateProposalStatus(propId, 'Sent');
    }
    this.sendingProposalId.set(null);
  }

  openConfirmProposalModal(prop: Proposal) {
    this.proposalToConfirm.set(prop);
    this.confirmMethod.set('Email');
    this.confirmAttachmentName.set('');
    this.confirmAttachmentData.set('');
    this.confirmNote.set('');
    this.showConfirmProposalModal.set(true);
  }

  onConfirmFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.confirmAttachmentName.set(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        this.confirmAttachmentData.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  submitConfirmProposal() {
    const prop = this.proposalToConfirm();
    if (prop) {
      this.state.updateProposal(prop.id, {
        status: 'Confirmed',
        confirmationMethod: this.confirmMethod(),
        confirmationAttachmentName: this.confirmAttachmentName(),
        confirmationAttachmentData: this.confirmAttachmentData(),
        confirmationNote: this.confirmNote(),
        confirmedAt: new Date().toISOString().split('T')[0]
      });

      const deal = this.state.deals().find(d => d.proposalId === prop.id);
      if (deal) {
        const today = new Date().toISOString().split('T')[0];
        const me = this.state.users().find(u => u.id === this.state.currentUserId());
        const authorName = me?.displayName || 'System';
        const partner = this.state.partners().find(p => p.id === prop.partnerId);
        const method = this.confirmMethod();

        if (method === 'Email') {
          this.state.addEmailLog(deal.id, {
            date: today,
            from: me?.email || 'system@crm.ma',
            to: partner?.email || '',
            subject: `Proposal #${prop.id} Confirmed`,
            body: this.confirmNote() || `Proposal confirmed via Email. Attachment: ${this.confirmAttachmentName()}`,
            direction: 'sent'
          });
        } else if (method === 'WhatsApp') {
          this.state.addNote(deal.id, {
            date: today,
            author: authorName,
            content: this.confirmNote() || `Proposal #${prop.id} confirmed via WhatsApp. Attachment: ${this.confirmAttachmentName()}`
          });
        } else if (method === 'Call') {
          this.state.addCallLog(deal.id, {
            date: today,
            duration: 0,
            callerName: authorName,
            summary: this.confirmNote() || 'Proposal confirmed via call.',
            outcome: 'Confirmed'
          });
        }
      }
    }
    this.showConfirmProposalModal.set(false);
    this.proposalToConfirm.set(null);
  }

  openCreateProposalModal() {
    this.editingProposalId.set(null);
    this.newProposal = {
      title: '',
      partnerId: this.salesEligiblePartners()[0]?.id || '',
      lines: [
        { product: '', description: '', qty: 1, unitPrice: 0, total: 0, vendor: '' }
      ],
      opportunityValue: 0,
      closingProbability: 50,
      expectedClosingDate: new Date().toISOString().split('T')[0],
      competitors: '',
      stage: 'New Lead' as SalesStage
    };
    this.selectedTemplateId = '';
    this.proposalModalOpen.set(true);
  }

  openEditProposalModal(prop: Proposal) {
    this.editingProposalId.set(prop.id);
    this.newProposal = {
      title: prop.title,
      partnerId: prop.partnerId,
      lines: prop.lines.map(l => ({ ...l, vendor: l.vendor || '' })),
      opportunityValue: prop.opportunityValue || 0,
      closingProbability: prop.closingProbability ?? 50,
      expectedClosingDate: prop.expectedClosingDate || '',
      competitors: prop.competitors ? prop.competitors.join(', ') : '',
      stage: prop.stage || 'New Lead'
    };
    this.selectedTemplateId = prop.templateId || '';
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

  saveProposal(andAssignTask = false) {
    const total = this.getNewProposalTotal();
    const propId = this.editingProposalId();
    const competitorsArray = this.newProposal.competitors
      ? this.newProposal.competitors.split(',').map(c => c.trim()).filter(Boolean)
      : [];

    const payload = {
      title: this.newProposal.title || 'Draft Proposal',
      partnerId: this.newProposal.partnerId,
      amount: total,
      templateId: this.selectedTemplateId || undefined,
      lines: this.newProposal.lines,
      opportunityValue: this.newProposal.opportunityValue,
      closingProbability: this.newProposal.closingProbability,
      expectedClosingDate: this.newProposal.expectedClosingDate,
      competitors: competitorsArray,
      stage: this.newProposal.stage
    };

    if (propId) {
      this.state.updateProposal(propId, payload);
      this.proposalModalOpen.set(false);
      this.editingProposalId.set(null);
      if (andAssignTask) {
        this.openAssignTaskModal('proposal', propId, payload.title);
      }
    } else {
      const newProp = this.state.addProposal({
        ...payload,
        status: 'Draft'
      });
      this.proposalModalOpen.set(false);
      this.editingProposalId.set(null);
      if (andAssignTask && newProp) {
        this.openAssignTaskModal('proposal', newProp.id, newProp.title);
      }
    }
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

  // Assign Task Methods
  openAssignTaskModal(entityType: 'deal' | 'proposal' | 'po', entityId: string, entityTitle: string) {
    this.assignTaskData = {
      title: '',
      description: '',
      assignedTeam: 'Sales',
      assignedTo: ''
    };
    this.assignTaskModalOpen.set({ entityType, entityId, entityTitle });
  }

  saveAssignTask() {
    const ctx = this.assignTaskModalOpen();
    if (!ctx || !this.assignTaskData.title.trim() || !this.assignTaskData.assignedTo) return;

    const moduleMap: Record<string, string> = { deal: 'Sales', proposal: 'Sales', po: 'Sales' };
    const subModuleMap: Record<string, string> = { deal: 'Deal', proposal: 'Proposal', po: 'PurchaseOrder' };
    this.state.addTask({
      title: this.assignTaskData.title.trim(),
      description: this.assignTaskData.description.trim() || undefined,
      assignedTeam: this.assignTaskData.assignedTeam,
      assignedTo: this.assignTaskData.assignedTo,
      status: 'Pending',
      relatedTo: ctx.entityTitle,
      relatedModule: moduleMap[ctx.entityType] as Task['relatedModule'],
      relatedSubModule: subModuleMap[ctx.entityType],
      relatedEntityId: ctx.entityId
    });

    this.assignTaskModalOpen.set(null);
  }

  saveDeal(andAssignTask = false) {
    const finalAmount = this.newDeal.amount - (this.newDeal.amount * (this.newDeal.discount / 100));
    const newDeal = this.state.addDeal({
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
    if (andAssignTask && newDeal) {
      this.openAssignTaskModal('deal', newDeal.id, newDeal.title);
    }
  }

  // Purchase Order Helpers & Mutators
  addPoLineItem() {
    this.poLines.update(lines => [...lines, { item: '', qty: 1, unitPrice: 0, type: 'software' }]);
  }

  removePoLine(index: number) {
    this.poLines.update(lines => lines.filter((_, i) => i !== index));
  }

  getPoTotal(): number {
    return this.poLines().reduce((acc, line) => acc + (line.qty * line.unitPrice), 0);
  }

  getPOVendorId(): string | null {
    let vendorId = this.selectedVendorId();
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
        this.selectedVendorId.set(vendorId);
        this.showNewVendorForm.set(false);
      } else {
        alert('Please specify a vendor name');
        return null;
      }
    }
    return vendorId;
  }

  clearPoLocalState() {
    this.poLines.set([{ item: '', qty: 1, unitPrice: 0, type: 'software' }]);
    this.selectedVendorId.set('');
    this.showNewVendorForm.set(false);
    this.newVendorData = { name: '', email: '', phone: '', city: 'Casablanca' };
    this.newPoDeliveryDate = '';
    this.selectedDealForPO.set(null);
  }

  openCreatePOModal(deal: Deal) {
    this.selectedDealForPO.set(deal);
    this.selectedVendorId.set(this.state.vendors()[0]?.id || '');
    this.showNewVendorForm.set(false);
    
    // Auto-populate poLines with deal lines if available, estimating 70% cost of goods
    if (deal.orderLines && deal.orderLines.length > 0) {
      this.poLines.set(deal.orderLines.map(l => ({
        item: l.product,
        description: l.description || '',
        qty: l.qty,
        unitPrice: Math.round(l.unitPrice * 0.7),
        type: 'software' as const
      })));
    } else {
      this.poLines.set([{ item: '', qty: 1, unitPrice: 0, type: 'software' }]);
    }
    
    this.newPoDeliveryDate = '';
    this.poModalOpen.set(true);
  }

  savePurchaseOrder() {
    const deal = this.selectedDealForPO();
    if (!deal) return;

    const vendorId = this.getPOVendorId();
    if (!vendorId) return;

    const totalAmount = this.getPoTotal();

    // Add PO
    this.state.addPurchaseOrder({
      dealId: deal.id,
      vendorId: vendorId,
      amount: totalAmount,
      status: 'Sent',
      deliveryDate: this.newPoDeliveryDate || undefined,
      sentVia: 'Email via CRM',
      lines: this.poLines().map(line => ({
        product: line.item,
        description: line.description,
        qty: line.qty,
        cost: line.unitPrice,
        type: line.type
      }))
    });

    // Automatically update deal stage to PO Sent
    this.state.updateDealStage(deal.id, 'Confirmed');

    this.clearPoLocalState();
    this.poModalOpen.set(false);
    this.activeTab.set('pos');
  }

  saveDraftPO() {
    const deal = this.selectedDealForPO();
    if (!deal) return;

    const vendorId = this.getPOVendorId();
    if (!vendorId) return;

    const totalAmount = this.getPoTotal();

    // Add PO with status Draft
    this.state.addPurchaseOrder({
      dealId: deal.id,
      vendorId: vendorId,
      amount: totalAmount,
      status: 'Draft',
      deliveryDate: this.newPoDeliveryDate || undefined,
      lines: this.poLines().map(line => ({
        product: line.item,
        description: line.description,
        qty: line.qty,
        cost: line.unitPrice,
        type: line.type
      }))
    });

    this.clearPoLocalState();
    this.poModalOpen.set(false);
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

  // Activity Hub Helpers
  getDealTab(dealId: string): string {
    return this.activeDealTabs()[dealId] || 'calls';
  }

  setDealTab(dealId: string, tab: string): void {
    this.activeDealTabs.update(tabs => ({ ...tabs, [dealId]: tab }));
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

  openConvertProposalModal(prop: Proposal) {
    this.proposalToConvert.set(prop);
    const partner = this.state.partners().find(p => p.id === prop.partnerId);
    this.newPartner = {
      id: partner?.id,
      name: partner?.name || '',
      type: 'Customer',
      email: partner?.email || '',
      phone: partner?.phone || '',
      city: partner?.city || 'Casablanca',
      comments: partner?.comments || '',
      ICE: '',
      IF: '',
      RC: '',
      score: undefined,
      source: 'Website form',
      assignedTo: ''
    };
    this.showConvertProposalModal.set(true);
  }

  submitConvertProposal() {
    const prop = this.proposalToConvert();
    if (!prop) return;

    if (this.newPartner.name.trim()) {
      if (!this.newPartner.ICE || this.newPartner.ICE.length !== 15) {
        alert('ICE must be exactly 15 digits.');
        return;
      }
      if (!this.newPartner.IF || !this.newPartner.IF.trim()) {
        alert('IF is required.');
        return;
      }
      if (!this.newPartner.RC || !this.newPartner.RC.trim()) {
        alert('RC is required.');
        return;
      }

      const partnerId = prop.partnerId;

      // 1. Promote the associated Prospect → Customer
      this.state.convertToCustomer(partnerId);

      // 2. Update the partner details in the list
      this.state.partners.update(partners =>
        partners.map(p => p.id === partnerId ? {
          ...p,
          name: this.newPartner.name,
          email: this.newPartner.email,
          phone: this.newPartner.phone,
          city: this.newPartner.city,
          comments: this.newPartner.comments
        } : p)
      );

      // 3. Create the Customer Card
      const accountId = this.state.generateAccountId();
      this.state.saveCustomerCard({
        id: 'cc-' + partnerId,
        partnerId: partnerId,
        accountId,
        recordType: 'Organization',
        name: this.newPartner.name,
        searchName: '',
        erpAccount: '',
        ice: this.newPartner.ICE,
        ifField: this.newPartner.IF,
        rc: this.newPartner.RC,
        rcCity: this.newPartner.city,
        tp: '',
        vatStatus: ['Standard'],
        orgType: 'Headquarter',
        parentAccountId: null,
        addresses: [],
        mainPhone: this.newPartner.phone,
        corporateEmail: this.newPartner.email,
        websiteUrl: '',
        personnel: [],
      });

      // 4. Create the Deal
      const today = new Date().toISOString().split('T')[0];
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 30);
      const formattedDelivery = deliveryDate.toISOString().split('T')[0];
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);

      this.state.addDeal({
        title: prop.title + ' — Deal',
        partnerId: partnerId,
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

      // Remove the proposal from the list
      this.state.proposals.update(props => props.filter(p => p.id !== prop.id));

      this.showConvertProposalModal.set(false);
      this.proposalToConvert.set(null);

      // Switch to Deals tab so the user sees the result immediately
      this.activeTab.set('deals');
    }
  }

  openCreateLeadModal() {
    this.newLeadData = {
      name: '',
      email: '',
      phone: '',
      city: 'Casablanca',
      score: 50,
      source: 'Website form',
      assignedTo: ''
    };
    this.leadModalOpen.set(true);
  }

  saveLead() {
    if (this.newLeadData.name.trim()) {
      this.state.addPartner({
        name: this.newLeadData.name,
        type: 'Lead',
        email: this.newLeadData.email,
        phone: this.newLeadData.phone,
        city: this.newLeadData.city,
        score: this.newLeadData.score,
        source: this.newLeadData.source as any,
        assignedTo: this.newLeadData.assignedTo || undefined
      });
      this.leadModalOpen.set(false);
    }
  }

  convertLeadToProspect(leadId: string) {
    this.state.convertLeadToProspect(leadId);
  }
}

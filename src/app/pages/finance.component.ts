import { Component, inject, signal, computed, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService, Deal } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreatedByBadgeComponent } from '../shared/created-by-badge.component';

// ── Local type alias for invoice line items ────────────────────────────────
type InvoiceLine = {
  item: string;
  description?: string;
  qty: number;
  unitPrice: number;
  type: 'software' | 'hardware' | 'service';
};

@Component({
  selector: 'app-finance',
  imports: [MatIconModule, CommonModule, FormsModule, CreatedByBadgeComponent],
  template: `
    <div class="flex gap-6">
      <!-- Left Sidebar Navigation -->
      <aside class="w-44 shrink-0 hidden lg:block">
        <nav class="space-y-1 sticky top-24">
          <button
            (click)="activeTab.set('Customer'); state.breadcrumbLabel.set('Customer Invoices')"
            [class]="activeTab() === 'Customer' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">receipt</mat-icon>
            Customer
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.customerInvoices().length }}</span>
          </button>
          <button
            (click)="activeTab.set('Vendor'); state.breadcrumbLabel.set('Vendor Invoices')"
            [class]="activeTab() === 'Vendor' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">receipt_long</mat-icon>
            Vendor
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.vendorInvoices().length }}</span>
          </button>
          <button
            (click)="activeTab.set('Recovery'); state.breadcrumbLabel.set('Recovery')"
            [class]="activeTab() === 'Recovery' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">healing</mat-icon>
            Recovery
            @if (state.overdueInvoices().length > 0) {
              <span class="ml-auto text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-bold">{{ state.overdueInvoices().length }}</span>
            }
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 min-w-0 space-y-8">
        <div class="flex justify-between items-end">
          <div>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Finance / المالية</h2>
            <p class="text-slate-500 mt-1">Manage customer invoices, vendor invoices, and late payment recovery.</p>
          </div>
          <button (click)="openCreateInvoiceModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
            <mat-icon class="w-5 h-5 text-[20px]! leading-none! flex items-center justify-center">receipt_long</mat-icon>
            New Invoice
          </button>
        </div>

        <!-- Invoices View -->
        @if (activeTab() !== 'Recovery') {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Invoice Ref</th>
                  <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Partner</th>
                  <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Amount</th>
                  <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Due Date</th>
                  <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Created By</th>
                  <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Status</th>
                  <th scope="col" class="px-6 py-3 text-right font-medium text-slate-500 uppercase tracking-wider text-xs">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                @for (invoice of filteredInvoices(); track invoice.id) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap font-mono text-sm font-semibold text-slate-900">
                      #{{invoice.id}}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-slate-900">{{getPartnerName(invoice.partnerId)}}</div>
                      <div class="text-xs text-slate-400">{{ getPartnerCity(invoice.partnerId) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-slate-900 font-mono font-bold">{{formatCurrency(invoice.amount)}}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-slate-500 font-mono">{{invoice.dueDate}}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <app-created-by-badge [createdBy]="invoice.createdBy" [createdAt]="invoice.createdAt" />
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class]="getStatusColor(invoice.status)" class="px-2.5 py-1 text-xs font-semibold rounded-full border">
                        {{invoice.status}}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold space-x-1">
                      @if (invoice.status !== 'Paid') {
                        <button (click)="state.updateInvoiceStatus(invoice.id, 'Paid')" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors">Mark Paid</button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-slate-500 text-sm">No invoices found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Recovery View (Late Payers Reminders) -->
        @if (activeTab() === 'Recovery') {
          <div class="space-y-6">
            <div class="bg-rose-50 border border-rose-200 rounded-xl p-5 flex items-start shadow-xs">
              <mat-icon class="text-rose-500 mr-3 mt-0.5">warning</mat-icon>
              <div>
                <h4 class="text-rose-950 font-semibold text-sm">Late Payment Recovery / استخلاص الديون</h4>
                <p class="text-rose-700 text-xs mt-1">Select one or more customers with overdue invoices below, choose a channel, and trigger a friendly Moroccan reminder.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Left 2 columns: Checkbox selection of late payers -->
              <div class="lg:col-span-2 space-y-3">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Overdue Invoices</span>
                @for (invoice of state.overdueInvoices(); track invoice.id) {
                  <div class="bg-white rounded-xl shadow-sm border p-5 flex items-center justify-between transition-all"
                    [class.border-indigo-600]="selectedInvoiceIds().includes(invoice.id)"
                    [class.border-slate-200]="!selectedInvoiceIds().includes(invoice.id)">
                    <div class="flex items-center gap-3">
                      <input type="checkbox"
                        [checked]="selectedInvoiceIds().includes(invoice.id)"
                        (change)="toggleInvoiceSelect(invoice.id)"
                        class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500">
                      <div>
                        <h4 class="font-semibold text-slate-900">{{getPartnerName(invoice.partnerId)}}</h4>
                        <p class="text-xs text-slate-500 mt-0.5">City: {{getPartnerCity(invoice.partnerId)}} &bull; Phone: {{getPartnerPhone(invoice.partnerId)}}</p>
                        <p class="text-xs text-slate-600 flex items-center gap-2 mt-1.5">
                          <span class="font-mono font-bold text-slate-900">{{formatCurrency(invoice.amount)}}</span>
                          <span>&bull;</span>
                          <span class="text-rose-600 font-semibold">Due Date: {{invoice.dueDate}}</span>
                        </p>
                      </div>
                    </div>
                    <span class="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-200 uppercase">Overdue</span>
                  </div>
                } @empty {
                  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                    No overdue invoices found. Excellent collection rates!
                  </div>
                }
              </div>

              <!-- Right 1 column: Outbound campaign config -->
              <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 self-start">
                <h3 class="font-semibold text-slate-900 text-sm pb-3 border-b border-slate-100 flex items-center gap-1.5">
                  <mat-icon class="text-indigo-600">send_time_extension</mat-icon> Outbound Reminder
                </h3>

                <div class="space-y-3">
                  <div>
                    <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Channel</label>
                    <div class="grid grid-cols-3 gap-2">
                      <button type="button" (click)="reminderChannel.set('WhatsApp')"
                        [class]="reminderChannel() === 'WhatsApp' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200'"
                        class="border p-2 rounded-lg text-xs flex flex-col items-center gap-1 justify-center transition-colors">
                        <mat-icon class="text-emerald-600 leading-none">chat</mat-icon>
                        WhatsApp
                      </button>
                      <button type="button" (click)="reminderChannel.set('SMS')"
                        [class]="reminderChannel() === 'SMS' ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200'"
                        class="border p-2 rounded-lg text-xs flex flex-col items-center gap-1 justify-center transition-colors">
                        <mat-icon class="text-amber-600 leading-none">sms</mat-icon>
                        SMS
                      </button>
                      <button type="button" (click)="reminderChannel.set('Email')"
                        [class]="reminderChannel() === 'Email' ? 'bg-blue-50 text-blue-800 border-blue-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200'"
                        class="border p-2 rounded-lg text-xs flex flex-col items-center gap-1 justify-center transition-colors">
                        <mat-icon class="text-blue-600 leading-none">email</mat-icon>
                        Email
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Template Language</label>
                    <select [(ngModel)]="reminderLanguage" (change)="updateReminderTemplate()" class="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white">
                      <option value="ar">Moroccan Darija / العربية</option>
                      <option value="fr">French / Français</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Message Preview</label>
                    <textarea [(ngModel)]="reminderMessage" rows="5" class="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-indigo-600 leading-relaxed"></textarea>
                  </div>

                  @if (successMessage()) {
                    <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start gap-1.5">
                      <mat-icon class="text-emerald-600 text-[16px] w-4 h-4 mt-0.5">check_circle</mat-icon>
                      <span>{{successMessage()}}</span>
                    </div>
                  }

                  <button (click)="sendReminders()" [disabled]="selectedInvoiceIds().length === 0"
                    [class]="selectedInvoiceIds().length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                    class="w-full py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1">
                    <mat-icon class="text-[16px] w-4 h-4 leading-none">send</mat-icon>
                    Send Reminders ({{selectedInvoiceIds().length}} selected)
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         CREATE INVOICE MODAL
         ═══════════════════════════════════════════════════════════════════════ -->
    @if (invoiceModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" (click)="onBackdropClick($event)">
        <div class="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">

          <!-- ── Sticky Modal Header ──────────────────────────────────────── -->
          <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
            <div class="flex items-center gap-3">
              <div [class]="invoiceType() === 'Deal' ? 'bg-violet-100' : 'bg-indigo-100'"
                   class="w-9 h-9 rounded-xl flex items-center justify-center">
                <mat-icon [class]="invoiceType() === 'Deal' ? 'text-violet-600' : 'text-indigo-600'" class="text-[20px] w-5 h-5">
                  {{ invoiceType() === 'Deal' ? 'handshake' : 'edit_note' }}
                </mat-icon>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-950 leading-tight">Create New Invoice</h3>
                <p class="text-[11px] text-slate-400 mt-0.5">Only verified Customers are eligible for invoicing.</p>
              </div>
            </div>
            <button (click)="invoiceModalOpen.set(false)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <mat-icon class="text-[20px] w-5 h-5">close</mat-icon>
            </button>
          </div>

          <!-- ── Scrollable Body ─────────────────────────────────────────── -->
          <div class="overflow-y-auto flex-1 px-6 py-5 space-y-5">

            <!-- ① Invoice Modality Toggle -->
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Invoice Pathway</label>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" id="invoice-type-manual"
                  (click)="setInvoiceType('Manual')"
                  [class]="invoiceType() === 'Manual'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'"
                  class="border-2 rounded-xl py-3 px-4 text-sm font-semibold transition-all flex items-center gap-3">
                  <mat-icon class="text-[22px] shrink-0">edit_note</mat-icon>
                  <span class="text-left">
                    <span class="block">Manual Invoice</span>
                    <span class="text-[10px] font-normal opacity-70">Free-form, no deal link</span>
                  </span>
                </button>
                <button type="button" id="invoice-type-deal"
                  (click)="setInvoiceType('Deal')"
                  [class]="invoiceType() === 'Deal'
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'"
                  class="border-2 rounded-xl py-3 px-4 text-sm font-semibold transition-all flex items-center gap-3">
                  <mat-icon class="text-[22px] shrink-0">handshake</mat-icon>
                  <span class="text-left">
                    <span class="block">Deal Invoice</span>
                    <span class="text-[10px] font-normal opacity-70">Inherits lines from deal</span>
                  </span>
                </button>
              </div>
            </div>

            <!-- ② Deal Selection Block (Deal pathway only) -->
            @if (invoiceType() === 'Deal') {
              <div class="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-3">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-violet-600 text-[18px] w-[18px] h-[18px]">link</mat-icon>
                  <span class="text-xs font-bold text-violet-700 uppercase tracking-wide">Deal Association</span>
                  <span class="ml-auto text-[10px] bg-violet-200 text-violet-800 px-2 py-0.5 rounded-full font-bold">Lines auto-inherited</span>
                </div>
                <div>
                  <label for="deal-select" class="block text-xs font-semibold text-slate-500 uppercase mb-1">
                    Deal Number <span class="text-rose-500">*</span>
                  </label>
                  <select id="deal-select"
                    [(ngModel)]="newInvoiceData.dealId"
                    (ngModelChange)="onDealSelected($event)"
                    required
                    class="w-full border border-violet-300 rounded-lg p-2.5 text-sm bg-white focus:outline-violet-500 focus:ring-2 focus:ring-violet-200">
                    <option value="">— Select a Deal —</option>
                    @for (deal of state.deals(); track deal.id) {
                      <option [value]="deal.id">{{ deal.dealNumber || deal.id }} · {{ deal.title }}</option>
                    }
                  </select>
                  @if (!newInvoiceData.dealId) {
                    <p class="text-rose-500 text-xs mt-1 flex items-center gap-1">
                      <mat-icon class="text-[14px] w-3.5 h-3.5">error_outline</mat-icon>
                      A Deal selection is required to proceed.
                    </p>
                  }
                </div>
              </div>
            }

            <!-- ③ Two-column Admin Info -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <!-- Document Direction hidden or removed from user view as per requirements -->

              <!-- ── Customer Selector (Manual + Outbound) ──────────────────────
                   Shown prominently when type is Customer or any Manual pathway.
                   When Deal is selected, this row is locked and auto-driven.
              -->
              <div class="sm:col-span-2">
                <label for="partner-select" class="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Select Customer
                  @if (invoiceType() === 'Deal') {
                    <span class="ml-1 text-[10px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-full font-bold">🔒 Locked by Deal</span>
                  }
                  @if (invoiceType() === 'Manual' && newInvoiceData.type === 'Customer') {
                    <span class="ml-1 text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-full font-bold">Fields auto-fill on selection</span>
                  }
                </label>
                <select id="partner-select"
                  [(ngModel)]="newInvoiceData.partnerId"
                  (ngModelChange)="onPartnerSelected($event)"
                  [disabled]="invoiceType() === 'Deal'"
                  [class]="invoiceType() === 'Deal' ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-70' : 'bg-white focus:ring-2 focus:ring-indigo-200'"
                  class="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-indigo-600 transition-colors">
                  <option value="">— Select an existing Customer —</option>
                  @for (cust of invoiceEligibleCustomers(); track cust.id) {
                    <option [value]="cust.id">{{ cust.name }}</option>
                  }
                </select>
                @if (invoiceEligibleCustomers().length === 0) {
                  <p class="text-amber-600 text-xs mt-1 flex items-center gap-1">
                    <mat-icon class="text-[14px] w-3.5 h-3.5">warning</mat-icon>
                    No active Customers found. Convert a Prospect first.
                  </p>
                }
                @if (invoiceType() === 'Deal') {
                  <p class="text-slate-400 text-xs mt-1 flex items-center gap-1">
                    <mat-icon class="text-[13px] w-3.5 h-3.5">lock</mat-icon>
                    Partner is auto-assigned from the selected Deal.
                  </p>
                }
                @if (invoiceType() === 'Manual' && newInvoiceData.partnerId && autoFilledFields().size > 0) {
                  <div class="mt-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <mat-icon class="text-indigo-500 text-[15px] w-4 h-4 shrink-0">auto_awesome</mat-icon>
                    <span class="text-xs text-indigo-700 font-medium">Customer details auto-filled from account record. You can still edit any field below.</span>
                  </div>
                }
              </div>

              <!-- VAT Number -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  VAT Number
                  @if (autoFilledFields().has('vatNumber')) {
                    <span class="ml-1 text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">Auto-filled</span>
                  }
                </label>
                <input [(ngModel)]="newInvoiceData.vatNumber" type="text"
                  placeholder="e.g. MA-ICE-123456789"
                  [class]="autoFilledFields().has('vatNumber') ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white'"
                  class="w-full border rounded-lg p-2 text-sm font-mono focus:outline-indigo-600 transition-colors">
              </div>

              <!-- Customer Account -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Customer Account
                  @if (invoiceType() === 'Deal' || autoFilledFields().has('customerAccount')) {
                    <span class="ml-1 text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">Auto-filled</span>
                  }
                </label>
                <input [(ngModel)]="newInvoiceData.customerAccount"
                  [readonly]="invoiceType() === 'Deal'"
                  type="text"
                  placeholder="e.g. ERP-ATLAS-01"
                  [class]="invoiceType() === 'Deal' ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : autoFilledFields().has('customerAccount') ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white'"
                  class="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-indigo-600 transition-colors">
              </div>

              <!-- Customer Name -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Customer Name
                  @if (invoiceType() === 'Deal' || autoFilledFields().has('customerName')) {
                    <span class="ml-1 text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">Auto-filled</span>
                  }
                </label>
                <input [(ngModel)]="newInvoiceData.customerName"
                  [readonly]="invoiceType() === 'Deal'"
                  type="text"
                  placeholder="Official corporate name"
                  [class]="invoiceType() === 'Deal' ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : autoFilledFields().has('customerName') ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white'"
                  class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 transition-colors">
              </div>

              <!-- Billing Address -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Billing Address
                  @if (invoiceType() === 'Deal' || autoFilledFields().has('billingAddress')) {
                    <span class="ml-1 text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">Auto-filled</span>
                  }
                </label>
                <input [(ngModel)]="newInvoiceData.billingAddress"
                  [readonly]="invoiceType() === 'Deal'"
                  type="text"
                  placeholder="Registered billing / fiscal address"
                  [class]="invoiceType() === 'Deal' ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : autoFilledFields().has('billingAddress') ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white'"
                  class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 transition-colors">
              </div>

              <!-- Delivery Address -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Delivery Address
                  @if (invoiceType() === 'Deal' || autoFilledFields().has('deliveryAddress')) {
                    <span class="ml-1 text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">Auto-filled</span>
                  }
                </label>
                <input [(ngModel)]="newInvoiceData.deliveryAddress"
                  [readonly]="invoiceType() === 'Deal'"
                  type="text"
                  placeholder="Full delivery location"
                  [class]="invoiceType() === 'Deal' ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : autoFilledFields().has('deliveryAddress') ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white'"
                  class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 transition-colors">
              </div>

              <!-- Due Date -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Due Date</label>
                <input [(ngModel)]="newInvoiceData.dueDate" type="date"
                  class="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-indigo-600">
              </div>

              <!-- Computed Total (read-only) -->
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Total Amount (MAD)
                  @if (invoiceLines().length > 0) {
                    <span class="ml-1 text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">Computed from lines</span>
                  }
                </label>
                <input [value]="computedTotal()" readonly type="text"
                  class="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono bg-slate-50 text-slate-600 cursor-not-allowed focus:outline-none">
              </div>
            </div>

            <!-- ④ Line Items Section ─────────────────────────────────────── -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-slate-400 text-[18px] w-[18px] h-[18px]">format_list_bulleted</mat-icon>
                  <span class="text-xs font-bold text-slate-600 uppercase tracking-wide">Line Items</span>
                  @if (invoiceType() === 'Deal' && invoiceLines().length > 0) {
                    <span class="text-[10px] bg-violet-100 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-bold">
                      {{ invoiceLines().length }} inherited from deal
                    </span>
                  }
                </div>
                <span class="text-xs text-slate-400 font-mono">Subtotal: {{ formatCurrency(computedTotal()) }}</span>
              </div>

              <!-- Lines Table -->
              @if (invoiceLines().length > 0) {
                <div class="rounded-xl border border-slate-200 overflow-hidden">
                  <!-- Table header -->
                  <div class="grid bg-slate-50 border-b border-slate-200 px-3 py-2"
                       style="grid-template-columns: 1fr 1.4fr 60px 90px 90px 32px">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Item</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Qty</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Unit Price</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total</span>
                    <span></span>
                  </div>

                  <!-- Line rows -->
                  @for (line of invoiceLines(); track $index; let i = $index) {
                    <div class="grid items-center gap-1.5 px-3 py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                         style="grid-template-columns: 1fr 1.4fr 60px 90px 90px 32px">
                      <!-- Item -->
                      <input [(ngModel)]="invoiceLines()[i].item"
                        (ngModelChange)="patchLine(i, 'item', $event)"
                        placeholder="Product / service"
                        class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-indigo-500 focus:ring-1 focus:ring-indigo-200">
                      <!-- Description -->
                      <input [(ngModel)]="invoiceLines()[i].description"
                        (ngModelChange)="patchLine(i, 'description', $event)"
                        placeholder="Optional detail"
                        class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-indigo-500 focus:ring-1 focus:ring-indigo-200">
                      <!-- Qty -->
                      <input [(ngModel)]="invoiceLines()[i].qty"
                        (ngModelChange)="patchLine(i, 'qty', +$event)"
                        type="number" min="1"
                        class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white font-mono text-center focus:outline-indigo-500">
                      <!-- Unit Price -->
                      <input [(ngModel)]="invoiceLines()[i].unitPrice"
                        (ngModelChange)="patchLine(i, 'unitPrice', +$event)"
                        type="number" min="0"
                        class="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white font-mono text-right focus:outline-indigo-500">
                      <!-- Row Total (read-only) -->
                      <span class="text-xs font-mono font-semibold text-slate-700 text-right pr-1">
                        {{ formatCurrency(line.qty * line.unitPrice) }}
                      </span>
                      <!-- Delete -->
                      <button type="button" (click)="removeLine(i)"
                        class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-100 text-slate-300 hover:text-rose-600 transition-colors">
                        <mat-icon class="text-[16px] w-4 h-4">delete_outline</mat-icon>
                      </button>
                    </div>
                  }

                  <!-- Running total footer -->
                  <div class="grid px-3 py-2 bg-slate-50 border-t border-slate-200"
                       style="grid-template-columns: 1fr 1.4fr 60px 90px 90px 32px">
                    <span class="col-span-4 text-xs font-bold text-slate-500 text-right pr-2">Invoice Total:</span>
                    <span class="text-xs font-bold font-mono text-slate-900 text-right pr-1">{{ formatCurrency(computedTotal()) }}</span>
                    <span></span>
                  </div>
                </div>
              } @else {
                <div class="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
                  <mat-icon class="text-slate-300 text-[36px] w-9 h-9 mx-auto block">receipt_long</mat-icon>
                  <p class="text-xs text-slate-400 mt-2">No line items yet.</p>
                  @if (invoiceType() === 'Deal') {
                    <p class="text-xs text-violet-500 mt-1">Select a Deal above to auto-inherit its product lines.</p>
                  }
                </div>
              }

              <!-- Add Custom Line button -->
              <button type="button"
                (click)="addBlankLine()"
                class="w-full border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-500 hover:text-indigo-700 rounded-xl py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 hover:bg-indigo-50">
                <mat-icon class="text-[16px] w-4 h-4">add</mat-icon>
                + Add Custom Invoice Line
              </button>
            </div>

            <!-- Validation Banner -->
            @if (formValidationError()) {
              <div class="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start gap-1.5">
                <mat-icon class="text-rose-500 text-[16px] w-4 h-4 mt-0.5 shrink-0">error_outline</mat-icon>
                <span>{{ formValidationError() }}</span>
              </div>
            }
          </div>

          <!-- ── Sticky Footer Actions ───────────────────────────────────── -->
          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl flex items-center justify-between gap-3 shrink-0">
            <!-- Left: Cancel -->
            <button (click)="invoiceModalOpen.set(false)"
              class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors">
              Cancel
            </button>

            <!-- Right: Save Draft + Save & Send -->
            <div class="flex items-center gap-2">
              <!-- Save as Draft -->
              <button type="button" (click)="saveInvoice('Draft')"
                class="flex items-center gap-1.5 px-4 py-2 border text-sm font-semibold rounded-lg transition-colors"
                [class]="invoiceType() === 'Deal'
                  ? 'border-violet-200 text-violet-700 hover:bg-violet-50'
                  : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'">
                <mat-icon class="text-[16px] w-4 h-4 leading-none">save</mat-icon>
                Save Draft
              </button>

              <!-- Save & Send -->
              <button type="button" (click)="saveInvoice('Pending')"
                class="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                [class]="invoiceType() === 'Deal'
                  ? 'bg-violet-600 hover:bg-violet-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'">
                <mat-icon class="text-[16px] w-4 h-4 leading-none">send</mat-icon>
                Save &amp; Send
              </button>
            </div>
          </div>

        </div><!-- /modal card -->
      </div><!-- /backdrop -->
    }
  `
})
export class FinanceComponent {
  state = inject(CrmStateService);
  activeTab = signal<'Customer' | 'Vendor' | 'Recovery'>('Customer');

  invoiceModalOpen  = signal(false);
  selectedInvoiceIds = signal<string[]>([]);
  reminderChannel   = signal<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');
  reminderLanguage  = 'ar';
  reminderMessage   = '';
  successMessage    = signal('');
  formValidationError = signal('');

  // ── Invoice Type Modality ─────────────────────────────────────────────────
  /** Tracks which invoice creation pathway the user selected. */
  invoiceType = signal<'Manual' | 'Deal'>('Manual');

  // ── Line Items Signal ─────────────────────────────────────────────────────
  /**
   * Active invoice line items — combines deal-inherited lines and manually
   * appended custom entries. Drives both the UI table and the computed total.
   */
  invoiceLines = signal<InvoiceLine[]>([]);

  /** Reactive sum of all line items: qty × unitPrice. */
  computedTotal = computed(() =>
    this.invoiceLines().reduce((sum, l) => sum + l.qty * l.unitPrice, 0)
  );

  // ── Eligible Customers (Prospects blocked) ────────────────────────────────
  /** Only Partners with type === 'Customer' may be invoiced. */
  invoiceEligibleCustomers = computed(() =>
    this.state.partners().filter(p => p.type === 'Customer')
  );

  // ── Form State ────────────────────────────────────────────────────────────
  newInvoiceData: {
    type: 'Customer' | 'Vendor';
    partnerId: string;
    dealId: string;
    dueDate: string;
    customerAccount: string;
    customerName: string;
    billingAddress: string;
    deliveryAddress: string;
    vatNumber: string;
  } = this.blankForm();

  /** Tracks which fields were auto-filled from the CustomerCard. */
  autoFilledFields = signal<Set<string>>(new Set());

  constructor() {
    const tab = this.state.navigateTab();
    if (tab) {
      this.activeTab.set(tab as 'Customer' | 'Vendor' | 'Recovery');
      this.state.navigateTab.set(null);
    }
    const label = this.activeTab() === 'Customer' ? 'Customer Invoices' : this.activeTab() === 'Vendor' ? 'Vendor Invoices' : 'Recovery';
    this.state.breadcrumbLabel.set(label);
    this.updateReminderTemplate();
    // When switching back to Manual, clear deal-bound locked fields and lines
    effect(() => {
      if (this.invoiceType() === 'Manual') {
        this.newInvoiceData.dealId = '';
        this.invoiceLines.set([]);
      }
    });
  }

  // ── Form helpers ──────────────────────────────────────────────────────────

  private blankForm() {
    return {
      type: 'Customer' as 'Customer' | 'Vendor',
      partnerId: '',
      dealId: '',
      dueDate: '',
      customerAccount: '',
      customerName: '',
      billingAddress: '',
      deliveryAddress: '',
      vatNumber: '',
    };
  }

  /** Switch pathway; clears deal context and line items when going Manual. */
  setInvoiceType(type: 'Manual' | 'Deal') {
    this.invoiceType.set(type);
    this.formValidationError.set('');
    if (type === 'Manual') {
      this.newInvoiceData.dealId = '';
      this.invoiceLines.set([]);
    }
  }

  /**
   * Called when the user picks a Deal.
   * ① Locks the Partner to the deal's partnerId.
   * ② Auto-fills admin fields (customerAccount, deliveryAddress, customerName).
   * ③ Inherits all deal / proposal lines into invoiceLines signal.
   */
  onDealSelected(dealId: string) {
    if (!dealId) { this.invoiceLines.set([]); return; }

    const deal = this.state.deals().find(d => d.id === dealId);
    if (!deal) return;

    // ── Lock partner ──────────────────────────────────────────────────────
    this.newInvoiceData.partnerId = deal.partnerId;

    // ── Auto-fill admin fields ────────────────────────────────────────────
    this.newInvoiceData.customerAccount = deal.customerAccount ?? '';
    this.newInvoiceData.deliveryAddress = deal.deliveryAddress ?? '';

    const partner = this.state.partners().find(p => p.id === deal.partnerId);
    this.newInvoiceData.customerName = partner?.name ?? '';

    // ── Inherit line items ────────────────────────────────────────────────
    // Prefer deal.orderLines → fall back to linked proposal lines
    const sourceLines = deal.orderLines && deal.orderLines.length > 0
      ? deal.orderLines
      : (this.state.proposals().find(pr => pr.id === deal.proposalId)?.lines ?? []);

    const inherited: InvoiceLine[] = sourceLines.map(l => ({
      item:       l.product,
      description: l.description || '',
      qty:         l.qty,
      unitPrice:   l.unitPrice,
      type:        'service' as const,   // default; user can override per row
    }));

    this.invoiceLines.set(inherited);
    this.formValidationError.set('');
  }

  /**
   * Called when the user manually picks a Customer (Manual pathway).
   * Auto-fills Customer Name, VAT, Billing Address, and Delivery Address
   * from the linked CustomerCard when available.
   */
  onPartnerSelected(partnerId: string) {
    if (!partnerId) {
      // Clear auto-filled fields when selection is cleared
      this.autoFilledFields.set(new Set());
      this.newInvoiceData.customerName = '';
      this.newInvoiceData.vatNumber = '';
      this.newInvoiceData.billingAddress = '';
      this.newInvoiceData.deliveryAddress = '';
      return;
    }

    const partner = this.state.partners().find(p => p.id === partnerId);
    if (!partner) return;

    const filled = new Set<string>();

    // ── Customer Name ──────────────────────────────────────────────────────
    this.newInvoiceData.customerName = partner.name;
    filled.add('customerName');

    // ── Enrich from CustomerCard ───────────────────────────────────────────
    const card = this.state.getCustomerCard(partnerId);
    if (card) {
      // VAT: use ICE field (Identifiant Commun de l'Entreprise — Morocco VAT)
      if (card.ice) {
        this.newInvoiceData.vatNumber = card.ice;
        filled.add('vatNumber');
      } else if (card.tp) {
        this.newInvoiceData.vatNumber = card.tp;
        filled.add('vatNumber');
      }

      // Billing Address: prefer 'Billing' or 'Siège Social / Fiscal' address type
      const billingAddr = card.addresses.find(a =>
        a.addressType === 'Billing' || a.addressType === 'Siège Social / Fiscal'
      ) ?? card.addresses.find(a => a.isPrimary) ?? card.addresses[0];
      if (billingAddr) {
        this.newInvoiceData.billingAddress =
          [billingAddr.streetAddress, billingAddr.industrialZone, billingAddr.postalCode, billingAddr.city]
            .filter(Boolean).join(', ');
        filled.add('billingAddress');
      }

      // Delivery Address: prefer 'Delivery' type, fall back to billing
      const deliveryAddr = card.addresses.find(a => a.addressType === 'Delivery')
        ?? billingAddr;
      if (deliveryAddr) {
        this.newInvoiceData.deliveryAddress =
          [deliveryAddr.streetAddress, deliveryAddr.industrialZone, deliveryAddr.postalCode, deliveryAddr.city]
            .filter(Boolean).join(', ');
        filled.add('deliveryAddress');
      }

      // Customer Account from ERP account code
      if (card.erpAccount) {
        this.newInvoiceData.customerAccount = card.erpAccount;
        filled.add('customerAccount');
      } else if (card.accountId) {
        this.newInvoiceData.customerAccount = card.accountId;
        filled.add('customerAccount');
      }
    }

    this.autoFilledFields.set(filled);
    this.formValidationError.set('');
  }

  /** Append a blank custom line to the invoice. */
  addBlankLine() {
    this.invoiceLines.update(lines => [
      ...lines,
      { item: '', description: '', qty: 1, unitPrice: 0, type: 'service' as const }
    ]);
  }

  /** Remove the line at index i. */
  removeLine(i: number) {
    this.invoiceLines.update(lines => lines.filter((_, idx) => idx !== i));
  }

  /**
   * Patch a single field on a line (Angular @for loops give us a snapshot,
   * so we must use update + spread to trigger change detection).
   */
  patchLine(i: number, field: keyof InvoiceLine, value: string | number) {
    this.invoiceLines.update(lines => {
      const copy = [...lines];
      copy[i] = { ...copy[i], [field]: value } as InvoiceLine;
      return copy;
    });
  }

  // ── Validation & Save ─────────────────────────────────────────────────────

  /**
   * Validates the form and persists the invoice.
   * @param status 'Draft' → save-only; 'Pending' → save & send
   */
  saveInvoice(status: 'Draft' | 'Pending' = 'Pending') {
    // Prospect guard (belt-and-suspenders, dropdown is already filtered)
    if (this.newInvoiceData.partnerId) {
      const partner = this.state.partners().find(p => p.id === this.newInvoiceData.partnerId);
      if (partner && partner.type !== 'Customer') {
        this.formValidationError.set('Invoices can only be created for verified Customers. Prospects are not eligible.');
        return;
      }
    }

    // Deal invoice guard
    if (this.invoiceType() === 'Deal' && !this.newInvoiceData.dealId) {
      this.formValidationError.set('A Deal must be selected for a Deal Invoice.');
      return;
    }

    // Partner required
    if (!this.newInvoiceData.partnerId) {
      this.formValidationError.set('Please select a Customer Account.');
      return;
    }

    // At least one meaningful line item OR non-zero manual total
    const total = this.computedTotal();
    if (total <= 0) {
      this.formValidationError.set('Add at least one line item with a quantity and unit price, or adjust existing lines.');
      return;
    }

    // Due date required
    if (!this.newInvoiceData.dueDate) {
      this.formValidationError.set('Please specify a due date.');
      return;
    }

    this.state.addInvoice({
      type:            this.newInvoiceData.type,
      partnerId:       this.newInvoiceData.partnerId,
      amount:          total,                              // ← always computed from lines
      status:          status === 'Draft' ? 'Draft' : 'Pending',
      dueDate:         this.newInvoiceData.dueDate,
      dealId:          this.newInvoiceData.dealId || undefined,
      customerAccount: this.newInvoiceData.customerAccount || undefined,
      customerName:    this.newInvoiceData.customerName    || undefined,
      deliveryAddress: this.newInvoiceData.deliveryAddress || undefined,
      vatNumber:       this.newInvoiceData.vatNumber       || undefined,
      lines:           this.invoiceLines().length > 0 ? [...this.invoiceLines()] : undefined,
    });

    this.invoiceModalOpen.set(false);
    this.formValidationError.set('');
  }

  // ── Invoice list helpers ──────────────────────────────────────────────────

  filteredInvoices = () =>
    this.activeTab() === 'Customer'
      ? this.state.customerInvoices()
      : this.state.vendorInvoices();

  getPartnerName(id: string) {
    return this.state.partners().find(p => p.id === id)?.name ?? 'Unknown';
  }
  getPartnerCity(id: string) {
    return this.state.partners().find(p => p.id === id)?.city ?? 'Casablanca';
  }
  getPartnerPhone(id: string) {
    return this.state.partners().find(p => p.id === id)?.phone ?? 'N/A';
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(value);
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'Paid':    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Overdue': return 'bg-rose-100    text-rose-800    border-rose-200';
      case 'Pending': return 'bg-amber-100   text-amber-800   border-amber-200';
      case 'Draft':   return 'bg-slate-100   text-slate-600   border-slate-200';
      default:        return 'bg-slate-100   text-slate-800   border-slate-200';
    }
  }

  toggleInvoiceSelect(id: string) {
    this.selectedInvoiceIds.update(ids =>
      ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
    );
  }

  openCreateInvoiceModal() {
    this.newInvoiceData = this.blankForm();
    // Default the type based on the active sidebar tab
    this.newInvoiceData.type = this.activeTab() === 'Vendor' ? 'Vendor' : 'Customer';
    this.invoiceType.set('Manual');
    this.invoiceLines.set([]);
    this.formValidationError.set('');
    this.autoFilledFields.set(new Set());
    this.invoiceModalOpen.set(true);
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.invoiceModalOpen.set(false);
    }
  }

  // ── Recovery helpers ──────────────────────────────────────────────────────

  updateReminderTemplate() {
    if (this.reminderLanguage === 'ar') {
      this.reminderMessage = `السلام عليكم،\nنذكركم بلطف بضرورة تسوية الفاتورة الخاصة بكم المتبقية والبالغة قيمتها {{amount}} درهم مغربي، والتي كانت مستحقة بتاريخ {{due_date}}.\nشكرًا لتعاونكم مع شركة أكمل الرقمية.\nطاقم المالية.`;
    } else {
      this.reminderMessage = `Bonjour,\nNous vous rappelons amicalement de régler votre facture impayée d'un montant de {{amount}} MAD, échue le {{due_date}}.\nMerci pour votre confiance.\nL'équipe Finance.`;
    }
  }

  sendReminders() {
    const channel = this.reminderChannel();
    this.successMessage.set(`Succès! Rappel envoyé via ${channel} aux clients sélectionnés.`);
    setTimeout(() => this.successMessage.set(''), 4000);
    this.selectedInvoiceIds.set([]);
  }
}

import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService, Invoice, Partner } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-finance',
  imports: [MatIconModule, CommonModule, FormsModule],
  template: `
    <div class="flex gap-6">
      <!-- Left Sidebar Navigation -->
      <aside class="w-44 shrink-0 hidden lg:block">
        <nav class="space-y-1 sticky top-24">
          <button 
            (click)="activeTab.set('Customer')" 
            [class]="activeTab() === 'Customer' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">receipt</mat-icon>
            Customer
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.customerInvoices().length }}</span>
          </button>
          <button 
            (click)="activeTab.set('Vendor')" 
            [class]="activeTab() === 'Vendor' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">receipt_long</mat-icon>
            Vendor
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.vendorInvoices().length }}</span>
          </button>
          <button 
            (click)="activeTab.set('Recovery')" 
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
                  <td colspan="6" class="px-6 py-8 text-center text-slate-500 text-sm">No invoices found.</td>
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

    <!-- Create Invoice Modal -->
    @if (invoiceModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Create New Invoice</h3>
          
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Invoice Type</label>
              <select [(ngModel)]="newInvoiceData.type" name="type" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                <option value="Customer">Customer (Outbound)</option>
                <option value="Vendor">Vendor (Inbound)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Partner</label>
              <select [(ngModel)]="newInvoiceData.partnerId" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                @for (p of state.partners(); track p.id) {
                  <option [value]="p.id">{{p.name}} ({{p.type}})</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Total Amount (MAD)</label>
              <input [(ngModel)]="newInvoiceData.amount" type="number" class="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-indigo-600">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Due Date</label>
              <input [(ngModel)]="newInvoiceData.dueDate" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-indigo-600">
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button (click)="invoiceModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
            <button (click)="saveInvoice()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">Save Invoice</button>
          </div>
        </div>
      </div>
    }
  `
})
export class FinanceComponent {
  state = inject(CrmStateService);
  activeTab = signal<'Customer' | 'Vendor' | 'Recovery'>('Customer');
  
  invoiceModalOpen = signal(false);
  selectedInvoiceIds = signal<string[]>([]);
  reminderChannel = signal<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');
  reminderLanguage = 'ar';
  reminderMessage = '';
  successMessage = signal('');

  newInvoiceData = {
    type: 'Customer' as 'Customer' | 'Vendor',
    partnerId: '',
    amount: 0,
    dueDate: ''
  };

  constructor() {
    this.updateReminderTemplate();
  }

  filteredInvoices = () => {
    return this.activeTab() === 'Customer' ? this.state.customerInvoices() : this.state.vendorInvoices();
  };

  getPartnerName(id: string) {
    return this.state.partners().find(p => p.id === id)?.name || 'Unknown';
  }

  getPartnerCity(id: string) {
    return this.state.partners().find(p => p.id === id)?.city || 'Casablanca';
  }

  getPartnerPhone(id: string) {
    return this.state.partners().find(p => p.id === id)?.phone || 'N/A';
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(value);
  }

  getStatusColor(status: string) {
    switch(status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Overdue': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }

  toggleInvoiceSelect(id: string) {
    this.selectedInvoiceIds.update(ids =>
      ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
    );
  }

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

  openCreateInvoiceModal() {
    this.newInvoiceData = {
      type: 'Customer',
      partnerId: this.state.partners()[0]?.id || '',
      amount: 0,
      dueDate: ''
    };
    this.invoiceModalOpen.set(true);
  }

  saveInvoice() {
    this.state.addInvoice({
      type: this.newInvoiceData.type,
      partnerId: this.newInvoiceData.partnerId,
      amount: this.newInvoiceData.amount,
      status: 'Pending',
      dueDate: this.newInvoiceData.dueDate
    });
    this.invoiceModalOpen.set(false);
  }
}

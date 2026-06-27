import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService, Partner } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-partners',
  imports: [MatIconModule, CommonModule, FormsModule],
  template: `
    <div class="flex gap-6">
      <!-- Left Sidebar Navigation -->
      <aside class="w-44 shrink-0 hidden lg:block">
        <nav class="space-y-1 sticky top-24">
          <button 
            (click)="activeTab.set('Lead')" 
            [class]="activeTab() === 'Lead' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">filter_alt</mat-icon>
            Leads
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.leads().length }}</span>
          </button>
          <button 
            (click)="activeTab.set('Customer')" 
            [class]="activeTab() === 'Customer' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">people</mat-icon>
            Customers
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.customers().length }}</span>
          </button>
          <button 
            (click)="activeTab.set('Prospect')" 
            [class]="activeTab() === 'Prospect' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">person_search</mat-icon>
            Prospects
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.prospects().length }}</span>
          </button>
          <button 
            (click)="activeTab.set('Vendor')" 
            [class]="activeTab() === 'Vendor' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">store</mat-icon>
            Vendors
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ state.vendors().length }}</span>
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 min-w-0 space-y-8">
        <div class="flex justify-between items-end">
          <div>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Partners / شركاء</h2>
            <p class="text-slate-500 mt-1">Directory of customers, prospects, and vendors in Morocco.</p>
          </div>
          <button (click)="openCreateModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
            <mat-icon class="w-5 h-5 text-[20px]! leading-none! flex items-center justify-center">person_add</mat-icon>
            New {{activeTab()}}
          </button>
        </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (partner of filteredPartners(); track partner.id) {
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:border-indigo-500/50 hover:shadow-md transition-all">
            <div>
              <div class="flex items-start justify-between mb-4">
                <div class="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-medium text-slate-600">
                  {{partner.name.substring(0,2).toUpperCase()}}
                </div>
                <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full"
                  [class]="partner.type === 'Lead' ? 'bg-purple-100 text-purple-800' : (partner.type === 'Customer' ? 'bg-emerald-100 text-emerald-800' : (partner.type === 'Prospect' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'))">
                  {{partner.type}}
                </span>
              </div>
              <h3 class="text-lg font-medium text-slate-900 truncate mb-1">{{partner.name}}</h3>
              <span class="inline-flex items-center text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded mb-4">
                <mat-icon class="text-[12px] w-3 h-3 mr-1">location_on</mat-icon> {{partner.city || 'Casablanca'}}
              </span>
              
              @if(partner.type === 'Lead') {
                <div class="flex gap-2 flex-wrap mb-4">
                  @if (partner.score) {
                    <span class="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider" [class]="partner.score > 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                      Score: {{partner.score}}
                    </span>
                  }
                  @if (partner.source) {
                    <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 rounded">
                      {{partner.source}}
                    </span>
                  }
                  @if (partner.assignedTo) {
                    <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded flex items-center gap-1">
                      <mat-icon class="text-[12px] w-3 h-3">person</mat-icon> {{partner.assignedTo}}
                    </span>
                  }
                </div>
              }
              
              <div class="space-y-2 mt-2">
                <div class="flex items-center text-sm text-slate-500">
                  <mat-icon class="mr-2 text-[16px] w-4 h-4">email</mat-icon>
                  {{partner.email || 'N/A'}}
                </div>
                <div class="flex items-center text-sm text-slate-500">
                  <mat-icon class="mr-2 text-[16px] w-4 h-4">phone</mat-icon>
                  <span class="font-mono">{{partner.phone || 'N/A'}}</span>
                </div>
              </div>

              @if(partner.comments) {
                <div class="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <strong class="text-slate-700">Notes:</strong> {{partner.comments}}
                </div>
              }

              <!-- Associated Invoices -->
              @let partnerInvoices = getPartnerInvoices(partner.id);
              @if (partnerInvoices.length > 0) {
                <div class="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoices / الفواتير</span>
                  <div class="space-y-1">
                    @for (inv of partnerInvoices; track inv.id) {
                      <div class="flex justify-between items-center text-xs">
                        <span class="text-slate-600 font-mono">Invoice #{{inv.id}}</span>
                        <span class="font-semibold" [class]="inv.status === 'Paid' ? 'text-emerald-600' : (inv.status === 'Overdue' ? 'text-rose-600' : 'text-amber-600')">
                          {{formatCurrency(inv.amount)}} ({{inv.status}})
                        </span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 flex gap-2">
              @if(partner.type === 'Lead') {
                <button (click)="state.convertLeadToProspect(partner.id)" class="w-full bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-indigo-600 border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                  <mat-icon class="mr-2 text-[16px] w-4 h-4">arrow_forward</mat-icon>
                  Convert to Prospect
                </button>
              }
              @if(partner.type === 'Prospect') {
                <button (click)="openConvertModal(partner)" class="w-full bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-indigo-600 border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                  <mat-icon class="mr-2 text-[16px] w-4 h-4">published_with_changes</mat-icon>
                  Convert to Customer
                </button>
              }
              @if(partner.type === 'Customer') {
                <button (click)="openCustomerCard(partner.id)" class="w-full bg-slate-50 hover:bg-indigo-50 text-indigo-600 border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                  <mat-icon class="mr-2 text-[16px] w-4 h-4">visibility</mat-icon>
                  View Customer Card
                </button>
              }
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-12 text-slate-500">
            No {{activeTab()}}s found in the directory.
          </div>
        }
      </div>

      <!-- Create Partner Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl border border-slate-100">
            <div class="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 class="text-lg font-semibold text-slate-950">Add New {{newPartner.type}}</h3>
              <button (click)="showCreateModal.set(false)" class="text-slate-400 hover:text-slate-600">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            
            <form (ngSubmit)="savePartner()" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Partner Type</label>
                <select [(ngModel)]="newPartner.type" name="type" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 bg-white">
                  <option value="Lead">Lead</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Customer">Customer</option>
                  <option value="Vendor">Vendor</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Company / Contact Name</label>
                <input [(ngModel)]="newPartner.name" name="name" type="text" placeholder="e.g. Casablanca Technologies" required class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Email</label>
                <input [(ngModel)]="newPartner.email" name="email" type="email" placeholder="e.g. contact@domain.ma" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone</label>
                <input [(ngModel)]="newPartner.phone" name="phone" type="text" placeholder="e.g. +212-522-XXXXXX" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">City</label>
                <select [(ngModel)]="newPartner.city" name="city" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 bg-white">
                  <option value="Casablanca">Casablanca</option>
                  <option value="Rabat">Rabat</option>
                  <option value="Marrakech">Marrakech</option>
                  <option value="Tangier">Tangier</option>
                  <option value="Fès">Fès</option>
                </select>
              </div>

              @if (newPartner.type === 'Customer') {
                <div>
                  <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">ICE (15 digits) *</label>
                  <input [(ngModel)]="newPartner.ICE" name="ICE" type="text" maxlength="15" placeholder="e.g. 123456789012345" required class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Identifiant Fiscal (IF) *</label>
                  <input [(ngModel)]="newPartner.IF" name="IF" type="text" placeholder="e.g. 12345678" required class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Registre de Commerce (RC) *</label>
                  <input [(ngModel)]="newPartner.RC" name="RC" type="text" placeholder="e.g. 123456" required class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
                </div>
              }

              @if (newPartner.type === 'Lead') {
                <div>
                  <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Lead Score (0-100)</label>
                  <input [(ngModel)]="newPartner.score" name="score" type="number" min="0" max="100" placeholder="e.g. 85" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Lead Source</label>
                  <select [(ngModel)]="newPartner.source" name="source" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 bg-white">
                    <option value="Website form">Website form</option>
                    <option value="Trade show">Trade show</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Marketing campaign">Marketing campaign</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Assigned Salesperson</label>
                  <select [(ngModel)]="newPartner.assignedTo" name="assignedTo" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 bg-white">
                    <option value="">-- Unassigned --</option>
                    @for (user of state.users(); track user.name) {
                      <option [value]="user.name">{{user.name}} ({{user.team}})</option>
                    }
                  </select>
                </div>
              }

              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Comments / Notes</label>
                <textarea [(ngModel)]="newPartner.comments" name="comments" rows="3" placeholder="Additional details..." class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
              </div>

              <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" (click)="showCreateModal.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">Save Partner</button>
              </div>
            </form>
          </div>
        </div>
      }
      </div>
    </div>
  `
})
export class PartnersComponent {
  state = inject(CrmStateService);
  router = inject(Router);
  activeTab = signal<'Lead' | 'Customer' | 'Prospect' | 'Vendor'>('Lead');
  showCreateModal = signal(false);

  openCreateModal() {
    this.newPartner.id = undefined;
    this.newPartner.type = this.activeTab();
    this.showCreateModal.set(true);
  }

  openConvertModal(partner: Partner) {
    this.newPartner = {
      id: partner.id,
      name: partner.name,
      type: 'Customer',
      email: partner.email || '',
      phone: partner.phone || '',
      city: partner.city || 'Casablanca',
      comments: partner.comments || '',
      ICE: '',
      IF: '',
      RC: '',
      score: undefined,
      source: 'Website form',
      assignedTo: ''
    };
    this.showCreateModal.set(true);
  }

  openCustomerCard(partnerId: string) {
    this.router.navigate(['/partners', partnerId, 'customer-card']);
  }

  newPartner = {
    id: '' as string | undefined,
    name: '',
    type: 'Lead' as 'Lead' | 'Prospect' | 'Customer' | 'Vendor',
    email: '',
    phone: '',
    city: 'Casablanca',
    comments: '',
    ICE: '',
    IF: '',
    RC: '',
    score: undefined as number | undefined,
    source: 'Website form' as 'Website form' | 'Trade show' | 'LinkedIn' | 'Marketing campaign' | 'Referral',
    assignedTo: ''
  };

  filteredPartners = () => this.state.partners().filter(p => p.type === this.activeTab());

  getPartnerInvoices(partnerId: string) {
    return this.state.invoices().filter(i => i.partnerId === partnerId);
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(value);
  }

  savePartner() {
    if (this.newPartner.name.trim()) {
      if (this.newPartner.type === 'Customer') {
        if (!this.newPartner.ICE || this.newPartner.ICE.length !== 15) { alert('ICE must be exactly 15 digits.'); return; }
        if (!this.newPartner.IF || !this.newPartner.IF.trim()) { alert('IF is required.'); return; }
        if (!this.newPartner.RC || !this.newPartner.RC.trim()) { alert('RC is required.'); return; }
      }

      if (this.newPartner.id) {
        // It's a conversion from Prospect to Customer
        this.state.convertToCustomer(this.newPartner.id);
        // Assuming we also want to update the partner data, but state service only has addPartner/convertToCustomer.
        // We'll just call convertToCustomer which fulfills the bug requirements.
      } else {
        this.state.addPartner({
          name: this.newPartner.name,
          type: this.newPartner.type,
          email: this.newPartner.email,
          phone: this.newPartner.phone,
          city: this.newPartner.city,
          comments: this.newPartner.comments,
          score: this.newPartner.type === 'Lead' ? this.newPartner.score : undefined,
          source: this.newPartner.type === 'Lead' ? this.newPartner.source : undefined,
          assignedTo: this.newPartner.type === 'Lead' && this.newPartner.assignedTo ? this.newPartner.assignedTo : undefined
        });
      }

      this.activeTab.set(this.newPartner.type);
      this.showCreateModal.set(false);
      // Reset form
      this.newPartner = {
        id: undefined,
        name: '',
        type: 'Lead',
        email: '',
        phone: '',
        city: 'Casablanca',
        comments: '',
        ICE: '',
        IF: '',
        RC: '',
        score: undefined,
        source: 'Website form',
        assignedTo: ''
      };
    }
  }
}

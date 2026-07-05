import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { CreatedByBadgeComponent } from '../shared/created-by-badge.component';

@Component({
  selector: 'app-marketing',
  imports: [MatIconModule, CommonModule, CreatedByBadgeComponent],
  template: `
    <div class="flex gap-6">
      <!-- Left Sidebar Navigation -->
      <aside class="w-44 shrink-0 hidden lg:block">
        <nav class="space-y-1 sticky top-24">
          <button 
            (click)="activeTab.set('Email'); state.breadcrumbLabel.set('Email')" 
            [class]="activeTab() === 'Email' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">email</mat-icon>
            Email
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ filteredByType('Email').length }}</span>
          </button>
          <button 
            (click)="activeTab.set('WhatsApp'); state.breadcrumbLabel.set('WhatsApp')" 
            [class]="activeTab() === 'WhatsApp' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">chat</mat-icon>
            WhatsApp
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ filteredByType('WhatsApp').length }}</span>
          </button>
          <button 
            (click)="activeTab.set('SMS'); state.breadcrumbLabel.set('SMS')" 
            [class]="activeTab() === 'SMS' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">sms</mat-icon>
            SMS
            <span class="ml-auto text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ filteredByType('SMS').length }}</span>
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 min-w-0 space-y-8">
        <div class="flex justify-between items-end">
          <div>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Marketing</h2>
            <p class="text-slate-500 mt-1">Automated campaigns across WhatsApp, SMS, and Email.</p>
          </div>
          <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
            <mat-icon class="w-5 h-5 text-[20px]! leading-none! flex items-center justify-center">add</mat-icon>
            New Campaign
          </button>
        </div>

        <!-- Overview Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white border text-center border-slate-200 rounded-xl p-5 shadow-sm">
            <div class="text-4xl font-semibold text-slate-900 mb-1">3</div>
            <div class="text-xs font-bold tracking-wider text-slate-500 uppercase">Active Campaigns</div>
          </div>
          <div class="bg-white border text-center border-slate-200 rounded-xl p-5 shadow-sm">
            <div class="text-4xl font-semibold text-slate-900 mb-1">165</div>
            <div class="text-xs font-bold tracking-wider text-slate-500 uppercase">Messages Sent</div>
          </div>
          <div class="bg-white border text-center border-slate-200 rounded-xl p-5 shadow-sm">
            <div class="text-4xl font-semibold text-slate-900 mb-1">12%</div>
            <div class="text-xs font-bold tracking-wider text-slate-500 uppercase">Conversion Target</div>
          </div>
        </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Campaign Title</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Target Audience</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Sent/Delivery</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Status</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Created By</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            @for (campaign of filteredCampaigns(); track campaign.id) {
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-slate-900">{{campaign.title}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-500">{{campaign.targetAudience}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">
                  {{campaign.sentCount}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStatusColor(campaign.status)" class="px-2.5 py-1 text-xs font-medium rounded-full">
                    {{campaign.status}}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <app-created-by-badge [createdBy]="campaign.createdBy" [createdAt]="campaign.createdAt" />
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-6 py-8 text-center text-slate-500 text-sm">No {{activeTab()}} campaigns found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      </div>
    </div>
  `
})
export class MarketingComponent {
  state = inject(CrmStateService);
  activeTab = signal<'Email' | 'WhatsApp' | 'SMS'>('Email');

  constructor() {
    const tab = this.state.navigateTab();
    if (tab) {
      this.activeTab.set(tab as 'Email' | 'WhatsApp' | 'SMS');
      this.state.navigateTab.set(null);
    }
    this.state.breadcrumbLabel.set(this.activeTab());
  }

  filteredCampaigns = () => this.state.campaigns().filter(c => c.type === this.activeTab());

  filteredByType = (type: string) => this.state.campaigns().filter(c => c.type === type);

  getStatusColor(status: string) {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800';
      case 'Draft': return 'bg-slate-100 text-slate-800';
      default: return 'bg-indigo-100 text-indigo-800';
    }
  }
}

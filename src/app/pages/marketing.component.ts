import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { CreatedByBadgeComponent } from '../shared/created-by-badge.component';
import { DataStatusBannerComponent } from '../shared/data-status-banner.component';

@Component({
  selector: 'app-marketing',
  imports: [MatIconModule, CommonModule, CreatedByBadgeComponent, DataStatusBannerComponent],
  template: `
    <div class="space-y-8">
      <app-data-status-banner [loading]="state.campaignsLoading()" [error]="state.campaignsError()" />
      <div class="flex gap-5 sm:gap-6 border-b border-zinc-200">
        <button
          (click)="activeTab.set('Email'); state.breadcrumbLabel.set('Email')"
          [class]="activeTab() === 'Email' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'"
          class="px-1 py-3 -mb-px border-b-2 text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <mat-icon class="text-[18px] w-[18px] h-[18px]">email</mat-icon>
          Email
          <span class="text-xs">{{ filteredByType('Email').length }}</span>
        </button>
        <button
          (click)="activeTab.set('WhatsApp'); state.breadcrumbLabel.set('WhatsApp')"
          [class]="activeTab() === 'WhatsApp' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'"
          class="px-1 py-3 -mb-px border-b-2 text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <mat-icon class="text-[18px] w-[18px] h-[18px]">chat</mat-icon>
          WhatsApp
          <span class="text-xs">{{ filteredByType('WhatsApp').length }}</span>
        </button>
        <button
          (click)="activeTab.set('SMS'); state.breadcrumbLabel.set('SMS')"
          [class]="activeTab() === 'SMS' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'"
          class="px-1 py-3 -mb-px border-b-2 text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <mat-icon class="text-[18px] w-[18px] h-[18px]">sms</mat-icon>
          SMS
          <span class="text-xs">{{ filteredByType('SMS').length }}</span>
        </button>
      </div>
      <div class="flex justify-end">
          <button class="bg-zinc-900 hover:bg-zinc-950 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-lg shadow-zinc-300">
            <mat-icon class="w-5 h-5 text-[20px]! leading-none! flex items-center justify-center">add</mat-icon>
            New Campaign
          </button>
        </div>

        <!-- Overview Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card rounded-xl p-4 lg:p-5 text-center">
            <div class="text-xl sm:text-2xl lg:text-3xl font-semibold text-zinc-900 mb-1 truncate">3</div>
            <div class="text-xs font-bold tracking-wider text-zinc-500 uppercase">Active Campaigns</div>
          </div>
          <div class="card rounded-xl p-4 lg:p-5 text-center">
            <div class="text-xl sm:text-2xl lg:text-3xl font-semibold text-zinc-900 mb-1 truncate">165</div>
            <div class="text-xs font-bold tracking-wider text-zinc-500 uppercase">Messages Sent</div>
          </div>
          <div class="card rounded-xl p-4 lg:p-5 text-center">
            <div class="text-xl sm:text-2xl lg:text-3xl font-semibold text-zinc-900 mb-1 truncate">12%</div>
            <div class="text-xs font-bold tracking-wider text-zinc-500 uppercase">Conversion Target</div>
          </div>
        </div>

      <div class="card rounded-2xl overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-white border border-zinc-200">
            <tr>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-zinc-500 uppercase tracking-wider text-xs">Campaign Title</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-zinc-500 uppercase tracking-wider text-xs">Target Audience</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-zinc-500 uppercase tracking-wider text-xs">Sent/Delivery</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-zinc-500 uppercase tracking-wider text-xs">Status</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-zinc-500 uppercase tracking-wider text-xs">Created By</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            @for (campaign of filteredCampaigns(); track campaign.id) {
              <tr class="hover:bg-zinc-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-zinc-900">{{campaign.title}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-zinc-500">{{campaign.targetAudience}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-zinc-600">
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
                <td colspan="5" class="px-6 py-8 text-center text-zinc-500 text-sm">No {{activeTab()}} campaigns found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    `})
export class MarketingComponent {
  state = inject(CrmStateService);
  activeTab = signal<'Email' | 'WhatsApp' | 'SMS'>('Email');

  constructor() {
    this.state.loadCampaigns();
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
      case 'Active': return 'bg-zinc-200 text-zinc-950';
      case 'Draft': return 'bg-zinc-100 text-zinc-800';
      default: return 'bg-zinc-200 text-zinc-950';
    }
  }
}

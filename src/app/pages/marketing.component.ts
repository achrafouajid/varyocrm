import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marketing',
  imports: [MatIconModule, CommonModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8">
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Marketing</h2>
          <p class="text-slate-500 mt-1">Automated campaigns across WhatsApp, SMS, and Email.</p>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
          <mat-icon class="mr-2 text-sm! w-5 h-5 leading-none!">add</mat-icon>
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

      <div class="flex space-x-1 border-b border-slate-200">
        <button 
          (click)="activeTab.set('Email')" 
          [class]="activeTab() === 'Email' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
          class="px-4 py-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2">
          <mat-icon class="text-[18px] w-[18px] h-[18px]">email</mat-icon> Email
        </button>
        <button 
          (click)="activeTab.set('WhatsApp')" 
          [class]="activeTab() === 'WhatsApp' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
          class="px-4 py-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2">
          <mat-icon class="text-[18px] w-[18px] h-[18px]">chat</mat-icon> WhatsApp
        </button>
        <button 
          (click)="activeTab.set('SMS')" 
          [class]="activeTab() === 'SMS' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
          class="px-4 py-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2">
          <mat-icon class="text-[18px] w-[18px] h-[18px]">sms</mat-icon> SMS
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Campaign Title</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Target Audience</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Sent/Delivery</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Status</th>
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
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-6 py-8 text-center text-slate-500 text-sm">No {{activeTab()}} campaigns found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class MarketingComponent {
  state = inject(CrmStateService);
  activeTab = signal<'Email' | 'WhatsApp' | 'SMS'>('Email');

  filteredCampaigns = () => this.state.campaigns().filter(c => c.type === this.activeTab());

  getStatusColor(status: string) {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800';
      case 'Draft': return 'bg-slate-100 text-slate-800';
      default: return 'bg-indigo-100 text-indigo-800';
    }
  }
}

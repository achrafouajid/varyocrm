import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService, Lead, LeadActivity, LeadAttachment } from '../services/crm-state.service';

@Component({
  selector: 'app-leads',
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-3xl font-extrabold tracking-tight text-slate-900">Leads Management</h2>
          <p class="text-slate-500 mt-1">Qualify opportunities, track interactions, and manage sales pipeline.</p>
        </div>
        <button (click)="openAddLeadModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 shadow-md hover:shadow-lg focus:outline-none">
          <mat-icon class="w-5 h-5 text-[20px]! leading-none!">add</mat-icon>
          Add New Lead
        </button>
      </div>

      <!-- KPI Metrics Dashboard -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Metric 1: Total Leads -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-xs">
          <div class="space-y-1">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads</span>
            <div class="text-3xl font-bold text-slate-900">{{ totalLeadsCount() }}</div>
          </div>
          <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <mat-icon class="w-6 h-6 text-[24px]! leading-none!">people_outline</mat-icon>
          </div>
        </div>

        <!-- Metric 2: Qualified Leads -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-xs">
          <div class="space-y-1">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Qualified Leads</span>
            <div class="text-3xl font-bold text-slate-900">{{ qualifiedLeadsCount() }}</div>
          </div>
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <mat-icon class="w-6 h-6 text-[24px]! leading-none!">verified_user</mat-icon>
          </div>
        </div>

        <!-- Metric 3: Avg Score -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-xs">
          <div class="space-y-1">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Lead Score</span>
            <div class="text-3xl font-bold text-slate-900">{{ avgLeadScore() }}%</div>
          </div>
          <div class="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <mat-icon class="w-6 h-6 text-[24px]! leading-none!">star_outline</mat-icon>
          </div>
        </div>

        <!-- Metric 4: Est. Pipeline -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-xs">
          <div class="space-y-1">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Value</span>
            <div class="text-3xl font-bold text-slate-900">€{{ pipelineValue() | number:'1.0-0' }}</div>
          </div>
          <div class="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <mat-icon class="w-6 h-6 text-[24px]! leading-none!">euro_symbol</mat-icon>
          </div>
        </div>
      </div>

      <!-- Filters & Data Table Container -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <!-- Table Toolbar / Filters -->
        <div class="p-5 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
          <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <!-- Search -->
            <div class="relative flex-1 sm:w-64">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <mat-icon class="w-5 h-5 text-[20px]!">search</mat-icon>
              </span>
              <input
                [(ngModel)]="searchQuery"
                type="text"
                placeholder="Search name, company..."
                class="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              >
            </div>
            <!-- Status Filter -->
            <select [(ngModel)]="statusFilter" class="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Attempted Contact">Attempted Contact</option>
              <option value="Meeting Scheduled">Meeting Scheduled</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Requested">Proposal Requested</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
              <option value="Disqualified">Disqualified</option>
            </select>
            <!-- Priority Filter -->
            <select [(ngModel)]="priorityFilter" class="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div class="text-xs text-slate-400 font-semibold uppercase">
            Showing {{ filteredLeads().length }} of {{ state.leads().length }} leads
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100">
            <thead class="bg-slate-50/50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Lead</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Company & Job</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Qualification</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Lead Score</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Value</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Owner</th>
                <th scope="col" class="px-6 py-3 class-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200/80 bg-white">
              @for (lead of filteredLeads(); track lead.id) {
                <tr (click)="selectLead(lead)" class="hover:bg-indigo-50/20 transition-colors cursor-pointer group">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-10 bg-indigo-100/80 text-indigo-700 font-bold rounded-xl flex items-center justify-center shadow-xs">
                        {{ getInitials(lead.name) }}
                      </div>
                      <div>
                        <div class="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{{ lead.name }}</div>
                        <div class="text-xs text-slate-400">{{ lead.id }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-slate-800">{{ lead.companyName }}</div>
                    <div class="text-xs text-slate-400">{{ lead.company?.city || 'No city' }}, {{ lead.company?.country || 'No country' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                      <span [class]="getPriorityBadge(lead.priority)" class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md">
                        {{ lead.priority }}
                      </span>
                      <span [class]="getTempBadge(lead.temperature)" class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md">
                        {{ lead.temperature }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div class="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div [style.width.%]="lead.score" [class]="getScoreColor(lead.score)" class="h-full rounded-full"></div>
                      </div>
                      <span class="text-xs font-bold text-slate-700">{{ lead.score }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-slate-900">
                      {{ lead.estimatedDealValue ? '€' + (lead.estimatedDealValue | number) : '—' }}
                    </div>
                    <div class="text-xs text-slate-400">{{ lead.probability ? lead.probability + '%' : '—' }} prob.</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-600 flex items-center gap-1.5">
                      <mat-icon class="w-4 h-4 text-[16px]! text-slate-400">person_outline</mat-icon>
                      {{ lead.assignedSalesperson || 'Unassigned' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getStatusClass(lead.status)" class="px-2.5 py-1 text-xs font-semibold rounded-full shadow-xs">
                      {{ lead.status }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                    <mat-icon class="text-[48px]! w-12 h-12 mb-3 text-slate-300 block mx-auto">people_alt</mat-icon>
                    <p class="font-semibold text-slate-500">No leads found</p>
                    <p class="text-xs text-slate-400 mt-1">Try resetting filters or adding a new lead record.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Slide-over details pane for lead -->
    @if (selectedLead(); as lead) {
      <div class="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <div class="absolute inset-0 overflow-hidden">
          <!-- Backdrop -->
          <div (click)="closeDetails()" class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"></div>

          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div class="pointer-events-auto w-screen max-w-2xl transform bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              <!-- Header -->
              <div class="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="h-12 w-12 bg-indigo-600 text-white font-extrabold rounded-xl flex items-center justify-center shadow-md">
                    {{ getInitials(lead.name) }}
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-slate-900" id="slide-over-title">{{ lead.name }}</h2>
                    <p class="text-xs text-slate-400 font-semibold">{{ lead.id }} &bull; {{ lead.companyName }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <!-- Change Status Quick Dropdown -->
                  <div class="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Status:</span>
                    <select [ngModel]="lead.status" (ngModelChange)="onStatusChange(lead.id, $event)" class="text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer">
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Attempted Contact">Attempted Contact</option>
                      <option value="Meeting Scheduled">Meeting Scheduled</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal Requested">Proposal Requested</option>
                      <option value="Converted">Converted</option>
                      <option value="Lost">Lost</option>
                      <option value="Disqualified">Disqualified</option>
                    </select>
                  </div>

                  <button (click)="closeDetails()" class="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg">
                    <mat-icon class="w-5 h-5 text-[20px]! leading-none!">close</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Tabs Nav -->
              <div class="px-6 border-b border-slate-100 flex gap-6 bg-slate-50/50">
                <button (click)="activeDetailTab.set('info')" [class.border-indigo-600]="activeDetailTab() === 'info'" [class.text-indigo-600]="activeDetailTab() === 'info'" class="py-3 border-b-2 border-transparent text-sm font-semibold text-slate-500 hover:text-slate-800 transition-all">Info</button>
                <button (click)="activeDetailTab.set('activities')" [class.border-indigo-600]="activeDetailTab() === 'activities'" [class.text-indigo-600]="activeDetailTab() === 'activities'" class="py-3 border-b-2 border-transparent text-sm font-semibold text-slate-500 hover:text-slate-800 transition-all">Activities & Notes</button>
                <button (click)="activeDetailTab.set('attachments')" [class.border-indigo-600]="activeDetailTab() === 'attachments'" [class.text-indigo-600]="activeDetailTab() === 'attachments'" class="py-3 border-b-2 border-transparent text-sm font-semibold text-slate-500 hover:text-slate-800 transition-all">Attachments</button>
                <button (click)="activeDetailTab.set('history')" [class.border-indigo-600]="activeDetailTab() === 'history'" [class.text-indigo-600]="activeDetailTab() === 'history'" class="py-3 border-b-2 border-transparent text-sm font-semibold text-slate-500 hover:text-slate-800 transition-all">Status History</button>
              </div>

              <!-- Scrollable content -->
              <div class="flex-1 overflow-y-auto p-6 space-y-6">
                <!-- TAB: Info -->
                @if (activeDetailTab() === 'info') {
                  <div class="space-y-6 animate-in fade-in duration-100">
                    <!-- Basic Information -->
                    <div class="bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-3">
                      <h3 class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Basic Information</h3>
                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Lead Name</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.name }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Company</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.companyName }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Assigned Salesperson</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.assignedSalesperson || 'Unassigned' }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Sales Team</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.salesTeam || '—' }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Email</div>
                          <a href="mailto:{{ lead.contacts?.[0]?.email }}" class="font-medium text-indigo-600 hover:underline mt-0.5 block">{{ lead.contacts?.[0]?.email || '—' }}</a>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Phone</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.contacts?.[0]?.phone || '—' }}</div>
                        </div>
                        @if (lead.contacts?.[0]?.website; as web) {
                          <div>
                            <div class="text-[10px] uppercase font-semibold text-slate-400">Website</div>
                            <a href="http://{{web}}" target="_blank" class="font-medium text-indigo-600 hover:underline mt-0.5 block">{{ web }}</a>
                          </div>
                        }
                        @if (lead.contacts?.[0]?.linkedin; as li) {
                          <div>
                            <div class="text-[10px] uppercase font-semibold text-slate-400">LinkedIn</div>
                            <a href="http://{{li}}" target="_blank" class="font-medium text-indigo-600 hover:underline mt-0.5 block">{{ li }}</a>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Company Information -->
                    <div class="bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-3">
                      <h3 class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Company Information</h3>
                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Industry</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.company?.industry || '—' }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Company Size</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.company?.size || '—' }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Annual Revenue</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.company?.annualRevenue || '—' }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Offices Count</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.company?.officesCount || '—' }}</div>
                        </div>
                        <div class="col-span-2">
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Address</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.company?.address || '—' }}, {{ lead.company?.city || '—' }}, {{ lead.company?.country || '—' }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Lead Source & Campaign -->
                    <div class="bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-3">
                      <h3 class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Source & Marketing Campaign</h3>
                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Lead Source</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.campaigns?.[0]?.source || '—' }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Campaign</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.campaigns?.[0]?.campaign || '—' }}</div>
                        </div>
                        @if (lead.campaigns?.[0]?.referralPartner) {
                          <div>
                            <div class="text-[10px] uppercase font-semibold text-slate-400">Referral Partner</div>
                            <div class="font-medium text-slate-800 mt-0.5">{{ lead.campaigns?.[0]?.referralPartner }}</div>
                          </div>
                        }
                        @if (lead.campaigns?.[0]?.tradeShow) {
                          <div>
                            <div class="text-[10px] uppercase font-semibold text-slate-400">Trade Show</div>
                            <div class="font-medium text-slate-800 mt-0.5">{{ lead.campaigns?.[0]?.tradeShow }}</div>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Decision Makers -->
                    <div class="bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-3">
                      <h3 class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Key Stakeholders (B2B)</h3>
                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Decision Maker</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.decisionMaker || '—' }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Influencer</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.influencer || '—' }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Finance Contact</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.financeContact || '—' }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Technical Contact</div>
                          <div class="font-medium text-slate-800 mt-0.5">{{ lead.technicalContact || '—' }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Audit Trail -->
                    <div class="bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-3">
                      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Trail</h3>
                      <div class="grid grid-cols-2 gap-4 text-[11px] text-slate-500">
                        <div>
                          <div>Created Date</div>
                          <div class="font-semibold text-slate-700 mt-0.5">{{ lead.createdDate }} by {{ lead.createdBy }}</div>
                        </div>
                        <div>
                          <div>Modified Date</div>
                          <div class="font-semibold text-slate-700 mt-0.5">{{ lead.modifiedDate }} by {{ lead.modifiedBy }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- TAB: Activities & Notes -->
                @if (activeDetailTab() === 'activities') {
                  <div class="space-y-6 animate-in fade-in duration-100">
                    <!-- Product Interest & Budget details -->
                    <div class="bg-indigo-50/40 rounded-xl p-4 border border-indigo-100 space-y-3 text-sm">
                      <h3 class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Lead Qualification & Sales Potential</h3>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Interested Product</div>
                          <div class="font-semibold text-slate-850 mt-0.5">{{ lead.productInterests?.[0]?.product || '—' }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Solution</div>
                          <div class="font-medium text-slate-700 mt-0.5">{{ lead.productInterests?.[0]?.solution || '—' }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Estimated Budget</div>
                          <div class="font-bold text-indigo-700 mt-0.5">€{{ (lead.estimatedDealValue || 0) | number }}</div>
                        </div>
                        <div>
                          <div class="text-[10px] uppercase font-semibold text-slate-400">Deal Probability</div>
                          <div class="font-medium text-slate-750 mt-0.5">{{ lead.probability || '0' }}%</div>
                        </div>
                      </div>
                    </div>

                    <!-- Free text Notes -->
                    <div class="space-y-2">
                      <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Notes & Comments</label>
                      <div class="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 text-sm text-slate-700 leading-relaxed font-sans shadow-xs whitespace-pre-line">
                        {{ lead.notes || 'No notes added for this lead yet.' }}
                      </div>
                    </div>

                    <!-- Log New Activity Form -->
                    <div class="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                      <h3 class="text-xs font-bold text-slate-700 uppercase">Log New Activity</h3>
                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <label class="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Type</label>
                          <select [(ngModel)]="newActivity.type" class="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white focus:outline-indigo-600">
                            <option value="Call">Call</option>
                            <option value="Email">Email</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Note">Note</option>
                            <option value="Task">Task</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Date</label>
                          <input [(ngModel)]="newActivity.date" type="date" class="w-full border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600">
                        </div>
                      </div>
                      <div>
                        <label class="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Summary</label>
                        <input [(ngModel)]="newActivity.summary" type="text" placeholder="e.g. Discussed pricing options" class="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-indigo-600">
                      </div>
                      <div>
                        <label class="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Details (Optional)</label>
                        <textarea [(ngModel)]="newActivity.detail" rows="2" placeholder="More detailed recap..." class="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-indigo-600"></textarea>
                      </div>
                      <div class="flex justify-end pt-2">
                        <button (click)="submitActivity(lead.id)" class="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs">
                          Log Activity
                        </button>
                      </div>
                    </div>

                    <!-- Activity History Timeline -->
                    <div class="space-y-4">
                      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Interactions Timeline</h3>
                      <div class="space-y-4">
                        @for (act of lead.activities; track act.id) {
                          <div class="flex gap-4 items-start border-l-2 border-slate-100 pl-4 relative">
                            <div class="absolute -left-1.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-white flex items-center justify-center"
                                 [class]="getActivityIconClass(act.type)">
                            </div>
                            <div class="flex-1 space-y-1">
                              <div class="flex justify-between items-center">
                                <span class="text-xs font-semibold text-slate-800">{{ act.summary }}</span>
                                <span class="text-[10px] text-slate-400 font-medium">{{ act.date }}</span>
                              </div>
                              @if (act.detail) {
                                <p class="text-xs text-slate-500 leading-relaxed">{{ act.detail }}</p>
                              }
                              <div class="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
                                <span class="px-1.5 py-0.5 rounded bg-slate-100">{{ act.type }}</span>
                                @if (act.assignedTo) {
                                  <span>Assigned: {{ act.assignedTo }}</span>
                                }
                              </div>
                            </div>
                          </div>
                        } @empty {
                          <p class="text-xs text-slate-400 text-center py-4">No logged interactions yet.</p>
                        }
                      </div>
                    </div>
                  </div>
                }

                <!-- TAB: Attachments -->
                @if (activeDetailTab() === 'attachments') {
                  <div class="space-y-6 animate-in fade-in duration-100">
                    <div class="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                      <h3 class="text-xs font-bold text-slate-700 uppercase">Upload Document (Mock)</h3>
                      <div class="flex gap-3">
                        <input [(ngModel)]="newAttachmentName" type="text" placeholder="e.g. Business_Card.png" class="flex-1 border border-slate-200 rounded-lg p-2 text-xs focus:outline-indigo-600">
                        <button (click)="submitAttachment(lead.id)" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-xs">
                          Upload File
                        </button>
                      </div>
                    </div>

                    <div class="space-y-3">
                      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Uploaded Files</h3>
                      <div class="divide-y divide-slate-100 bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden">
                        @for (file of lead.attachments; track file.id) {
                          <div class="px-4 py-3 flex justify-between items-center text-xs">
                            <div class="flex items-center gap-2.5">
                              <mat-icon class="text-slate-400 text-[20px]! w-5 h-5">insert_drive_file</mat-icon>
                              <div>
                                <div class="font-medium text-slate-800">{{ file.fileName }}</div>
                                <div class="text-[10px] text-slate-400">Uploaded: {{ file.uploadedAt }} &bull; {{ file.fileSize || 'N/A' }}</div>
                              </div>
                            </div>
                            <button class="text-slate-400 hover:text-rose-600 transition-colors">
                              <mat-icon class="text-[16px]! w-4 h-4">delete_outline</mat-icon>
                            </button>
                          </div>
                        } @empty {
                          <p class="text-xs text-slate-400 text-center py-6">No attachments uploaded yet.</p>
                        }
                      </div>
                    </div>
                  </div>
                }

                <!-- TAB: Status History -->
                @if (activeDetailTab() === 'history') {
                  <div class="space-y-4 animate-in fade-in duration-100">
                    <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Transition Log</h3>
                    <div class="space-y-4">
                      @for (hist of lead.statusHistory; track $index) {
                        <div class="flex gap-4 items-start pl-4 border-l-2 border-slate-100 relative">
                          <div class="absolute -left-1.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-600"></div>
                          <div class="flex-1 text-xs">
                            <div class="flex justify-between font-semibold text-slate-800">
                              <span>Status updated to: {{ hist.status }}</span>
                              <span class="text-[10px] text-slate-400 font-medium">{{ hist.timestamp }}</span>
                            </div>
                            <div class="text-[10px] text-slate-400 font-medium mt-0.5">Changed by: {{ hist.user }}</div>
                          </div>
                        </div>
                      } @empty {
                        <p class="text-xs text-slate-400 text-center py-4">No status changes logged.</p>
                      }
                    </div>
                  </div>
                }
              </div>

            </div>
          </div>
        </div>
      </div>
    }

    <!-- Add Lead Modal -->
    @if (addLeadModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
          
          <div class="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 class="text-lg font-bold text-slate-950">Add New Lead Record</h3>
            <button (click)="addLeadModalOpen.set(false)" class="text-slate-400 hover:text-slate-600 transition-colors">
              <mat-icon class="w-5 h-5 text-[20px]! leading-none!">close</mat-icon>
            </button>
          </div>

          <div class="space-y-4 text-xs font-sans">
            <!-- Basic Section -->
            <div class="space-y-2.5">
              <h4 class="font-bold text-indigo-700 uppercase tracking-wider text-[10px]">1. Basic Information</h4>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Lead Name*</label>
                  <input [(ngModel)]="newLead.name" type="text" placeholder="e.g. John Doe" class="w-full border border-slate-200 rounded-lg p-2 focus:outline-indigo-600">
                </div>
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Company Name*</label>
                  <input [(ngModel)]="newLead.companyName" type="text" placeholder="e.g. Acmo Group" class="w-full border border-slate-200 rounded-lg p-2 focus:outline-indigo-600">
                </div>
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Email</label>
                  <input [(ngModel)]="newLead.email" type="email" placeholder="e.g. email@acmo.com" class="w-full border border-slate-200 rounded-lg p-2 focus:outline-indigo-600">
                </div>
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Phone</label>
                  <input [(ngModel)]="newLead.phone" type="text" placeholder="e.g. +212-6..." class="w-full border border-slate-200 rounded-lg p-2 focus:outline-indigo-600">
                </div>
              </div>
            </div>

            <!-- Company Section -->
            <div class="space-y-2.5">
              <h4 class="font-bold text-indigo-700 uppercase tracking-wider text-[10px]">2. Company Information</h4>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Industry</label>
                  <input [(ngModel)]="newLead.industry" type="text" placeholder="e.g. Healthcare" class="w-full border border-slate-200 rounded-lg p-2 focus:outline-indigo-600">
                </div>
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Company Size</label>
                  <input [(ngModel)]="newLead.companySize" type="text" placeholder="e.g. 200 employees" class="w-full border border-slate-200 rounded-lg p-2 focus:outline-indigo-600">
                </div>
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">City</label>
                  <input [(ngModel)]="newLead.city" type="text" placeholder="Casablanca" class="w-full border border-slate-200 rounded-lg p-2 focus:outline-indigo-600">
                </div>
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Country</label>
                  <input [(ngModel)]="newLead.country" type="text" placeholder="Morocco" class="w-full border border-slate-200 rounded-lg p-2 focus:outline-indigo-600">
                </div>
              </div>
            </div>

            <!-- Qualification & Source -->
            <div class="space-y-2.5">
              <h4 class="font-bold text-indigo-700 uppercase tracking-wider text-[10px]">3. Qualification & Source</h4>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Status</label>
                  <select [(ngModel)]="newLead.status" class="w-full border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-600">
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Attempted Contact">Attempted Contact</option>
                    <option value="Meeting Scheduled">Meeting Scheduled</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Requested">Proposal Requested</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                    <option value="Disqualified">Disqualified</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Priority</label>
                  <select [(ngModel)]="newLead.priority" class="w-full border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-600">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Temperature</label>
                  <select [(ngModel)]="newLead.temperature" class="w-full border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-600">
                    <option value="Cold">Cold</option>
                    <option value="Warm">Warm</option>
                    <option value="Hot">Hot</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Lead Source</label>
                  <input [(ngModel)]="newLead.source" type="text" placeholder="Website, Social Media..." class="w-full border border-slate-200 rounded-lg p-2 focus:outline-indigo-600">
                </div>
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Product Interest</label>
                  <input [(ngModel)]="newLead.interestedProduct" type="text" placeholder="e.g. Cloud Hosting" class="w-full border border-slate-200 rounded-lg p-2 focus:outline-indigo-600">
                </div>
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Est. Budget (€)</label>
                  <input [(ngModel)]="newLead.estimatedBudget" type="number" placeholder="e.g. 50000" class="w-full border border-slate-200 rounded-lg p-2 focus:outline-indigo-600">
                </div>
                <div>
                  <label class="block font-semibold text-slate-500 mb-1">Assigned Salesperson</label>
                  <select [(ngModel)]="newLead.assignedSalesperson" class="w-full border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-600">
                    <option value="">-- Unassigned --</option>
                    @for (user of state.users(); track user.name) {
                      <option [value]="user.name">{{ user.name }} ({{ user.role }})</option>
                    }
                  </select>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block font-semibold text-slate-500 mb-1">Notes</label>
              <textarea [(ngModel)]="newLead.notes" rows="3" placeholder="Evaluate legacy systems, downtime concerns, etc." class="w-full border border-slate-200 rounded-lg p-2 focus:outline-indigo-600"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
            <button (click)="addLeadModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button (click)="saveLead()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm">
              Save Lead Record
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class LeadsComponent {
  state = inject(CrmStateService);

  // Filters state
  searchQuery = '';
  statusFilter = '';
  priorityFilter = '';

  // Modals & Panels state
  selectedLead = signal<Lead | null>(null);
  activeDetailTab = signal<'info' | 'activities' | 'attachments' | 'history'>('info');
  addLeadModalOpen = signal(false);

  // Forms state
  newActivity = {
    type: 'Call' as LeadActivity['type'],
    date: new Date().toISOString().split('T')[0],
    summary: '',
    detail: ''
  };

  newAttachmentName = '';

  newLead = {
    name: '',
    companyName: '',
    email: '',
    phone: '',
    industry: '',
    companySize: '',
    city: '',
    country: '',
    status: 'New' as Lead['status'],
    priority: 'Medium' as Lead['priority'],
    temperature: 'Warm' as Lead['temperature'],
    source: '',
    interestedProduct: '',
    estimatedBudget: 0,
    assignedSalesperson: '',
    notes: ''
  };

  // KPI Computations
  totalLeadsCount = computed(() => this.state.leads().length);
  qualifiedLeadsCount = computed(() => this.state.leads().filter(l => l.status === 'Qualified').length);
  avgLeadScore = computed(() => {
    const list = this.state.leads();
    if (list.length === 0) return 0;
    const total = list.reduce((sum, l) => sum + l.score, 0);
    return Math.round(total / list.length);
  });
  pipelineValue = computed(() => {
    return this.state.leads()
      .filter(l => ['New', 'Contacted', 'Attempted Contact', 'Meeting Scheduled', 'Qualified', 'Proposal Requested'].includes(l.status))
      .reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);
  });

  // Filtered Leads list
  filteredLeads = computed(() => {
    let list = this.state.leads();

    if (this.statusFilter) {
      list = list.filter(l => l.status === this.statusFilter);
    }
    if (this.priorityFilter) {
      list = list.filter(l => l.priority === this.priorityFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(l => 
        l.name.toLowerCase().includes(q) || 
        l.companyName.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      );
    }
    return list;
  });

  // Lifecycle/Selection actions
  selectLead(lead: Lead) {
    this.selectedLead.set(lead);
    this.activeDetailTab.set('info');
    // reset activity form
    this.newActivity = {
      type: 'Call',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      detail: ''
    };
    this.newAttachmentName = '';
  }

  closeDetails() {
    this.selectedLead.set(null);
  }

  onStatusChange(leadId: string, status: Lead['status']) {
    this.state.updateLeadStatus(leadId, status);
    // Refresh details reference in signals
    const updated = this.state.leads().find(l => l.id === leadId);
    if (updated) {
      this.selectedLead.set(updated);
    }
  }

  // Activity submit
  submitActivity(leadId: string) {
    if (!this.newActivity.summary.trim()) return;
    this.state.addLeadActivity(leadId, {
      type: this.newActivity.type,
      date: this.newActivity.date,
      summary: this.newActivity.summary,
      detail: this.newActivity.detail,
      assignedTo: 'Achraf (Manager)'
    });

    // Refresh details reference
    const updated = this.state.leads().find(l => l.id === leadId);
    if (updated) {
      this.selectedLead.set(updated);
    }

    // Reset activity form
    this.newActivity = {
      type: 'Call',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      detail: ''
    };
  }

  // Attachment submit
  submitAttachment(leadId: string) {
    if (!this.newAttachmentName.trim()) return;
    this.state.addLeadAttachment(leadId, {
      fileName: this.newAttachmentName,
      fileSize: '1.5 MB',
      uploadedAt: new Date().toISOString().split('T')[0]
    });

    const updated = this.state.leads().find(l => l.id === leadId);
    if (updated) {
      this.selectedLead.set(updated);
    }
    this.newAttachmentName = '';
  }

  // Add Lead Modal handlers
  openAddLeadModal() {
    this.newLead = {
      name: '',
      companyName: '',
      email: '',
      phone: '',
      industry: '',
      companySize: '',
      city: '',
      country: '',
      status: 'New',
      priority: 'Medium',
      temperature: 'Warm',
      source: 'Website',
      interestedProduct: '',
      estimatedBudget: 0,
      assignedSalesperson: this.state.users()[0]?.name || '',
      notes: ''
    };
    this.addLeadModalOpen.set(true);
  }

  saveLead() {
    if (!this.newLead.name.trim() || !this.newLead.companyName.trim()) {
      alert('Lead Name and Company Name are required.');
      return;
    }

    const randomScore = Math.floor(Math.random() * 40) + 50; // 50 to 90
    this.state.addLead({
      name: this.newLead.name,
      companyName: this.newLead.companyName,
      status: this.newLead.status,
      qualification: this.newLead.status === 'Qualified' ? 'Qualified' : 'Pending',
      priority: this.newLead.priority,
      score: randomScore,
      temperature: this.newLead.temperature,
      stage: 'Discovery Meeting',
      assignedSalesperson: this.newLead.assignedSalesperson,
      salesTeam: 'Enterprise Sales',
      territory: this.newLead.country || 'International',
      businessUnit: 'Cloud Solutions',
      decisionMaker: 'IT Manager',
      estimatedDealValue: this.newLead.estimatedBudget,
      probability: this.newLead.status === 'Qualified' ? 70 : 30,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days out
      notes: this.newLead.notes,
      company: {
        industry: this.newLead.industry,
        size: this.newLead.companySize,
        city: this.newLead.city,
        country: this.newLead.country,
        address: 'Main Office Address'
      },
      contacts: [
        {
          id: 'lc-' + Date.now(),
          name: this.newLead.name,
          email: this.newLead.email,
          phone: this.newLead.phone,
          mobile: this.newLead.phone
        }
      ],
      campaigns: [
        {
          source: this.newLead.source,
          campaign: 'General Lead Capture'
        }
      ],
      productInterests: [
        {
          product: this.newLead.interestedProduct,
          solution: 'Cloud Solution Integration'
        }
      ]
    });

    this.addLeadModalOpen.set(false);
  }

  // Helpers
  getInitials(name: string): string {
    if (!name) return 'LD';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-sky-100 text-sky-800';
      case 'Attempted Contact': return 'bg-amber-100 text-amber-800';
      case 'Meeting Scheduled': return 'bg-indigo-100 text-indigo-800';
      case 'Qualified': return 'bg-emerald-100 text-emerald-800';
      case 'Proposal Requested': return 'bg-purple-100 text-purple-800';
      case 'Converted': return 'bg-teal-100 text-teal-800';
      case 'Lost': return 'bg-rose-100 text-rose-800';
      case 'Disqualified': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  getPriorityBadge(priority: string): string {
    switch(priority) {
      case 'High': return 'bg-rose-50 text-rose-600 border border-rose-100';
      case 'Medium': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'Low': return 'bg-slate-50 text-slate-600 border border-slate-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  }

  getTempBadge(temp: string): string {
    switch(temp) {
      case 'Hot': return 'bg-orange-50 text-orange-600 border border-orange-100';
      case 'Warm': return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'Cold': return 'bg-sky-50 text-sky-600 border border-sky-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'bg-emerald-600';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  }

  getActivityIconClass(type: string): string {
    switch(type) {
      case 'Call': return 'bg-sky-500 border-sky-200';
      case 'Email': return 'bg-indigo-500 border-indigo-200';
      case 'Meeting': return 'bg-emerald-500 border-emerald-200';
      case 'Task': return 'bg-amber-500 border-amber-200';
      default: return 'bg-slate-500 border-slate-200';
    }
  }
}

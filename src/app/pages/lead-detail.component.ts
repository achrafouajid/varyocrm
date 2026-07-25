import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService, Lead, LeadActivity, LeadAttachment } from '../services/crm-state.service';
import { CreatedByBadgeComponent } from '../shared/created-by-badge.component';
import { UserAvatarComponent } from '../shared/user-avatar.component';

@Component({
  selector: 'app-lead-detail',
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink, CreatedByBadgeComponent, UserAvatarComponent],
  template: `
    <div class="space-y-6 font-sans max-w-5xl mx-auto">
      <a routerLink="/partners" class="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">arrow_back</mat-icon>
        Back to Partners
      </a>

      @if (lead(); as lead) {
        <!-- Header -->
        <div class="glass-card rounded-2xl p-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="h-14 w-14 glass-strong text-indigo-700 font-extrabold rounded-xl flex items-center justify-center text-lg">
                {{ getInitials(lead.name) }}
              </div>
              <div>
                <h2 class="text-2xl font-bold text-slate-900">{{ lead.name }}</h2>
                <p class="text-sm text-slate-500 font-semibold mt-0.5">{{ lead.id }} &bull; {{ lead.companyName }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span [class]="getStatusClass(lead.status)" class="px-2.5 py-1 text-xs font-semibold rounded-full glass-chip">{{ lead.status }}</span>
                  <span [class]="getPriorityBadge(lead.priority)" class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md glass-chip">{{ lead.priority }}</span>
                  <span [class]="getTempBadge(lead.temperature)" class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md glass-chip">{{ lead.temperature }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 glass-chip rounded-lg px-2 py-1">
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
              @if (lead.status !== 'Converted') {
                <button (click)="convertToProspect(lead)" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <mat-icon class="text-[14px] w-3.5 h-3.5">arrow_forward</mat-icon>
                  Convert to Prospect
                </button>
              }
            </div>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="glass-card rounded-2xl p-4">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lead Score</span>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex-1 bg-white/30 rounded-full h-2 overflow-hidden">
                <div [style.width.%]="lead.score" [class]="getScoreColor(lead.score)" class="h-full rounded-full"></div>
              </div>
              <span class="text-lg font-bold" [class]="lead.score >= 80 ? 'text-emerald-600' : lead.score >= 50 ? 'text-amber-600' : 'text-rose-600'">{{ lead.score }}</span>
            </div>
          </div>
          <div class="glass-card rounded-2xl p-4">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Value</span>
            <div class="text-lg font-bold text-slate-900 mt-1">{{ lead.estimatedDealValue ? '€' + (lead.estimatedDealValue | number) : '—' }}</div>
          </div>
          <div class="glass-card rounded-2xl p-4">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Probability</span>
            <div class="text-lg font-bold text-indigo-600 mt-1">{{ lead.probability || '0' }}%</div>
          </div>
          <div class="glass-card rounded-2xl p-4">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Close</span>
            <div class="text-lg font-bold text-slate-900 mt-1">{{ lead.expectedCloseDate || '—' }}</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="glass-card rounded-2xl overflow-hidden">
          <div class="px-6 border-b border-white/20 flex gap-6">
            <button (click)="activeTab.set('info')" [class]="activeTab() === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'" class="py-3 border-b-2 text-sm font-semibold transition-all">Info</button>
            <button (click)="activeTab.set('activities')" [class]="activeTab() === 'activities' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'" class="py-3 border-b-2 text-sm font-semibold transition-all">Activities & Notes</button>
            <button (click)="activeTab.set('attachments')" [class]="activeTab() === 'attachments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'" class="py-3 border-b-2 text-sm font-semibold transition-all">Attachments</button>
            <button (click)="activeTab.set('history')" [class]="activeTab() === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'" class="py-3 border-b-2 text-sm font-semibold transition-all">Status History</button>
          </div>

          <div class="p-6">
            @if (activeTab() === 'info') {
              <div class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Basic Information -->
                  <div class="glass rounded-xl p-5 space-y-3">
                    <h3 class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Basic Information</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Lead Name</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.name }}</div></div>
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Company</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.companyName }}</div></div>
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Assigned Salesperson</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.assignedSalesperson || 'Unassigned' }}</div></div>
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Sales Team</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.salesTeam || '—' }}</div></div>
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Email</div><a href="mailto:{{ lead.contacts?.[0]?.email }}" class="font-semibold text-indigo-600 hover:underline mt-0.5 block truncate">{{ lead.contacts?.[0]?.email || '—' }}</a></div>
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Phone</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.contacts?.[0]?.phone || '—' }}</div></div>
                      @if (lead.contacts?.[0]?.website; as web) {
                        <div><div class="text-[10px] uppercase font-semibold text-slate-400">Website</div><a href="http://{{web}}" target="_blank" class="font-semibold text-indigo-600 hover:underline mt-0.5 block truncate">{{ web }}</a></div>
                      }
                      @if (lead.contacts?.[0]?.linkedin; as li) {
                        <div><div class="text-[10px] uppercase font-semibold text-slate-400">LinkedIn</div><a href="http://{{li}}" target="_blank" class="font-semibold text-indigo-600 hover:underline mt-0.5 block truncate">{{ li }}</a></div>
                      }
                    </div>
                  </div>

                  <!-- Company Information -->
                  <div class="glass rounded-xl p-5 space-y-3">
                    <h3 class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Company Information</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Industry</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.company?.industry || '—' }}</div></div>
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Company Size</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.company?.size || '—' }}</div></div>
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Annual Revenue</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.company?.annualRevenue || '—' }}</div></div>
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Offices Count</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.company?.officesCount || '—' }}</div></div>
                      <div class="col-span-2"><div class="text-[10px] uppercase font-semibold text-slate-400">Address</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.company?.address || '—' }}, {{ lead.company?.city || '—' }}, {{ lead.company?.country || '—' }}</div></div>
                    </div>
                  </div>

                  <!-- Source & Campaign -->
                  <div class="glass rounded-xl p-5 space-y-3">
                    <h3 class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Source & Marketing Campaign</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Lead Source</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.campaigns?.[0]?.source || '—' }}</div></div>
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Campaign</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.campaigns?.[0]?.campaign || '—' }}</div></div>
                      @if (lead.campaigns?.[0]?.referralPartner) { <div><div class="text-[10px] uppercase font-semibold text-slate-400">Referral Partner</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.campaigns?.[0]?.referralPartner }}</div></div> }
                      @if (lead.campaigns?.[0]?.tradeShow) { <div><div class="text-[10px] uppercase font-semibold text-slate-400">Trade Show</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.campaigns?.[0]?.tradeShow }}</div></div> }
                    </div>
                  </div>

                  <!-- Key Stakeholders -->
                  <div class="glass rounded-xl p-5 space-y-3">
                    <h3 class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Key Stakeholders</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Decision Maker</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.decisionMaker || '—' }}</div></div>
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Influencer</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.influencer || '—' }}</div></div>
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Finance Contact</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.financeContact || '—' }}</div></div>
                      <div><div class="text-[10px] uppercase font-semibold text-slate-400">Technical Contact</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.technicalContact || '—' }}</div></div>
                    </div>
                  </div>
                </div>

                <!-- Audit Trail -->
                <div class="glass rounded-xl p-5">
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Trail</h3>
                  <div class="grid grid-cols-2 gap-4 text-xs text-slate-500 mt-3">
                    <div><div>Created By</div><div class="mt-1"><app-created-by-badge [createdBy]="lead.createdBy" [createdAt]="lead.createdDate" /></div></div>
                    <div><div>Modified</div><div class="font-semibold text-slate-700 mt-1">{{ lead.modifiedDate }} by <app-user-avatar [userId]="lead.modifiedBy" [size]="20" /> {{ getUserName(lead.modifiedBy) }}</div></div>
                  </div>
                </div>
              </div>
            }

            @if (activeTab() === 'activities') {
              <div class="space-y-6">
                <div class="glass rounded-xl p-5 text-sm">
                  <h3 class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Lead Qualification & Sales Potential</h3>
                  <div class="grid grid-cols-2 gap-4 mt-3">
                    <div><div class="text-[10px] uppercase font-semibold text-slate-400">Interested Product</div><div class="font-semibold text-slate-800 mt-0.5">{{ lead.productInterests?.[0]?.product || '—' }}</div></div>
                    <div><div class="text-[10px] uppercase font-semibold text-slate-400">Solution</div><div class="font-semibold text-slate-700 mt-0.5">{{ lead.productInterests?.[0]?.solution || '—' }}</div></div>
                    <div><div class="text-[10px] uppercase font-semibold text-slate-400">Estimated Budget</div><div class="font-bold text-indigo-700 mt-0.5">€{{ (lead.estimatedDealValue || 0) | number }}</div></div>
                    <div><div class="text-[10px] uppercase font-semibold text-slate-400">Deal Probability</div><div class="font-semibold text-slate-700 mt-0.5">{{ lead.probability || '0' }}%</div></div>
                  </div>
                </div>

                <div class="glass rounded-xl p-5">
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Notes & Comments</h3>
                  <div class="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-line">{{ lead.notes || 'No notes added for this lead yet.' }}</div>
                </div>

                <div class="glass-card rounded-xl p-5 space-y-3">
                  <h3 class="text-xs font-bold text-slate-700 uppercase">Log New Activity</h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Type</label>
                      <select [(ngModel)]="newActivity.type" class="w-full glass-input rounded-lg p-2 text-xs outline-none bg-transparent">
                        <option value="Call">Call</option><option value="Email">Email</option><option value="Meeting">Meeting</option><option value="Note">Note</option><option value="Task">Task</option>
                      </select></div>
                    <div><label class="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Date</label>
                      <input [(ngModel)]="newActivity.date" type="date" class="w-full glass-input rounded-lg p-1.5 text-xs outline-none"></div>
                  </div>
                  <div><label class="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Summary</label>
                    <input [(ngModel)]="newActivity.summary" type="text" placeholder="e.g. Discussed pricing options" class="w-full glass-input rounded-lg p-2 text-xs outline-none"></div>
                  <div><label class="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Details</label>
                    <textarea [(ngModel)]="newActivity.detail" rows="2" placeholder="More detailed recap..." class="w-full glass-input rounded-lg p-2 text-xs outline-none"></textarea></div>
                  <div class="flex justify-end pt-2">
                    <button (click)="submitActivity(lead.id)" class="bg-slate-800/80 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Log Activity</button>
                  </div>
                </div>

                <div class="space-y-4">
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Interactions Timeline</h3>
                  <div class="space-y-4">
                    @for (act of lead.activities; track act.id) {
                      <div class="flex gap-4 items-start border-l-2 border-white/30 pl-4 relative">
                        <div class="absolute -left-1.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-white flex items-center justify-center" [class]="getActivityIconClass(act.type)"></div>
                        <div class="flex-1 space-y-1">
                          <div class="flex justify-between items-center">
                            <span class="text-xs font-semibold text-slate-800">{{ act.summary }}</span>
                            <span class="text-[10px] text-slate-400 font-medium">{{ act.date }}</span>
                          </div>
                          @if (act.detail) { <p class="text-xs text-slate-500 leading-relaxed">{{ act.detail }}</p> }
                          <div class="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
                            <span class="px-1.5 py-0.5 rounded glass-chip">{{ act.type }}</span>
                            @if (act.assignedTo) { <span>Assigned: {{ act.assignedTo }}</span> }
                          </div>
                        </div>
                      </div>
                    } @empty { <p class="text-xs text-slate-400 text-center py-4">No logged interactions yet.</p> }
                  </div>
                </div>
              </div>
            }

            @if (activeTab() === 'attachments') {
              <div class="space-y-6">
                <div class="glass-card rounded-xl p-5 space-y-3">
                  <h3 class="text-xs font-bold text-slate-700 uppercase">Upload Document</h3>
                  <div class="flex gap-3">
                    <input [(ngModel)]="newAttachmentName" type="text" placeholder="e.g. Business_Card.png" class="flex-1 glass-input rounded-lg p-2 text-xs outline-none">
                    <button (click)="submitAttachment(lead.id)" class="bg-indigo-600/80 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-semibold">Upload File</button>
                  </div>
                </div>
                <div class="space-y-3">
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Uploaded Files</h3>
                  <div class="divide-y divide-white/20 glass rounded-xl overflow-hidden">
                    @for (file of lead.attachments; track file.id) {
                      <div class="px-4 py-3 flex justify-between items-center text-xs">
                        <div class="flex items-center gap-2.5">
                          <mat-icon class="text-slate-400 text-[20px]! w-5 h-5">insert_drive_file</mat-icon>
                          <div><div class="font-semibold text-slate-800">{{ file.fileName }}</div><div class="text-[10px] text-slate-400">Uploaded: {{ file.uploadedAt }} &bull; {{ file.fileSize || 'N/A' }}</div></div>
                        </div>
                        <button class="text-slate-400 hover:text-rose-600 transition-colors"><mat-icon class="text-[16px]! w-4 h-4">delete_outline</mat-icon></button>
                      </div>
                    } @empty { <p class="text-xs text-slate-400 text-center py-6">No attachments uploaded yet.</p> }
                  </div>
                </div>
              </div>
            }

            @if (activeTab() === 'history') {
              <div class="space-y-4">
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Transition Log</h3>
                <div class="space-y-4">
                  @for (hist of lead.statusHistory; track $index) {
                    <div class="flex gap-4 items-start pl-4 border-l-2 border-white/30 relative">
                      <div class="absolute -left-1.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-white glass-strong"></div>
                      <div class="flex-1 text-xs">
                        <div class="flex justify-between font-semibold text-slate-800">
                          <span>Status updated to: {{ hist.status }}</span>
                          <span class="text-[10px] text-slate-400 font-medium">{{ hist.timestamp }}</span>
                        </div>
                        <div class="text-[10px] text-slate-400 font-medium mt-0.5">Changed by: {{ hist.user }}</div>
                      </div>
                    </div>
                  } @empty { <p class="text-xs text-slate-400 text-center py-4">No status changes logged.</p> }
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="text-center py-20 text-slate-400">
          <mat-icon class="text-[48px]! w-12 h-12 mb-3 text-slate-300">filter_alt</mat-icon>
          <p class="font-semibold text-slate-500">Lead not found</p>
        </div>
      }
    </div>
  `
})
export class LeadDetailComponent {
  state = inject(CrmStateService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  activeTab = signal<'info' | 'activities' | 'attachments' | 'history'>('info');

  newActivity = {
    type: 'Call' as LeadActivity['type'],
    date: new Date().toISOString().split('T')[0],
    summary: '',
    detail: ''
  };

  newAttachmentName = '';

  lead = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return this.state.leadsData().find(l => l.id === id) || null;
  });

  onStatusChange(leadId: string, status: Lead['status']) {
    this.state.updateLeadStatus(leadId, status);
  }

  convertToProspect(lead: Lead) {
    this.state.convertLeadDataToProspect(lead);
    this.router.navigate(['/partners']);
  }

  submitActivity(leadId: string) {
    if (!this.newActivity.summary.trim()) return;
    this.state.addLeadActivity(leadId, {
      type: this.newActivity.type,
      date: this.newActivity.date,
      summary: this.newActivity.summary,
      detail: this.newActivity.detail,
      assignedTo: 'Achraf (Manager)'
    });
    this.newActivity = {
      type: 'Call',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      detail: ''
    };
  }

  submitAttachment(leadId: string) {
    if (!this.newAttachmentName.trim()) return;
    this.state.addLeadAttachment(leadId, {
      fileName: this.newAttachmentName,
      fileSize: '1.5 MB',
      uploadedAt: new Date().toISOString().split('T')[0]
    });
    this.newAttachmentName = '';
  }

  getInitials(name: string): string {
    if (!name) return 'LD';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getUserName(userId: string): string {
    return this.state.users().find(u => u.id === userId)?.displayName || userId;
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

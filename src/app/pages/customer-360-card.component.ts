import { Component, inject, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CrmStateService, Customer360View } from '../services/crm-state.service';

@Component({
  selector: 'app-customer-360',
  imports: [MatIconModule, CommonModule],
  template: `
    <div class="grid grid-cols-12 gap-6">

      <!-- ─── LEFT COLUMN (5/12) ────────────────────────── -->
      <div class="col-span-12 lg:col-span-5 space-y-6">

        <!-- Profile Card -->
        <div class="glass-card rounded-2xl p-8 flex flex-col items-center text-center hover:shadow-md transition-all">
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-extrabold text-3xl uppercase shadow-lg mb-4">
            {{ initials() }}
          </div>
          <h2 class="text-xl font-extrabold text-slate-900 font-sans">{{ view().partner.name }}</h2>
          <p class="text-sm text-slate-500 font-sans mt-1">{{ jobTitle() }}</p>
          <div class="flex items-center gap-3 mt-5">
            <button class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 flex items-center justify-center transition-all cursor-pointer">
              <mat-icon style="font-size:18px;width:18px;height:18px">call</mat-icon>
            </button>
            <button class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 flex items-center justify-center transition-all cursor-pointer">
              <mat-icon style="font-size:18px;width:18px;height:18px">mail</mat-icon>
            </button>
            <button class="w-10 h-10 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-100 flex items-center justify-center transition-all cursor-pointer">
              <mat-icon style="font-size:18px;width:18px;height:18px">chat</mat-icon>
            </button>
            <button class="w-10 h-10 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100 flex items-center justify-center transition-all cursor-pointer">
              <mat-icon style="font-size:18px;width:18px;height:18px">calendar_today</mat-icon>
            </button>
          </div>
        </div>

        <!-- Detailed Information Card -->
        <div class="glass-card rounded-2xl p-6 space-y-5 hover:shadow-md transition-all">
          <h3 class="text-sm font-bold text-slate-900 font-sans flex items-center gap-2">
            <mat-icon style="font-size:16px;width:16px;height:16px" class="text-indigo-500">badge</mat-icon>
            Detailed Information
          </h3>
          <div class="space-y-4">
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans block mb-1">First Name</span>
              <span class="text-sm font-semibold text-slate-800 font-sans">{{ firstName() }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans block mb-1">Last Name</span>
              <span class="text-sm font-semibold text-slate-800 font-sans">{{ lastName() }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans block mb-1">Email</span>
              <span class="text-sm font-semibold text-slate-800 font-sans truncate block">{{ view().partner.email || '—' }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans block mb-1">Phone</span>
              <span class="text-sm font-semibold text-slate-800 font-sans">{{ view().partner.phone || '—' }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans block mb-2">Sources</span>
              <div class="flex flex-wrap gap-2">
                @for (src of sources(); track src) {
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-sans uppercase tracking-wide border"
                        [class]="sourceBadgeClass(src)">
                    <mat-icon style="font-size:12px;width:12px;height:12px">{{ sourceIcon(src) }}</mat-icon>
                    {{ src }}
                  </span>
                }
              </div>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans block mb-1">Last Contacted</span>
              <span class="text-sm font-semibold text-slate-800 font-sans">{{ lastContacted() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── RIGHT COLUMN (7/12) ───────────────────────── -->
      <div class="col-span-12 lg:col-span-7 space-y-6">

        <!-- Interaction History Card -->
        <div class="glass-card rounded-2xl p-6 hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
              <div class="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <mat-icon style="font-size:16px;width:16px;height:16px">history</mat-icon>
              </div>
              <h3 class="font-bold text-slate-900 text-sm font-sans">Interaction History</h3>
            </div>
            <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold font-sans">{{ recentOrders().length }}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (order of recentOrders(); track order.id) {
              <div class="p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50/30 transition-colors">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <span class="font-bold text-xs text-slate-800 font-sans leading-snug truncate" [title]="order.title">{{ order.title }}</span>
                  <span [class]="stageBadgeClass(order.stage)" class="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-bold font-sans uppercase border whitespace-nowrap">{{ order.stage }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-bold font-mono text-xs text-indigo-600">{{ formatCurrency(order.amount) }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">{{ order.date || '—' }}</span>
                </div>
              </div>
            } @empty {
              <div class="col-span-2 text-center py-8 text-slate-400 text-xs italic font-sans">No transactions recorded</div>
            }
          </div>

          @if (teamMembers().length > 0) {
            <div class="mt-4 pt-4 border-t border-slate-100">
              <div class="flex items-center gap-3">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Team</span>
                <div class="flex -space-x-2">
                  @for (member of teamMembers(); track member.name) {
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-sans border-2 border-white shadow-sm"
                         [style.background]="member.color"
                         [title]="member.name + ' (' + member.role + ')'">
                      {{ member.initials }}
                    </div>
                  }
                </div>
                <span class="text-[10px] text-slate-400 font-sans">{{ teamMembers().length }} members</span>
              </div>
            </div>
          }
        </div>

        <!-- Bottom Row: Task Schedule + Stage Funnel -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Task Schedule Card -->
          <div class="glass-card rounded-2xl p-6 hover:shadow-md transition-all">
            <div class="flex items-center gap-2 mb-4">
              <div class="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <mat-icon style="font-size:16px;width:16px;height:16px">event_note</mat-icon>
              </div>
              <h3 class="font-bold text-slate-900 text-sm font-sans">Task Schedule</h3>
            </div>
            <div class="space-y-2.5">
              @for (item of scheduleItems(); track item.id) {
                <div class="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-amber-50/30 transition-colors">
                  <div class="w-2 h-2 rounded-full shrink-0"
                       [class]="item.type === 'task' ? (item.status === 'Completed' ? 'bg-emerald-500' : item.status === 'In Progress' ? 'bg-amber-500' : 'bg-slate-300') : 'bg-indigo-400'">
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="text-xs font-semibold text-slate-800 font-sans block truncate">{{ item.title }}</span>
                    <span class="text-[9px] text-slate-400 font-mono">{{ item.dateLabel }}</span>
                  </div>
                  @if (item.type === 'task') {
                    <span class="text-[9px] font-bold font-sans uppercase"
                          [class]="item.status === 'Completed' ? 'text-emerald-600' : item.status === 'In Progress' ? 'text-amber-600' : 'text-slate-400'">
                      {{ item.status }}
                    </span>
                  }
                </div>
              } @empty {
                <div class="text-center py-6 text-slate-400 text-xs italic font-sans">No scheduled tasks</div>
              }
            </div>
          </div>

          <!-- Stage Funnel Card -->
          <div class="glass-card rounded-2xl p-6 hover:shadow-md transition-all">
            <div class="flex items-center gap-2 mb-4">
              <div class="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <mat-icon style="font-size:16px;width:16px;height:16px">funnel</mat-icon>
              </div>
              <h3 class="font-bold text-slate-900 text-sm font-sans">Stage Funnel</h3>
            </div>
            <div class="space-y-4">
              <div class="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                <span class="text-[10px] font-bold text-indigo-500 uppercase tracking-wider font-sans block mb-1">Weighted Value</span>
                <span class="text-xl font-bold font-mono text-indigo-700">{{ formatCurrency(weightedValue()) }}</span>
                <div class="flex items-center gap-1 mt-1">
                  <mat-icon style="font-size:12px;width:12px;height:12px" class="text-indigo-400">trending_up</mat-icon>
                  <span class="text-[10px] font-semibold text-indigo-400 font-sans">Probability adjusted</span>
                </div>
              </div>
              <div class="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <span class="text-[10px] font-bold text-emerald-500 uppercase tracking-wider font-sans block mb-1">Total Value</span>
                <span class="text-xl font-bold font-mono text-emerald-700">{{ formatCurrency(totalValue()) }}</span>
                <div class="flex items-center gap-1 mt-1">
                  <mat-icon style="font-size:12px;width:12px;height:12px" class="text-emerald-400">account_balance</mat-icon>
                  <span class="text-[10px] font-semibold text-emerald-400 font-sans">All deals pipeline</span>
                </div>
              </div>
              @if (stageBreakdown().length > 0) {
                <div class="pt-2 border-t border-slate-100 space-y-1.5">
                  @for (item of stageBreakdown(); track item.stage) {
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="w-1.5 h-1.5 rounded-full shrink-0" [style.background]="item.color"></div>
                        <span class="text-[10px] font-semibold text-slate-500 font-sans truncate">{{ item.stage }}</span>
                      </div>
                      <div class="flex items-center gap-3 shrink-0">
                        <span class="text-[10px] font-bold font-mono text-slate-600">{{ formatCurrency(item.value) }}</span>
                        <span class="text-[9px] font-bold font-mono text-slate-400">({{ item.count }})</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: contents; }
  `]
})
export class Customer360Component {
  state = inject(CrmStateService);
  view = input.required<Customer360View>();

  primaryContact = computed(() => this.view().contacts[0] ?? null);

  initials = computed(() => {
    const name = this.view().partner.name;
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  jobTitle = computed(() => this.primaryContact()?.jobTitle || 'Customer');

  firstName = computed(() => {
    const contact = this.primaryContact();
    if (contact) {
      const parts = contact.name.trim().split(/\s+/);
      return parts[0] || '—';
    }
    const parts = this.view().partner.name.trim().split(/\s+/);
    return parts[0] || '—';
  });

  lastName = computed(() => {
    const contact = this.primaryContact();
    if (contact) {
      const parts = contact.name.trim().split(/\s+/);
      return parts.length > 1 ? parts.slice(1).join(' ') : '—';
    }
    const parts = this.view().partner.name.trim().split(/\s+/);
    return parts.length > 1 ? parts.slice(1).join(' ') : '—';
  });

  sources = computed(() => {
    const set = new Set<string>();
    const partner = this.view().partner;
    if (partner.source) set.add(partner.source);
    for (const o of this.view().orders) {
      const deal = this.state.deals().find(d => d.id === o.id);
      if (deal?.activityLog) {
        if (deal.activityLog.calls.length) set.add('Call');
        if (deal.activityLog.emails.length) set.add('Email');
        if (deal.activityLog.meetings.some(m => m.type === 'teams')) set.add('Teams');
        if (deal.activityLog.meetings.some(m => m.type === 'in-person' || m.type === 'demo')) set.add('In-Person');
      }
    }
    if (this.view().tickets.length) set.add('Support');
    return Array.from(set);
  });

  lastContacted = computed(() => {
    const dates: string[] = [];
    for (const o of this.view().orders) {
      if (o.date) dates.push(o.date);
      const deal = this.state.deals().find(d => d.id === o.id);
      if (deal?.activityLog) {
        for (const c of deal.activityLog.calls) dates.push(c.date);
        for (const e of deal.activityLog.emails) dates.push(e.date);
        for (const m of deal.activityLog.meetings) dates.push(m.date);
      }
    }
    for (const m of this.view().meetings) dates.push(m.date);
    if (!dates.length) return 'No interactions yet';
    return [...dates].sort().reverse()[0];
  });

  recentOrders = computed(() => {
    return [...this.view().orders]
      .sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      })
      .slice(0, 6);
  });

  teamMembers = computed(() => {
    const set = new Set<string>();
    const partnerId = this.view().partner.id;
    for (const o of this.view().orders) {
      const deal = this.state.deals().find(d => d.id === o.id);
      if (deal?.salesPerson) set.add(deal.salesPerson);
      if (deal?.activityLog) {
        for (const m of deal.activityLog.meetings) {
          for (const a of m.attendees) set.add(a);
        }
        for (const c of deal.activityLog.calls) set.add(c.callerName);
      }
    }
    for (const t of this.state.tickets().filter(tk => tk.partnerId === partnerId)) {
      if (t.assignedTo) set.add(t.assignedTo);
    }
    return Array.from(set).map(name => {
      const user = this.state.users().find(
        u => u.displayName === name || u.displayName.includes(name) || name.includes(u.displayName)
      );
      if (user) {
        const team = this.state.teams().find(t => t.id === user.teamId);
        return {
          name: user.displayName,
          initials: user.initials,
          color: user.avatarColor,
          role: team?.name || user.jobTitle || ''
        };
      }
      const initials = name.split(/\s+/).filter(Boolean).map(p => p[0]).join('').toUpperCase().slice(0, 2);
      const colors = ['#7F77DD', '#1D9E75', '#D85A30', '#378ADD', '#BA7517', '#D4537E'];
      return { name, initials, color: colors[name.length % colors.length], role: '' };
    });
  });

  scheduleItems = computed(() => {
    const partnerId = this.view().partner.id;
    const partnerName = this.view().partner.name;
    const items: { id: string; title: string; dateLabel: string; type: 'task' | 'meeting'; status?: string }[] = [];

    for (const t of this.state.tasks()) {
      if (t.relatedEntityId === partnerId || (t.relatedTo && t.relatedTo.includes(partnerName))) {
        items.push({ id: t.id, title: t.title, dateLabel: t.createdAt, type: 'task', status: t.status });
      }
    }
    for (const o of this.view().orders) {
      const deal = this.state.deals().find(d => d.id === o.id);
      if (deal?.activityLog) {
        for (const m of deal.activityLog.meetings) {
          if (!items.some(i => i.title === m.title)) {
            items.push({ id: m.id, title: m.title, dateLabel: m.date + ' · ' + m.time, type: 'meeting' });
          }
        }
      }
    }
    return items.sort((a, b) => b.dateLabel.localeCompare(a.dateLabel));
  });

  weightedValue = computed(() => {
    return Math.round(this.view().orders.reduce((sum, o) => sum + o.amount * this.stageWeight(o.stage), 0));
  });

  totalValue = computed(() => this.view().orders.reduce((sum, o) => sum + o.amount, 0));

  stageBreakdown = computed(() => {
    const map = new Map<string, { value: number; count: number }>();
    for (const o of this.view().orders) {
      const entry = map.get(o.stage) || { value: 0, count: 0 };
      entry.value += o.amount;
      entry.count += 1;
      map.set(o.stage, entry);
    }
    const colors: Record<string, string> = {
      'New': '#378ADD', 'Proposal sent': '#BA7517', 'Confirmed': '#1D9E75',
      'Awaiting Invoicing': '#7F77DD', 'Invoiced': '#D4537E', 'Closed Won': '#059669',
      'Closed Lost': '#DC2626'
    };
    return Array.from(map.entries()).map(([stage, data]) => ({
      stage,
      value: data.value,
      count: data.count,
      color: colors[stage] || '#94A3B8'
    }));
  });

  formatCurrency(value: number) {
    const cur = this.state.globalCurrency();
    const locale = cur === 'MAD' ? 'fr-MA' : cur === 'EUR' ? 'fr-FR' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(value);
  }

  stageWeight(stage: string): number {
    switch (stage) {
      case 'Closed Won': return 1;
      case 'Invoiced': return 0.95;
      case 'Awaiting Invoicing': return 0.9;
      case 'Confirmed': return 0.85;
      case 'Proposal sent': return 0.5;
      case 'New': return 0.2;
      case 'Closed Lost': return 0;
      default: return 0.3;
    }
  }

  stageBadgeClass(stage: string): string {
    switch (stage) {
      case 'Confirmed':
      case 'Closed Won': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Awaiting Invoicing':
      case 'Invoiced': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'New':
      case 'Proposal sent': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Closed Lost': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  sourceBadgeClass(source: string): string {
    switch (source) {
      case 'LinkedIn': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Call': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Email': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Teams': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'In-Person': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Support': return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'Website form': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Referral': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Marketing campaign': return 'bg-pink-50 text-pink-700 border-pink-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  sourceIcon(source: string): string {
    switch (source) {
      case 'LinkedIn': return 'business';
      case 'Call': return 'call';
      case 'Email': return 'mail';
      case 'Teams': return 'video_camera_front';
      case 'In-Person': return 'location_on';
      case 'Support': return 'headset_mic';
      case 'Website form': return 'public';
      case 'Referral': return 'group_add';
      case 'Marketing campaign': return 'campaign';
      default: return 'source';
    }
  }
}

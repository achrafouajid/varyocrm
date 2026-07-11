import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService, Ticket } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreatedByBadgeComponent } from '../shared/created-by-badge.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tickets',
  imports: [MatIconModule, CommonModule, FormsModule, CreatedByBadgeComponent, RouterModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8">
      <div class="flex justify-end">
        <button (click)="openNewTicketModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-lg shadow-indigo-200">
          <mat-icon class="w-5 h-5 text-[20px]! leading-none! flex items-center justify-center">add</mat-icon>
          New Ticket
        </button>
      </div>

      @if (activePriorityFilter()) {
        <div class="flex items-center gap-2">
          <div class="glass rounded-xl px-4 py-2 flex items-center gap-2 text-sm">
            <mat-icon class="text-[18px] w-4.5 h-4.5 text-amber-500">filter_alt</mat-icon>
            <span class="font-semibold text-slate-700">Filtered by priority:</span>
            <span [class]="activePriorityFilter() === 'High' ? 'bg-rose-100 text-rose-700' : activePriorityFilter() === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'" class="px-2 py-0.5 rounded text-xs font-bold">{{activePriorityFilter()}}</span>
            <button (click)="clearFilter()" class="text-slate-400 hover:text-slate-600 ml-1 transition-colors">
              <mat-icon class="text-[16px] w-4 h-4">close</mat-icon>
            </button>
          </div>
          <span class="text-xs text-slate-400 font-medium">{{ filteredTickets().length }} ticket{{ filteredTickets().length !== 1 ? 's' : '' }}</span>
        </div>
      }

      <div class="glass-card rounded-2xl overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="glass">
            <tr>
              <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Priority</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Subject / Title</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Type</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Related Partner</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Assignee</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Status</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Created By</th>
              <th scope="col" class="px-6 py-3 text-right font-medium text-slate-500 uppercase tracking-wider text-xs">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            @for (ticket of filteredTickets(); track ticket.id) {
              <tr class="hover:bg-slate-50 transition-colors">
                <td (click)="openEditTicketModal(ticket)" class="px-6 py-4 whitespace-nowrap cursor-pointer">
                  <div class="flex items-center">
                    <mat-icon [class]="getPriorityColor(ticket.priority)" class="text-[18px] w-5 h-5">flag</mat-icon>
                    <span class="ml-1.5 text-xs font-medium text-slate-500">{{ ticket.priority }}</span>
                  </div>
                </td>
                <td (click)="openEditTicketModal(ticket)" class="px-6 py-4 cursor-pointer">
                  <div class="text-sm font-medium text-slate-900">{{ticket.title}}</div>
                  @if (ticket.resolution) {
                    <div class="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
                      <mat-icon class="text-[12px] w-3 h-3">done_all</mat-icon>
                      <span class="truncate max-w-xs" [title]="ticket.resolution">{{ticket.resolution}}</span>
                    </div>
                  }
                </td>
                <td (click)="openEditTicketModal(ticket)" class="px-6 py-4 whitespace-nowrap cursor-pointer text-sm text-slate-600">
                  <span class="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-md border border-slate-200 font-medium">
                    {{ticket.type || 'N/A'}}
                  </span>
                </td>
                <td (click)="openEditTicketModal(ticket)" class="px-6 py-4 whitespace-nowrap cursor-pointer text-sm text-slate-500">
                  {{getPartnerName(ticket.partnerId)}}
                </td>
                <td (click)="openEditTicketModal(ticket)" class="px-6 py-4 whitespace-nowrap cursor-pointer text-sm text-slate-600">
                  <div class="flex items-center gap-2">
                    <div class="h-5 w-5 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-[9px] font-bold text-indigo-600 uppercase">
                      {{ticket.assignedTo ? ticket.assignedTo.substring(0,1) : 'U'}}
                    </div>
                    {{ticket.assignedTo || 'Unassigned'}}
                  </div>
                </td>
                <td (click)="openEditTicketModal(ticket)" class="px-6 py-4 whitespace-nowrap cursor-pointer">
                  <span [class]="getStatusColor(ticket.status)" class="px-2.5 py-1 text-xs font-semibold rounded-full border">
                    {{ticket.status}}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <app-created-by-badge [createdBy]="ticket.createdBy" [createdAt]="ticket.createdAt" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button (click)="deleteTicket(ticket.id)" class="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors" title="Delete Ticket">
                    <mat-icon class="text-[18px] w-4.5 h-4.5">delete</mat-icon>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="px-6 py-12 text-center text-slate-400 text-sm">
                  <mat-icon class="text-[40px]! w-10 h-10 mb-2 text-slate-300 block mx-auto">support_agent</mat-icon>
                  No tickets found. Create one to get started.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Ticket Modal (Create / Edit) -->
    @if (modalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="glass-dialog rounded-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-950">
              {{ isEditing() ? 'Edit Support Ticket' : 'New Support Ticket' }}
            </h3>
            <button (click)="modalOpen.set(false)" class="text-slate-400 hover:text-slate-600 transition-colors">
              <mat-icon class="w-5 h-5 text-[20px]! leading-none!">close</mat-icon>
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Subject / Title *</label>
              <input
                [(ngModel)]="newTicket.title"
                type="text"
                placeholder="e.g. Login issue on client portal"
                class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600"
              >
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Ticket Type</label>
                <select [(ngModel)]="newTicket.type" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                  @for (t of state.ticketTypes(); track t) {
                    <option [value]="t">{{ t }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Related Partner</label>
                <select [(ngModel)]="newTicket.partnerId" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                  <option value="">-- Select Partner --</option>
                  @for (p of state.partners(); track p.id) {
                    <option [value]="p.id">{{p.name}} ({{p.type}})</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Assigned To</label>
              <select [(ngModel)]="newTicket.assignedTo" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                <option value="">-- Select Assignee --</option>
                @for (user of state.users(); track user.name) {
                  <option [value]="user.name">{{user.name}} ({{user.role}})</option>
                }
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Priority</label>
                <select [(ngModel)]="newTicket.priority" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                <select [(ngModel)]="newTicket.status" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <!-- Resolution Field: Displayed only if status is Resolved or Closed -->
            @if (newTicket.status === 'Resolved' || newTicket.status === 'Closed') {
              <div class="animate-in slide-in-from-top-2 duration-200">
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Resolution Details *</label>
                <textarea
                  [(ngModel)]="newTicket.resolution"
                  rows="3"
                  placeholder="Describe how this issue was resolved..."
                  class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600"
                ></textarea>
              </div>
            }
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-white/30">
            <button (click)="modalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button (click)="saveTicket()" [disabled]="!newTicket.title.trim() || ((newTicket.status === 'Resolved' || newTicket.status === 'Closed') && !newTicket.resolution.trim())" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm shadow-lg shadow-indigo-200">
              {{ isEditing() ? 'Save Changes' : 'Create Ticket' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class TicketsComponent {
  state = inject(CrmStateService);
  modalOpen = signal(false);
  isEditing = signal(false);
  editingTicketId = signal<string | null>(null);
  activePriorityFilter = signal<'High' | 'Medium' | 'Low' | null>(null);

  filteredTickets = computed(() => {
    const filter = this.activePriorityFilter();
    if (!filter) return this.state.tickets();
    return this.state.tickets().filter(t => t.priority === filter);
  });

  clearFilter() {
    this.activePriorityFilter.set(null);
  }

  constructor() {
    const filter = this.state.ticketFilter();
    if (filter?.priority && ['High', 'Medium', 'Low'].includes(filter.priority)) {
      this.activePriorityFilter.set(filter.priority as 'High' | 'Medium' | 'Low');
      this.state.ticketFilter.set(null);
    }
  }

  newTicket = {
    title: '',
    partnerId: '',
    assignedTo: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'Open' as 'Open' | 'In Progress' | 'Resolved' | 'Closed',
    type: 'Software issue',
    resolution: ''
  };

  openNewTicketModal() {
    this.isEditing.set(false);
    this.editingTicketId.set(null);
    this.newTicket = {
      title: '',
      partnerId: this.state.partners()[0]?.id || '',
      assignedTo: this.state.users()[0]?.name || '',
      priority: 'Medium',
      status: 'Open',
      type: this.state.ticketTypes()[0] || 'Software issue',
      resolution: ''
    };
    this.modalOpen.set(true);
  }

  openEditTicketModal(ticket: Ticket) {
    this.isEditing.set(true);
    this.editingTicketId.set(ticket.id);
    this.newTicket = {
      title: ticket.title,
      partnerId: ticket.partnerId,
      assignedTo: ticket.assignedTo,
      priority: ticket.priority,
      status: ticket.status,
      type: ticket.type || this.state.ticketTypes()[0] || 'Software issue',
      resolution: ticket.resolution || ''
    };
    this.modalOpen.set(true);
  }

  saveTicket() {
    if (!this.newTicket.title.trim()) return;

    if (this.newTicket.status !== 'Resolved' && this.newTicket.status !== 'Closed') {
      this.newTicket.resolution = '';
    }

    if (this.isEditing() && this.editingTicketId()) {
      this.state.updateTicket(this.editingTicketId()!, {
        title: this.newTicket.title,
        partnerId: this.newTicket.partnerId,
        assignedTo: this.newTicket.assignedTo,
        priority: this.newTicket.priority,
        status: this.newTicket.status,
        type: this.newTicket.type,
        resolution: this.newTicket.resolution
      });
    } else {
      this.state.addTicket({
        title: this.newTicket.title,
        partnerId: this.newTicket.partnerId,
        assignedTo: this.newTicket.assignedTo || 'Unassigned',
        status: this.newTicket.status,
        priority: this.newTicket.priority,
        type: this.newTicket.type,
        resolution: this.newTicket.resolution || undefined
      });
    }
    this.modalOpen.set(false);
  }

  deleteTicket(id: string) {
    if (confirm('Are you sure you want to delete this ticket?')) {
      this.state.deleteTicket(id);
    }
  }

  getPartnerName(id: string) {
    return this.state.partners().find(p => p.id === id)?.name || 'Unknown';
  }

  getPriorityColor(priority: string) {
    switch(priority) {
      case 'High': return 'text-rose-500';
      case 'Medium': return 'text-amber-500';
      case 'Low': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  }

  getStatusColor(status: string) {
    switch(status) {
      case 'Open': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }
}

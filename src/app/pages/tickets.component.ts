import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService, Ticket, TicketStatus } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreatedByBadgeComponent } from '../shared/created-by-badge.component';
import { RouterModule } from '@angular/router';
import { DataStatusBannerComponent } from '../shared/data-status-banner.component';
import { PaginatorComponent } from '../shared/paginator.component';

@Component({
  selector: 'app-tickets',
  imports: [MatIconModule, CommonModule, FormsModule, CreatedByBadgeComponent, RouterModule, DataStatusBannerComponent, PaginatorComponent],
  template: `
    <div class="space-y-8">
      <app-data-status-banner [loading]="state.ticketsLoading()" [error]="state.ticketsError()" />
      <div class="flex justify-end">
        <button (click)="openNewTicketModal()" class="bg-zinc-900 hover:bg-zinc-950 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-lg shadow-zinc-300">
          <mat-icon class="w-5 h-5 text-[20px]! leading-none! flex items-center justify-center">add</mat-icon>
          New Ticket
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2">
          <mat-icon class="text-[18px] w-4.5 h-4.5 text-zinc-500">filter_alt</mat-icon>
          <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Filters</span>
        </div>
        <select [ngModel]="priorityFilter()" (ngModelChange)="priorityFilter.set($event)" class="input-field rounded-lg p-2 text-sm focus:outline-blue-600 cursor-pointer w-40">
          <option [ngValue]="null">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)" class="input-field rounded-lg p-2 text-sm focus:outline-blue-600 cursor-pointer w-44">
          <option [ngValue]="null">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select [ngModel]="typeFilter()" (ngModelChange)="typeFilter.set($event)" class="input-field rounded-lg p-2 text-sm focus:outline-blue-600 cursor-pointer w-44">
          <option [ngValue]="null">All Types</option>
          @for (t of state.ticketTypes(); track t) {
            <option [value]="t">{{ t }}</option>
          }
        </select>
        @if (hasActiveFilters()) {
          <button (click)="clearFilters()" class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
            <mat-icon class="text-[14px] w-3.5 h-3.5">close</mat-icon>
            Clear Filters
          </button>
        }
        <span class="text-xs text-zinc-400 font-medium ml-auto">{{ filteredTickets().length }} ticket{{ filteredTickets().length !== 1 ? 's' : '' }}</span>
      </div>

      <div class="card rounded-2xl overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-white border border-zinc-200">
            <tr>
              <th scope="col" class="px-6 py-3 text-left font-medium text-zinc-500 uppercase tracking-wider text-xs">Priority</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-zinc-500 uppercase tracking-wider text-xs">Subject / Title</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-zinc-500 uppercase tracking-wider text-xs">Type</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-zinc-500 uppercase tracking-wider text-xs">Related Partner</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-zinc-500 uppercase tracking-wider text-xs">Assignee</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-zinc-500 uppercase tracking-wider text-xs">Status</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-zinc-500 uppercase tracking-wider text-xs">Created By</th>
              <th scope="col" class="px-6 py-3 text-right font-medium text-zinc-500 uppercase tracking-wider text-xs">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            @for (ticket of paginatedTickets(); track ticket.id) {
              <tr class="hover:bg-zinc-50 transition-colors">
                <td (click)="openEditTicketModal(ticket)" class="px-6 py-4 whitespace-nowrap cursor-pointer">
                  <div class="flex items-center">
                    <mat-icon [class]="getPriorityColor(ticket.priority)" class="text-[18px] w-5 h-5">flag</mat-icon>
                    <span [class]="getPriorityColor(ticket.priority)" class="ml-1.5 text-xs font-semibold">{{ ticket.priority }}</span>
                  </div>
                </td>
                <td (click)="openEditTicketModal(ticket)" class="px-6 py-4 cursor-pointer">
                  <div class="text-sm font-medium text-zinc-900">{{ticket.title}}</div>
                  @if (ticket.resolution) {
                    <div class="text-[11px] text-zinc-900 font-medium mt-0.5 flex items-center gap-0.5">
                      <mat-icon class="text-[12px] w-3 h-3">done_all</mat-icon>
                      <span class="truncate max-w-xs" [title]="ticket.resolution">{{ticket.resolution}}</span>
                    </div>
                  }
                </td>
                <td (click)="openEditTicketModal(ticket)" class="px-6 py-4 whitespace-nowrap cursor-pointer text-sm text-zinc-600">
                  <span class="px-2 py-0.5 text-xs bg-zinc-100 text-zinc-700 rounded-md border border-zinc-200 font-medium">
                    {{ticket.type || 'N/A'}}
                  </span>
                </td>
                <td (click)="openEditTicketModal(ticket)" class="px-6 py-4 whitespace-nowrap cursor-pointer text-sm text-zinc-500">
                  {{getPartnerName(ticket.partnerId)}}
                </td>
                <td (click)="openEditTicketModal(ticket)" class="px-6 py-4 whitespace-nowrap cursor-pointer text-sm text-zinc-600">
                  <div class="flex items-center gap-2">
                    <div class="h-5 w-5 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-[9px] font-bold text-zinc-900 uppercase">
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
                  <button (click)="openDeleteModal(ticket)" class="text-zinc-700 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Delete Ticket">
                    <mat-icon class="text-[18px] w-4.5 h-4.5">delete</mat-icon>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="px-6 py-12 text-center text-zinc-400 text-sm">
                  <mat-icon class="text-[40px]! w-10 h-10 mb-2 text-zinc-300 block mx-auto">support_agent</mat-icon>
                  No tickets found. Create one to get started.
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (filteredTickets().length > 0) {
          <app-paginator
            [currentPage]="ticketsPage()"
            [totalPages]="ticketsTotalPages()"
            [pageSize]="ticketsPageSize()"
            (pageChange)="ticketsPage.set($event)"
            (pageSizeChange)="ticketsPageSize.set($event)" />
        }
      </div>
    </div>

    <!-- Ticket Modal (Create / Edit) -->
    @if (modalOpen()) {
      <div class="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white shadow-xl rounded-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-zinc-950">
              {{ isEditing() ? 'Edit Support Ticket' : 'New Support Ticket' }}
            </h3>
            <button (click)="modalOpen.set(false)" class="text-zinc-400 hover:text-zinc-600 transition-colors">
              <mat-icon class="w-5 h-5 text-[20px]! leading-none!">close</mat-icon>
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-zinc-500 uppercase mb-1">Subject / Title *</label>
              <input
                [(ngModel)]="newTicket.title"
                type="text"
                placeholder="e.g. Login issue on client portal"
                class="w-full input-field rounded-lg p-2 text-sm focus:outline-blue-600"
              >
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-zinc-500 uppercase mb-1">Ticket Type</label>
                <select [(ngModel)]="newTicket.type" class="w-full input-field rounded-lg p-2 text-sm focus:outline-blue-600">
                  @for (t of state.ticketTypes(); track t) {
                    <option [value]="t">{{ t }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-zinc-500 uppercase mb-1">Related Partner</label>
                <select [(ngModel)]="newTicket.partnerId" class="w-full input-field rounded-lg p-2 text-sm focus:outline-blue-600">
                  <option value="">-- Select Partner --</option>
                  @for (p of state.partners(); track p.id) {
                    <option [value]="p.id">{{p.name}} ({{p.type}})</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-zinc-500 uppercase mb-1">Assigned To</label>
              <select [(ngModel)]="newTicket.assignedTo" class="w-full input-field rounded-lg p-2 text-sm focus:outline-blue-600">
                <option value="">-- Select Assignee --</option>
                @for (user of state.users(); track user.name) {
                  <option [value]="user.name">{{user.name}} ({{user.role}})</option>
                }
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-zinc-500 uppercase mb-1">Priority</label>
                <select [(ngModel)]="newTicket.priority" class="w-full input-field rounded-lg p-2 text-sm focus:outline-blue-600">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-zinc-500 uppercase mb-1">Status</label>
                <select [(ngModel)]="newTicket.status" class="w-full input-field rounded-lg p-2 text-sm focus:outline-blue-600">
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
                <label class="block text-xs font-semibold text-zinc-500 uppercase mb-1">Resolution Details *</label>
                <textarea
                  [(ngModel)]="newTicket.resolution"
                  rows="3"
                  placeholder="Describe how this issue was resolved..."
                  class="w-full input-field rounded-lg p-2 text-sm focus:outline-blue-600"
                ></textarea>
              </div>
            }
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-white/30">
            <button (click)="modalOpen.set(false)" class="px-4 py-2 border border-zinc-200 text-zinc-600 text-sm font-semibold rounded-lg hover:bg-zinc-50">
              Cancel
            </button>
            <button (click)="saveTicket()" [disabled]="!newTicket.title.trim() || ((newTicket.status === 'Resolved' || newTicket.status === 'Closed') && !newTicket.resolution.trim())" class="px-4 py-2 bg-zinc-900 hover:bg-zinc-950 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm shadow-lg shadow-zinc-300">
              {{ isEditing() ? 'Save Changes' : 'Create Ticket' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (deleteModalOpen() && ticketToDelete()) {
      <div class="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white shadow-xl rounded-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-zinc-950">Delete Ticket</h3>
            <button (click)="cancelDelete()" class="text-zinc-400 hover:text-zinc-600 transition-colors">
              <mat-icon class="w-5 h-5 text-[20px]! leading-none!">close</mat-icon>
            </button>
          </div>
          <p class="text-sm text-zinc-600 leading-relaxed">
            Are you sure you want to delete this ticket?
          </p>
          <div class="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3">
            <div class="text-sm font-semibold text-zinc-900">{{ ticketToDelete()?.title }}</div>
            @if (ticketToDelete()?.id) {
              <div class="text-[11px] text-zinc-400 font-mono mt-0.5">#{{ ticketToDelete()?.id }}</div>
            }
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-white/30">
            <button (click)="cancelDelete()" class="px-4 py-2 border border-zinc-200 text-zinc-600 text-sm font-semibold rounded-lg hover:bg-zinc-50">
              Cancel
            </button>
            <button (click)="deleteConfirm()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5">
              <mat-icon class="w-4 h-4 text-[16px]! leading-none!">delete</mat-icon>
              Delete
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
  priorityFilter = signal<'High' | 'Medium' | 'Low' | null>(null);
  statusFilter = signal<TicketStatus | null>(null);
  typeFilter = signal<string | null>(null);

  filteredTickets = computed(() => {
    const priority = this.priorityFilter();
    const status = this.statusFilter();
    const type = this.typeFilter();
    return this.state.tickets().filter(t =>
      (!priority || t.priority === priority) &&
      (!status || t.status === status) &&
      (!type || t.type === type)
    );
  });

  hasActiveFilters = computed(() => !!this.priorityFilter() || !!this.statusFilter() || !!this.typeFilter());

  ticketsPage = signal(1);
  ticketsPageSize = signal(10);
  ticketsTotalPages = computed(() => Math.max(1, Math.ceil(this.filteredTickets().length / this.ticketsPageSize())));
  paginatedTickets = computed(() => {
    const start = (this.ticketsPage() - 1) * this.ticketsPageSize();
    return this.filteredTickets().slice(start, start + this.ticketsPageSize());
  });

  clearFilters() {
    this.priorityFilter.set(null);
    this.statusFilter.set(null);
    this.typeFilter.set(null);
  }

  constructor() {
    this.state.loadTickets();
    const filter = this.state.ticketFilter();
    if (filter?.priority && ['High', 'Medium', 'Low'].includes(filter.priority)) {
      this.priorityFilter.set(filter.priority as 'High' | 'Medium' | 'Low');
      this.state.ticketFilter.set(null);
    }
  }

  // Delete confirmation
  deleteModalOpen = signal(false);
  ticketToDelete = signal<Ticket | null>(null);

  openDeleteModal(ticket: Ticket) {
    this.ticketToDelete.set(ticket);
    this.deleteModalOpen.set(true);
  }

  cancelDelete() {
    this.deleteModalOpen.set(false);
    this.ticketToDelete.set(null);
  }

  deleteConfirm() {
    const ticket = this.ticketToDelete();
    if (ticket) {
      this.state.deleteTicket(ticket.id);
    }
    this.deleteModalOpen.set(false);
    this.ticketToDelete.set(null);
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

  getPartnerName(id: string) {
    return this.state.partners().find(p => p.id === id)?.name || 'Unknown';
  }

  getPriorityColor(priority: string) {
    switch(priority) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-green-500';
      case 'Low': return 'text-blue-400';
      default: return 'text-zinc-400';
    }
  }

  getStatusColor(status: string) {
    switch(status) {
      case 'Open': return 'text-red-600 border border-red-200';
      case 'In Progress': return 'text-amber-600 border border-amber-200';
      case 'Resolved': return 'text-emerald-600 border border-emerald-200';
      default: return 'text-zinc-400 border border-zinc-200';
    }
  }
}

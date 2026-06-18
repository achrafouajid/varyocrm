import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tickets',
  imports: [MatIconModule, CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8">
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Tickets</h2>
          <p class="text-slate-500 mt-1">Customer service requests and partner issues.</p>
        </div>
        <button (click)="openNewTicketModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
          <mat-icon class="w-5 h-5 text-[20px]! leading-none! flex items-center justify-center">add</mat-icon>
          New Ticket
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Priority</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Subject</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Related Partner</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Assignee</th>
              <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            @for (ticket of state.tickets(); track ticket.id) {
              <tr class="hover:bg-slate-50 transition-colors cursor-pointer">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <mat-icon [class]="getPriorityColor(ticket.priority)" class="text-[18px] w-5 h-5">flag</mat-icon>
                    <span class="ml-1.5 text-xs font-medium text-slate-500">{{ ticket.priority }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-slate-900">{{ticket.title}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-500">{{getPartnerName(ticket.partnerId)}}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-600 flex items-center gap-2">
                    <div class="h-5 w-5 bg-slate-200 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-600">
                      {{ticket.assignedTo.substring(0,1)}}
                    </div>
                    {{ticket.assignedTo}}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStatusColor(ticket.status)" class="px-2.5 py-1 text-xs font-medium rounded-full">
                    {{ticket.status}}
                  </span>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-slate-400 text-sm">
                  <mat-icon class="text-[40px]! w-10 h-10 mb-2 text-slate-300 block mx-auto">support_agent</mat-icon>
                  No tickets found. Create one to get started.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- New Ticket Modal -->
    @if (modalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-950">New Support Ticket</h3>
            <button (click)="modalOpen.set(false)" class="text-slate-400 hover:text-slate-600 transition-colors">
              <mat-icon class="w-5 h-5 text-[20px]! leading-none!">close</mat-icon>
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Subject / Title</label>
              <input
                [(ngModel)]="newTicket.title"
                type="text"
                placeholder="e.g. Login issue on client portal"
                class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600"
              >
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Related Partner</label>
              <select [(ngModel)]="newTicket.partnerId" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                <option value="">-- Select Partner --</option>
                @for (p of state.partners(); track p.id) {
                  <option [value]="p.id">{{p.name}} ({{p.type}})</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Assigned To</label>
              <select [(ngModel)]="newTicket.assignedTo" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                <option value="">-- Select Assignee --</option>
                @for (user of state.users(); track user.name) {
                  <option [value]="user.name">{{user.name}} ({{user.role}})</option>
                }
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Priority</label>
                <select [(ngModel)]="newTicket.priority" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                <select [(ngModel)]="newTicket.status" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button (click)="modalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button (click)="saveTicket()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">
              Create Ticket
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

  newTicket = {
    title: '',
    partnerId: '',
    assignedTo: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'Open' as 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  };

  openNewTicketModal() {
    this.newTicket = {
      title: '',
      partnerId: this.state.partners()[0]?.id || '',
      assignedTo: this.state.users()[0]?.name || '',
      priority: 'Medium',
      status: 'Open'
    };
    this.modalOpen.set(true);
  }

  saveTicket() {
    if (!this.newTicket.title.trim()) return;
    this.state.tickets.update(tickets => [
      ...tickets,
      {
        id: 'tk' + (tickets.length + 1),
        title: this.newTicket.title,
        partnerId: this.newTicket.partnerId,
        assignedTo: this.newTicket.assignedTo || 'Unassigned',
        status: this.newTicket.status,
        priority: this.newTicket.priority
      }
    ]);
    this.modalOpen.set(false);
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
      case 'Open': return 'bg-amber-100 text-amber-800';
      case 'In Progress': return 'bg-indigo-100 text-indigo-800';
      case 'Resolved': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }
}

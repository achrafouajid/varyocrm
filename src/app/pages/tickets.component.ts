import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tickets',
  imports: [MatIconModule, CommonModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8">
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Tickets</h2>
          <p class="text-slate-500 mt-1">Customer service requests and partner issues.</p>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
          <mat-icon class="mr-2 text-sm! w-5 h-5 leading-none!">add</mat-icon>
          New Ticket
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Priority</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Subject</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Related Partner</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Assignee</th>
              <th scope="col" class="px-6 py-3 text-left test-xs font-medium text-slate-500 uppercase tracking-wider text-xs">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            @for (ticket of state.tickets(); track ticket.id) {
              <tr class="hover:bg-slate-50 transition-colors cursor-pointer">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <mat-icon [class]="getPriorityColor(ticket.priority)" class="text-[18px] w-5 h-5">flag</mat-icon>
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
                <td colspan="5" class="px-6 py-8 text-center text-slate-500 text-sm">No tickets found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class TicketsComponent {
  state = inject(CrmStateService);

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

import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService, Partner, Task, Proposal, Deal, PurchaseOrder } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sales',
  imports: [MatIconModule, CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8">
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Sales & Operations</h2>
          <p class="text-slate-500 mt-1">Manage proposals, deals, purchase orders, and team tasks.</p>
        </div>
        <div class="flex gap-2">
          @if (activeTab() === 'deals') {
            <button (click)="openCreateDealModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
              <mat-icon class="mr-2 text-sm! w-5 h-5 leading-none!">add</mat-icon>
              New Deal
            </button>
          } @else if (activeTab() === 'proposals') {
            <button (click)="openCreateProposalModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
              <mat-icon class="mr-2 text-sm! w-5 h-5 leading-none!">add</mat-icon>
              New Proposal
            </button>
          } @else if (activeTab() === 'tasks') {
            <button (click)="openCreateTaskModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
              <mat-icon class="mr-2 text-sm! w-5 h-5 leading-none!">add</mat-icon>
              New Task
            </button>
          }
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex space-x-1 border-b border-slate-200">
        <button 
          (click)="activeTab.set('deals')" 
          [class]="activeTab() === 'deals' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
          class="px-4 py-3 border-b-2 font-medium text-sm transition-colors">
          Deals ({{ state.deals().length }})
        </button>
        <button 
          (click)="activeTab.set('proposals')" 
          [class]="activeTab() === 'proposals' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
          class="px-4 py-3 border-b-2 font-medium text-sm transition-colors">
          Proposals ({{ state.proposals().length }})
        </button>
        <button 
          (click)="activeTab.set('tasks')" 
          [class]="activeTab() === 'tasks' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
          class="px-4 py-3 border-b-2 font-medium text-sm transition-colors">
          Tasks & Assignments ({{ state.tasks().length }})
        </button>
        <button 
          (click)="activeTab.set('pos')" 
          [class]="activeTab() === 'pos' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
          class="px-4 py-3 border-b-2 font-medium text-sm transition-colors">
          Purchase Orders ({{ state.purchaseOrders().length }})
        </button>
      </div>

      <!-- Deals View -->
      @if (activeTab() === 'deals') {
        <div class="grid grid-cols-1 gap-6">
          @for (deal of state.deals(); track deal.id) {
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all space-y-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-lg font-semibold text-slate-900">{{deal.title}}</h3>
                  <p class="text-sm text-slate-500 mt-0.5">Client: {{getPartnerName(deal.partnerId)}}</p>
                </div>
                <div class="flex flex-col items-end gap-1.5">
                  <span class="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {{deal.stage}}
                  </span>
                  @if (deal.estimatedDeliveryDate) {
                    <span class="text-xs text-emerald-600 flex items-center font-medium">
                      <mat-icon class="text-[14px] w-3.5 h-3.5 mr-0.5">local_shipping</mat-icon> Est. Delivery: {{deal.estimatedDeliveryDate}}
                    </span>
                  }
                </div>
              </div>

              <!-- Deal Details -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-100">
                <div>
                  <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount Details</span>
                  <div class="mt-1">
                    <span class="text-xl font-bold text-slate-900 font-mono">{{formatCurrency(deal.amount)}}</span>
                    @if (deal.discount) {
                      <span class="text-xs text-emerald-600 font-semibold ml-2">({{deal.discount}}% Discount applied)</span>
                    }
                  </div>
                </div>

                <div>
                  <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Comments / Notes</span>
                  <p class="text-xs text-slate-600 mt-1 line-clamp-2">{{deal.comments || 'No comments.'}}</p>
                </div>

                <div>
                  <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Attached Proposal</span>
                  <div class="text-xs text-slate-600 mt-1">
                    #{{deal.proposalId || 'N/A'}} - {{ getProposalTitle(deal.proposalId) }}
                  </div>
                </div>
              </div>

              <!-- Email Exchange Log -->
              @if (deal.emailExchange) {
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs font-mono space-y-1">
                  <div class="text-slate-400 font-sans font-bold flex items-center gap-1 mb-1">
                    <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none">email</mat-icon> Email Exchange & Confirmation Logs
                  </div>
                  <pre class="whitespace-pre-wrap text-[10px] text-slate-700 leading-relaxed font-sans">{{deal.emailExchange}}</pre>
                </div>
              }

              <!-- Action buttons for Operations / Delivery -->
              <div class="flex justify-between items-center pt-4 border-t border-slate-100">
                <span class="text-xs text-slate-400">Lines: {{ deal.orderLines?.length || 0 }} items</span>
                <div class="flex gap-2">
                  <!-- Create PO trigger if none exists for this deal -->
                  @if (!hasPOForDeal(deal.id)) {
                    <button (click)="openCreatePOModal(deal)" class="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center">
                      <mat-icon class="mr-1 text-[16px] w-4 h-4">add_shopping_cart</mat-icon> Create PO (Operations)
                    </button>
                  }
                  @if (deal.stage === 'New') {
                    <button (click)="state.updateDealStage(deal.id, 'Confirmed')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center">
                      <mat-icon class="mr-1 text-[16px] w-4 h-4">check</mat-icon> Confirm Deal
                    </button>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="bg-white rounded-2xl p-8 text-center text-slate-500 shadow-sm border border-slate-200">No deals found. Create a confirmed proposal to start.</div>
          }
        </div>
      }

      <!-- Proposals View -->
      @if (activeTab() === 'proposals') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (prop of state.proposals(); track prop.id) {
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
              <div class="space-y-3">
                <div class="flex justify-between items-start">
                  <span class="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase"
                    [class]="prop.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : (prop.status === 'Sent' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800')">
                    {{prop.status}}
                  </span>
                  <span class="font-mono text-sm text-slate-400">#{{prop.id}}</span>
                </div>
                <h3 class="text-lg font-semibold text-slate-900">{{prop.title}}</h3>
                <p class="text-xs text-slate-500">Prospect: {{getPartnerName(prop.partnerId)}}</p>

                <!-- Lines -->
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lines & Pricing</span>
                  @for (line of prop.lines; track $index) {
                    <div class="flex justify-between text-xs text-slate-700">
                      <span>{{line.qty}}x {{line.product}}</span>
                      <span class="font-mono">{{formatCurrency(line.total)}}</span>
                    </div>
                  }
                  <div class="flex justify-between border-t border-slate-200 pt-1.5 text-xs font-bold text-slate-900 font-mono">
                    <span>Total Proposal Amount</span>
                    <span>{{formatCurrency(prop.amount)}}</span>
                  </div>
                </div>
              </div>

              <div class="mt-5 pt-3 border-t border-slate-100 flex justify-between gap-2">
                @if (prop.status === 'Draft') {
                  <button (click)="state.updateProposalStatus(prop.id, 'Sent')" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                    Send to Prospect
                  </button>
                } @else if (prop.status === 'Sent') {
                  <button (click)="state.updateProposalStatus(prop.id, 'Confirmed')" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                    <mat-icon class="text-[16px] w-4 h-4">task_alt</mat-icon> Confirm (Signs BC)
                  </button>
                } @else {
                  <span class="text-xs text-emerald-600 font-semibold py-2 flex items-center justify-center w-full">
                    <mat-icon class="text-[16px] w-4 h-4 mr-1">check_circle</mat-icon> Confirmed & Ready to Convert
                  </span>
                }
              </div>
            </div>
          } @empty {
            <div class="col-span-2 bg-white rounded-2xl p-8 text-center text-slate-500 shadow-sm border border-slate-200">No proposals found.</div>
          }
        </div>
      }

      <!-- Tasks View -->
      @if (activeTab() === 'tasks') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (task of state.tasks(); track task.id) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div class="flex justify-between items-start mb-3">
                  <span [class]="getStatusColor(task.status)" class="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full">
                    {{task.status}}
                  </span>
                  <span class="text-xs text-slate-400 font-mono">#{{task.id}}</span>
                </div>
                <h4 class="text-slate-900 font-semibold text-base mb-1">{{task.title}}</h4>
                <p class="text-xs text-slate-500 mb-3">{{task.description}}</p>

                @if (task.relatedTo) {
                  <div class="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg p-1.5 px-2 mb-4 inline-flex items-center gap-1 font-medium">
                    <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none">link</mat-icon>
                    {{task.relatedTo}}
                  </div>
                }
              </div>

              <div class="border-t border-slate-100 pt-3 flex flex-col gap-3 mt-4">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-400 font-medium">Assigned Team:</span>
                  <span class="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{{task.assignedTeam || 'Sales'}}</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-400 font-medium">Assigned Person:</span>
                  <span class="font-bold text-slate-700">{{task.assignedTo || 'Unassigned'}}</span>
                </div>
                
                <!-- Manual reassignment & status change -->
                <div class="flex gap-2 pt-2 border-t border-slate-50">
                  @if (task.status === 'Pending') {
                    <button (click)="state.updateTaskStatus(task.id, 'In Progress')" class="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-indigo-600 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                      Start Task
                    </button>
                  } @else if (task.status === 'In Progress') {
                    <button (click)="state.updateTaskStatus(task.id, 'Completed')" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors">
                      Complete Task
                    </button>
                  } @else {
                    <span class="text-emerald-600 text-xs font-bold py-1.5 text-center w-full flex items-center justify-center">
                      <mat-icon class="text-[16px] w-4 h-4 mr-0.5">check_circle</mat-icon> Completed
                    </span>
                  }
                  
                  <!-- Assign Option -->
                  @if (task.status !== 'Completed') {
                    <button (click)="openAssignModal(task)" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center">
                      <mat-icon class="text-[16px] w-4 h-4">person</mat-icon> Assign
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Purchase Orders View -->
      @if (activeTab() === 'pos') {
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">PO Ref</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Vendor</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Deal</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Amount</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Delivery Date</th>
                <th scope="col" class="px-6 py-3 text-left font-medium text-slate-500 uppercase tracking-wider text-xs">Status</th>
                <th scope="col" class="px-6 py-3 text-right font-medium text-slate-500 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              @for (po of state.purchaseOrders(); track po.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-slate-900 font-mono">#{{po.id}}</div>
                    @if (po.sentVia) {
                      <span class="text-[10px] text-slate-400 font-medium">Sent: {{po.sentVia}}</span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-950 font-medium">{{getPartnerName(po.vendorId)}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-500">{{getDealTitle(po.dealId)}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-900 font-mono font-bold">{{formatCurrency(po.amount)}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-slate-600 font-mono">{{po.deliveryDate || 'Pending Conf.'}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full"
                      [class]="po.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : (po.status === 'Sent' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800')">
                      {{po.status}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold space-x-1.5">
                    @if (po.status === 'Sent') {
                      <button (click)="openSetDeliveryDatePOModal(po)" class="bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-50">Set Del. Date</button>
                      <button (click)="state.updatePurchaseOrderStatus(po.id, 'Delivered')" class="bg-indigo-600 text-white px-2 py-1 rounded-lg hover:bg-indigo-700">Receive Goods</button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-6 py-8 text-center text-slate-500 text-sm">No Purchase Orders generated yet.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Modals -->
    <!-- Assign Modal -->
    @if (assignModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Assign Task: {{selectedTask()?.title}}</h3>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Assignee</label>
            <select [(ngModel)]="reassignedUser" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
              @for (user of state.users(); track user.name) {
                <option [value]="user.name">{{user.name}} ({{user.role}})</option>
              }
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button (click)="assignModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
            <button (click)="saveAssignment()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">Assign</button>
          </div>
        </div>
      </div>
    }

    <!-- Create Proposal Modal -->
    @if (proposalModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Create Proposal</h3>
          
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Prospect / Client</label>
              <select [(ngModel)]="newProposal.partnerId" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                @for (p of state.partners(); track p.id) {
                  <option [value]="p.id">{{p.name}} ({{p.type}})</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Proposal Title</label>
              <input [(ngModel)]="newProposal.title" type="text" placeholder="e.g. Standard Enterprise Cloud Infrastructure" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Template</label>
              <select [(ngModel)]="selectedTemplateId" (change)="applyTemplate()" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                <option value="">-- Manual/No Template --</option>
                @for (temp of state.proposalTemplates(); track temp.id) {
                  <option [value]="temp.id">{{temp.name}}</option>
                }
              </select>
            </div>

            <!-- Line Items -->
            <div class="space-y-2 border-t border-slate-100 pt-2">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Line Items</span>
              @for (line of newProposal.lines; track $index) {
                <div class="grid grid-cols-12 gap-2 items-center">
                  <input class="col-span-4 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600" [(ngModel)]="line.product" placeholder="Product">
                  <input class="col-span-4 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600" [(ngModel)]="line.description" placeholder="Description">
                  <input class="col-span-1 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600 text-center" type="number" [(ngModel)]="line.qty" (change)="recalcLine(line)">
                  <input class="col-span-2 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600 font-mono text-right" type="number" [(ngModel)]="line.unitPrice" (change)="recalcLine(line)">
                  <button type="button" (click)="removeLine($index)" class="col-span-1 text-rose-500 hover:bg-rose-50 p-1 rounded"><mat-icon class="text-[16px] w-4 h-4 leading-none">delete</mat-icon></button>
                </div>
              }
              <button (click)="addLineItem()" class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center mt-1">
                <mat-icon class="text-[16px] w-4 h-4 mr-0.5">add_circle</mat-icon> Add Line Item
              </button>
            </div>
          </div>

          <div class="flex justify-between items-center border-t border-slate-100 pt-4">
            <div class="text-sm">
              <span class="text-slate-500">Total Amount:</span>
              <strong class="ml-1 text-slate-900 font-mono">{{formatCurrency(getNewProposalTotal())}}</strong>
            </div>
            <div class="flex gap-2">
              <button (click)="proposalModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
              <button (click)="saveProposal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">Create Proposal</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Create Deal Modal -->
    @if (dealModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Create Deal</h3>
          
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Client (Must be Customer)</label>
              <select [(ngModel)]="newDeal.partnerId" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                @for (c of state.customers(); track c.id) {
                  <option [value]="c.id">{{c.name}}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Deal Title</label>
              <input [(ngModel)]="newDeal.title" type="text" placeholder="e.g. Atlas Cloud Migration Project" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Amount (MAD)</label>
                <input [(ngModel)]="newDeal.amount" type="number" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Discount (%)</label>
                <input [(ngModel)]="newDeal.discount" type="number" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Linked Proposal</label>
              <select [(ngModel)]="newDeal.proposalId" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                <option value="">None</option>
                @for (p of state.proposals(); track p.id) {
                  <option [value]="p.id">#{{p.id}} - {{p.title}}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Email Exchange logs & Confirmations</label>
              <textarea [(ngModel)]="newDeal.emailExchange" rows="3" placeholder="Paste copy of signed email confirmations..." class="w-full border border-slate-200 rounded-lg p-2 text-[11px] font-mono focus:outline-indigo-600"></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Customer Comments</label>
              <textarea [(ngModel)]="newDeal.comments" rows="2" placeholder="Comments..." class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button (click)="dealModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
            <button (click)="saveDeal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">Save Deal</button>
          </div>
        </div>
      </div>
    }

    <!-- Create PO Modal (Operations) -->
    @if (poModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Create Purchase Order</h3>
          <p class="text-xs text-slate-500">Creating Purchase Order linked to: <strong>{{selectedDealForPO()?.title}}</strong></p>
          
          <div class="space-y-3">
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="block text-xs font-semibold text-slate-500 uppercase">Vendor</label>
                <button (click)="showNewVendorForm.set(!showNewVendorForm())" class="text-indigo-600 hover:text-indigo-700 text-[10px] font-bold uppercase">
                  {{ showNewVendorForm() ? 'Select Existing' : '+ Create New Vendor Inline' }}
                </button>
              </div>
              
              @if (showNewVendorForm()) {
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                  <input [(ngModel)]="newVendorData.name" placeholder="Vendor Company Name" class="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white">
                  <input [(ngModel)]="newVendorData.email" placeholder="Vendor Email" class="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white">
                  <input [(ngModel)]="newVendorData.phone" placeholder="Vendor Phone" class="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white">
                  <select [(ngModel)]="newVendorData.city" class="w-full border border-slate-200 rounded-lg p-1.5 text-xs bg-white">
                    <option value="Casablanca">Casablanca</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Marrakech">Marrakech</option>
                  </select>
                </div>
              } @else {
                <select [(ngModel)]="selectedVendorId" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  @for (v of state.vendors(); track v.id) {
                    <option [value]="v.id">{{v.name}} ({{v.city}})</option>
                  }
                </select>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">PO Total Cost (MAD)</label>
              <input [(ngModel)]="newPoCost" type="number" class="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-indigo-600">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Expected Vendor Delivery Date</label>
              <input [(ngModel)]="newPoDeliveryDate" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-indigo-600">
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button (click)="poModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
            <button (click)="savePurchaseOrder()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">Send PO via Email</button>
          </div>
        </div>
      </div>
    }

    <!-- Set Delivery Date PO Modal -->
    @if (setDeliveryDateModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Log Vendor Expected Delivery Date</h3>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Expected Delivery Date</label>
            <input [(ngModel)]="loggedDeliveryDate" type="date" class="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-indigo-600">
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button (click)="setDeliveryDateModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
            <button (click)="saveDeliveryDate()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">Save</button>
          </div>
        </div>
      </div>
    }

    <!-- Create Task Modal -->
    @if (taskModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Create New Task</h3>
          
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Task Title</label>
              <input [(ngModel)]="newTaskData.title" type="text" placeholder="e.g. Generate Customer Invoice" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
              <textarea [(ngModel)]="newTaskData.description" rows="2" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Assigned Team</label>
                <select [(ngModel)]="newTaskData.assignedTeam" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Support">Support</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Assigned Person</label>
                <select [(ngModel)]="newTaskData.assignedTo" class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  <option value="">Unassigned</option>
                  @for (user of state.users(); track user.name) {
                    <option [value]="user.name">{{user.name}}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Related To</label>
              <input [(ngModel)]="newTaskData.relatedTo" type="text" placeholder="e.g. Deal: Atlas Digital Project" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button (click)="taskModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
            <button (click)="saveTask()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm">Save Task</button>
          </div>
        </div>
      </div>
    }
  `
})
export class SalesComponent {
  state = inject(CrmStateService);
  activeTab = signal<'deals' | 'proposals' | 'tasks' | 'pos'>('deals');

  // Modals state
  assignModalOpen = signal(false);
  proposalModalOpen = signal(false);
  dealModalOpen = signal(false);
  poModalOpen = signal(false);
  setDeliveryDateModalOpen = signal(false);
  taskModalOpen = signal(false);

  // Modal data properties
  selectedTask = signal<Task | null>(null);
  reassignedUser = '';

  selectedDealForPO = signal<Deal | null>(null);
  showNewVendorForm = signal(false);
  selectedVendorId = '';
  newVendorData = { name: '', email: '', phone: '', city: 'Casablanca' };
  newPoCost = 9000;
  newPoDeliveryDate = '';

  selectedPOForDelivery = signal<PurchaseOrder | null>(null);
  loggedDeliveryDate = '';

  newProposal = {
    title: '',
    partnerId: '',
    lines: [] as { product: string; description: string; qty: number; unitPrice: number; total: number }[]
  };
  selectedTemplateId = '';

  newDeal = {
    title: '',
    partnerId: '',
    amount: 15000,
    discount: 0,
    proposalId: '',
    emailExchange: '',
    comments: ''
  };

  newTaskData = {
    title: '',
    description: '',
    assignedTeam: 'Sales' as 'Sales' | 'Operations' | 'Finance' | 'Support',
    assignedTo: '',
    relatedTo: ''
  };

  getPartnerName(id: string) {
    return this.state.partners().find(p => p.id === id)?.name || 'Unknown';
  }

  getProposalTitle(id?: string) {
    return this.state.proposals().find(p => p.id === id)?.title || 'N/A';
  }

  getDealTitle(id?: string) {
    return this.state.deals().find(d => d.id === id)?.title || 'N/A';
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(value);
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'In Progress': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      default: return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  }

  hasPOForDeal(dealId: string) {
    return this.state.purchaseOrders().some(po => po.dealId === dealId);
  }

  // Task assignment
  openAssignModal(task: Task) {
    this.selectedTask.set(task);
    this.reassignedUser = task.assignedTo || '';
    this.assignModalOpen.set(true);
  }

  saveAssignment() {
    const task = this.selectedTask();
    if (task) {
      this.state.updateTaskStatus(task.id, task.status, this.reassignedUser);
      this.assignModalOpen.set(false);
    }
  }

  // Proposal Creation
  openCreateProposalModal() {
    this.newProposal = {
      title: '',
      partnerId: this.state.partners()[0]?.id || '',
      lines: [
        { product: '', description: '', qty: 1, unitPrice: 0, total: 0 }
      ]
    };
    this.selectedTemplateId = '';
    this.proposalModalOpen.set(true);
  }

  applyTemplate() {
    if (this.selectedTemplateId) {
      const template = this.state.proposalTemplates().find(t => t.id === this.selectedTemplateId);
      if (template) {
        this.newProposal.title = template.name;
        this.newProposal.lines = template.lines.map(l => ({ ...l }));
      }
    }
  }

  addLineItem() {
    this.newProposal.lines.push({ product: '', description: '', qty: 1, unitPrice: 0, total: 0 });
  }

  removeLine(index: number) {
    this.newProposal.lines.splice(index, 1);
  }

  recalcLine(line: any) {
    line.total = line.qty * line.unitPrice;
  }

  getNewProposalTotal() {
    return this.newProposal.lines.reduce((acc, line) => acc + (line.qty * line.unitPrice), 0);
  }

  saveProposal() {
    const total = this.getNewProposalTotal();
    this.state.addProposal({
      title: this.newProposal.title || 'Draft Proposal',
      partnerId: this.newProposal.partnerId,
      amount: total,
      status: 'Draft',
      templateId: this.selectedTemplateId || undefined,
      lines: this.newProposal.lines
    });
    this.proposalModalOpen.set(false);
  }

  // Deal Creation
  openCreateDealModal() {
    const defaultCust = this.state.customers()[0]?.id || '';
    this.newDeal = {
      title: '',
      partnerId: defaultCust,
      amount: 0,
      discount: 0,
      proposalId: '',
      emailExchange: '',
      comments: ''
    };
    this.dealModalOpen.set(true);
  }

  saveDeal() {
    const finalAmount = this.newDeal.amount - (this.newDeal.amount * (this.newDeal.discount / 100));
    const prop = this.state.proposals().find(p => p.id === this.newDeal.proposalId);
    this.state.addDeal({
      title: this.newDeal.title || 'New Deal',
      partnerId: this.newDeal.partnerId,
      amount: finalAmount,
      stage: 'New',
      comments: this.newDeal.comments,
      proposalId: this.newDeal.proposalId || undefined,
      discount: this.newDeal.discount || undefined,
      emailExchange: this.newDeal.emailExchange || undefined,
      orderLines: prop?.lines || []
    });
    this.dealModalOpen.set(false);
  }

  // Purchase Order
  openCreatePOModal(deal: Deal) {
    this.selectedDealForPO.set(deal);
    this.selectedVendorId = this.state.vendors()[0]?.id || '';
    this.showNewVendorForm.set(false);
    this.newPoCost = Math.round(deal.amount * 0.7); // Estimate 70% cost of goods
    this.newPoDeliveryDate = '';
    this.poModalOpen.set(true);
  }

  savePurchaseOrder() {
    const deal = this.selectedDealForPO();
    if (!deal) return;

    let vendorId = this.selectedVendorId;

    if (this.showNewVendorForm()) {
      if (this.newVendorData.name.trim()) {
        const newVendor = this.state.addPartner({
          name: this.newVendorData.name,
          type: 'Vendor',
          email: this.newVendorData.email,
          phone: this.newVendorData.phone,
          city: this.newVendorData.city,
          comments: 'Created inline from PO generation.'
        });
        vendorId = newVendor.id;
      } else {
        alert('Please specify a vendor name');
        return;
      }
    }

    // Add PO
    this.state.addPurchaseOrder({
      dealId: deal.id,
      vendorId: vendorId,
      amount: this.newPoCost,
      status: 'Sent',
      deliveryDate: this.newPoDeliveryDate || undefined,
      sentVia: 'Email via CRM',
      lines: [
        { product: 'Goods for ' + deal.title, qty: 1, cost: this.newPoCost }
      ]
    });

    // Automatically update deal stage to PO Sent
    this.state.updateDealStage(deal.id, 'Confirmed');

    this.poModalOpen.set(false);
    this.activeTab.set('pos');
  }

  // PO Delivery Dates
  openSetDeliveryDatePOModal(po: PurchaseOrder) {
    this.selectedPOForDelivery.set(po);
    this.loggedDeliveryDate = po.deliveryDate || '';
    this.setDeliveryDateModalOpen.set(true);
  }

  saveDeliveryDate() {
    const po = this.selectedPOForDelivery();
    if (po) {
      this.state.updatePurchaseOrderStatus(po.id, po.status, this.loggedDeliveryDate);
      
      // Update Deal's estimated delivery date
      const deal = this.state.deals().find(d => d.id === po.dealId);
      if (deal) {
        // Estimate customer delivery 3 days after vendor delivery
        const parts = this.loggedDeliveryDate.split('-');
        if (parts.length === 3) {
          const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          date.setDate(date.getDate() + 3);
          const customerEst = date.toISOString().substring(0, 10);
          
          this.state.deals.update(deals =>
            deals.map(d => d.id === deal.id ? { ...d, estimatedDeliveryDate: customerEst } : d)
          );
        }
      }
      
      this.setDeliveryDateModalOpen.set(false);
    }
  }

  // Create Task manually
  openCreateTaskModal() {
    this.newTaskData = {
      title: '',
      description: '',
      assignedTeam: 'Sales',
      assignedTo: '',
      relatedTo: ''
    };
    this.taskModalOpen.set(true);
  }

  saveTask() {
    this.state.addTask({
      title: this.newTaskData.title,
      description: this.newTaskData.description,
      assignedTeam: this.newTaskData.assignedTeam,
      assignedTo: this.newTaskData.assignedTo || undefined,
      status: 'Pending',
      relatedTo: this.newTaskData.relatedTo || undefined
    });
    this.taskModalOpen.set(false);
  }
}

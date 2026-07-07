import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService, Task } from '../services/crm-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { CreatedByBadgeComponent } from '../shared/created-by-badge.component';

const MODULE_SUB_MODULES: Record<string, string[]> = {
  Sales: ['Deal', 'Proposal', 'PurchaseOrder'],
  Finance: ['CustomerInvoice', 'VendorInvoice', 'Recovery'],
  Partners: ['Lead', 'Customer', 'Prospect', 'Vendor'],
  Support: ['Ticket'],
  Marketing: ['Campaign'],
};

const SUB_MODULE_LABELS: Record<string, string> = {
  Deal: 'Deal',
  Proposal: 'Proposal',
  PurchaseOrder: 'Purchase Order',
  CustomerInvoice: 'Customer Invoice',
  VendorInvoice: 'Vendor Invoice',
  Recovery: 'Recovery',
  Lead: 'Lead',
  Customer: 'Customer',
  Prospect: 'Prospect',
  Vendor: 'Vendor',
  Ticket: 'Ticket',
  Campaign: 'Campaign',
};

@Component({
  selector: 'app-tasks',
  imports: [MatIconModule, CommonModule, FormsModule, DragDropModule, CreatedByBadgeComponent],
  styles: [`
    .kanban-column.cdk-drop-list-dragging .kanban-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .kanban-card.cdk-drag-placeholder {
      opacity: 0;
    }
    .kanban-card.cdk-drag-preview {
      background: white !important;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
      transform: rotate(3deg);
      transition: none;
    }
    .kanban-card {
      transition: transform 200ms cubic-bezier(0, 0, 0.2, 1),
                  box-shadow 200ms ease;
    }
    .kanban-column {
      transition: background-color 200ms ease;
    }
  `],
  template: `
    <div class="space-y-8">
      <div class="flex justify-end">
        <button (click)="openCreateTaskModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-lg shadow-indigo-200">
          <mat-icon class="w-5 h-5 text-[20px]! leading-none! flex items-center justify-center">add</mat-icon>
          New Task
        </button>
      </div>

      <!-- View Tabs -->
      <div class="flex gap-1 glass-card rounded-xl p-1 w-fit">
        <button
          (click)="activeView.set('list')"
          [class]="activeView() === 'list' ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
          class="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
        >
          <mat-icon class="text-[18px] w-[18px] h-[18px]">list_alt</mat-icon>
          List
        </button>
        <button
          (click)="activeView.set('kanban')"
          [class]="activeView() === 'kanban' ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
          class="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
        >
          <mat-icon class="text-[18px] w-[18px] h-[18px]">view_column</mat-icon>
          Kanban
        </button>
      </div>

      <!-- List View -->
      @if (activeView() === 'list') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (task of state.tasks(); track task.id) {
            <div class="glass-card rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-all">
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

              <div class="border-t border-slate-100 pt-3 flex flex-col gap-2 mt-4">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-400 font-medium">Created By:</span>
                  <app-created-by-badge [createdBy]="task.createdBy" [createdAt]="task.createdAt" />
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-400 font-medium">Assigned Team:</span>
                  <span class="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{{task.assignedTeam || 'Sales'}}</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-400 font-medium">Assigned Person:</span>
                  <span class="font-bold text-slate-700">{{task.assignedTo || 'Unassigned'}}</span>
                </div>

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

                  @if (task.status !== 'Completed') {
                    <button (click)="openAssignModal(task)" class="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center">
                      <mat-icon class="text-[16px] w-4 h-4">person</mat-icon> Assign
                    </button>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full text-center py-12 text-slate-500 glass-card rounded-2xl">
              No tasks found. Create a new task to get started.
            </div>
          }
        </div>
      }

      <!-- Kanban View -->
      @if (activeView() === 'kanban') {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[600px]" cdkDropListGroup>
          <div class="glass rounded-2xl p-4 flex flex-col">
            <div class="flex items-center justify-between mb-4 px-1">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Pending</h3>
              </div>
              <span class="text-xs font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-white/30">{{pendingTasks().length}}</span>
            </div>
            <div
              cdkDropList
              [cdkDropListData]="pendingTasks()"
              (cdkDropListDropped)="onDrop($event, 'Pending')"
              class="kanban-column flex-1 space-y-3 min-h-[100px] rounded-xl"
            >
              @for (task of pendingTasks(); track task.id) {
                <div cdkDrag [cdkDragData]="task" class="kanban-card glass-card rounded-xl p-4 cursor-grab active:cursor-grabbing hover:shadow-md">
                  <div class="flex items-start justify-between mb-2">
                    <span class="text-[10px] font-mono text-slate-400">#{{task.id}}</span>
                    <span [class]="getStatusColor(task.status)" class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">{{task.status}}</span>
                  </div>
                  <h4 class="text-sm font-semibold text-slate-900 mb-2 leading-snug">{{task.title}}</h4>
                  @if (task.relatedTo) {
                    <div class="text-[11px] text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1 mb-2 inline-flex items-center gap-1 font-medium">
                      <mat-icon class="text-[12px] w-3 h-3 leading-none">link</mat-icon>
                      <span class="truncate max-w-[180px]">{{task.relatedTo}}</span>
                    </div>
                  }
                  <div class="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <mat-icon class="text-[14px] w-3.5 h-3.5">person</mat-icon>
                    <span class="font-medium truncate">{{task.assignedTo || 'Unassigned'}}</span>
                    @if (task.assignedTeam) {
                      <span class="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{{task.assignedTeam}}</span>
                    }
                  </div>
                  <div class="mt-2 pt-2 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-400">
                    <app-created-by-badge [createdBy]="task.createdBy" [createdAt]="task.createdAt" [size]="20" />
                  </div>
                </div>
              } @empty {
                <div class="text-center py-8 text-xs text-slate-400 italic">No tasks</div>
              }
            </div>
          </div>

          <div class="glass rounded-2xl p-4 flex flex-col">
            <div class="flex items-center justify-between mb-4 px-1">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide">In Progress</h3>
              </div>
              <span class="text-xs font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-white/30">{{inProgressTasks().length}}</span>
            </div>
            <div
              cdkDropList
              [cdkDropListData]="inProgressTasks()"
              (cdkDropListDropped)="onDrop($event, 'In Progress')"
              class="kanban-column flex-1 space-y-3 min-h-[100px] rounded-xl"
            >
              @for (task of inProgressTasks(); track task.id) {
                <div cdkDrag [cdkDragData]="task" class="kanban-card glass-card rounded-xl p-4 cursor-grab active:cursor-grabbing hover:shadow-md">
                  <div class="flex items-start justify-between mb-2">
                    <span class="text-[10px] font-mono text-slate-400">#{{task.id}}</span>
                    <span [class]="getStatusColor(task.status)" class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">{{task.status}}</span>
                  </div>
                  <h4 class="text-sm font-semibold text-slate-900 mb-2 leading-snug">{{task.title}}</h4>
                  @if (task.relatedTo) {
                    <div class="text-[11px] text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1 mb-2 inline-flex items-center gap-1 font-medium">
                      <mat-icon class="text-[12px] w-3 h-3 leading-none">link</mat-icon>
                      <span class="truncate max-w-[180px]">{{task.relatedTo}}</span>
                    </div>
                  }
                  <div class="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <mat-icon class="text-[14px] w-3.5 h-3.5">person</mat-icon>
                    <span class="font-medium truncate">{{task.assignedTo || 'Unassigned'}}</span>
                    @if (task.assignedTeam) {
                      <span class="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{{task.assignedTeam}}</span>
                    }
                  </div>
                  <div class="mt-2 pt-2 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-400">
                    <app-created-by-badge [createdBy]="task.createdBy" [createdAt]="task.createdAt" [size]="20" />
                  </div>
                </div>
              } @empty {
                <div class="text-center py-8 text-xs text-slate-400 italic">No tasks</div>
              }
            </div>
          </div>

          <div class="glass rounded-2xl p-4 flex flex-col">
            <div class="flex items-center justify-between mb-4 px-1">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wide">Completed</h3>
              </div>
              <span class="text-xs font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-white/30">{{completedTasks().length}}</span>
            </div>
            <div
              cdkDropList
              [cdkDropListData]="completedTasks()"
              (cdkDropListDropped)="onDrop($event, 'Completed')"
              class="kanban-column flex-1 space-y-3 min-h-[100px] rounded-xl"
            >
              @for (task of completedTasks(); track task.id) {
                <div cdkDrag [cdkDragData]="task" class="kanban-card glass-card rounded-xl p-4 cursor-grab active:cursor-grabbing hover:shadow-md">
                  <div class="flex items-start justify-between mb-2">
                    <span class="text-[10px] font-mono text-slate-400">#{{task.id}}</span>
                    <span [class]="getStatusColor(task.status)" class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">{{task.status}}</span>
                  </div>
                  <h4 class="text-sm font-semibold text-slate-900 mb-2 leading-snug">{{task.title}}</h4>
                  @if (task.relatedTo) {
                    <div class="text-[11px] text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1 mb-2 inline-flex items-center gap-1 font-medium">
                      <mat-icon class="text-[12px] w-3 h-3 leading-none">link</mat-icon>
                      <span class="truncate max-w-[180px]">{{task.relatedTo}}</span>
                    </div>
                  }
                  <div class="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <mat-icon class="text-[14px] w-3.5 h-3.5">person</mat-icon>
                    <span class="font-medium truncate">{{task.assignedTo || 'Unassigned'}}</span>
                    @if (task.assignedTeam) {
                      <span class="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{{task.assignedTeam}}</span>
                    }
                  </div>
                  <div class="mt-2 pt-2 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-400">
                    <app-created-by-badge [createdBy]="task.createdBy" [createdAt]="task.createdAt" [size]="20" />
                  </div>
                </div>
              } @empty {
                <div class="text-center py-8 text-xs text-slate-400 italic">No tasks</div>
              }
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Create Task Modal -->
    @if (taskModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="glass-dialog rounded-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Create New Task</h3>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Task Title</label>
              <input [(ngModel)]="newTaskData.title" type="text" placeholder="e.g. Generate Customer Invoice" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
              <textarea [(ngModel)]="newTaskData.description" rows="2" class="w-full glass-input rounded-lg p-2 text-sm focus:outline-indigo-600"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Assigned Team</label>
                <select [(ngModel)]="newTaskData.assignedTeam" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Support">Support</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Assigned Person</label>
                <select [(ngModel)]="newTaskData.assignedTo" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  <option value="">Unassigned</option>
                  @for (user of state.users(); track user.name) {
                    <option [value]="user.name">{{user.name}}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Module</label>
              <select [(ngModel)]="selectedModule" (ngModelChange)="onModuleChange()" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                <option value="">None</option>
                @for (mod of moduleList; track mod) {
                  <option [value]="mod">{{mod}}</option>
                }
              </select>
            </div>

            @if (selectedModule()) {
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Sub-module</label>
                <select [(ngModel)]="selectedSubModule" (ngModelChange)="onSubModuleChange()" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  <option value="">Select...</option>
                  @for (sub of subModules(); track sub) {
                    <option [value]="sub">{{subModuleLabel(sub)}}</option>
                  }
                </select>
              </div>
            }

            @if (selectedModule() && selectedSubModule()) {
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">{{subModuleLabel(selectedSubModule())}}</label>
                <select [(ngModel)]="newTaskData.relatedEntityId" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
                  <option value="">Select...</option>
                  @for (entity of relatedEntities(); track entity.id) {
                    <option [value]="entity.id">{{entity.label}}</option>
                  }
                </select>
              </div>
            }
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button (click)="closeTaskModal()" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 font-sans">Cancel</button>
            <button (click)="saveTask()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-lg shadow-indigo-200 font-sans">Save Task</button>
          </div>
        </div>
      </div>
    }

    <!-- Assign Modal -->
    @if (assignModalOpen()) {
      <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="glass-dialog rounded-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
          <h3 class="text-lg font-bold text-slate-950">Assign Task: {{selectedTask()?.title}}</h3>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Assignee</label>
            <select [(ngModel)]="reassignedUser" class="w-full glass-input rounded-lg p-2 text-sm bg-white focus:outline-indigo-600">
              @for (user of state.users(); track user.name) {
                <option [value]="user.name">{{user.name}} ({{user.role}})</option>
              }
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button (click)="assignModalOpen.set(false)" class="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
            <button (click)="saveAssignment()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-lg shadow-indigo-200">Assign</button>
          </div>
        </div>
      </div>
    }
  `
})
export class TasksComponent {
  state = inject(CrmStateService);

  moduleList = Object.keys(MODULE_SUB_MODULES);

  activeView = signal<'list' | 'kanban'>('list');

  pendingTasks = computed(() => this.state.tasks().filter(t => t.status === 'Pending'));
  inProgressTasks = computed(() => this.state.tasks().filter(t => t.status === 'In Progress'));
  completedTasks = computed(() => this.state.tasks().filter(t => t.status === 'Completed'));

  taskModalOpen = signal(false);
  assignModalOpen = signal(false);
  selectedTask = signal<Task | null>(null);
  reassignedUser = '';

  selectedModule = signal('');
  selectedSubModule = signal('');
  subModules = computed(() => this.selectedModule() ? MODULE_SUB_MODULES[this.selectedModule()] || [] : []);
  relatedEntities = computed(() => {
    const mod = this.selectedModule();
    const sub = this.selectedSubModule();
    if (!mod || !sub) return [];
    return this.state.getRelatedEntities(mod, sub);
  });

  newTaskData = {
    title: '',
    description: '',
    assignedTeam: 'Sales' as 'Sales' | 'Operations' | 'Finance' | 'Support',
    assignedTo: '',
    relatedEntityId: ''
  };

  constructor() {
    const tab = this.state.navigateTab();
    if (tab === 'kanban') {
      this.activeView.set('kanban');
      this.state.navigateTab.set(null);
    }
  }

  subModuleLabel(sub: string): string {
    return SUB_MODULE_LABELS[sub] || sub;
  }

  getRelatedLabel(task: Task): string {
    if (task.relatedTo) return task.relatedTo;
    if (task.relatedModule && task.relatedSubModule) {
      const subLabel = this.subModuleLabel(task.relatedSubModule);
      return `${subLabel} (${task.relatedModule})`;
    }
    return '';
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'In Progress': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      default: return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  }

  onDrop(event: CdkDragDrop<Task[]>, targetStatus: Task['status']) {
    if (event.previousContainer === event.container) return;
    const task = event.item.data as Task;
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    this.state.updateTaskStatus(task.id, targetStatus);
  }

  onModuleChange() {
    this.selectedSubModule.set('');
    this.newTaskData.relatedEntityId = '';
  }

  onSubModuleChange() {
    this.newTaskData.relatedEntityId = '';
  }

  openCreateTaskModal() {
    this.newTaskData = {
      title: '',
      description: '',
      assignedTeam: 'Sales',
      assignedTo: '',
      relatedEntityId: ''
    };
    this.selectedModule.set('');
    this.selectedSubModule.set('');
    this.taskModalOpen.set(true);
  }

  closeTaskModal() {
    this.taskModalOpen.set(false);
  }

  saveTask() {
    const mod = this.selectedModule();
    const sub = this.selectedSubModule();
    const entityId = this.newTaskData.relatedEntityId;
    let relatedTo: string | undefined;
    let relatedModule: string | undefined;
    let relatedSubModule: string | undefined;
    let relatedEntityId: string | undefined;

    if (mod && sub && entityId) {
      relatedModule = mod;
      relatedSubModule = sub;
      relatedEntityId = entityId;
      const entities = this.state.getRelatedEntities(mod, sub);
      const found = entities.find(e => e.id === entityId);
      relatedTo = found ? found.label : entityId;
    }

    this.state.addTask({
      title: this.newTaskData.title,
      description: this.newTaskData.description,
      assignedTeam: this.newTaskData.assignedTeam,
      assignedTo: this.newTaskData.assignedTo || undefined,
      status: 'Pending',
      relatedTo,
      relatedModule: relatedModule as Task['relatedModule'],
      relatedSubModule,
      relatedEntityId
    });
    this.taskModalOpen.set(false);
  }

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
}

import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { ToastService } from '../toast.service';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTeamId?: string;
  assignedToUserId?: string;
  assignedByUserId: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  priority?: 'URGENT' | 'MEDIUM' | 'LOW';
  dueDate?: string;
  relatedEntityType: 'PARTNER' | 'DEAL' | 'PROPOSAL' | 'PURCHASE_ORDER' | 'INVOICE' | 'TICKET' | 'CAMPAIGN';
  relatedEntityId?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  tasks = signal<Task[]>([]);
  isLoaded = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  allTasks = computed(() => this.tasks());
  isLoading$ = computed(() => this.isLoading());
  error$ = computed(() => this.error());

  load(): void {
    if (this.isLoaded()) return;
    this.isLoading.set(true);
    this.error.set(null);

    this.api.getTasks().subscribe({
      next: (tasks) => {
        if (tasks && tasks.length > 0) {
          this.tasks.set(tasks);
        }
        this.isLoaded.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.warn('Failed to load tasks from API:', err);
        this.isLoaded.set(true);
        this.isLoading.set(false);
        this.error.set('Failed to load tasks from the server.');
      }
    });
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.api.createTask(task as any).subscribe({
      next: (created) => {
        this.tasks.update(tasks => [...tasks, created]);
        this.toast.show(`Task <strong>${created.title}</strong> created`);
      },
      error: () => this.toast.show('Failed to create task', { type: 'error' })
    });
  }

  updateTask(id: string, task: Partial<Task>): void {
    this.api.updateTask(id, task as any).subscribe({
      next: (updated) => {
        this.tasks.update(tasks =>
          tasks.map(t => t.id === id ? updated : t)
        );
        this.toast.show(`Task updated`);
      },
      error: () => this.toast.show('Failed to update task', { type: 'error' })
    });
  }

  deleteTask(id: string): void {
    const deleted = this.tasks().find(t => t.id === id);
    this.api.deleteTask(id).subscribe({
      next: () => {
        this.tasks.update(tasks => tasks.filter(t => t.id !== id));
        this.toast.show(`Task <strong>${deleted?.title || id}</strong> deleted`, {
          undo: () => {
            if (deleted) {
              this.tasks.update(tasks => [...tasks, deleted]);
            }
          }
        });
      },
      error: () => this.toast.show('Failed to delete task', { type: 'error' })
    });
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks().find(t => t.id === id);
  }
}

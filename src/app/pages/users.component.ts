import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CrmStateService, CrmUser, RoleId } from '../services/crm-state.service';
import { UserAvatarComponent } from '../shared/user-avatar.component';
import { RoleBadgeComponent } from '../shared/role-badge.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UserAvatarComponent, RoleBadgeComponent, MatIconModule],
  styles: [`
    .panel {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.25s ease, opacity 0.25s ease;
    }
    .panel.open {
      max-height: 800px;
      opacity: 1;
    }
  `],
  template: `
    <div class="space-y-6 font-sans">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-slate-900">Users</h1>
          <span class="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-100/50">
            {{ state.activeUsers().length }} Active
          </span>
        </div>
        <button
          (click)="openAddPanel()"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <mat-icon class="text-base w-4 h-4 flex items-center justify-center">add</mat-icon>
          Add User
        </button>
      </div>

      <!-- Add/Edit User Panel (Inline) -->
      <div [class.open]="showAddPanel()" class="panel bg-slate-50 border border-slate-200/80 rounded-2xl p-0 shadow-xs">
        <div class="p-6 space-y-4">
          <h3 class="font-bold text-slate-800 text-sm">
            {{ editingUser() ? 'Edit User details' : 'Add New User Account' }}
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Display Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Display Name *</label>
              <input
                [(ngModel)]="formDisplayName"
                type="text"
                placeholder="e.g. Amina Alaoui"
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-indigo-600 text-slate-800"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Email address *</label>
              <input
                [(ngModel)]="formEmail"
                [disabled]="!!editingUser()"
                type="email"
                placeholder="e.g. a.alaoui@acg.ma"
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-indigo-600 text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              />
            </div>

            <!-- Job Title -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Job Title</label>
              <input
                [(ngModel)]="formJobTitle"
                type="text"
                placeholder="e.g. Accountant Specialist"
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-indigo-600 text-slate-800"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone number</label>
              <input
                [(ngModel)]="formPhone"
                type="text"
                placeholder="e.g. +212-661-234567"
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-indigo-600 text-slate-800"
              />
            </div>

            <!-- Role Dropdown -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">System Role</label>
              <select
                [(ngModel)]="formRoleId"
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-indigo-600 text-slate-700 cursor-pointer font-semibold"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="salesperson">Sales (Salesperson)</option>
                <option value="support">Support</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <!-- Team Dropdown -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1">Team Assignment</label>
              <select
                [(ngModel)]="formTeamId"
                class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-indigo-600 text-slate-700 cursor-pointer font-semibold"
              >
                <option value="">Unassigned</option>
                @for (team of state.teams(); track team.id) {
                  <option [value]="team.id">{{ team.name }} ({{ team.department }})</option>
                }
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              (click)="closeAddPanel()"
              class="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              (click)="saveUser()"
              [disabled]="!formDisplayName.trim() || !formEmail.trim()"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {{ editingUser() ? 'Save changes' : 'Add User' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div class="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <!-- Search input -->
          <div class="relative flex-1 max-w-xs">
            <input
              [(ngModel)]="searchTerm"
              type="text"
              placeholder="Search by name or email..."
              class="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-indigo-600 text-slate-800"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">search</mat-icon>
            </div>
          </div>

          <!-- Role Select -->
          <select
            [(ngModel)]="selectedRole"
            class="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white text-slate-600 cursor-pointer font-semibold focus:outline-indigo-600"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="salesperson">Sales</option>
            <option value="support">Support</option>
            <option value="viewer">Viewer</option>
          </select>

          <!-- Team Select -->
          <select
            [(ngModel)]="selectedTeam"
            class="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white text-slate-600 cursor-pointer font-semibold focus:outline-indigo-600"
          >
            <option value="all">All Teams</option>
            <option value="unassigned">Unassigned</option>
            @for (t of state.teams(); track t.id) {
              <option [value]="t.id">{{ t.name }}</option>
            }
          </select>
        </div>

        <!-- Status Toggle toggleInactive -->
        <label class="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            [(ngModel)]="showInactive"
            class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
          />
          <span class="text-xs font-semibold text-slate-600">Show Inactive accounts</span>
        </label>
      </div>

      <!-- Table / User List -->
      <div class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User details</th>
              <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">System Role</th>
              <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Team</th>
              <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            @for (user of filteredUsers(); track user.id) {
              <!-- Standard row -->
              <tr class="hover:bg-slate-50/40 transition-colors">
                <!-- Avatar + Name -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <a [routerLink]="['/settings/users', user.id]" class="hover:opacity-85 transition-opacity">
                      <app-user-avatar [userId]="user.id" [size]="36"></app-user-avatar>
                    </a>
                    <div>
                      <a [routerLink]="['/settings/users', user.id]" class="font-bold text-xs text-slate-800 hover:text-indigo-600 block transition-colors">
                        {{ user.displayName }}
                      </a>
                      <span class="text-[10px] text-slate-400 block font-medium mt-0.5">{{ user.jobTitle || 'No title' }}</span>
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium font-mono">
                  {{ user.email }}
                </td>

                <!-- Role badge -->
                <td class="px-6 py-4 whitespace-nowrap text-xs">
                  @if (editingRoleIdUserId() === user.id) {
                    <div class="space-y-1">
                      <select
                        [value]="user.roleId"
                        (change)="changeUserRole(user.id, $event)"
                        (blur)="cancelRoleEdit()"
                        (keydown.esc)="cancelRoleEdit()"
                        class="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white text-slate-700 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-500"
                        autofocus
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="salesperson">Sales</option>
                        <option value="support">Support</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      @if (roleErrorUserId() === user.id) {
                        <p class="text-[10px] text-rose-600 leading-tight font-medium">{{ roleErrorMessage() }}</p>
                      }
                    </div>
                  } @else {
                    <app-role-badge [roleId]="user.roleId"></app-role-badge>
                  }
                </td>

                <!-- Team -->
                <td class="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                  {{ getTeamName(user.teamId) }}
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap text-xs">
                  <span
                    [class]="user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'"
                    class="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border"
                  >
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>

                <!-- Actions Menu -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-xs relative">
                  <button
                    (click)="toggleMenu(user.id, $event)"
                    class="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors flex items-center ml-auto cursor-pointer"
                  >
                    <mat-icon class="text-base w-5 h-5 flex items-center justify-center">more_vert</mat-icon>
                  </button>

                  <!-- Actions Dropdown panel -->
                  @if (activeMenuUserId() === user.id) {
                    <div class="absolute right-6 top-11 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-10 w-36 text-left animate-in fade-in slide-in-from-top-1 duration-100">
                      <button
                        (click)="editUser(user)"
                        class="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        <mat-icon class="text-slate-400 text-sm w-4 h-4 flex items-center justify-center">edit</mat-icon>
                        Edit Details
                      </button>
                      <button
                        (click)="startRoleEdit(user.id)"
                        class="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        <mat-icon class="text-slate-400 text-sm w-4 h-4 flex items-center justify-center">swap_horiz</mat-icon>
                        Change Role
                      </button>
                      @if (user.isActive && user.id !== state.currentUserId()) {
                        <button
                          (click)="confirmDeactivate(user.id)"
                          class="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                        >
                          <mat-icon class="text-rose-400 text-sm w-4 h-4 flex items-center justify-center">block</mat-icon>
                          Deactivate
                        </button>
                      }
                    </div>
                  }
                </td>
              </tr>

              <!-- Inline Deactivation Confirmation row -->
              @if (deactivateConfirmUserId() === user.id) {
                <tr class="bg-rose-50/40">
                  <td colspan="6" class="px-6 py-3 border-t border-rose-100">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2 text-rose-800 text-xs font-semibold">
                        <mat-icon class="text-rose-500 text-sm w-4 h-4 flex items-center justify-center">warning</mat-icon>
                        <span>Deactivate {{ user.displayName }}? This cannot be undone.</span>
                      </div>
                      <div class="flex items-center gap-2">
                        @if (deactivateErrorMessage()) {
                          <span class="text-[10px] text-rose-700 font-bold mr-2">{{ deactivateErrorMessage() }}</span>
                        }
                        <button
                          (click)="cancelDeactivate()"
                          class="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-slate-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          (click)="executeDeactivate(user.id)"
                          class="bg-rose-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-rose-750 cursor-pointer shadow-xs"
                        >
                          Confirm Deactivation
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              }
            } @empty {
              <!-- Empty state row -->
              <tr>
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                    <div class="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                      <i class="ti ti-users-off text-2xl leading-none"></i>
                    </div>
                    <p class="text-xs font-bold text-slate-800 font-sans">No users match your filters</p>
                    <p class="text-[10px] text-slate-500">Try adjusting your filters, query string or toggle settings to locate the user.</p>
                    <button
                      (click)="clearFilters()"
                      class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100/50 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class UsersComponent {
  state = inject(CrmStateService);

  // Filters signals
  searchTerm = signal<string>('');
  selectedRole = signal<string>('all');
  selectedTeam = signal<string>('all');
  showInactive = signal<boolean>(false);

  // Add / Edit form signals
  showAddPanel = signal<boolean>(false);
  editingUser = signal<CrmUser | null>(null);

  formDisplayName = '';
  formEmail = '';
  formJobTitle = '';
  formPhone = '';
  formRoleId: RoleId = 'viewer';
  formTeamId = '';

  // Interactivity signals
  activeMenuUserId = signal<string | null>(null);
  editingRoleIdUserId = signal<string | null>(null);
  roleErrorUserId = signal<string | null>(null);
  roleErrorMessage = signal<string>('');

  deactivateConfirmUserId = signal<string | null>(null);
  deactivateErrorMessage = signal<string>('');

  // Close menus when clicking anywhere
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', () => {
        this.activeMenuUserId.set(null);
      });
    }
  }

  toggleMenu(userId: string, event: Event) {
    event.stopPropagation();
    if (this.activeMenuUserId() === userId) {
      this.activeMenuUserId.set(null);
    } else {
      this.activeMenuUserId.set(userId);
    }
  }

  // Filter computation
  filteredUsers = computed(() => {
    let list = this.state.users();
    const query = this.searchTerm().toLowerCase().trim();
    const role = this.selectedRole();
    const team = this.selectedTeam();
    const activeOnly = !this.showInactive();

    // 1. Status Filter
    if (activeOnly) {
      list = list.filter(u => u.isActive);
    }

    // 2. Role Filter
    if (role !== 'all') {
      list = list.filter(u => u.roleId === role);
    }

    // 3. Team Filter
    if (team !== 'all') {
      if (team === 'unassigned') {
        list = list.filter(u => !u.teamId);
      } else {
        list = list.filter(u => u.teamId === team);
      }
    }

    // 4. Search Query Filter
    if (query) {
      list = list.filter(u => 
        u.displayName.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
    }

    return list;
  });

  // Actions
  clearFilters() {
    this.searchTerm.set('');
    this.selectedRole.set('all');
    this.selectedTeam.set('all');
    this.showInactive.set(false);
  }

  openAddPanel() {
    this.editingUser.set(null);
    this.formDisplayName = '';
    this.formEmail = '';
    this.formJobTitle = '';
    this.formPhone = '';
    this.formRoleId = 'viewer';
    this.formTeamId = '';
    this.showAddPanel.set(true);
  }

  editUser(user: CrmUser) {
    this.editingUser.set(user);
    this.formDisplayName = user.displayName;
    this.formEmail = user.email;
    this.formJobTitle = user.jobTitle || '';
    this.formPhone = user.phone || '';
    this.formRoleId = user.roleId;
    this.formTeamId = user.teamId || '';
    this.showAddPanel.set(true);
    this.activeMenuUserId.set(null);
  }

  closeAddPanel() {
    this.showAddPanel.set(false);
    this.editingUser.set(null);
  }

  saveUser() {
    const editMode = this.editingUser();
    if (editMode) {
      this.state.updateUser(editMode.id, {
        displayName: this.formDisplayName,
        jobTitle: this.formJobTitle,
        phone: this.formPhone,
        roleId: this.formRoleId,
        teamId: this.formTeamId || null
      });
      // Handle potential team memberships update
      const oldTeamId = editMode.teamId;
      const newTeamId = this.formTeamId;
      if (oldTeamId !== newTeamId) {
        if (oldTeamId) {
          try {
            this.state.removeTeamMember(oldTeamId, editMode.id);
          } catch (e) {}
        }
        if (newTeamId) {
          this.state.addTeamMember(newTeamId, editMode.id);
        }
      }
    } else {
      this.state.addUser({
        displayName: this.formDisplayName,
        email: this.formEmail,
        jobTitle: this.formJobTitle,
        phone: this.formPhone,
        roleId: this.formRoleId,
        teamId: this.formTeamId || null,
        isActive: true,
        preferences: {
          language: 'fr',
          notifyOnLeadAssign: true,
          notifyOnDealUpdate: true,
          notifyOnMention: true
        }
      });
    }
    this.closeAddPanel();
  }

  // Inline role editing
  startRoleEdit(userId: string) {
    this.editingRoleIdUserId.set(userId);
    this.roleErrorUserId.set(null);
    this.roleErrorMessage.set('');
    this.activeMenuUserId.set(null);
  }

  changeUserRole(userId: string, event: Event) {
    const val = (event.target as HTMLSelectElement).value as RoleId;
    try {
      this.state.updateUserRole(userId, val);
      this.cancelRoleEdit();
    } catch (err: any) {
      this.roleErrorUserId.set(userId);
      this.roleErrorMessage.set(err.message || 'Operation failed');
    }
  }

  cancelRoleEdit() {
    this.editingRoleIdUserId.set(null);
  }

  // Deactivation
  confirmDeactivate(userId: string) {
    this.deactivateConfirmUserId.set(userId);
    this.deactivateErrorMessage.set('');
    this.activeMenuUserId.set(null);
  }

  executeDeactivate(userId: string) {
    try {
      this.state.deactivateUser(userId);
      this.cancelDeactivate();
    } catch (err: any) {
      this.deactivateErrorMessage.set(err.message || 'Deactivation failed');
    }
  }

  cancelDeactivate() {
    this.deactivateConfirmUserId.set(null);
    this.deactivateErrorMessage.set('');
  }

  // Getters
  getTeamName(teamId: string | null): string {
    if (!teamId) return '—';
    return this.state.teams().find(t => t.id === teamId)?.name || '—';
  }
}

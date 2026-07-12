import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrmStateService } from '../services/crm-state.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-org-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-8 font-sans">

      <!-- Success Banner -->
      @if (showSuccess()) {
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
          <mat-icon class="text-emerald-600 text-base w-5 h-5 flex items-center justify-center">check_circle</mat-icon>
          <span>Changes saved successfully.</span>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- LEFT COLUMN: Organization Card -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-800 text-base">Profile Details</h3>
            <button
              (click)="toggleEdit()"
              class="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors flex items-center cursor-pointer"
              title="Edit Profile"
            >
              <mat-icon class="text-lg w-5 h-5 flex items-center justify-center">{{ isEditing() ? 'close' : 'edit' }}</mat-icon>
            </button>
          </div>

          <div class="flex items-center gap-4">
            <!-- Large initials circle -->
            <div
              [style.background-color]="state.organization().logoColor"
              class="w-16 h-16 rounded-2xl text-white font-extrabold text-2xl flex items-center justify-center uppercase shadow-sm shrink-0"
            >
              {{ state.organization().logoInitials }}
            </div>
            <div class="flex-1 min-w-0">
              @if (isEditing()) {
                <input
                  [(ngModel)]="editName"
                  placeholder="Organization Name"
                  class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-indigo-600 font-semibold text-slate-800"
                />
              } @else {
                <h2 class="text-lg font-bold text-slate-900 truncate">{{ state.organization().name }}</h2>
                <p class="text-xs text-slate-400 font-mono mt-0.5">ID: {{ state.organization().id }}</p>
              }
            </div>
          </div>

          <div class="space-y-4">
            <!-- Industry -->
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Industry</label>
              @if (isEditing()) {
                <select
                  [(ngModel)]="editIndustry"
                  class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-indigo-600 font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Retail">Retail</option>
                  <option value="Education">Education</option>
                </select>
              } @else {
                <div class="text-sm font-semibold text-slate-800">{{ state.organization().industry }}</div>
              }
            </div>

            <!-- Timezone -->
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Timezone</label>
              @if (isEditing()) {
                <input
                  [(ngModel)]="editTimezone"
                  placeholder="e.g. Africa/Casablanca"
                  class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-indigo-600 text-slate-700"
                />
              } @else {
                <div class="text-sm font-semibold text-slate-800 font-mono">{{ state.organization().timezone }}</div>
              }
            </div>

            <!-- Fiscal Year Start -->
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fiscal Year Start Month</label>
              @if (isEditing()) {
                <select
                  [(ngModel)]="editFiscalStart"
                  class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-indigo-600 font-semibold text-slate-700 cursor-pointer"
                >
                  @for (m of months; track m.value) {
                    <option [value]="m.value">{{ m.name }}</option>
                  }
                </select>
              } @else {
                <div class="text-sm font-semibold text-slate-800">{{ getMonthName(state.organization().fiscalYearStart) }}</div>
              }
            </div>
          </div>

          @if (isEditing()) {
            <div class="pt-2">
              <button
                (click)="saveOrgDetails()"
                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer font-sans"
              >
                Save Changes
              </button>
            </div>
          }
        </div>

        <!-- RIGHT COLUMN: Metrics -->
        <div class="space-y-6">
          <h3 class="font-bold text-slate-800 text-base px-1">Organization Metrics</h3>
          <div class="grid grid-cols-2 gap-4">
            <!-- Total Users -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-4 lg:p-5 shadow-xs hover:shadow-md transition-shadow">
              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</div>
              <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">{{ state.users().length }}</div>
            </div>

            <!-- Active Users -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-4 lg:p-5 shadow-xs hover:shadow-md transition-shadow">
              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Users</div>
              <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">{{ state.activeUsers().length }}</div>
            </div>

            <!-- Active Teams -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-4 lg:p-5 shadow-xs hover:shadow-md transition-shadow">
              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Teams</div>
              <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">{{ state.teams().length }}</div>
            </div>

            <!-- Groups -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-4 lg:p-5 shadow-xs hover:shadow-md transition-shadow">
              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collaboration Groups</div>
              <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">{{ state.groups().length }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- BELOW COLUMNS: Danger Zone -->
      <div class="bg-rose-50 border border-rose-200/80 rounded-2xl p-6 shadow-xs">
        <h3 class="font-bold text-rose-800 text-base mb-2">Danger Zone</h3>
        <p class="text-xs text-rose-600/90 mb-4">Deactivating the organization will disable all user accounts and freeze CRM data collections. This action requires high administrative verification.</p>
        <button
          disabled
          class="bg-rose-100/50 text-rose-450 px-4 py-2.5 rounded-xl text-sm font-semibold border border-rose-200/50 cursor-not-allowed select-none"
          title="Contact support to deactivate your organization"
        >
          Deactivate Organization
        </button>
      </div>
    </div>
  `
})
export class OrgSettingsComponent {
  state = inject(CrmStateService);

  isEditing = signal<boolean>(false);
  showSuccess = signal<boolean>(false);

  editName = '';
  editIndustry = '';
  editTimezone = '';
  editFiscalStart = 1;

  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  toggleEdit() {
    if (this.isEditing()) {
      this.isEditing.set(false);
    } else {
      const org = this.state.organization();
      this.editName = org.name;
      this.editIndustry = org.industry;
      this.editTimezone = org.timezone;
      this.editFiscalStart = org.fiscalYearStart;
      this.isEditing.set(true);
    }
  }

  saveOrgDetails() {
    this.state.updateOrganization({
      name: this.editName,
      industry: this.editIndustry,
      timezone: this.editTimezone,
      fiscalYearStart: Number(this.editFiscalStart)
    });
    this.isEditing.set(false);
    this.showSuccess.set(true);
    setTimeout(() => {
      this.showSuccess.set(false);
    }, 2000);
  }

  getMonthName(val: number): string {
    return this.months.find(m => m.value === val)?.name || 'January';
  }
}

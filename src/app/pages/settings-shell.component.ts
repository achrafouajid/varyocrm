import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto font-sans">
      <!-- Left Sidebar Nav -->
      <aside class="w-full md:w-56 shrink-0 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs self-start">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">Settings</h2>
        <nav class="space-y-1">
          <a
            routerLink="/settings/organization"
            routerLinkActive="bg-indigo-50/50 text-indigo-600 border-l-2 border-indigo-600 font-semibold"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors border-l-2 border-transparent"
          >
            <i class="ti ti-building text-base leading-none"></i>
            Organization
          </a>
          <a
            routerLink="/settings/users"
            routerLinkActive="bg-indigo-50/50 text-indigo-600 border-l-2 border-indigo-600 font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors border-l-2 border-transparent"
          >
            <i class="ti ti-users text-base leading-none"></i>
            Users
          </a>
          <a
            routerLink="/settings/teams"
            routerLinkActive="bg-indigo-50/50 text-indigo-600 border-l-2 border-indigo-600 font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors border-l-2 border-transparent"
          >
            <i class="ti ti-users-group text-base leading-none"></i>
            Teams
          </a>
          <a
            routerLink="/settings/groups"
            routerLinkActive="bg-indigo-50/50 text-indigo-600 border-l-2 border-indigo-600 font-semibold"
            class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors border-l-2 border-transparent"
          >
            <i class="ti ti-messages text-base leading-none"></i>
            Groups
          </a>
        </nav>
      </aside>

      <!-- Right Side Content -->
      <main class="flex-1 min-w-0">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class SettingsShellComponent {}

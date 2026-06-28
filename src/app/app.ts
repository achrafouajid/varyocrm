import { Component, signal, ElementRef, inject, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CrmStateService } from './services/crm-state.service';
import { UserAvatarComponent } from './shared/user-avatar.component';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  children?: { label: string; icon: string; route: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'home', route: '/' },
  { label: 'Sales', icon: 'monetization_on', route: '/sales' },
  { label: 'Marketing', icon: 'campaign', route: '/marketing' },
  { label: 'Leads', icon: 'person_search', route: '/leads' },
  { label: 'Tasks', icon: 'task_alt', route: '/tasks' },
  { label: 'Tickets', icon: 'support_agent', route: '/tickets' },
  { label: 'Analytics', icon: 'bar_chart', route: '/analytics' },
  { label: 'Partners', icon: 'handshake', route: '/partners' },
  { label: 'Finance', icon: 'account_balance', route: '/finance' },
  { label: 'Automation', icon: 'smart_toy', route: '/automation' },
  { label: 'Groups', icon: 'group_work', route: '/groups' },
  { label: 'Settings', icon: 'settings', route: '/settings' },
];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, CommonModule, UserAvatarComponent],
  styles: [`
    .sidebar {
      width: 64px;
      transition: width 180ms cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      flex-shrink: 0;
    }
    .sidebar.expanded {
      width: 220px;
    }
    .nav-label {
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      white-space: nowrap;
      transition: opacity 140ms cubic-bezier(0.4, 0, 0.2, 1),
                  max-width 180ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar.expanded .nav-label {
      opacity: 1;
      max-width: 160px;
    }
    .sub-nav {
      max-height: 0;
      overflow: hidden;
      transition: max-height 220ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sub-nav.open {
      max-height: 200px;
    }
    .chevron {
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      transition: opacity 140ms cubic-bezier(0.4, 0, 0.2, 1),
                  max-width 180ms cubic-bezier(0.4, 0, 0.2, 1),
                  transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar.expanded .chevron {
      opacity: 1;
      max-width: 20px;
    }
    .chevron.rotated {
      transform: rotate(180deg);
    }
    /* Tooltip — only visible when collapsed and NOT hover-expanding */
    .sidebar-tooltip {
      position: absolute;
      left: calc(100% + 10px);
      top: 50%;
      transform: translateY(-50%);
      background: #1e293b;
      color: #f1f5f9;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 8px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 80ms ease;
      z-index: 1000;
    }
    .sidebar:not(.expanded) .nav-item-wrap:hover .sidebar-tooltip {
      opacity: 1;
    }
    /* Hover-progress ring on the icon badge when collapsed */
    .sidebar:not(.expanded) .nav-item-wrap:hover .icon-badge {
      background: #eef2ff;
      color: #4f46e5;
    }
    .toggle-btn {
      transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .toggle-btn.expanded {
      transform: rotate(180deg);
    }
    /* Hover delay indicator bar */
    .hover-bar {
      position: absolute;
      bottom: 0;
      left: 8px;
      right: 8px;
      height: 2px;
      border-radius: 1px;
      background: #6366f1;
      transform: scaleX(0);
      transform-origin: left;
      opacity: 0;
    }
    .sidebar:not(.expanded) .nav-item-wrap:hover .hover-bar {
      opacity: 1;
      transform: scaleX(1);
      transition: transform 1s linear, opacity 50ms ease;
    }
  `],
  template: `
    <div class="min-h-screen bg-[#F5F6FA] text-slate-900 font-sans flex" style="height:100vh; overflow:hidden;">

      <!-- Sidebar -->
      <aside
        class="sidebar flex flex-col bg-white border-r border-slate-200/80 h-full relative z-40"
        [class.expanded]="isExpanded()"
        (mouseenter)="onSidebarMouseEnter()"
        (mouseleave)="onSidebarMouseLeave()"
      >
        <!-- Logo / Toggle -->
        <div class="flex items-center h-16 px-3 border-b border-slate-100 gap-2 shrink-0">
          <button
            (click)="togglePin()"
            class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all duration-150 shrink-0"
            [title]="pinnedOpen() ? 'Unpin sidebar' : 'Pin sidebar open'"
          >
            <mat-icon class="text-[20px] w-5 h-5 toggle-btn" [class.expanded]="isExpanded()">chevron_right</mat-icon>
          </button>
          @if (isExpanded()) {
            <a routerLink="/" class="flex items-center shrink-0 hover:opacity-80 transition-opacity overflow-hidden">
              <img src="/crm.webp" alt="MarocCRM" class="h-10 w-auto object-contain">
            </a>
          }
        </div>

        <!-- Nav Items -->
        <nav class="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-0.5">
          @for (item of navItems; track item.route + item.label) {
            @if (item.children) {
              <!-- Expandable group -->
              <div class="nav-item-wrap relative">
                <button
                  (click)="toggleSubnav(item.label)"
                  class="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                  [class.bg-indigo-50]="openSubnav() === item.label"
                  [class.text-indigo-700]="openSubnav() === item.label"
                >
                  <mat-icon class="icon-badge text-[20px] w-5 h-5 shrink-0 rounded-lg transition-colors duration-150">{{ item.icon }}</mat-icon>
                  <span class="nav-label text-sm font-semibold tracking-tight">{{ item.label }}</span>
                  <mat-icon class="chevron text-[18px] ml-auto shrink-0" [class.rotated]="openSubnav() === item.label">expand_more</mat-icon>
                </button>
                <div class="sidebar-tooltip">{{ item.label }}</div>
                <div class="hover-bar"></div>
                <!-- Sub items -->
                <div class="sub-nav pl-2" [class.open]="openSubnav() === item.label && isExpanded()">
                  @for (child of item.children; track child.label) {
                    <a
                      [routerLink]="child.route"
                      class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150 text-sm font-medium mt-0.5"
                    >
                      <mat-icon class="text-[16px] w-4 h-4 shrink-0">{{ child.icon }}</mat-icon>
                      <span>{{ child.label }}</span>
                    </a>
                  }
                </div>
              </div>
            } @else {
              <!-- Simple link -->
              <div class="nav-item-wrap relative">
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-indigo-50 !text-indigo-700 font-semibold"
                  [routerLinkActiveOptions]="item.route === '/' ? { exact: true } : {}"
                  class="flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                >
                  <mat-icon class="icon-badge text-[20px] w-5 h-5 shrink-0 rounded-lg transition-colors duration-150">{{ item.icon }}</mat-icon>
                  <span class="nav-label text-sm font-semibold tracking-tight">{{ item.label }}</span>
                </a>
                <div class="sidebar-tooltip">{{ item.label }}</div>
                <div class="hover-bar"></div>
              </div>
            }
          }
        </nav>

        <!-- Bottom: User Profile -->
        <div class="shrink-0 p-2 border-t border-slate-100">
          @let currentUser = getCurrentUser();
          @if (currentUser) {
            <a
              [routerLink]="['/settings/users', state.currentUserId()]"
              class="flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              title="View Profile"
            >
              <app-user-avatar [userId]="state.currentUserId()" [size]="36" class="shrink-0"></app-user-avatar>
              <div class="nav-label flex flex-col text-left overflow-hidden">
                <span class="text-xs font-bold text-slate-800 leading-tight truncate">{{ currentUser.displayName }}</span>
                <span class="text-[10px] text-slate-500 font-semibold leading-none mt-0.5 truncate uppercase tracking-wider">{{ currentUser.roleId }}</span>
              </div>
            </a>
          }
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main class="flex-1 overflow-y-auto p-6 lg:p-8">
          <router-outlet></router-outlet>
        </main>
      </div>

    </div>
  `
})
export class App implements OnDestroy {
  state = inject(CrmStateService);

  /** True when user has clicked the toggle to permanently pin the sidebar open */
  pinnedOpen = signal<boolean>(false);

  /** True when hover-expanded (auto, not pinned) */
  hoverOpen = signal<boolean>(false);

  /** Final computed expanded state */
  isExpanded() {
    return this.pinnedOpen() || this.hoverOpen();
  }

  openSubnav = signal<string | null>(null);
  navItems = NAV_ITEMS;

  private hoverTimer: ReturnType<typeof setTimeout> | null = null;

  onSidebarMouseEnter() {
    if (this.pinnedOpen()) return; // already open, nothing to do
    this.hoverTimer = setTimeout(() => {
      this.hoverOpen.set(true);
    }, 1000);
  }

  onSidebarMouseLeave() {
    // Cancel pending expand
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
    // Collapse only if it was hover-expanded (not pinned)
    if (!this.pinnedOpen()) {
      this.hoverOpen.set(false);
      this.openSubnav.set(null);
    }
  }

  togglePin() {
    const next = !this.pinnedOpen();
    this.pinnedOpen.set(next);
    // If unpinning while hover was open, collapse immediately
    if (!next) {
      this.hoverOpen.set(false);
      this.openSubnav.set(null);
    }
  }

  toggleSubnav(label: string) {
    this.openSubnav.set(this.openSubnav() === label ? null : label);
  }

  getCurrentUser() {
    return this.state.users().find(u => u.id === this.state.currentUserId());
  }

  ngOnDestroy() {
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
  }

  constructor(private elementRef: ElementRef) { }
}

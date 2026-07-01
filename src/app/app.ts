import { Component, signal, ElementRef, inject, OnDestroy, OnInit, computed, HostListener, viewChild, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrmStateService } from './services/crm-state.service';
import { UserAvatarComponent } from './shared/user-avatar.component';
import { SupportModalComponent } from './shared/support-modal.component';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'home', route: '/' },
  { label: 'Sales', icon: 'monetization_on', route: '/sales' },
  { label: 'Marketing', icon: 'campaign', route: '/marketing' },
  { label: 'Tasks', icon: 'task_alt', route: '/tasks' },
  { label: 'Tickets', icon: 'support_agent', route: '/tickets' },
  { label: 'Analytics', icon: 'bar_chart', route: '/analytics' },
  { label: 'Partners', icon: 'handshake', route: '/partners' },
  { label: 'Finance', icon: 'account_balance', route: '/finance' },
  { label: 'Automation', icon: 'smart_toy', route: '/automation' },
  { label: 'Groups', icon: 'group_work', route: '/groups' },
  { label: 'Settings', icon: 'settings', route: '/settings' },
];

interface SearchItem {
  mainMenu: string;
  mainIcon: string;
  mainRoute: string;
  submenu?: string;
  subIcon?: string;
  tab?: string;
  action: string;
  keywords: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  { mainMenu: 'Dashboard', mainIcon: 'home', mainRoute: '/', action: 'View your customizable daily summary and KPIs', keywords: 'dashboard home kpi summary' },
  { mainMenu: 'Sales', mainIcon: 'monetization_on', mainRoute: '/sales', submenu: 'Deals', subIcon: 'monetization_on', tab: 'deals', action: 'Manage deals and sales pipeline', keywords: 'sales deals pipeline opportunities' },
  { mainMenu: 'Sales', mainIcon: 'monetization_on', mainRoute: '/sales', submenu: 'Proposals', subIcon: 'description', tab: 'proposals', action: 'Create and manage proposals', keywords: 'sales proposals quotes estimates' },
  { mainMenu: 'Sales', mainIcon: 'monetization_on', mainRoute: '/sales', submenu: 'Purchase Orders', subIcon: 'shopping_cart', tab: 'pos', action: 'Generate and track purchase orders', keywords: 'sales purchase orders po procurement' },
  { mainMenu: 'Marketing', mainIcon: 'campaign', mainRoute: '/marketing', submenu: 'Email Campaigns', subIcon: 'email', tab: 'Email', action: 'Launch and manage email campaigns', keywords: 'marketing email campaigns' },
  { mainMenu: 'Marketing', mainIcon: 'campaign', mainRoute: '/marketing', submenu: 'WhatsApp Campaigns', subIcon: 'chat', tab: 'WhatsApp', action: 'Send WhatsApp campaigns to prospects', keywords: 'marketing whatsapp campaigns' },
  { mainMenu: 'Marketing', mainIcon: 'campaign', mainRoute: '/marketing', submenu: 'SMS Campaigns', subIcon: 'sms', tab: 'SMS', action: 'Send SMS campaigns to contacts', keywords: 'marketing sms campaigns' },
  { mainMenu: 'Partners', mainIcon: 'filter_alt', mainRoute: '/partners', submenu: 'Leads', subIcon: 'filter_alt', tab: 'Lead', action: 'Qualify leads, track interactions, and manage pipeline', keywords: 'leads qualification pipeline opportunities tracking' },
  { mainMenu: 'Tasks', mainIcon: 'task_alt', mainRoute: '/tasks', action: 'View tasks in list view', keywords: 'tasks assignments list view' },
  { mainMenu: 'Tasks', mainIcon: 'view_column', mainRoute: '/tasks', submenu: 'Kanban Board', subIcon: 'view_column', tab: 'kanban', action: 'View tasks in Kanban board', keywords: 'tasks kanban board drag drop columns' },
  { mainMenu: 'Tickets', mainIcon: 'support_agent', mainRoute: '/tickets', action: 'Manage customer support tickets and service requests', keywords: 'tickets support customer service' },
  { mainMenu: 'Analytics', mainIcon: 'bar_chart', mainRoute: '/analytics', action: 'View performance indicators, forecasts, and sales insights', keywords: 'analytics reports insights forecasts charts' },

  { mainMenu: 'Partners', mainIcon: 'handshake', mainRoute: '/partners', submenu: 'Customers', subIcon: 'people', tab: 'Customer', action: 'View customer profiles and account details', keywords: 'partners customers clients' },
  { mainMenu: 'Partners', mainIcon: 'handshake', mainRoute: '/partners', submenu: 'Prospects', subIcon: 'person_search', tab: 'Prospect', action: 'Track and convert prospects to customers', keywords: 'partners prospects conversions' },
  { mainMenu: 'Partners', mainIcon: 'handshake', mainRoute: '/partners', submenu: 'Vendors', subIcon: 'store', tab: 'Vendor', action: 'Manage vendor and supplier directory', keywords: 'partners vendors suppliers' },
  { mainMenu: 'Finance', mainIcon: 'account_balance', mainRoute: '/finance', submenu: 'Customer Invoices', subIcon: 'receipt', tab: 'Customer', action: 'Manage customer invoices and billing', keywords: 'finance invoices customers billing' },
  { mainMenu: 'Finance', mainIcon: 'account_balance', mainRoute: '/finance', submenu: 'Vendor Invoices', subIcon: 'receipt_long', tab: 'Vendor', action: 'Manage vendor invoices and payables', keywords: 'finance invoices vendors billing' },
  { mainMenu: 'Finance', mainIcon: 'account_balance', mainRoute: '/finance', submenu: 'Recovery', subIcon: 'healing', tab: 'Recovery', action: 'Send payment reminders for overdue invoices', keywords: 'finance recovery reminders overdue invoices' },
  { mainMenu: 'Automation', mainIcon: 'smart_toy', mainRoute: '/automation', action: 'Create and manage workflow automation rules', keywords: 'automation workflows rules triggers conditions' },
  { mainMenu: 'Groups', mainIcon: 'group_work', mainRoute: '/groups', action: 'Collaborate with teams via chat, meetings, and file sharing', keywords: 'groups chat meetings collaboration teams' },
  { mainMenu: 'Settings', mainIcon: 'settings', mainRoute: '/settings/organization', submenu: 'Organization', subIcon: 'business', action: 'Configure organization profile and settings', keywords: 'settings organization company profile' },
  { mainMenu: 'Settings', mainIcon: 'settings', mainRoute: '/settings/users', submenu: 'Users', subIcon: 'people', action: 'Manage user accounts and permissions', keywords: 'settings users accounts permissions roles' },
  { mainMenu: 'Settings', mainIcon: 'settings', mainRoute: '/settings/teams', submenu: 'Teams', subIcon: 'groups', action: 'Configure teams, departments, and assignments', keywords: 'settings teams departments groups' },
  { mainMenu: 'Settings', mainIcon: 'settings', mainRoute: '/settings/groups', submenu: 'Groups', subIcon: 'forum', action: 'Manage collaboration group settings', keywords: 'settings groups collaboration' },
];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatIconModule, CommonModule, FormsModule, UserAvatarComponent, SupportModalComponent],
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
            <div class="nav-item-wrap relative">
              <a
                [routerLink]="item.route"
                class="flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150 cursor-pointer"
                [class]="isNavActive(item) ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'"
              >
                <mat-icon class="icon-badge text-[20px] w-5 h-5 shrink-0 rounded-lg transition-colors duration-150">{{ item.icon }}</mat-icon>
                <span class="nav-label text-sm font-semibold tracking-tight">{{ item.label }}</span>
              </a>
              <div class="sidebar-tooltip">{{ item.label }}</div>
              <div class="hover-bar"></div>
            </div>
          }
        </nav>

        <!-- Bottom: Help + User Profile -->
        <div class="shrink-0 p-2 border-t border-slate-100 space-y-0.5">
          <button
            (click)="openSupportModal()"
            class="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150 cursor-pointer"
            title="Help & Support"
          >
            <mat-icon class="text-[20px] w-5 h-5 shrink-0">help</mat-icon>
            <span class="nav-label text-sm font-semibold tracking-tight">Help & Support</span>
          </button>
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
        <!-- Global Search Bar -->
        <div class="shrink-0 px-6 lg:px-8 pt-4 pb-0 relative z-30 search-container">
          <div class="relative max-w-xl">
            <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] w-5 h-5 pointer-events-none">search</mat-icon>
            <input
              #searchInput
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchInput($event)"
              (focus)="showSearchResults.set(true)"
              (keydown)="onSearchKeydown($event)"
              type="text"
              placeholder="Search menus and pages...  (Ctrl+K)"
              class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-xs"
            />
            @if (searchQuery()) {
              <button (click)="clearSearch()" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <mat-icon class="text-[18px] w-4.5 h-4.5">close</mat-icon>
              </button>
            }
            <!-- Results Dropdown -->
            @if (showSearchResults() && searchQuery().length >= 1 && filteredSearchItems().length > 0) {
              <div class="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto origin-top animate-in zoom-in-95 duration-150">
                @for (item of filteredSearchItems(); track $index) {
                  <button
                    (click)="navigateToSearchItem(item)"
                    (mouseenter)="selectedSearchIndex.set($index)"
                    [class.bg-indigo-50]="selectedSearchIndex() === $index"
                    class="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 cursor-pointer"
                  >
                    <mat-icon class="text-slate-400 text-[18px] w-[18px] h-[18px] mt-0.5 shrink-0">{{ item.subIcon || item.mainIcon }}</mat-icon>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-baseline gap-2">
                        <span class="text-[11px] font-medium text-slate-400 shrink-0">{{ item.mainMenu }}</span>
                        @if (item.submenu) {
                          <span class="text-xs font-semibold text-slate-800 truncate">{{ item.submenu }}</span>
                        } @else {
                          <span class="text-xs font-semibold text-slate-800 truncate">{{ item.mainMenu }}</span>
                        }
                      </div>
                      <p class="text-[11px] text-slate-500 mt-0.5 leading-tight">{{ item.action }}</p>
                    </div>
                    <mat-icon class="text-slate-300 text-[14px] w-3.5 h-3.5 mt-1 shrink-0">chevron_right</mat-icon>
                  </button>
                }
              </div>
            }
            @if (showSearchResults() && searchQuery().length >= 1 && filteredSearchItems().length === 0) {
              <div class="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-4 text-center">
                <p class="text-sm text-slate-400">No results found for "{{ searchQuery() }}"</p>
              </div>
            }
          </div>
        </div>

        <!-- Breadcrumbs -->
        <div class="shrink-0 px-6 lg:px-8 pt-3 pb-0">
          <nav class="flex items-center gap-1 text-xs font-medium text-slate-400" aria-label="Breadcrumb">
            @for (crumb of breadcrumbs(); track crumb.label; let last = $last) {
              @if (!last && crumb.route) {
                <a [routerLink]="crumb.route" class="hover:text-indigo-600 transition-colors truncate max-w-[120px]">{{ crumb.label }}</a>
                <mat-icon class="text-[14px] w-3.5 h-3.5 mx-0.5 shrink-0 text-slate-300">chevron_right</mat-icon>
              } @else {
                <span class="text-slate-700 font-semibold truncate max-w-[180px]">{{ crumb.label }}</span>
              }
            }
          </nav>
        </div>

        <main class="flex-1 overflow-y-auto p-6 lg:p-8">
          <router-outlet></router-outlet>
        </main>
      </div>

    </div>

    <app-support-modal></app-support-modal>
  `
})
export class App implements OnInit, OnDestroy {
  state = inject(CrmStateService);
  private router = inject(Router);

  @ViewChild(SupportModalComponent) supportModal!: SupportModalComponent;

  // Global search
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  searchQuery = signal('');
  showSearchResults = signal(false);
  selectedSearchIndex = signal(0);

  filteredSearchItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    return SEARCH_ITEMS.filter(item =>
      item.mainMenu.toLowerCase().includes(q) ||
      item.action.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q) ||
      (item.submenu && item.submenu.toLowerCase().includes(q))
    ).slice(0, 12);
  });

  @HostListener('document:keydown.control.k', ['$event'])
  @HostListener('document:keydown.meta.k', ['$event'])
  handleKeyboardShortcut(event: Event) {
    event.preventDefault();
    this.openSearch();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.showSearchResults() && !target.closest('.search-container')) {
      this.showSearchResults.set(false);
    }
  }

  openSearch() {
    this.showSearchResults.set(true);
    setTimeout(() => this.searchInput()?.nativeElement.focus(), 50);
  }

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    this.selectedSearchIndex.set(0);
    if (value.length >= 1) {
      this.showSearchResults.set(true);
    } else {
      this.showSearchResults.set(false);
    }
  }

  onSearchKeydown(event: KeyboardEvent) {
    const items = this.filteredSearchItems();
    if (items.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedSearchIndex.update(i => (i + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedSearchIndex.update(i => (i - 1 + items.length) % items.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const idx = this.selectedSearchIndex();
      if (idx >= 0 && idx < items.length) {
        this.navigateToSearchItem(items[idx]);
      }
    } else if (event.key === 'Escape') {
      this.showSearchResults.set(false);
      this.searchInput()?.nativeElement.blur();
    }
  }

  navigateToSearchItem(item: SearchItem) {
    this.showSearchResults.set(false);
    this.searchQuery.set('');
    if (item.tab) {
      this.state.navigateTab.set(item.tab);
    }
    this.router.navigate([item.mainRoute]);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.showSearchResults.set(false);
    this.searchInput()?.nativeElement.focus();
  }

  openSupportModal() {
    this.supportModal?.openModal();
  }

  /** True when user has clicked the toggle to permanently pin the sidebar open */
  pinnedOpen = signal<boolean>(false);

  /** True when hover-expanded (auto, not pinned) */
  hoverOpen = signal<boolean>(false);

  /** Final computed expanded state */
  isExpanded() {
    return this.pinnedOpen() || this.hoverOpen();
  }

  navItems = NAV_ITEMS;

  /** Tracks which primary route is currently active */
  activeRoute = signal<string>('/');

  private hoverTimer: ReturnType<typeof setTimeout> | null = null;
  private routerSub: any;

  ngOnInit() {
    this.activeRoute.set(this.router.url.split('?')[0]);

    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const newRoute = e.urlAfterRedirects.split('?')[0];
        this.activeRoute.set(newRoute);
        this.state.breadcrumbLabel.set(null);
      });
  }

  breadcrumbs = computed(() => {
    const route = this.activeRoute();
    const crumbs: { label: string; route?: string }[] = [];

    if (route === '/') {
      crumbs.push({ label: 'Dashboard' });
      return crumbs;
    }

    // Find the matching parent nav item
    const navItem = this.navItems.find(item => route.startsWith(item.route) && item.route !== '/');
    if (navItem) {
      crumbs.push({ label: navItem.label, route: navItem.route });

      // Check for sub-label from service (set by section pages with sub-tabs)
      const subLabel = this.state.breadcrumbLabel();
      if (subLabel) {
        crumbs.push({ label: subLabel });
      } else {
        // Derive sub-label from URL path segments beyond the nav route
        const subPath = route.replace(navItem.route, '').replace(/^\//, '');
        if (subPath) {
          const segments = subPath.split('/');
          segments.forEach(seg => {
            const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
            crumbs.push({ label });
          });
        }
      }
    }

    return crumbs;
  });

  onSidebarMouseEnter() {
    if (this.pinnedOpen()) return;
    this.hoverTimer = setTimeout(() => {
      this.hoverOpen.set(true);
    }, 1000);
  }

  onSidebarMouseLeave() {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
    if (!this.pinnedOpen()) {
      this.hoverOpen.set(false);
    }
  }

  togglePin() {
    const next = !this.pinnedOpen();
    this.pinnedOpen.set(next);
    if (!next) {
      this.hoverOpen.set(false);
    }
  }

  isNavActive(item: NavItem): boolean {
    const route = this.activeRoute();
    if (item.route === '/') return route === '/';
    return route.startsWith(item.route);
  }

  getCurrentUser() {
    return this.state.users().find(u => u.id === this.state.currentUserId());
  }

  ngOnDestroy() {
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  constructor(private elementRef: ElementRef) {}
}
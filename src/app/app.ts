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
      width: 72px;
      transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
      height: 100vh;
      margin: 0;
      padding: 0 0 16px 0;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .sidebar.expanded {
      width: 240px;
    }
    .sidebar-pill {
      border-radius: 36px;
      overflow: hidden;
      margin: auto 8px;
      max-height: calc((100vh - 148px) * 0.67);
    }
    .logo-container-wrap {
      transition: padding 250ms ease, justify-content 250ms ease;
    }
    .sidebar:not(.expanded) .logo-container-wrap {
      justify-content: center;
      padding: 0;
    }
    .toggle-container-wrap {
      transition: padding 250ms ease, justify-content 250ms ease;
    }
    .sidebar:not(.expanded) .toggle-container-wrap {
      justify-content: center;
      padding: 0;
    }
    .nav-item-link {
      height: 48px;
      width: 100%;
      padding: 0 16px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 16px;
      border-radius: 9999px;
      transition: width 250ms ease, padding 250ms ease, justify-content 250ms ease;
    }
    .sidebar:not(.expanded) .nav-item-link {
      width: 40px;
      height: 40px;
      padding: 0;
      justify-content: center;
      gap: 0;
    }
    .nav-item-wrap {
      width: 100%;
      display: flex;
      justify-content: center;
    }
    .nav-label {
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      white-space: nowrap;
      color: rgba(255, 255, 255, 0.8);
      transition: opacity 140ms cubic-bezier(0.4, 0, 0.2, 1),
                  max-width 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar.expanded .nav-label {
      opacity: 1;
      max-width: 160px;
    }

    .sidebar-tooltip {
      position: absolute;
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%);
      background: rgba(30, 41, 59, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #f1f5f9;
      font-size: 11px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 8px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 100ms ease;
      z-index: 1000;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .sidebar:not(.expanded) .nav-item-wrap:hover .sidebar-tooltip {
      opacity: 1;
    }
    .sidebar:not(.expanded) .nav-item-wrap:hover .icon-badge {
      background: rgba(99, 102, 241, 0.12);
      color: #6366f1;
    }
    .toggle-btn {
      transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .toggle-btn.expanded {
      transform: rotate(180deg);
    }
    .nav-item-glow {
      position: absolute;
      inset: 0;
      border-radius: 12px;
      opacity: 0;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(139, 92, 246, 0.06));
      transition: opacity 200ms ease;
      pointer-events: none;
    }
    .nav-item-wrap:hover .nav-item-glow {
      opacity: 1;
    }

    .dark-glass-search {
      background: rgba(17, 17, 17, 0.9) !important;
      backdrop-filter: blur(30px) saturate(2);
      -webkit-backdrop-filter: blur(30px) saturate(2);
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: #f1f5f9 !important;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15) !important;
      font-weight: 500;
    }
    .dark-glass-search::placeholder {
      color: rgba(255, 255, 255, 0.4) !important;
    }
    .dark-glass-search:focus {
      background: rgba(17, 17, 17, 0.95) !important;
      border-color: rgba(99, 102, 241, 0.3) !important;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), 0 4px 24px rgba(0, 0, 0, 0.2) !important;
    }
    .dark-glass-dropdown {
      background: rgba(17, 17, 17, 0.95) !important;
      backdrop-filter: blur(40px) saturate(2);
      -webkit-backdrop-filter: blur(40px) saturate(2);
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 8px 64px rgba(0, 0, 0, 0.3) !important;
    }
    .search-result-btn {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: background-color 150ms ease;
    }
    .search-result-btn:hover, .search-result-btn.selected-item {
      background-color: rgba(255, 255, 255, 0.08) !important;
    }
  `],
  template: `
    <div class="min-h-screen text-slate-900 font-sans flex" style="height:100vh; overflow:hidden;">

      <!-- Sidebar -->
      <aside
        class="sidebar flex flex-col relative z-40 self-center"
        [class.expanded]="isExpanded()"
        (mouseenter)="onSidebarMouseEnter()"
        (mouseleave)="onSidebarMouseLeave()"
      >
        <!-- Logo field at the top -->
        <div class="flex items-center justify-start h-16 px-4 gap-3 shrink-0 mt-3 logo-container-wrap">
          <img src="logo.webp" alt="Company Logo" class="w-10 h-10 object-contain rounded-xl shadow-sm" />
          @if (isExpanded()) {
            <span class="font-bold text-xl tracking-tight font-sans truncate" style="color: #0146e5">Bento</span>
          }
        </div>

        <!-- Toggle Button below the logo, but not in the pill sidebar -->
        <div class="flex items-center justify-start px-4 h-12 shrink-0 mb-2 toggle-container-wrap">
          <button
            (click)="togglePin()"
            class="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 bg-white/60 border border-slate-200/50 transition-all duration-150 shrink-0 shadow-sm"
            [title]="pinnedOpen() ? 'Unpin sidebar' : 'Pin sidebar open'"
          >
            <mat-icon class="text-[20px] w-5 h-5 toggle-btn" [class.expanded]="isExpanded()">chevron_right</mat-icon>
          </button>
        </div>

        <!-- Pill-shaped Sidebar Menu -->
        <div class="sidebar-pill flex flex-col glass-sidebar shadow-2xl overflow-hidden">
          <!-- Nav Items -->
          <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-1.5 flex flex-col gap-2">
            @for (item of navItems; track item.route + item.label) {
              <div class="nav-item-wrap relative group">
                <a
                  [routerLink]="item.route"
                  class="nav-item-link relative transition-all duration-200 cursor-pointer"
                  [class]="isNavActive(item) ? 'bg-[#c6f6d5] text-slate-900 shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'"
                >
                  <mat-icon class="icon-badge text-[22px] w-[22px] h-[22px] shrink-0 transition-colors duration-150">{{ item.icon }}</mat-icon>
                  <span class="nav-label text-[15px] font-semibold tracking-tight" [class]="isNavActive(item) ? '!text-slate-900' : ''">{{ item.label }}</span>
                </a>
                <div class="sidebar-tooltip">{{ item.label }}</div>
              </div>
            }
          </nav>

          <!-- Bottom: Help -->
          <div class="shrink-0 py-3 px-1.5 border-t border-white/5 flex flex-col items-center">
            <button
              (click)="openSupportModal()"
              class="nav-item-link text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150 cursor-pointer"
              title="Help & Support"
            >
              <mat-icon class="text-[22px] w-[22px] h-[22px] shrink-0">help</mat-icon>
              <span class="nav-label text-[15px] font-semibold tracking-tight">Help & Support</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Bar: Search + Right Icons -->
        <div class="shrink-0 px-6 lg:px-8 pt-5 pb-0 relative z-30 search-container">
          <div class="flex items-center justify-between gap-4">
            <div class="relative max-w-xl flex-1">
              <mat-icon class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60 text-[20px] w-5 h-5 pointer-events-none">search</mat-icon>
              <input
                #searchInput
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchInput($event)"
                (focus)="showSearchResults.set(true)"
                (keydown)="onSearchKeydown($event)"
                type="text"
                placeholder="Search menus and pages...  (Ctrl+K)"
                class="w-full pl-11 pr-10 py-2.5 dark-glass-search rounded-full text-sm outline-none transition-all"
              />
              @if (searchQuery()) {
                <button (click)="clearSearch()" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors">
                  <mat-icon class="text-[18px] w-4.5 h-4.5">close</mat-icon>
                </button>
              }
              <!-- Results Dropdown -->
              @if (showSearchResults() && searchQuery().length >= 1 && filteredSearchItems().length > 0) {
                <div class="absolute left-0 right-0 mt-2 dark-glass-dropdown rounded-2xl z-50 max-h-80 overflow-y-auto origin-top">
                  @for (item of filteredSearchItems(); track $index) {
                    <button
                      (click)="navigateToSearchItem(item)"
                      (mouseenter)="selectedSearchIndex.set($index)"
                      [class]="(selectedSearchIndex() === $index ? 'selected-item' : '') + ' search-result-btn w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors last:border-b-0 cursor-pointer'"
                    >
                      <mat-icon class="text-white/60 text-[18px] w-[18px] h-[18px] mt-0.5 shrink-0">{{ item.subIcon || item.mainIcon }}</mat-icon>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-baseline gap-2">
                          <span class="text-[10px] font-semibold text-white/40 uppercase tracking-wider shrink-0">{{ item.mainMenu }}</span>
                          @if (item.submenu) {
                            <span class="text-xs font-bold text-white/90 truncate">{{ item.submenu }}</span>
                          } @else {
                            <span class="text-xs font-bold text-white/90 truncate">{{ item.mainMenu }}</span>
                          }
                        </div>
                        <p class="text-[11px] text-white/50 mt-0.5 leading-tight">{{ item.action }}</p>
                      </div>
                      <mat-icon class="text-white/30 text-[14px] w-3.5 h-3.5 mt-1 shrink-0">chevron_right</mat-icon>
                    </button>
                  }
                </div>
              }
              @if (showSearchResults() && searchQuery().length >= 1 && filteredSearchItems().length === 0) {
                <div class="absolute left-0 right-0 mt-2 dark-glass-dropdown rounded-2xl z-50 p-4 text-center">
                  <p class="text-sm text-white/50">No results found for "{{ searchQuery() }}"</p>
                </div>
              }
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                (click)="state.isCustomizing.set(!state.isCustomizing())"
                class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150 shrink-0"
                [title]="state.isCustomizing() ? 'Done Customizing' : 'Customize KPIs'"
              >
                <mat-icon class="text-[18px] w-[18px] h-[18px]">{{ state.isCustomizing() ? 'check' : 'edit_square' }}</mat-icon>
              </button>
              <button
                class="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 bg-white/60 border border-slate-200/50 transition-all duration-150 shrink-0 shadow-sm"
                title="Inbox"
              >
                <mat-icon class="text-[20px] w-5 h-5">inbox</mat-icon>
              </button>
              <button
                class="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 bg-white/60 border border-slate-200/50 transition-all duration-150 shrink-0 shadow-sm relative"
                title="Notifications"
              >
                <mat-icon class="text-[20px] w-5 h-5">notifications</mat-icon>
                @if (unreadCount() > 0) {
                  <span class="absolute -top-1 -right-1 w-[18px] h-[18px] bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white">{{ unreadCount() }}</span>
                }
              </button>
              <a
                [routerLink]="['/settings/users', state.currentUserId()]"
                class="shrink-0"
                title="View Profile"
              >
                <app-user-avatar [userId]="state.currentUserId()" [size]="36" class="shrink-0 border-2 border-white/80 rounded-full block"></app-user-avatar>
              </a>
            </div>
          </div>
        </div>

        <!-- Breadcrumbs & Nav Tabs -->
        <div class="shrink-0 px-6 lg:px-10 pt-3 pb-0 flex items-center gap-6">
          <nav class="flex items-center gap-2 text-sm font-semibold text-slate-500" aria-label="Breadcrumb">
            @for (crumb of breadcrumbs(); track crumb.label; let last = $last) {
              @if (!last && crumb.route) {
                <a [routerLink]="crumb.route" class="hover:text-slate-800 transition-colors truncate max-w-[120px]">{{ crumb.label }}</a>
                <mat-icon class="text-[16px] w-4 h-4 mx-1 shrink-0 text-slate-400">chevron_right</mat-icon>
              } @else {
                <span class="text-slate-900 font-bold truncate max-w-[180px]">{{ crumb.label }}</span>
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

  /** Demo unread notification count */
  unreadCount = signal(3);

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

  ngOnDestroy() {
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  constructor(private elementRef: ElementRef) {}
}
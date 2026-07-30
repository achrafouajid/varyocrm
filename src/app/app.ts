import { Component, signal, ElementRef, inject, OnDestroy, OnInit, computed, HostListener, viewChild, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrmStateService } from './services/crm-state.service';
import { UserAvatarComponent } from './shared/user-avatar.component';
import { SupportModalComponent } from './shared/support-modal.component';
import { NotificationInboxDrawerComponent } from './shared/notification-inbox-drawer.component';
import { ToastContainerComponent } from './shared/toast.component';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: 'home', route: '/' },
    ]
  },
  {
    label: 'Sales',
    items: [
      { label: 'Sales Pipeline', icon: 'monetization_on', route: '/sales' },
      { label: 'Marketing', icon: 'campaign', route: '/marketing' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { label: 'Tasks', icon: 'task_alt', route: '/tasks' },
      { label: 'Tickets', icon: 'support_agent', route: '/tickets' },
      { label: 'Automation', icon: 'smart_toy', route: '/automation' },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Analytics', icon: 'bar_chart', route: '/analytics' },
    ]
  },
  {
    label: 'CRM',
    items: [
      { label: 'Partners', icon: 'handshake', route: '/partners' },
      { label: 'Groups', icon: 'group_work', route: '/groups' },
      { label: 'Finance', icon: 'account_balance', route: '/finance' },
    ]
  }
];

// Flat list for breadcrumb matching
const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(s => s.items);

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
  imports: [RouterOutlet, RouterLink, MatIconModule, CommonModule, FormsModule, UserAvatarComponent, SupportModalComponent, NotificationInboxDrawerComponent, ToastContainerComponent],
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .app-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* ── Sidebar ── */
    .app-sidebar {
      width: 224px;
      min-width: 224px;
      height: 100vh;
      background: #FFFFFF;
      border-right: 1px solid #E5E7EB;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 40;
      flex-shrink: 0;
      transition: width 200ms ease, min-width 200ms ease;
    }

    .app-sidebar.collapsed {
      width: 60px;
      min-width: 60px;
    }

    .app-sidebar.collapsed .sidebar-section-title {
      max-height: 0;
      opacity: 0;
      padding-top: 0;
      padding-bottom: 0;
      overflow: hidden;
    }

    .app-sidebar.collapsed .nav-label {
      max-width: 0;
      opacity: 0;
      margin-left: 0;
    }

    .app-sidebar.collapsed .sidebar-logo span {
      max-width: 0;
      opacity: 0;
    }

    .app-sidebar.collapsed .sidebar-user-info {
      max-width: 0;
      opacity: 0;
    }

    .app-sidebar.collapsed .sidebar-user {
      gap: 0;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px 16px;
      flex-shrink: 0;
    }

    .app-sidebar.collapsed .sidebar-logo {
      gap: 0;
    }

    .sidebar-logo img {
      width: 28px;
      height: 28px;
      object-fit: contain;
      border-radius: 6px;
    }

    .sidebar-collapse-btn {
      margin-left: auto;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      transition: all 150ms ease;
      flex-shrink: 0;
      overflow: hidden;
    }

    .sidebar-collapse-btn:hover {
      background: #F3F4F6;
      color: #111827;
    }

    .sidebar-collapse-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .app-sidebar.collapsed .sidebar-collapse-btn {
      opacity: 0;
      pointer-events: none;
      width: 0;
      margin-left: 0;
      overflow: hidden;
    }

    .app-sidebar.collapsed .sidebar-link,
    .app-sidebar.collapsed .sidebar-bottom-link {
      justify-content: center;
      gap: 0;
      padding: 7px 0;
    }

    .sidebar-logo span {
      font-weight: 700;
      font-size: 16px;
      letter-spacing: -0.02em;
      color: #111827;
      max-width: 100px;
      opacity: 1;
      overflow: hidden;
      white-space: nowrap;
      transition: max-width 200ms ease, opacity 150ms ease;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 4px 10px;
    }

    .sidebar-section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #9CA3AF;
      padding: 18px 12px 6px;
      max-height: 40px;
      opacity: 1;
      overflow: hidden;
      transition: max-height 200ms ease, opacity 150ms ease, padding 200ms ease;
    }

    .sidebar-section-title:first-child {
      padding-top: 6px;
    }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #6B7280;
      cursor: pointer;
      transition: all 200ms ease;
      text-decoration: none;
      margin: 1px 0;
    }

    .sidebar-link:hover {
      background: #F3F4F6;
      color: #111827;
    }

    .sidebar-link.active {
      background: var(--color-accent-light);
      color: var(--color-accent);
      font-weight: 600;
    }

    .sidebar-link mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      line-height: 20px;
    }

    .nav-label {
      margin-left: 10px;
      overflow: hidden;
      white-space: nowrap;
      max-width: 200px;
      opacity: 1;
      transition: max-width 200ms ease, opacity 150ms ease, margin-left 200ms ease;
    }

    .sidebar-bottom {
      flex-shrink: 0;
      border-top: 1px solid #E5E7EB;
      padding: 8px 10px;
    }

    .sidebar-bottom-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #6B7280;
      cursor: pointer;
      transition: all 200ms ease;
      text-decoration: none;
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
    }

    .sidebar-bottom-link:hover {
      background: #F3F4F6;
      color: #111827;
    }

    .sidebar-bottom-link.active {
      background: var(--color-accent-light);
      color: var(--color-accent);
      font-weight: 600;
    }

    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-top: 1px solid #F3F4F6;
      margin-top: 4px;
      cursor: pointer;
      border-radius: 6px;
      transition: background 150ms ease;
      text-decoration: none;
    }

    .sidebar-user:hover {
      background: #F3F4F6;
    }

    .sidebar-user-info {
      flex: 1;
      min-width: 0;
      max-width: 150px;
      opacity: 1;
      overflow: hidden;
      white-space: nowrap;
      transition: max-width 200ms ease, opacity 150ms ease;
    }

    .sidebar-user-name {
      font-size: 13px;
      font-weight: 600;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar-user-role {
      font-size: 11px;
      color: #9CA3AF;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Content Area ── */
    .app-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .content-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 24px;
      background: #FFFFFF;
      border-bottom: 1px solid #E5E7EB;
      flex-shrink: 0;
      z-index: 30;
    }

    .topbar-search {
      position: relative;
      max-width: 400px;
      flex: 1;
    }

    .topbar-search input {
      width: 100%;
      padding: 7px 12px 7px 36px;
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      font-size: 13px;
      color: #111827;
      outline: none;
      transition: all 150ms ease;
    }

    .topbar-search input::placeholder {
      color: #9CA3AF;
    }

    .topbar-search input:focus {
      background: var(--color-surface);
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px rgba(9, 9, 11, 0.08); /* zinc-950 with opacity */
    }

    .topbar-search mat-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #9CA3AF;
      pointer-events: none;
    }

    .topbar-search .clear-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
    }

    .topbar-search .clear-btn:hover {
      color: #6B7280;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .topbar-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid transparent;
      color: #6B7280;
      cursor: pointer;
      transition: all 150ms ease;
      position: relative;
    }

    .topbar-icon-btn:hover {
      background: #F3F4F6;
      color: #111827;
      border-color: #E5E7EB;
    }

    .topbar-icon-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .notification-dot {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 16px;
      height: 16px;
      background: #DC2626;
      border: 2px solid #FFFFFF;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 700;
      color: white;
    }

    .topbar-avatar {
      flex-shrink: 0;
      border-radius: 9999px;
      overflow: hidden;
    }

    .search-dropdown {
      position: absolute;
      left: 0;
      right: 0;
      top: calc(100% + 6px);
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
      max-height: 320px;
      overflow-y: auto;
      z-index: 50;
    }

    .search-result-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 16px;
      border-bottom: 1px solid #F3F4F6;
      cursor: pointer;
      transition: background 150ms ease;
    }

    .search-result-item:last-child {
      border-bottom: none;
    }

    .search-result-item:hover,
    .search-result-item.selected {
      background: #F9FAFB;
    }

    .search-result-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #9CA3AF;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .search-result-info {
      flex: 1;
      min-width: 0;
    }

    .search-result-breadcrumb {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #9CA3AF;
    }

    .search-result-title {
      font-size: 13px;
      font-weight: 600;
      color: #111827;
      margin-left: 8px;
    }

    .search-result-desc {
      font-size: 11px;
      color: #6B7280;
      margin-top: 2px;
      line-height: 1.3;
    }

    /* ── Breadcrumbs ── */
    .content-breadcrumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 12px 24px 0;
      font-size: 13px;
    }

    .breadcrumb-link {
      color: #6B7280;
      font-weight: 500;
      text-decoration: none;
      transition: color 150ms ease;
    }

    .breadcrumb-link:hover {
      color: #111827;
    }

    .breadcrumb-current {
      color: #111827;
      font-weight: 600;
    }

    .breadcrumb-sep {
      color: #D1D5DB;
    }

    /* ── Main content ── */
    .content-main {
      flex: 1;
      overflow-y: auto;
      padding: 20px 56px 24px 24px;
    }

    /* ── Mobile sidebar toggle ── */
    .mobile-sidebar-toggle {
      display: none;
    }

    @media (max-width: 768px) {
      .app-sidebar {
        position: fixed;
        left: -224px;
        top: 0;
        bottom: 0;
        transition: left 250ms ease;
        z-index: 50;
      }

      .app-sidebar.mobile-open {
        left: 0;
      }

      .mobile-sidebar-toggle {
        display: flex;
      }

      .mobile-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.3);
        z-index: 45;
      }
    }
  `],
  template: `
    <div class="app-layout font-sans search-container">

      <!-- Mobile overlay -->
      @if (mobileMenuOpen()) {
        <div class="mobile-overlay" (click)="mobileMenuOpen.set(false)"></div>
      }

      <!-- Sidebar -->
      <aside class="app-sidebar" [class.mobile-open]="mobileMenuOpen()" [class.collapsed]="sidebarCollapsed()">

        <!-- Logo + collapse toggle -->
        <div class="sidebar-logo" (click)="onLogoClick()">
          <img src="logo.webp" alt="Bento Logo" />
          <span>Bento</span>
          <button
            class="sidebar-collapse-btn"
            (click)="toggleCollapse($event)"
            [title]="sidebarCollapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
          >
            <mat-icon>{{ sidebarCollapsed() ? 'menu' : 'menu_open' }}</mat-icon>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          @for (section of navSections; track section.label) {
            <div class="sidebar-section-title">{{ section.label }}</div>
            @for (item of section.items; track item.route) {
              <a
                [routerLink]="item.route"
                class="sidebar-link"
                [class.active]="isNavActive(item)"
                [title]="item.label"
                (click)="mobileMenuOpen.set(false)"
              >
                <mat-icon>{{ item.icon }}</mat-icon>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            }
          }
        </nav>

        <!-- Bottom Section -->
        <div class="sidebar-bottom">
          <a
            routerLink="/settings"
            class="sidebar-bottom-link"
            [class.active]="activeRoute().startsWith('/settings')"
            title="Settings"
            (click)="mobileMenuOpen.set(false)"
          >
            <mat-icon>settings</mat-icon>
            <span class="nav-label">Settings</span>
          </a>
          <button
            class="sidebar-bottom-link"
            title="Help & Support"
            (click)="openSupportModal()"
          >
            <mat-icon>help_outline</mat-icon>
            <span class="nav-label">Help & Support</span>
          </button>
          <a
            [routerLink]="['/settings/users', state.currentUserId()]"
            class="sidebar-user"
            title="Profile"
            (click)="mobileMenuOpen.set(false)"
          >
            <app-user-avatar [userId]="state.currentUserId()" [size]="32" class="shrink-0 rounded-full block"></app-user-avatar>
            <div class="sidebar-user-info">
              <div class="sidebar-user-name">{{ currentUserName() }}</div>
              <div class="sidebar-user-role">Administrator</div>
            </div>
          </a>
        </div>
      </aside>

      <!-- Content Area -->
      <div class="app-content">

        <!-- Top Bar -->
        <header class="content-topbar">
          <!-- Mobile menu button -->
          <button
            class="topbar-icon-btn mobile-sidebar-toggle"
            (click)="mobileMenuOpen.set(!mobileMenuOpen())"
            title="Toggle menu"
          >
            <mat-icon>menu</mat-icon>
          </button>

          <!-- Search -->
          <div class="topbar-search">
            <mat-icon>search</mat-icon>
            <input
              #searchInput
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearchInput($event)"
              (focus)="showSearchResults.set(true)"
              (keydown)="onSearchKeydown($event)"
              type="text"
              placeholder="Search menus and pages...  (Ctrl+K)"
            />
            @if (searchQuery()) {
              <button class="clear-btn" (click)="clearSearch()" title="Clear search">
                <mat-icon class="text-[14px] w-3.5 h-3.5">close</mat-icon>
              </button>
            }

            <!-- Search Results Dropdown -->
            @if (showSearchResults() && searchQuery().length >= 1 && filteredSearchItems().length > 0) {
              <div class="search-dropdown">
                @for (item of filteredSearchItems(); track $index) {
                  <div
                    class="search-result-item"
                    [class.selected]="selectedSearchIndex() === $index"
                    (click)="navigateToSearchItem(item)"
                    (mouseenter)="selectedSearchIndex.set($index)"
                  >
                    <mat-icon>{{ item.subIcon || item.mainIcon }}</mat-icon>
                    <div class="search-result-info">
                      <div class="flex items-baseline gap-2">
                        <span class="search-result-breadcrumb">{{ item.mainMenu }}</span>
                        <span class="search-result-title">{{ item.submenu || item.mainMenu }}</span>
                      </div>
                      <p class="search-result-desc">{{ item.action }}</p>
                    </div>
                  </div>
                }
              </div>
            }
            @if (showSearchResults() && searchQuery().length >= 1 && filteredSearchItems().length === 0) {
              <div class="search-dropdown" style="padding: 20px; text-align: center;">
                <p class="text-sm text-zinc-500">No results found for "{{ searchQuery() }}"</p>
              </div>
            }
          </div>

          <!-- Right Actions -->
          <div class="topbar-actions">
            <button
              class="topbar-icon-btn"
              (click)="state.isCustomizing.set(!state.isCustomizing())"
              [title]="state.isCustomizing() ? 'Done Customizing' : 'Customize KPIs'"
            >
              <mat-icon>{{ state.isCustomizing() ? 'check' : 'edit_square' }}</mat-icon>
            </button>
            <button
              class="topbar-icon-btn"
              (click)="openInbox()"
              title="Mail"
            >
              <mat-icon>mail</mat-icon>
            </button>
            <button
              class="topbar-icon-btn"
              (click)="openNotifications()"
              title="Notifications"
            >
              <mat-icon>notifications_none</mat-icon>
              @if (unreadCount() > 0) {
                <span class="notification-dot">{{ unreadCount() }}</span>
              }
            </button>
            <a
              [routerLink]="['/settings/users', state.currentUserId()]"
              class="topbar-avatar"
              title="View Profile"
            >
              <app-user-avatar [userId]="state.currentUserId()" [size]="32" class="shrink-0 rounded-full block"></app-user-avatar>
            </a>
          </div>
        </header>

        <!-- Breadcrumbs -->
        <div class="content-breadcrumbs">
          @for (crumb of breadcrumbs(); track crumb.label; let last = $last) {
            @if (!last && crumb.route) {
              <a [routerLink]="crumb.route" class="breadcrumb-link">{{ crumb.label }}</a>
              <mat-icon class="breadcrumb-sep text-[14px] w-3.5 h-3.5">chevron_right</mat-icon>
            } @else {
              <span class="breadcrumb-current">{{ crumb.label }}</span>
            }
          }
        </div>

        <!-- Main Content -->
        <main class="content-main">
          <router-outlet></router-outlet>
        </main>
      </div>

    </div>

    <app-support-modal></app-support-modal>

    <app-notification-inbox-drawer
      [drawerType]="drawerType()"
      [open]="drawerOpen()"
      (closed)="closeDrawer()"
      (switchType)="drawerType.set($event)"
    ></app-notification-inbox-drawer>

    <app-toast-container></app-toast-container>
  `
})
export class App implements OnInit, OnDestroy {
  state = inject(CrmStateService);
  private router = inject(Router);

  @ViewChild(SupportModalComponent) supportModal!: SupportModalComponent;

  // Navigation sections
  navSections = NAV_SECTIONS;

  // Mobile menu
  mobileMenuOpen = signal(false);

  // Sidebar collapse
  sidebarCollapsed = signal(false);

  onLogoClick() {
    if (this.sidebarCollapsed()) {
      this.sidebarCollapsed.set(false);
    } else {
      this.router.navigate(['/']);
    }
  }

  toggleCollapse(event: Event) {
    event.stopPropagation();
    this.sidebarCollapsed.update(v => !v);
  }

  // Current user display name
  currentUserName = computed(() => {
    const users = this.state.users();
    const userId = this.state.currentUserId();
    const user = users.find((u: any) => u.id === userId);
    return user?.displayName || 'User';
  });

  // Global search
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  searchQuery = signal('');
  showSearchResults = signal(false);
  selectedSearchIndex = signal(0);

  /** Demo unread notification count */
  unreadCount = computed(() => this.state.unreadNotificationsCount());

  drawerOpen = signal(false);
  drawerType = signal<'notifications' | 'inbox'>('notifications');

  openNotifications() {
    this.drawerType.set('notifications');
    this.drawerOpen.set(true);
  }

  openInbox() {
    this.drawerType.set('inbox');
    this.drawerOpen.set(true);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

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

  /** Tracks which primary route is currently active */
  activeRoute = signal<string>('/');

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
    const navItem = ALL_NAV_ITEMS.find(item => route.startsWith(item.route) && item.route !== '/');
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

  isNavActive(item: NavItem): boolean {
    const route = this.activeRoute();
    if (item.route === '/') return route === '/';
    return route.startsWith(item.route);
  }

  ngOnDestroy() {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  constructor(private elementRef: ElementRef) {}
}
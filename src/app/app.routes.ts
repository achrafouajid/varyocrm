import {Routes} from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'analytics', loadComponent: () => import('./pages/analytics.component').then(m => m.AnalyticsComponent) },
  { path: 'tasks', loadComponent: () => import('./pages/tasks.component').then(m => m.TasksComponent) },
  { path: 'sales', loadComponent: () => import('./pages/sales.component').then(m => m.SalesComponent) },
  { path: 'sales/deals/:dealId', loadComponent: () => import('./pages/deal-detail.component').then(m => m.DealDetailComponent) },
  { path: 'marketing', loadComponent: () => import('./pages/marketing.component').then(m => m.MarketingComponent) },
  { path: 'partners', loadComponent: () => import('./pages/partners.component').then(m => m.PartnersComponent) },
  { path: 'finance', loadComponent: () => import('./pages/finance.component').then(m => m.FinanceComponent) },
  { path: 'tickets', loadComponent: () => import('./pages/tickets.component').then(m => m.TicketsComponent) },
  { path: 'automation', loadComponent: () => import('./pages/automation.component').then(m => m.AutomationComponent) },
  { path: 'partners/:id/customer-card', loadComponent: () => import('./pages/customer-card.component').then(m => m.CustomerCardComponent) },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings-shell.component').then(m => m.SettingsShellComponent),
    children: [
      { path: '', redirectTo: 'organization', pathMatch: 'full' },
      { path: 'organization', loadComponent: () => import('./pages/org-settings.component').then(m => m.OrgSettingsComponent) },
      { path: 'users', loadComponent: () => import('./pages/users.component').then(m => m.UsersComponent) },
      { path: 'users/:userId', loadComponent: () => import('./pages/user-profile.component').then(m => m.UserProfileComponent) },
      { path: 'teams', loadComponent: () => import('./pages/teams.component').then(m => m.TeamsComponent) },
      { path: 'groups', loadComponent: () => import('./pages/groups.component').then(m => m.GroupsComponent) }
    ]
  },
  { path: 'groups', loadComponent: () => import('./pages/groups.component').then(m => m.GroupsComponent) }
];


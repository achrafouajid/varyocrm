import {Routes} from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'analytics', loadComponent: () => import('./pages/analytics.component').then(m => m.AnalyticsComponent) },
  { path: 'sales', loadComponent: () => import('./pages/sales.component').then(m => m.SalesComponent) },
  { path: 'marketing', loadComponent: () => import('./pages/marketing.component').then(m => m.MarketingComponent) },
  { path: 'partners', loadComponent: () => import('./pages/partners.component').then(m => m.PartnersComponent) },
  { path: 'finance', loadComponent: () => import('./pages/finance.component').then(m => m.FinanceComponent) },
  { path: 'tickets', loadComponent: () => import('./pages/tickets.component').then(m => m.TicketsComponent) }
];


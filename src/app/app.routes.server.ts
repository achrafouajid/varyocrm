import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'partners/:id/customer-card',
    renderMode: RenderMode.Server,
  },
  {
    path: 'settings/users/:userId',
    renderMode: RenderMode.Server,
  },
  {
    path: 'sales/deals/:dealId',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

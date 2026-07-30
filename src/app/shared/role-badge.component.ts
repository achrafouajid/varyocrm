import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleId, CRM_ROLES } from '../services/crm-state.service';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [class]="getBadgeClass()"
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border font-sans"
    >
      {{ getRoleLabel() }}
    </span>
  `
})
export class RoleBadgeComponent {
  @Input() roleId: RoleId = 'viewer';

  getBadgeClass(): string {
    switch (this.roleId) {
      case 'admin':
        return 'bg-zinc-100 text-zinc-950 border-zinc-200';
      case 'manager':
        return 'bg-zinc-100 text-zinc-950 border-zinc-200';
      case 'salesperson':
        return 'bg-zinc-100 text-zinc-950 border-zinc-200';
      case 'support':
        return 'bg-zinc-100 text-zinc-950 border-zinc-200';
      case 'viewer':
      default:
        return 'bg-zinc-50 text-zinc-600 border-zinc-200';
    }
  }

  getRoleLabel(): string {
    return CRM_ROLES.find(r => r.id === this.roleId)?.label || 'Viewer';
  }
}

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
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'salesperson':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'support':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'viewer':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }

  getRoleLabel(): string {
    return CRM_ROLES.find(r => r.id === this.roleId)?.label || 'Viewer';
  }
}

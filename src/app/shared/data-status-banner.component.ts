import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

/**
 * Drop-in loading spinner / error banner for pages backed by a lazy `load*()` call
 * on CrmStateService. Bind `loading`/`error` to the matching `*Loading`/`*Error` signals.
 */
@Component({
  selector: 'app-data-status-banner',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  template: `
    @if (loading()) {
      <div class="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-sm">
        <mat-icon class="text-[18px] w-[18px] h-[18px] animate-spin">progress_activity</mat-icon>
        <span>Loading latest data…</span>
      </div>
    }
    @if (error()) {
      <div class="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
        <mat-icon class="text-[18px] w-[18px] h-[18px]">warning</mat-icon>
        <span>{{ error() }}</span>
      </div>
    }
  `
})
export class DataStatusBannerComponent {
  loading = input<boolean>(false);
  error = input<string | null>(null);
}

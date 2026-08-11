import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { ToastService } from '../toast.service';
import { Deal, CallLog, EmailLog, Meeting, TeamsRecording, Note, FollowUp } from '../crm-state.service';

export type { Deal, CallLog, EmailLog, Meeting, TeamsRecording, Note, FollowUp };

@Injectable({
  providedIn: 'root'
})
export class DealsService {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  deals = signal<Deal[]>([]);
  isLoaded = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  allDeals = computed(() => this.deals());
  isLoading$ = computed(() => this.isLoading());
  error$ = computed(() => this.error());

  load(): void {
    if (this.isLoaded()) return;
    this.isLoading.set(true);
    this.error.set(null);

    this.api.getDeals().subscribe({
      next: (deals) => {
        if (deals && deals.length > 0) {
          this.deals.set(deals);
        }
        this.isLoaded.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.warn('Failed to load deals from API:', err);
        this.isLoaded.set(true);
        this.isLoading.set(false);
        this.error.set('Failed to load deals from the server.');
      }
    });
  }

  addDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.api.createDeal(deal as any).subscribe({
      next: (created) => {
        this.deals.update(deals => [...deals, created]);
        this.toast.show(`Deal <strong>${created.title}</strong> created`);
      },
      error: () => this.toast.show('Failed to create deal', { type: 'error' })
    });
  }

  updateDeal(id: string, deal: Partial<Deal>): void {
    this.api.updateDeal(id, deal as any).subscribe({
      next: (updated) => {
        this.deals.update(deals =>
          deals.map(d => d.id === id ? updated : d)
        );
        this.toast.show(`Deal updated`);
      },
      error: () => this.toast.show('Failed to update deal', { type: 'error' })
    });
  }

  deleteDeal(id: string): void {
    const deleted = this.deals().find(d => d.id === id);
    this.api.deleteDeal(id).subscribe({
      next: () => {
        this.deals.update(deals => deals.filter(d => d.id !== id));
        this.toast.show(`Deal <strong>${deleted?.title || id}</strong> deleted`, {
          undo: () => {
            if (deleted) {
              this.deals.update(deals => [...deals, deleted]);
            }
          }
        });
      },
      error: () => this.toast.show('Failed to delete deal', { type: 'error' })
    });
  }

  getDealById(id: string): Deal | undefined {
    return this.deals().find(d => d.id === id);
  }

  addMeeting(dealId: string, meeting: any): void {
    // Stub method for adding meeting to deal
  }

  addRecording(dealId: string, recording: any): void {
    // Stub method for adding recording to deal
  }

  addNote(dealId: string, note: any): void {
    // Stub method for adding note to deal
  }

  addFollowUp(dealId: string, followUp: any): void {
    // Stub method for adding follow-up to deal
  }

  updateDealStage(dealId: string, stage: string): void {
    const deal = this.getDealById(dealId);
    if (deal) {
      this.updateDeal(dealId, { ...deal, stage: stage as any });
    }
  }

  addEmailLog(dealId: string, emailLog: any): void {
    // Stub method for adding email log to deal
  }

  addCallLog(dealId: string, callLog: any): void {
    // Stub method for adding call log to deal
  }

  updateFollowUpStatus(dealId: string, followUpId: string, status: string): void {
    // Stub method for updating follow-up status
  }
}

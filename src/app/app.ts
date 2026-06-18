import { Component, signal, HostListener, ElementRef, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CrmStateService } from './services/crm-state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, CommonModule],
  template: `
    <div class="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans flex flex-col">
      <!-- Top Navigation -->
      <header class="bg-white border-b border-slate-200/80 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo & Main Nav -->
            <div class="flex items-center gap-8">
              <a routerLink="/" class="flex shrink-0 items-center hover:opacity-80 transition-opacity">
                <img src="/crm.webp" alt="MarocCRM" class="h-20 w-auto">
              </a>
              
              <nav class="hidden md:flex items-center space-x-0.5">
                <!-- Sales Dropdown -->
                <div class="relative" (mouseenter)="activeDropdown.set('sales')" (mouseleave)="activeDropdown.set(null)">
                  <a routerLink="/sales" [class.bg-slate-100]="activeDropdown() === 'sales'" [class.text-slate-900]="activeDropdown() === 'sales'"
                          class="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 inline-flex items-center gap-1">
                    Sales
                    <mat-icon class="text-[16px] w-4 h-4 transition-transform duration-200" [class.rotate-180]="activeDropdown() === 'sales'">expand_more</mat-icon>
                  </a>
                  @if (activeDropdown() === 'sales') {
                    <div class="absolute left-1/2 -translate-x-1/2 pt-2 w-52">
                      <div class="bg-white rounded-xl shadow-xl shadow-slate-200/50 ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ease-out">
                        <div class="px-4 py-2 border-b border-slate-100">
                          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sales</span>
                        </div>
                        <div class="py-1">
                          <a routerLink="/sales" (click)="activeDropdown.set(null)" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                            <mat-icon class="text-slate-400 text-[18px] w-[18px] h-[18px]">monetization_on</mat-icon>
                            <span class="font-medium">Deals & Proposals</span>
                          </a>
                          <a routerLink="/sales" (click)="activeDropdown.set(null)" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                            <mat-icon class="text-slate-400 text-[18px] w-[18px] h-[18px]">task</mat-icon>
                            <span class="font-medium">Tasks</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <!-- Marketing Dropdown -->
                <div class="relative" (mouseenter)="activeDropdown.set('marketing')" (mouseleave)="activeDropdown.set(null)">
                  <a routerLink="/marketing" [class.bg-slate-100]="activeDropdown() === 'marketing'" [class.text-slate-900]="activeDropdown() === 'marketing'"
                          class="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 inline-flex items-center gap-1">
                    Marketing
                    <mat-icon class="text-[16px] w-4 h-4 transition-transform duration-200" [class.rotate-180]="activeDropdown() === 'marketing'">expand_more</mat-icon>
                  </a>
                  @if (activeDropdown() === 'marketing') {
                    <div class="absolute left-1/2 -translate-x-1/2 pt-2 w-52">
                      <div class="bg-white rounded-xl shadow-xl shadow-slate-200/50 ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ease-out">
                        <div class="px-4 py-2 border-b border-slate-100">
                          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Channels</span>
                        </div>
                        <div class="py-1">
                          <a routerLink="/marketing" (click)="activeDropdown.set(null)" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                            <mat-icon class="text-slate-400 text-[18px] w-[18px] h-[18px]">email</mat-icon>
                            <span class="font-medium">Email</span>
                          </a>
                          <a routerLink="/marketing" (click)="activeDropdown.set(null)" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                            <mat-icon class="text-slate-400 text-[18px] w-[18px] h-[18px]">chat</mat-icon>
                            <span class="font-medium">WhatsApp</span>
                          </a>
                          <a routerLink="/marketing" (click)="activeDropdown.set(null)" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                            <mat-icon class="text-slate-400 text-[18px] w-[18px] h-[18px]">sms</mat-icon>
                            <span class="font-medium">SMS</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <!-- Inbox Dropdown -->
                <div class="relative" (mouseenter)="activeDropdown.set('inbox')" (mouseleave)="activeDropdown.set(null)">
                  <a routerLink="/tickets" [class.bg-slate-100]="activeDropdown() === 'inbox'" [class.text-slate-900]="activeDropdown() === 'inbox'"
                          class="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 inline-flex items-center gap-1">
                    Inbox
                    <mat-icon class="text-[16px] w-4 h-4 transition-transform duration-200" [class.rotate-180]="activeDropdown() === 'inbox'">expand_more</mat-icon>
                  </a>
                  @if (activeDropdown() === 'inbox') {
                    <div class="absolute left-1/2 -translate-x-1/2 pt-2 w-52">
                      <div class="bg-white rounded-xl shadow-xl shadow-slate-200/50 ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ease-out">
                        <div class="px-4 py-2 border-b border-slate-100">
                          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Support</span>
                        </div>
                        <div class="py-1">
                          <a routerLink="/tickets" (click)="activeDropdown.set(null)" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                            <mat-icon class="text-slate-400 text-[18px] w-[18px] h-[18px]">inbox</mat-icon>
                            <span class="font-medium">My tickets</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <!-- Analytics -->
                <a routerLink="/analytics" routerLinkActive="bg-slate-100 text-slate-900 font-medium"
                   class="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150">
                  Analytics
                </a>

                <!-- Partners -->
                <a routerLink="/partners" routerLinkActive="bg-slate-100 text-slate-900 font-medium"
                   class="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150">
                  Partners
                </a>
                
                <!-- Finance -->
                <a routerLink="/finance" routerLinkActive="bg-slate-100 text-slate-900 font-medium"
                   class="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150">
                  Finance
                </a>
              </nav>
            </div>

            <!-- Global Actions & Profile -->
            <div class="flex items-center gap-4">
              <button (click)="isWizardOpen.set(!isWizardOpen())" class="flex items-center gap-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors">
                <mat-icon class="text-[16px] w-4 h-4 leading-none">auto_awesome</mat-icon>
                <span>Walkthrough Wizard</span>
                <span class="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {{ state.walkthroughStep() }}/{{ state.steps.length }}
                </span>
              </button>
              <div class="h-6 w-px bg-slate-200 mx-1"></div>
              <button class="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-full transition-colors focus:outline-none">
                <img src="https://ui-avatars.com/api/?name=Achraf+Ouajid&background=4f46e5&color=fff&bold=true" alt="Profile" class="w-8 h-8 rounded-full shadow-sm ring-1 ring-slate-200">
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Layout container: sidebar for wizard, main for routes -->
      <div class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <!-- Main Content -->
        <main class="flex-1 min-w-0">
          <router-outlet></router-outlet>
        </main>

        <!-- Walkthrough Sidebar Panel -->
        @if (isWizardOpen()) {
          <aside class="w-full lg:w-80 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 self-start lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto animate-in slide-in-from-right-4 duration-300">
            <div class="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 class="font-bold text-slate-900 flex items-center gap-2">
                <mat-icon class="text-amber-500">model_training</mat-icon>
                Scenario Walkthrough
              </h3>
              <button (click)="isWizardOpen.set(false)" class="text-slate-400 hover:text-slate-600">
                <mat-icon class="text-[20px] w-5 h-5">close</mat-icon>
              </button>
            </div>

            <!-- Steps Progress Bar -->
            <div class="space-y-2">
              <div class="flex justify-between text-xs text-slate-500 font-medium">
                <span>Scenario Progress</span>
                <span>{{ state.walkthroughStep() }} / {{ state.steps.length }} Steps</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-indigo-600 h-full transition-all duration-300" [style.width.%]="(state.walkthroughStep() / state.steps.length) * 100"></div>
              </div>
            </div>

            @if (state.walkthroughStep() < state.steps.length) {
              <!-- Current Step Details -->
              @let currentStep = state.steps[state.walkthroughStep()];
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-4">
                <div class="flex items-center gap-2">
                  <span class="bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {{ state.walkthroughStep() + 1 }}
                  </span>
                  <h4 class="font-semibold text-slate-950 text-sm leading-tight">{{ currentStep.title }}</h4>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">{{ currentStep.description }}</p>
                
                <div class="pt-2 flex flex-col gap-2">
                  <button (click)="navigateToRoute(currentStep.route)" class="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1">
                    <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none">navigation</mat-icon>
                    Go to Page
                  </button>
                  <button (click)="runStepAction(currentStep)" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1">
                    <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none">flash_on</mat-icon>
                    {{ currentStep.actionLabel }}
                  </button>
                </div>
              </div>
            } @else {
              <!-- Completed Scenario -->
              <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-3">
                <mat-icon class="text-emerald-500 text-3xl w-8 h-8">check_circle</mat-icon>
                <h4 class="font-bold text-emerald-950 text-sm">Scenario Fully Completed!</h4>
                <p class="text-xs text-emerald-700">All workflow stages from quote to vendor PO, customer invoicing, and collection recovery were executed successfully.</p>
                <button (click)="resetScenario()" class="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1">
                  <mat-icon class="text-[14px] w-3.5 h-3.5 leading-none font-bold">restart_alt</mat-icon>
                  Reset & Run Again
                </button>
              </div>
            }

            <!-- Steps list -->
            <div class="space-y-2.5 pt-4 border-t border-slate-100">
              <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Step List</h5>
              <div class="space-y-1.5 max-h-48 overflow-y-auto text-xs pr-1">
                @for (step of state.steps; track $index) {
                  <div class="flex items-center gap-2 py-1 px-1.5 rounded" [class.bg-slate-50]="$index === state.walkthroughStep()">
                    <mat-icon class="text-[16px] w-4 h-4" 
                      [class.text-emerald-500]="$index < state.walkthroughStep()"
                      [class.text-indigo-600]="$index === state.walkthroughStep()"
                      [class.text-slate-300]="$index > state.walkthroughStep()">
                      {{ $index < state.walkthroughStep() ? 'check_circle' : ($index === state.walkthroughStep() ? 'radio_button_checked' : 'radio_button_unchecked') }}
                    </mat-icon>
                    <span class="truncate" [class.text-slate-400]="$index > state.walkthroughStep()" [class.font-semibold]="$index === state.walkthroughStep()">
                      {{ step.title }}
                    </span>
                  </div>
                }
              </div>
            </div>
          </aside>
        }
      </div>
    </div>
  `
})
export class App {
  state = inject(CrmStateService);
  router = inject(Router);

  activeDropdown = signal<string | null>(null);
  isWizardOpen = signal(true);

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.activeDropdown.set(null);
    }
  }

  navigateToRoute(route: string) {
    this.router.navigateByUrl(route);
  }

  runStepAction(step: any) {
    step.action();
    this.router.navigateByUrl(step.route);
  }

  resetScenario() {
    this.state.resetWalkthrough();
  }
}

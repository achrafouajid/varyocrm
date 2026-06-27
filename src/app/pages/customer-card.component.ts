import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CrmStateService,
  CustomerCard,
  CustomerAddress,
  CustomerPersonnel,
  RecordType,
  OrgType,
  AddressType,
  VatStatus,
} from '../services/crm-state.service';

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Fès', 'Agadir',
  'Meknès', 'Oujda', 'Kenitra', 'Tétouan', 'Safi', 'El Jadida',
  'Béni Mellal', 'Nador', 'Taza', 'Settat', 'Mohammedia', 'Laâyoune',
  'Khouribga', 'Témara', 'Salé', 'Berkane', 'Chefchaouen', 'Essaouira',
];

const JOB_TITLES = [
  'Purchasing Manager', 'DAF', 'IT Manager', 'Logistics', 'CEO',
  'Operations Manager', 'Sales Manager', 'Administrative Assistant',
];

@Component({
  selector: 'app-customer-card',
  imports: [MatIconModule, CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-8 pb-12">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button (click)="goBack()" class="text-slate-400 hover:text-slate-600 transition-colors">
            <mat-icon class="text-[24px]">arrow_back</mat-icon>
          </button>
          <div>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">
              {{ isExisting() ? 'Edit Customer Card' : 'New Customer Card' }}
            </h2>
            <p class="text-slate-500 mt-1">
              {{ isExisting() ? 'Update master data for ' + partner()?.name : 'Complete the details to convert this prospect to a customer' }}
            </p>
          </div>
        </div>
        <button (click)="saveCard()" [disabled]="!isValid()" class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
          <mat-icon class="w-5 h-5 text-[20px]! leading-none!">save</mat-icon>
          {{ isExisting() ? 'Update' : 'Convert to Customer' }}
        </button>
      </div>

      <!-- Section 1: Business Relation -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
          <mat-icon class="text-indigo-500 text-[20px]">business</mat-icon>
          <h3 class="text-lg font-semibold text-slate-900">1. Business Relation</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Account ID</label>
            <input [value]="form().accountId" disabled class="w-full border border-slate-200 rounded-lg p-2 text-sm bg-slate-50 text-slate-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Record Type</label>
            <select [(ngModel)]="form().recordType" name="recordType" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 bg-white">
              <option value="Organization">Organization</option>
              <option value="Individual">Individual</option>
            </select>
          </div>
          <div class="lg:col-span-2">
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Official Company Name</label>
            <input [(ngModel)]="form().name" name="name" type="text" placeholder="e.g. Casablanca Technologies S.A.R.L." class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Search Name</label>
            <input [(ngModel)]="form().searchName" name="searchName" type="text" placeholder="Short name / Acronym" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">ERP Customer Account</label>
            <input [(ngModel)]="form().erpAccount" name="erpAccount" type="text" placeholder="Link to financial backend" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
          </div>
        </div>
      </section>

      <!-- Section 2: Moroccan Legal & Fiscal -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
          <mat-icon class="text-indigo-500 text-[20px]">gavel</mat-icon>
          <h3 class="text-lg font-semibold text-slate-900">2. Moroccan Legal & Fiscal Details</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">ICE</label>
            <input [(ngModel)]="form().ice" name="ice" type="text" maxlength="15" placeholder="15 digits"
              (input)="onIceInput($event)"
              class="w-full border rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono"
              [class.border-red-300]="iceError()"
              [class.border-slate-200]="!iceError()">
            @if (iceError()) {
              <p class="text-red-500 text-xs mt-1">{{ iceError() }}</p>
            }
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">IF (Identifiant Fiscal)</label>
            <input [(ngModel)]="form().ifField" name="ifField" type="text" placeholder="IF" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">RC (Registre de Commerce)</label>
            <input [(ngModel)]="form().rc" name="rc" type="text" placeholder="RC number" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Ville RC</label>
            <select [(ngModel)]="form().rcCity" name="rcCity" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 bg-white">
              <option value="">Select city</option>
              @for (city of cities; track city) {
                <option [value]="city">{{ city }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">TP (Taxe Professionnelle)</label>
            <input [(ngModel)]="form().tp" name="tp" type="text" placeholder="TP number" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
          </div>
          <div class="lg:col-span-3">
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">TVA / VAT Status</label>
            <div class="flex flex-wrap gap-6">
              @for (option of vatOptions; track option) {
                <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" [checked]="form().vatStatus.includes(option)" (change)="toggleVat(option)"
                    class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                  {{ option }}
                </label>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Section 3: Corporate Hierarchy -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
          <mat-icon class="text-indigo-500 text-[20px]">account_tree</mat-icon>
          <h3 class="text-lg font-semibold text-slate-900">3. Corporate Hierarchy</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Organization Type</label>
            <select [(ngModel)]="form().orgType" name="orgType" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 bg-white">
              <option value="Headquarter">Headquarter</option>
              <option value="Subsidiary">Subsidiary</option>
              <option value="Branch">Branch</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Parent Account</label>
            <select [(ngModel)]="form().parentAccountId" name="parentAccountId" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 bg-white">
              <option [ngValue]="null">None (standalone)</option>
              @for (card of existingCards(); track card.id) {
                @if (card.id !== form().id) {
                  <option [ngValue]="card.id">{{ card.name }} ({{ card.accountId }})</option>
                }
              }
            </select>
          </div>
        </div>
      </section>

      <!-- Section 4: Addresses -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <mat-icon class="text-indigo-500 text-[20px]">location_on</mat-icon>
            <h3 class="text-lg font-semibold text-slate-900">4. Addresses</h3>
          </div>
          <button (click)="addAddress()" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">add_circle</mat-icon>
            Add Address
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <th class="text-left py-2 pr-2">Type</th>
                <th class="text-left py-2 pr-2">Street Address</th>
                <th class="text-left py-2 pr-2">Zone Industrielle</th>
                <th class="text-left py-2 pr-2">Postal Code</th>
                <th class="text-left py-2 pr-2">City</th>
                <th class="text-center py-2 pr-2">Primary</th>
                <th class="text-center py-2 w-10">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (addr of form().addresses; track addr.id; let i = $index) {
                <tr class="border-b border-slate-50 hover:bg-slate-50/50">
                  <td class="py-2 pr-2">
                    <select [(ngModel)]="addr.addressType" [name]="'addrType' + i" class="w-40 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600 bg-white">
                      <option value="Siège Social / Fiscal">Siège Social / Fiscal</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Billing">Billing</option>
                    </select>
                  </td>
                  <td class="py-2 pr-2">
                    <input [(ngModel)]="addr.streetAddress" [name]="'addrStreet' + i" type="text" placeholder="N°, Boulevard, Rue, Étage" class="w-48 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600">
                  </td>
                  <td class="py-2 pr-2">
                    <input [(ngModel)]="addr.industrialZone" [name]="'addrZone' + i" type="text" placeholder="e.g. ZI Sapino" class="w-36 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600">
                  </td>
                  <td class="py-2 pr-2">
                    <input [(ngModel)]="addr.postalCode" [name]="'addrPostal' + i" type="text" maxlength="5" placeholder="20000" class="w-20 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600 font-mono">
                  </td>
                  <td class="py-2 pr-2">
                    <select [(ngModel)]="addr.city" [name]="'addrCity' + i" class="w-32 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600 bg-white">
                      @for (city of cities; track city) {
                        <option [value]="city">{{ city }}</option>
                      }
                    </select>
                  </td>
                  <td class="py-2 pr-2 text-center">
                    <input type="radio" [name]="'primaryAddr'" [checked]="addr.isPrimary" (change)="setPrimaryAddress(i)"
                      class="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500">
                  </td>
                  <td class="py-2 text-center">
                    <button (click)="removeAddress(i)" class="text-slate-400 hover:text-red-500 transition-colors">
                      <mat-icon class="text-[18px] w-[18px] h-[18px]">remove_circle</mat-icon>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-8 text-center text-slate-400 text-sm">No addresses added yet.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section 5: Company Contact Information -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
          <mat-icon class="text-indigo-500 text-[20px]">contact_phone</mat-icon>
          <h3 class="text-lg font-semibold text-slate-900">5. Company Contact Information</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Main Phone</label>
            <input [(ngModel)]="form().mainPhone" name="mainPhone" type="text" placeholder="+212 5XX XX XX XX"
              (input)="onPhoneInput($event)"
              class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600 font-mono">
            <p class="text-slate-400 text-xs mt-1">Format: +212 X XX XX XX XX</p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Corporate Email</label>
            <input [(ngModel)]="form().corporateEmail" name="corporateEmail" type="email" placeholder="contact@client.ma" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Website URL</label>
            <input [(ngModel)]="form().websiteUrl" name="websiteUrl" type="url" placeholder="https://www.client.ma" class="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-indigo-600">
          </div>
        </div>
      </section>

      <!-- Section 6: Associated Personnel -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <mat-icon class="text-indigo-500 text-[20px]">people</mat-icon>
            <h3 class="text-lg font-semibold text-slate-900">6. Associated Personnel</h3>
          </div>
          <button (click)="addPersonnel()" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">add_circle</mat-icon>
            Add Person
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <th class="text-left py-2 pr-2">Full Name</th>
                <th class="text-left py-2 pr-2">Job Title</th>
                <th class="text-left py-2 pr-2">Direct Mobile</th>
                <th class="text-left py-2 pr-2">Direct Email</th>
                <th class="text-center py-2 pr-2">Primary</th>
                <th class="text-center py-2 w-10">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (person of form().personnel; track person.id; let i = $index) {
                <tr class="border-b border-slate-50 hover:bg-slate-50/50">
                  <td class="py-2 pr-2">
                    <input [(ngModel)]="person.fullName" [name]="'personName' + i" type="text" placeholder="First and Last Name" class="w-44 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600">
                  </td>
                  <td class="py-2 pr-2">
                    <select [(ngModel)]="person.jobTitle" [name]="'personTitle' + i" class="w-36 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600 bg-white">
                      @for (title of jobTitles; track title) {
                        <option [value]="title">{{ title }}</option>
                      }
                    </select>
                  </td>
                  <td class="py-2 pr-2">
                    <input [(ngModel)]="person.directMobile" [name]="'personMobile' + i" type="text" placeholder="+212 6XX XX XX XX"
                      class="w-40 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600 font-mono">
                  </td>
                  <td class="py-2 pr-2">
                    <input [(ngModel)]="person.directEmail" [name]="'personEmail' + i" type="email" placeholder="name@client.ma" class="w-44 border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600">
                  </td>
                  <td class="py-2 pr-2 text-center">
                    <input type="radio" [name]="'primaryPerson'" [checked]="person.isPrimary" (change)="setPrimaryPerson(i)"
                      class="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500">
                  </td>
                  <td class="py-2 text-center">
                    <button (click)="removePersonnel(i)" class="text-slate-400 hover:text-red-500 transition-colors">
                      <mat-icon class="text-[18px] w-[18px] h-[18px]">remove_circle</mat-icon>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="py-8 text-center text-slate-400 text-sm">No personnel added yet.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `
})
export class CustomerCardComponent implements OnInit {
  state = inject(CrmStateService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  cities = MOROCCAN_CITIES;
  jobTitles = JOB_TITLES;
  vatOptions: VatStatus[] = ['Standard', 'No VAT', 'Export Trade'];

  partnerId: string = '';
  isExisting = signal(false);

  form = signal<CustomerCard>(this.emptyCard());

  iceError = signal<string | null>(null);

  partner = computed(() => this.state.partners().find(p => p.id === this.partnerId));

  existingCards = computed(() => this.state.customerCards());

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.partnerId = params.get('id') || '';
      const existing = this.state.getCustomerCard(this.partnerId);
      if (existing) {
        this.form.set({ ...existing, addresses: [...existing.addresses], personnel: [...existing.personnel] });
        this.isExisting.set(true);
      } else {
        const p = this.partner();
        const accountId = this.state.generateAccountId();
        this.form.set({
          id: 'cc-' + this.partnerId,
          partnerId: this.partnerId,
          accountId,
          recordType: 'Organization',
          name: p?.name || '',
          searchName: '',
          erpAccount: '',
          ice: '',
          ifField: '',
          rc: '',
          rcCity: '',
          tp: '',
          vatStatus: ['Standard'],
          orgType: 'Headquarter',
          parentAccountId: null,
          addresses: [],
          mainPhone: p?.phone || '',
          corporateEmail: p?.email || '',
          websiteUrl: '',
          personnel: [],
        });
      }
    });
  }

  emptyCard(): CustomerCard {
    return {
      id: '',
      partnerId: '',
      accountId: '',
      recordType: 'Organization',
      name: '',
      searchName: '',
      erpAccount: '',
      ice: '',
      ifField: '',
      rc: '',
      rcCity: '',
      tp: '',
      vatStatus: ['Standard'],
      orgType: 'Headquarter',
      parentAccountId: null,
      addresses: [],
      mainPhone: '',
      corporateEmail: '',
      websiteUrl: '',
      personnel: [],
    };
  }

  onIceInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length > 15) val = val.slice(0, 15);
    input.value = val;
    this.form().ice = val;
    if (val.length > 0 && val.length !== 15) {
      this.iceError.set('ICE must be exactly 15 digits');
    } else {
      this.iceError.set(null);
    }
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value && !input.value.startsWith('+212')) {
      input.value = '+212 ' + input.value.replace(/^\+212\s*/, '');
    }
  }

  toggleVat(option: VatStatus) {
    const current = this.form().vatStatus;
    if (current.includes(option)) {
      this.form().vatStatus = current.filter(v => v !== option);
    } else {
      this.form().vatStatus = [...current, option];
    }
  }

  addAddress() {
    this.form().addresses = [
      ...this.form().addresses,
      {
        id: 'addr-' + Date.now(),
        addressType: 'Siège Social / Fiscal',
        streetAddress: '',
        industrialZone: '',
        postalCode: '',
        city: 'Casablanca',
        isPrimary: this.form().addresses.length === 0,
      },
    ];
  }

  removeAddress(index: number) {
    this.form().addresses = this.form().addresses.filter((_, i) => i !== index);
    if (this.form().addresses.length > 0 && !this.form().addresses.some(a => a.isPrimary)) {
      this.form().addresses[0].isPrimary = true;
    }
  }

  setPrimaryAddress(index: number) {
    this.form().addresses = this.form().addresses.map((a, i) => ({ ...a, isPrimary: i === index }));
  }

  addPersonnel() {
    this.form().personnel = [
      ...this.form().personnel,
      {
        id: 'per-' + Date.now(),
        fullName: '',
        jobTitle: 'Purchasing Manager',
        directMobile: '',
        directEmail: '',
        isPrimary: this.form().personnel.length === 0,
      },
    ];
  }

  removePersonnel(index: number) {
    this.form().personnel = this.form().personnel.filter((_, i) => i !== index);
    if (this.form().personnel.length > 0 && !this.form().personnel.some(p => p.isPrimary)) {
      this.form().personnel[0].isPrimary = true;
    }
  }

  setPrimaryPerson(index: number) {
    this.form().personnel = this.form().personnel.map((p, i) => ({ ...p, isPrimary: i === index }));
  }

  isValid(): boolean {
    const f = this.form();
    if (!f.name.trim()) return false;
    if (!f.ice || f.ice.length !== 15) return false;
    if (!f.ifField || !f.ifField.trim()) return false;
    if (!f.rc || !f.rc.trim()) return false;
    return true;
  }

  saveCard() {
    if (!this.isValid()) return;

    if (!this.isExisting()) {
      this.state.convertToCustomer(this.partnerId);
    }
    this.state.saveCustomerCard(this.form());
    this.goBack();
  }

  goBack() {
    this.router.navigateByUrl('/partners');
  }
}

import { Injectable, signal, computed } from '@angular/core';

export type PartnerType = 'Customer' | 'Prospect' | 'Vendor';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type DealStage = 'New' | 'Proposal sent' | 'Confirmed' | 'Awaiting Invoicing' | 'Invoiced' | 'Closed Won' | 'Closed Lost';
export type InvoiceStatus = 'Pending' | 'Paid' | 'Overdue' | 'Draft';
export type CampaignType = 'WhatsApp' | 'SMS' | 'Email';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  email?: string;
  phone?: string;
  comments?: string;
  city?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTeam?: 'Sales' | 'Operations' | 'Finance' | 'Support';
  assignedTo?: string;
  status: TaskStatus;
  relatedTo?: string; // module/entity reference
}

export interface ProposalLine {
  product: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Proposal {
  id: string;
  title: string;
  partnerId: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Confirmed' | 'Rejected';
  templateId?: string;
  lines: ProposalLine[];
}

export interface Deal {
  id: string;
  title: string;
  partnerId: string;
  amount: number;
  stage: DealStage;
  comments?: string;
  proposalId?: string;
  orderLines?: ProposalLine[];
  discount?: number;
  emailExchange?: string;
  estimatedDeliveryDate?: string;
}

export interface PurchaseOrder {
  id: string;
  dealId: string;
  vendorId: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Delivered' | 'Invoiced';
  deliveryDate?: string;
  lines: { product: string; qty: number; cost: number }[];
  sentVia?: string;
}

export interface Invoice {
  id: string;
  type: 'Customer' | 'Vendor';
  partnerId: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  dealId?: string;
  purchaseOrderId?: string;
}

export interface Campaign {
  id: string;
  title: string;
  type: CampaignType;
  status: 'Draft' | 'Active' | 'Completed';
  targetAudience: string;
  sentCount: number;
}

export interface Ticket {
  id: string;
  title: string;
  partnerId: string;
  assignedTo: string;
  status: TicketStatus;
  priority: 'Low' | 'Medium' | 'High';
}

export interface ProposalTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  lines: ProposalLine[];
}

@Injectable({ providedIn: 'root' })
export class CrmStateService {
  // Team members
  users = signal<{ name: string; role: string; team: 'Sales' | 'Operations' | 'Finance' | 'Support' }[]>([
    { name: 'Youssef El Alami', role: 'Salesperson', team: 'Sales' },
    { name: 'Amine Bennani', role: 'Salesperson', team: 'Sales' },
    { name: 'Achraf (Manager)', role: 'Sales Manager', team: 'Sales' },
    { name: 'Khadija (Ops Manager)', role: 'Operations Manager', team: 'Operations' },
    { name: 'Fatima Chraibi', role: 'Operations Personnel', team: 'Operations' },
    { name: 'Omar (Finance)', role: 'Finance Specialist', team: 'Finance' }
  ]);

  // Proposal templates
  proposalTemplates = signal<ProposalTemplate[]>([
    {
      id: 'temp1',
      name: 'Standard Cloud Hosting Services',
      subject: 'Offre Commerciale - Cloud Hosting',
      body: 'Voici notre proposition commerciale pour la mise en place d\'une infrastructure Cloud optimisée pour vos besoins.',
      lines: [
        { product: 'Serveur Dédié Maroc Cloud', description: 'Serveur Haute Performance localisé à Casablanca', qty: 2, unitPrice: 4500, total: 9000 },
        { product: 'Installation & Configuration', description: 'Déploiement et migration des données', qty: 1, unitPrice: 6000, total: 6000 }
      ]
    },
    {
      id: 'temp2',
      name: 'CRM Customization & Training',
      subject: 'Offre Commerciale - Intégration CRM Maroc',
      body: 'Proposition de services professionnels pour le développement spécifique et la formation CRM.',
      lines: [
        { product: 'Développement sur-mesure CRM', description: 'Modules spécifiques et intégration locale', qty: 10, unitPrice: 1500, total: 15000 },
        { product: 'Formation des équipes', description: 'Formation pratique pour le staff de vente', qty: 2, unitPrice: 3000, total: 6000 }
      ]
    }
  ]);

  // Moroccan data population
  partners = signal<Partner[]>([
    { id: 'p1', name: 'Atlas Digital S.A.R.L.', type: 'Prospect', email: 'contact@atlasdigital.ma', phone: '+212-522-458922', comments: 'Grand intérêt pour la migration Cloud.', city: 'Casablanca' },
    { id: 'p2', name: 'Casablanca Tech Wholesale', type: 'Vendor', email: 'sales@casatechwholesale.ma', phone: '+212-522-897452', comments: 'Fournisseur principal de serveurs physiques.', city: 'Casablanca' },
    { id: 'p3', name: 'Maroc Telecom Systems', type: 'Customer', email: 'telecomsys@mts.co.ma', phone: '+212-537-778899', comments: 'Client historique pour le support réseau.', city: 'Rabat' },
    { id: 'p4', name: 'Al-Maghrib Consulting', type: 'Prospect', email: 'hello@almaghribconsulting.ma', phone: '+212-661-345678', comments: 'En attente d\'une offre personnalisée CRM.', city: 'Marrakech' }
  ]);

  tasks = signal<Task[]>([
    { id: 't1', title: 'Assign prospect and follow up', description: 'Sales manager needs to assign Atlas Digital to a salesperson', assignedTeam: 'Sales', assignedTo: 'Achraf (Manager)', status: 'Pending', relatedTo: 'Atlas Digital S.A.R.L.' }
  ]);

  proposals = signal<Proposal[]>([]);
  deals = signal<Deal[]>([]);
  purchaseOrders = signal<PurchaseOrder[]>([]);
  invoices = signal<Invoice[]>([]);

  campaigns = signal<Campaign[]>([
    { id: 'c1', title: 'Aïd Al-Adha Promotion', type: 'Email', status: 'Completed', targetAudience: 'Prospects', sentCount: 450 },
    { id: 'c2', title: 'WhatsApp Alert - Nouveautés Cloud', type: 'WhatsApp', status: 'Active', targetAudience: 'Customers', sentCount: 180 },
    { id: 'c3', title: 'SMS Offres Spéciales PME', type: 'SMS', status: 'Draft', targetAudience: 'Prospects', sentCount: 0 }
  ]);

  tickets = signal<Ticket[]>([
    { id: 'tk1', title: 'Problème accès console Cloud', partnerId: 'p3', assignedTo: 'Fatima Chraibi', status: 'In Progress', priority: 'High' }
  ]);

  // Derived states
  customers = computed(() => this.partners().filter(p => p.type === 'Customer'));
  vendors = computed(() => this.partners().filter(p => p.type === 'Vendor'));
  prospects = computed(() => this.partners().filter(p => p.type === 'Prospect'));

  customerInvoices = computed(() => this.invoices().filter(i => i.type === 'Customer'));
  vendorInvoices = computed(() => this.invoices().filter(i => i.type === 'Vendor'));
  overdueInvoices = computed(() => this.invoices().filter(i => i.type === 'Customer' && i.status === 'Overdue'));

  dashboardKpis = signal<string[]>(['totalDeals', 'marketingSpend', 'latePayers']);

  toggleDashboardKpi(kpiId: string) {
    this.dashboardKpis.update(kpis =>
      kpis.includes(kpiId) ? kpis.filter(id => id !== kpiId) : [...kpis, kpiId]
    );
  }

  // State transitions & helpers
  convertToCustomer(partnerId: string) {
    this.partners.update(partners =>
      partners.map(p => p.id === partnerId ? { ...p, type: 'Customer' } : p)
    );
  }

  addPartner(partner: Omit<Partner, 'id'>) {
    const newId = 'p' + (this.partners().length + 1);
    const newPartner = { ...partner, id: newId };
    this.partners.update(pList => [...pList, newPartner]);
    return newPartner;
  }

  addTask(task: Omit<Task, 'id'>) {
    const newId = 't' + (this.tasks().length + 1);
    const newTask = { ...task, id: newId };
    this.tasks.update(tList => [...tList, newTask]);
    return newTask;
  }

  updateTaskStatus(taskId: string, status: TaskStatus, assignedTo?: string) {
    this.tasks.update(tasks =>
      tasks.map(t => {
        if (t.id === taskId) {
          const updated = { ...t, status };
          if (assignedTo !== undefined) updated.assignedTo = assignedTo;
          return updated;
        }
        return t;
      })
    );
  }

  addProposal(proposal: Omit<Proposal, 'id'>) {
    const newId = 'pr' + (this.proposals().length + 1);
    const newProp = { ...proposal, id: newId };
    this.proposals.update(props => [...props, newProp]);
    return newProp;
  }

  updateProposalStatus(propId: string, status: 'Draft' | 'Sent' | 'Confirmed' | 'Rejected') {
    this.proposals.update(props =>
      props.map(p => p.id === propId ? { ...p, status } : p)
    );
  }

  addDeal(deal: Omit<Deal, 'id'>) {
    const newId = 'd' + (this.deals().length + 1);
    const newDeal = { ...deal, id: newId };
    this.deals.update(dList => [...dList, newDeal]);
    return newDeal;
  }

  updateDealStage(dealId: string, stage: DealStage) {
    this.deals.update(deals =>
      deals.map(d => d.id === dealId ? { ...d, stage } : d)
    );
  }

  addPurchaseOrder(po: Omit<PurchaseOrder, 'id'>) {
    const newId = 'po' + (this.purchaseOrders().length + 1);
    const newPo = { ...po, id: newId };
    this.purchaseOrders.update(pos => [...pos, newPo]);
    return newPo;
  }

  updatePurchaseOrderStatus(poId: string, status: 'Draft' | 'Sent' | 'Delivered' | 'Invoiced', deliveryDate?: string) {
    this.purchaseOrders.update(pos =>
      pos.map(po => {
        if (po.id === poId) {
          const updated = { ...po, status };
          if (deliveryDate) updated.deliveryDate = deliveryDate;
          return updated;
        }
        return po;
      })
    );
  }

  addInvoice(invoice: Omit<Invoice, 'id'>) {
    const newId = 'i' + (this.invoices().length + 1);
    const newInv = { ...invoice, id: newId };
    this.invoices.update(invs => [...invs, newInv]);
    return newInv;
  }

  updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    this.invoices.update(invs =>
      invs.map(i => i.id === invoiceId ? { ...i, status } : i)
    );
  }

  // Walkthrough Wizard State
  walkthroughStep = signal<number>(0);
  
  steps = [
    {
      title: 'Assign Prospect Task to Sales',
      description: 'The Sales Manager assigns the prospect "Atlas Digital S.A.R.L." to salesperson "Youssef El Alami" to contact them.',
      route: '/sales',
      actionLabel: 'Auto-Assign Task',
      action: () => {
        // Complete t1, change assignee to Youssef
        this.updateTaskStatus('t1', 'Completed', 'Youssef El Alami');
        // Create next task: create proposal
        this.addTask({
          title: 'Contact Atlas Digital and create Proposal',
          description: 'Contact Youssef\'s assigned prospect to define requirements and create a formal proposal.',
          assignedTeam: 'Sales',
          assignedTo: 'Youssef El Alami',
          status: 'Pending',
          relatedTo: 'Atlas Digital S.A.R.L.'
        });
        this.walkthroughStep.set(1);
      }
    },
    {
      title: 'Create Proposal for Prospect',
      description: 'Youssef El Alami contacts the prospect and creates a Proposal on the CRM using a template (e.g. Standard Cloud Hosting Services).',
      route: '/sales',
      actionLabel: 'Auto-Create Proposal',
      action: () => {
        // Mark t2 (or latest pending Sales task) completed
        const pendingSalesTask = this.tasks().find(t => t.assignedTo === 'Youssef El Alami' && t.status === 'Pending');
        if (pendingSalesTask) {
          this.updateTaskStatus(pendingSalesTask.id, 'Completed');
        }
        
        // Add Proposal
        const prop = this.addProposal({
          title: 'Proposition Cloud Hosting - Atlas Digital',
          partnerId: 'p1', // Atlas Digital
          amount: 15000,
          status: 'Sent',
          templateId: 'temp1',
          lines: [
            { product: 'Serveur Dédié Maroc Cloud', description: 'Serveur Haute Performance localisé à Casablanca', qty: 2, unitPrice: 4500, total: 9000 },
            { product: 'Installation & Configuration', description: 'Déploiement et migration des données', qty: 1, unitPrice: 6000, total: 6000 }
          ]
        });

        // Add task to wait for confirmation
        this.addTask({
          title: 'Follow up & wait for Proposal confirmation',
          description: 'Wait for the signed Bon de commande from Atlas Digital.',
          assignedTeam: 'Sales',
          assignedTo: 'Youssef El Alami',
          status: 'Pending',
          relatedTo: 'Proposal: ' + prop.title
        });
        
        this.walkthroughStep.set(2);
      }
    },
    {
      title: 'Wait & Confirm Proposal',
      description: 'The prospect Atlas Digital confirms the proposal (signs the Bon de commande). Status moves to Confirmed.',
      route: '/sales',
      actionLabel: 'Confirm Proposal',
      action: () => {
        const prop = this.proposals().find(p => p.partnerId === 'p1');
        if (prop) {
          this.updateProposalStatus(prop.id, 'Confirmed');
        }
        const pendingTask = this.tasks().find(t => t.status === 'Pending' && t.title.includes('Proposal confirmation'));
        if (pendingTask) {
          this.updateTaskStatus(pendingTask.id, 'Completed');
        }
        this.walkthroughStep.set(3);
      }
    },
    {
      title: 'Convert Prospect to Customer',
      description: 'Since the proposal is confirmed, the sales person converts the prospect "Atlas Digital S.A.R.L." to a Customer.',
      route: '/partners',
      actionLabel: 'Convert to Customer',
      action: () => {
        this.convertToCustomer('p1');
        this.walkthroughStep.set(4);
      }
    },
    {
      title: 'Create Deal',
      description: 'Under Sales > Deals, create a Deal with customer information, email exchange log, order lines, and price discounts.',
      route: '/sales',
      actionLabel: 'Auto-Create Deal',
      action: () => {
        const prop = this.proposals().find(p => p.partnerId === 'p1');
        const deal = this.addDeal({
          title: 'Atlas Digital Cloud Migration Deal',
          partnerId: 'p1',
          amount: 13500, // 10% discount on 15000
          stage: 'New',
          comments: 'Client requested a 10% discount which was approved. Delivery requested before next month.',
          proposalId: prop?.id,
          orderLines: prop?.lines || [],
          discount: 10,
          emailExchange: 'De: contact@atlasdigital.ma\nÀ: y.alami@acme.ma\nSujet: Bon de commande signé\n\nBonjour Youssef,\nVous trouverez ci-joint le BC signé. Merci de procéder à la livraison des serveurs.'
        });

        // Add task for Operations Team to create PO and deliver
        this.addTask({
          title: 'Create PO & arrange delivery of servers',
          description: 'Operations Manager will assign this task to Ops personnel to coordinate delivery.',
          assignedTeam: 'Operations',
          assignedTo: 'Khadija (Ops Manager)',
          status: 'Pending',
          relatedTo: 'Deal: ' + deal.title
        });

        this.walkthroughStep.set(5);
      }
    },
    {
      title: 'Assign Task to Operations Personnel',
      description: 'Operations Manager (Khadija) assigns the delivery task to operations personnel Fatima Chraibi.',
      route: '/sales',
      actionLabel: 'Assign to Fatima',
      action: () => {
        const pendingOpsTask = this.tasks().find(t => t.assignedTeam === 'Operations' && t.status === 'Pending');
        if (pendingOpsTask) {
          this.updateTaskStatus(pendingOpsTask.id, 'In Progress', 'Fatima Chraibi');
        }
        this.walkthroughStep.set(6);
      }
    },
    {
      title: 'Sourcing & Creating Purchase Order',
      description: 'Fatima Chraibi checks if the requested goods are on an existing vendor or creates a new vendor (e.g. Marrakech Hardware) and creates a Purchase Order.',
      route: '/sales',
      actionLabel: 'Create Vendor & PO',
      action: () => {
        // Create new vendor Marrakech Hardware if not exists
        let vendor = this.partners().find(p => p.name === 'Marrakech Hardware');
        if (!vendor) {
          vendor = this.addPartner({
            name: 'Marrakech Hardware',
            type: 'Vendor',
            email: 'contact@marrakechhardware.ma',
            phone: '+212-524-334455',
            comments: 'Nouveau fournisseur pour serveurs haute performance.',
            city: 'Marrakech'
          });
        }

        const deal = this.deals().find(d => d.partnerId === 'p1');
        
        // Create Purchase Order
        const po = this.addPurchaseOrder({
          dealId: deal?.id || 'd1',
          vendorId: vendor.id,
          amount: 9000,
          status: 'Sent',
          sentVia: 'Email via CRM',
          lines: [
            { product: 'Serveur Physique OEM (Marrakech Hardware)', qty: 2, cost: 4500 }
          ]
        });

        const pendingOpsTask = this.tasks().find(t => t.assignedTo === 'Fatima Chraibi' && t.status === 'In Progress');
        if (pendingOpsTask) {
          this.updateTaskStatus(pendingOpsTask.id, 'In Progress');
          // Add info about PO to task
          pendingOpsTask.relatedTo = 'PO: ' + po.id;
        }

        this.walkthroughStep.set(7);
      }
    },
    {
      title: 'Vendor Delivery Confirmation',
      description: 'Vendor confirms expected delivery date. Fatima logs this to update the estimated customer delivery date on the Deal.',
      route: '/sales',
      actionLabel: 'Log Delivery Date',
      action: () => {
        const po = this.purchaseOrders().find(p => p.status === 'Sent');
        if (po) {
          this.updatePurchaseOrderStatus(po.id, 'Sent', '2026-07-02');
        }
        // Update estimated delivery on deal
        const deal = this.deals().find(d => d.partnerId === 'p1');
        if (deal) {
          this.deals.update(deals =>
            deals.map(d => d.id === deal.id ? { ...d, estimatedDeliveryDate: '2026-07-05' } : d)
          );
        }
        this.walkthroughStep.set(8);
      }
    },
    {
      title: 'Receive Goods & Move Deal Stage',
      description: 'Goods are received from the vendor. Deal stage automatically moves to "Awaiting Invoicing" and PO status to "Delivered".',
      route: '/sales',
      actionLabel: 'Mark Goods Received',
      action: () => {
        const po = this.purchaseOrders().find(p => p.status === 'Sent');
        if (po) {
          this.updatePurchaseOrderStatus(po.id, 'Delivered');
        }
        const deal = this.deals().find(d => d.partnerId === 'p1');
        if (deal) {
          this.updateDealStage(deal.id, 'Awaiting Invoicing');
        }
        const pendingOpsTask = this.tasks().find(t => t.assignedTo === 'Fatima Chraibi');
        if (pendingOpsTask) {
          this.updateTaskStatus(pendingOpsTask.id, 'Completed');
        }

        // Create task for Finance team
        this.addTask({
          title: 'Confirm delivery and generate Invoice for Atlas Digital',
          description: 'Omar will generate customer invoice and record vendor invoice.',
          assignedTeam: 'Finance',
          assignedTo: 'Omar (Finance)',
          status: 'Pending',
          relatedTo: 'Deal: ' + (deal?.title || '')
        });

        this.walkthroughStep.set(9);
      }
    },
    {
      title: 'Generate Customer Invoice',
      description: 'Finance specialist (Omar) generates the customer invoice from the CRM and sends it. It is visible on Finance > Customer Invoices.',
      route: '/finance',
      actionLabel: 'Generate Customer Invoice',
      action: () => {
        const deal = this.deals().find(d => d.partnerId === 'p1');
        // Add customer invoice
        this.addInvoice({
          type: 'Customer',
          partnerId: 'p1',
          amount: deal?.amount || 13500,
          status: 'Pending',
          dueDate: '2026-07-20',
          dealId: deal?.id
        });

        if (deal) {
          this.updateDealStage(deal.id, 'Invoiced');
        }

        const pendingFinanceTask = this.tasks().find(t => t.assignedTeam === 'Finance' && t.status === 'Pending');
        if (pendingFinanceTask) {
          this.updateTaskStatus(pendingFinanceTask.id, 'Completed');
        }

        this.walkthroughStep.set(10);
      }
    },
    {
      title: 'Record Vendor Invoice',
      description: 'Finance receives and records the Vendor Invoice, which is linked to the Purchase Order and visible on Finance > Vendor Invoices.',
      route: '/finance',
      actionLabel: 'Record Vendor Invoice',
      action: () => {
        const po = this.purchaseOrders().find(p => p.status === 'Delivered');
        this.addInvoice({
          type: 'Vendor',
          partnerId: po?.vendorId || 'p2',
          amount: po?.amount || 9000,
          status: 'Pending',
          dueDate: '2026-07-15',
          purchaseOrderId: po?.id
        });
        if (po) {
          this.updatePurchaseOrderStatus(po.id, 'Invoiced');
        }
        this.walkthroughStep.set(11);
      }
    },
    {
      title: 'Simulate Late Payment & Recovery',
      description: 'Simulate that Atlas Digital is late paying (mark invoice as Overdue). Finance can select Atlas Digital on the Recovery page to send WhatsApp/SMS/Email payment reminders.',
      route: '/finance',
      actionLabel: 'Mark Overdue & Go to Recovery',
      action: () => {
        const inv = this.invoices().find(i => i.partnerId === 'p1' && i.type === 'Customer');
        if (inv) {
          this.updateInvoiceStatus(inv.id, 'Overdue');
        }
        // Change tab
        this.walkthroughStep.set(12);
      }
    }
  ];

  resetWalkthrough() {
    this.walkthroughStep.set(0);
    // Reset core demo states
    this.partners.set([
      { id: 'p1', name: 'Atlas Digital S.A.R.L.', type: 'Prospect', email: 'contact@atlasdigital.ma', phone: '+212-522-458922', comments: 'Grand intérêt pour la migration Cloud.', city: 'Casablanca' },
      { id: 'p2', name: 'Casablanca Tech Wholesale', type: 'Vendor', email: 'sales@casatechwholesale.ma', phone: '+212-522-897452', comments: 'Fournisseur principal de serveurs physiques.', city: 'Casablanca' },
      { id: 'p3', name: 'Maroc Telecom Systems', type: 'Customer', email: 'telecomsys@mts.co.ma', phone: '+212-537-778899', comments: 'Client historique pour le support réseau.', city: 'Rabat' },
      { id: 'p4', name: 'Al-Maghrib Consulting', type: 'Prospect', email: 'hello@almaghribconsulting.ma', phone: '+212-661-345678', comments: 'En attente d\'une offre personnalisée CRM.', city: 'Marrakech' }
    ]);
    this.tasks.set([
      { id: 't1', title: 'Assign prospect and follow up', description: 'Sales manager needs to assign Atlas Digital to a salesperson', assignedTeam: 'Sales', assignedTo: 'Achraf (Manager)', status: 'Pending', relatedTo: 'Atlas Digital S.A.R.L.' }
    ]);
    this.proposals.set([]);
    this.deals.set([]);
    this.purchaseOrders.set([]);
    this.invoices.set([]);
  }
}

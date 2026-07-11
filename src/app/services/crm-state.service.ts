import { Injectable, signal, computed } from '@angular/core';
import { SEED_ORG, SEED_USERS, SEED_TEAMS, SEED_GROUPS, SEED_MESSAGES, SEED_MEETINGS } from '../data/seed-data';

export interface Organization {
  id: string;
  name: string;
  logoInitials: string;
  logoColor: string;
  industry: string;
  timezone: string;
  fiscalYearStart: number;
  createdAt: Date;
}

export type RoleId = 'admin' | 'manager' | 'salesperson' | 'support' | 'viewer';

export interface CrmRole {
  id: RoleId;
  label: string;
  description: string;
  permissions: {
    canManageUsers: boolean;
    canManageTeams: boolean;
    canManageRoles: boolean;
    canViewAllDeals: boolean;
    canDeleteRecords: boolean;
    canCreateGroups: boolean;
    canScheduleMeetings: boolean;
  };
}

export interface CrmUser {
  id: string;
  displayName: string;
  name: string;              // For backward compatibility (same as displayName)
  email: string;
  initials: string;
  avatarColor: string;
  roleId: RoleId;
  role: string;              // For backward compatibility (derived from roleId)
  teamId: string | null;
  team: 'Sales' | 'Operations' | 'Finance' | 'Support' | null; // For backward compatibility
  isActive: boolean;
  phone?: string;
  jobTitle?: string;
  preferences: {
    language: 'en' | 'fr' | 'ar' | 'es';
    notifyOnLeadAssign: boolean;
    notifyOnDealUpdate: boolean;
    notifyOnMention: boolean;
  };
  createdAt: Date;
  lastActiveAt: Date;
}

export interface CrmTeam {
  id: string;
  name: string;
  department: 'Sales' | 'Operations' | 'Finance' | 'Support' | 'Custom';
  description?: string;
  leadUserId: string;
  memberUserIds: string[];
  color: string;
  createdAt: Date;
}

export interface CrmGroup {
  id: string;
  name: string;
  description?: string;
  createdByUserId: string;
  memberUserIds: string[];
  createdAt: Date;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderUserId: string;
  content: string;
  sentAt: Date;
  readByUserIds: string[];
}

export interface GroupMeeting {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  durationMinutes: number;
  organizerUserId: string;
  attendeeUserIds: string[];
  status: 'scheduled' | 'cancelled' | 'completed';
}

export const CRM_ROLES: CrmRole[] = [
  {
    id: 'admin',
    label: 'Admin',
    description: 'Full access to all settings and records',
    permissions: {
      canManageUsers: true,
      canManageTeams: true,
      canManageRoles: true,
      canViewAllDeals: true,
      canDeleteRecords: true,
      canCreateGroups: true,
      canScheduleMeetings: true
    }
  },
  {
    id: 'manager',
    label: 'Manager',
    description: 'Manage team members and view all deals',
    permissions: {
      canManageUsers: true,
      canManageTeams: true,
      canManageRoles: false,
      canViewAllDeals: true,
      canDeleteRecords: false,
      canCreateGroups: true,
      canScheduleMeetings: true
    }
  },
  {
    id: 'salesperson',
    label: 'Sales',
    description: 'Create and update leads and deals',
    permissions: {
      canManageUsers: false,
      canManageTeams: false,
      canManageRoles: false,
      canViewAllDeals: false,
      canDeleteRecords: false,
      canCreateGroups: true,
      canScheduleMeetings: true
    }
  },
  {
    id: 'support',
    label: 'Support',
    description: 'Manage support tickets and communications',
    permissions: {
      canManageUsers: false,
      canManageTeams: false,
      canManageRoles: false,
      canViewAllDeals: false,
      canDeleteRecords: false,
      canCreateGroups: true,
      canScheduleMeetings: true
    }
  },
  {
    id: 'viewer',
    label: 'Viewer',
    description: 'Read-only access across all modules',
    permissions: {
      canManageUsers: false,
      canManageTeams: false,
      canManageRoles: false,
      canViewAllDeals: false,
      canDeleteRecords: false,
      canCreateGroups: false,
      canScheduleMeetings: false
    }
  }
];

const AVATAR_COLORS = [
  '#7F77DD',  // purple
  '#1D9E75',  // teal
  '#D85A30',  // coral
  '#378ADD',  // blue
  '#BA7517',  // amber
  '#D4537E'   // pink
];

export type PartnerType = 'Customer' | 'Prospect' | 'Vendor' | 'Lead';

export interface Customer360Contact {
  name: string;
  jobTitle: string;
  email?: string;
  phone?: string;
}

export interface Customer360Order {
  id: string;
  title: string;
  stage: DealStage;
  amount: number;
  date?: string;
}

export interface Customer360Meeting {
  id: string;
  date: string;
  title: string;
  type: string;
}

export interface Customer360Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  priority: string;
}

export interface Customer360Invoice {
  id: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
}

export interface Customer360View {
  partner: Partner;
  contacts: Customer360Contact[];
  orders: Customer360Order[];
  meetings: Customer360Meeting[];
  tickets: Customer360Ticket[];
  invoices: Customer360Invoice[];
}

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type ProposalStage = 'New Lead' | 'Qualified' | 'Meeting Scheduled' | 'Proposal Sent' | 'Negotiation' | 'Won / Lost';
export type DealStage = 'New' | 'Proposal sent' | 'Confirmed' | 'Awaiting Invoicing' | 'Invoiced' | 'Closed Won' | 'Closed Lost' | ProposalStage;
export type InvoiceStatus = 'Pending' | 'Paid' | 'Overdue' | 'Draft';
export type CampaignType = 'WhatsApp' | 'SMS' | 'Email';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

// ──────────────────────────────────────────────────────────────────────────────
// Workflow Automation Types
// ──────────────────────────────────────────────────────────────────────────────
export type AutomationTrigger =
  | 'LeadCreated'
  | 'LeadUpdated'
  | 'DealCreated'
  | 'DealUpdated'
  | 'TicketCreated'
  | 'TicketUpdated';

export interface FieldDescriptor {
  key: string;
  label: string;
  type: 'string' | 'number' | 'enum' | 'date' | 'boolean';
  allowedValues?: string[];
  path: string;
}

export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'isEmpty'
  | 'isNotEmpty';

export interface AutomationCondition {
  fieldKey: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
}

export interface AutomationRuleGroup {
  id: string;
  logicalOperator: 'AND';
  conditions: AutomationCondition[];
}

export type AutomationActionType =
  | 'AssignSalesperson'
  | 'CreateFollowUpTask'
  | 'SendEmailLog'
  | 'NotifyManager'
  | 'UpdateEntityField'
  | 'ChangeStage'
  | 'CreateNote'
  | 'AddTag'
  | 'SetDueDate'
  | 'WebhookCall';

export interface AutomationAction {
  id: string;
  type: AutomationActionType;
  params: {
    assignee?: string;
    taskTitle?: string;
    taskDescription?: string;
    taskDueDateOffsetDays?: number;
    emailSubject?: string;
    emailBody?: string;
    emailFrom?: string;
    emailTo?: string;
    targetTeam?: 'Sales' | 'Operations' | 'Finance' | 'Support';
    taskTeam?: 'Sales' | 'Operations' | 'Finance' | 'Support';
    fieldKey?: string;
    fieldValue?: string | number;
    targetStage?: string;
    noteContent?: string;
    tagName?: string;
    webhookUrl?: string;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isTemplate?: boolean;
  trigger: AutomationTrigger;
  conditionGroups: AutomationRuleGroup[];
  actions: AutomationAction[];
  priority: number;
  stopOnMatch: boolean;
  conflictStrategy: 'first-wins' | 'all-execute';
  version: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  changeHistory?: {
    version: number;
    changedAt: string;
    changedBy: string;
    snapshot: object;
  }[];
  executionCount?: number;
}

export interface AutomationExecutionLog {
  id: string;
  ruleId: string;
  ruleName: string;
  ruleVersion: number;
  trigger: AutomationTrigger;
  entityType: 'Lead' | 'Deal' | 'Ticket';
  entityId: string;
  entityLabel: string;
  executedAt: string;
  dryRun: boolean;
  conditionsTrace: {
    groupId: string;
    passed: boolean;
    conditions: { fieldKey: string; expected: unknown; actual: unknown; passed: boolean }[];
  }[];
  actionsExecuted: { actionId: string; type: AutomationActionType; status: 'ok' | 'error'; error?: string }[];
  status: 'success' | 'partial' | 'failed';
}

export const TRIGGER_FIELD_MAP: Record<AutomationTrigger, FieldDescriptor[]> = {
  LeadCreated: [
    { key: 'name', label: 'Name', type: 'string', path: 'name' },
    { key: 'companyName', label: 'Company Name', type: 'string', path: 'companyName' },
    { key: 'status', label: 'Status', type: 'enum', allowedValues: ['New', 'Contacted', 'Attempted Contact', 'Meeting Scheduled', 'Qualified', 'Proposal Requested', 'Converted', 'Lost', 'Disqualified'], path: 'status' },
    { key: 'qualification', label: 'Qualification', type: 'enum', allowedValues: ['Qualified', 'Unqualified', 'Pending'], path: 'qualification' },
    { key: 'priority', label: 'Priority', type: 'enum', allowedValues: ['Low', 'Medium', 'High'], path: 'priority' },
    { key: 'score', label: 'Score', type: 'number', path: 'score' },
    { key: 'temperature', label: 'Temperature', type: 'enum', allowedValues: ['Cold', 'Warm', 'Hot'], path: 'temperature' },
    { key: 'stage', label: 'Stage', type: 'string', path: 'stage' },
    { key: 'assignedSalesperson', label: 'Assigned Salesperson', type: 'string', path: 'assignedSalesperson' },
    { key: 'estimatedDealValue', label: 'Estimated Deal Value', type: 'number', path: 'estimatedDealValue' },
    { key: 'probability', label: 'Probability', type: 'number', path: 'probability' }
  ],
  LeadUpdated: [
    { key: 'name', label: 'Name', type: 'string', path: 'name' },
    { key: 'companyName', label: 'Company Name', type: 'string', path: 'companyName' },
    { key: 'status', label: 'Status', type: 'enum', allowedValues: ['New', 'Contacted', 'Attempted Contact', 'Meeting Scheduled', 'Qualified', 'Proposal Requested', 'Converted', 'Lost', 'Disqualified'], path: 'status' },
    { key: 'qualification', label: 'Qualification', type: 'enum', allowedValues: ['Qualified', 'Unqualified', 'Pending'], path: 'qualification' },
    { key: 'priority', label: 'Priority', type: 'enum', allowedValues: ['Low', 'Medium', 'High'], path: 'priority' },
    { key: 'score', label: 'Score', type: 'number', path: 'score' },
    { key: 'temperature', label: 'Temperature', type: 'enum', allowedValues: ['Cold', 'Warm', 'Hot'], path: 'temperature' },
    { key: 'stage', label: 'Stage', type: 'string', path: 'stage' },
    { key: 'assignedSalesperson', label: 'Assigned Salesperson', type: 'string', path: 'assignedSalesperson' },
    { key: 'estimatedDealValue', label: 'Estimated Deal Value', type: 'number', path: 'estimatedDealValue' },
    { key: 'probability', label: 'Probability', type: 'number', path: 'probability' }
  ],
  DealCreated: [
    { key: 'title', label: 'Title', type: 'string', path: 'title' },
    { key: 'amount', label: 'Amount', type: 'number', path: 'amount' },
    { key: 'stage', label: 'Stage', type: 'enum', allowedValues: ['New', 'Proposal sent', 'Confirmed', 'Awaiting Invoicing', 'Invoiced', 'Closed Won', 'Closed Lost'], path: 'stage' },
    { key: 'customerAccount', label: 'Customer Account', type: 'string', path: 'customerAccount' },
    { key: 'contactPerson', label: 'Contact Person', type: 'string', path: 'contactPerson' },
    { key: 'salesPerson', label: 'Salesperson', type: 'string', path: 'salesPerson' },
    { key: 'orderStatus', label: 'Order Status', type: 'string', path: 'orderStatus' }
  ],
  DealUpdated: [
    { key: 'title', label: 'Title', type: 'string', path: 'title' },
    { key: 'amount', label: 'Amount', type: 'number', path: 'amount' },
    { key: 'stage', label: 'Stage', type: 'enum', allowedValues: ['New', 'Proposal sent', 'Confirmed', 'Awaiting Invoicing', 'Invoiced', 'Closed Won', 'Closed Lost'], path: 'stage' },
    { key: 'customerAccount', label: 'Customer Account', type: 'string', path: 'customerAccount' },
    { key: 'contactPerson', label: 'Contact Person', type: 'string', path: 'contactPerson' },
    { key: 'salesPerson', label: 'Salesperson', type: 'string', path: 'salesPerson' },
    { key: 'orderStatus', label: 'Order Status', type: 'string', path: 'orderStatus' }
  ],
  TicketCreated: [
    { key: 'title', label: 'Title', type: 'string', path: 'title' },
    { key: 'assignedTo', label: 'Assigned To', type: 'string', path: 'assignedTo' },
    { key: 'status', label: 'Status', type: 'enum', allowedValues: ['Open', 'In Progress', 'Resolved', 'Closed'], path: 'status' },
    { key: 'priority', label: 'Priority', type: 'enum', allowedValues: ['Low', 'Medium', 'High'], path: 'priority' }
  ],
  TicketUpdated: [
    { key: 'title', label: 'Title', type: 'string', path: 'title' },
    { key: 'assignedTo', label: 'Assigned To', type: 'string', path: 'assignedTo' },
    { key: 'status', label: 'Status', type: 'enum', allowedValues: ['Open', 'In Progress', 'Resolved', 'Closed'], path: 'status' },
    { key: 'priority', label: 'Priority', type: 'enum', allowedValues: ['Low', 'Medium', 'High'], path: 'priority' }
  ]
};

export interface LeadCompany {
  industry?: string;
  size?: string;
  annualRevenue?: string;
  country?: string;
  city?: string;
  address?: string;
  officesCount?: number;
}

export interface LeadContact {
  id: string;
  name: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  linkedin?: string;
}

export interface LeadActivity {
  id: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Task';
  date: string;
  summary: string;
  detail?: string;
  assignedTo?: string;
  nextFollowUp?: string;
}

export interface LeadAttachment {
  id: string;
  fileName: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface LeadStatusHistory {
  status: string;
  timestamp: string;
  user: string;
}

export interface LeadProductInterest {
  product: string;
  solution?: string;
  usersCount?: number;
}

export interface LeadCampaign {
  source: string;
  campaign?: string;
  referralPartner?: string;
  tradeShow?: string;
  marketingCampaign?: string;
  socialMedia?: string;
  salesReferral?: string;
}

export interface Lead {
  id: string;
  name: string;
  companyName: string;
  status: 'New' | 'Contacted' | 'Attempted Contact' | 'Meeting Scheduled' | 'Qualified' | 'Proposal Requested' | 'Converted' | 'Lost' | 'Disqualified';
  qualification: 'Qualified' | 'Unqualified' | 'Pending';
  priority: 'Low' | 'Medium' | 'High';
  score: number; // 0-100
  temperature: 'Cold' | 'Warm' | 'Hot';
  stage: string;
  assignedSalesperson?: string;
  salesTeam?: string;
  territory?: string;
  businessUnit?: string;
  
  // Decision makers
  decisionMaker?: string;
  influencer?: string;
  financeContact?: string;
  technicalContact?: string;

  // Sales probability
  estimatedDealValue?: number;
  probability?: number; // percentage
  expectedCloseDate?: string;

  // Audit
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;

  company?: LeadCompany;
  contacts?: LeadContact[];
  activities?: LeadActivity[];
  attachments?: LeadAttachment[];
  statusHistory?: LeadStatusHistory[];
  productInterests?: LeadProductInterest[];
  campaigns?: LeadCampaign[];
  notes?: string;
}

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  email?: string;
  phone?: string;
  comments?: string;
  city?: string;
  score?: number;
  source?: 'Website form' | 'Trade show' | 'LinkedIn' | 'Marketing campaign' | 'Referral';
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTeam?: 'Sales' | 'Operations' | 'Finance' | 'Support';
  assignedTo?: string;
  status: TaskStatus;
  priority?: 'Urgent' | 'Medium' | 'Low';
  deadline?: string;
  relatedTo?: string; // display label of the related entity
  relatedModule?: 'Sales' | 'Finance' | 'Partners' | 'Support' | 'Marketing';
  relatedSubModule?: string; // entity type: Deal, Proposal, PurchaseOrder, Lead, Customer, Prospect, Vendor, Ticket, Campaign, Invoice, Recovery
  relatedEntityId?: string; // id of the related entity
  createdBy: string;
  createdAt: string;
}

export interface ProposalLine {
  product: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
  vendor?: string;
}

export interface Proposal {
  id: string;
  title: string;
  partnerId: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Confirmed' | 'Rejected';
  templateId?: string;
  lines: ProposalLine[];
  createdBy: string;
  createdAt: string;
  deliveryMethod?: 'Email' | 'WhatsApp' | 'SMS';
  opportunityValue?: number;
  closingProbability?: number;
  expectedClosingDate?: string;
  competitors?: string[];
  stage?: ProposalStage;
  confirmationMethod?: 'Email' | 'WhatsApp' | 'Call';
  confirmationAttachmentName?: string;
  confirmationAttachmentData?: string;
  confirmationNote?: string;
  confirmedAt?: string;
}

export interface CallLog {
  id: string;
  date: string;
  duration: number; // in minutes
  callerName: string;
  summary: string;
  outcome: string;
}

export interface EmailLog {
  id: string;
  date: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  direction: 'sent' | 'received';
}

export interface Meeting {
  id: string;
  date: string;
  time: string;
  title: string;
  attendees: string[];
  location: string;
  summary: string;
  type: 'in-person' | 'teams' | 'demo';
}

export interface TeamsRecording {
  id: string;
  date: string;
  title: string;
  meetingLink: string;
  recordingLink: string;
  duration: string;
}

export interface Note {
  id: string;
  date: string;
  author: string;
  content: string;
}

export interface FollowUp {
  id: string;
  dueDate: string;
  title: string;
  assignedTo: string;
  status: 'pending' | 'done';
}

export interface Deal {
  id: string;
  title: string;
  partnerId: string;
  amount: number;
  stage: DealStage;
  comments?: string;
  proposalId?: string;
  createdBy: string;
  createdAt: string;
  orderLines?: ProposalLine[];
  discount?: number;
  emailExchange?: string;
  estimatedDeliveryDate?: string;

  // Identification & Dates
  orderNumber?: string;
  dealNumber?: string;
  orderDate?: string;
  requestedDeliveryDate?: string;
  orderStatus?: string;

  // Customer & Delivery
  customerAccount?: string;
  billingAddress?: string;
  deliveryAddress?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Sales & Ownership
  salesPerson?: string;
  salesRegion?: string;

  // Commercial Basics
  currency?: string;
  paymentTerms?: string;
  orderTotalAmount?: number;

  // Vendor / Partner
  vendorAccount?: string;
  purchaseOrderRef?: string;
  warehouseAddress?: string;
  transportationService?: string;
  expectedDeliveryDateVendor?: string;
  deliveryDate?: string;

  // Deal Activity Hub
  activityLog?: {
    calls: CallLog[];
    emails: EmailLog[];
    meetings: Meeting[];
    recordings: TeamsRecording[];
    notes: Note[];
    followUps: FollowUp[];
  };
}

export interface PurchaseOrder {
  id: string;
  dealId: string;
  vendorId: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Delivered' | 'Invoiced';
  deliveryDate?: string;
  lines: { product: string; description?: string; qty: number; cost: number; type?: 'software' | 'hardware' | 'service' }[];
  sentVia?: string;
  createdBy: string;
  createdAt: string;
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
  createdBy: string;
  createdAt: string;
  // Customer administrative information
  customerAccount?: string;   // Unique account code / ERP ID
  customerName?: string;      // Official corporate name
  deliveryAddress?: string;   // Full delivery location
  vatNumber?: string;         // VAT registration string
  // Line items (inherited from deal + custom additions)
  lines?: { item: string; description?: string; qty: number; unitPrice: number; type: 'software' | 'hardware' | 'service' }[];
}

export interface Campaign {
  id: string;
  title: string;
  type: CampaignType;
  status: 'Draft' | 'Active' | 'Completed';
  targetAudience: string;
  sentCount: number;
  createdBy: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  partnerId: string;
  assignedTo: string;
  status: TicketStatus;
  priority: 'Low' | 'Medium' | 'High';
  deadline?: string;
  type?: string;
  resolution?: string;
  createdBy: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  targetId: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Task';
  description: string;
  timestamp: string;
  link?: string;
}


export type RecordType = 'Organization' | 'Individual';
export type OrgType = 'Headquarter' | 'Subsidiary' | 'Branch';
export type AddressType = 'Siège Social / Fiscal' | 'Delivery' | 'Warehouse' | 'Billing';
export type VatStatus = 'Standard' | 'No VAT' | 'Export Trade';

export interface CustomerAddress {
  id: string;
  addressType: AddressType;
  streetAddress: string;
  industrialZone: string;
  postalCode: string;
  city: string;
  isPrimary: boolean;
  country?: string;
}

export interface CustomerPersonnel {
  id: string;
  fullName: string;
  jobTitle: string;
  directMobile: string;
  directEmail: string;
  isPrimary: boolean;
}

export interface CustomerCard {
  id: string;
  partnerId: string;
  accountId: string;
  recordType: RecordType;
  name: string;
  searchName: string;
  erpAccount: string;
  ice: string;
  ifField: string;
  rc: string;
  rcCity: string;
  tp: string;
  vatStatus: VatStatus[];
  orgType: OrgType;
  parentAccountId: string | null;
  addresses: CustomerAddress[];
  mainPhone: string;
  corporateEmail: string;
  websiteUrl: string;
  personnel: CustomerPersonnel[];
  createdBy: string;
  createdAt: string;
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
  // Config signals
  organization = signal<Organization>(SEED_ORG);
  users = signal<CrmUser[]>(SEED_USERS);
  teams = signal<CrmTeam[]>(SEED_TEAMS);
  groups = signal<CrmGroup[]>(SEED_GROUPS);
  groupMessages = signal<GroupMessage[]>(SEED_MESSAGES);
  groupMeetings = signal<GroupMeeting[]>(SEED_MEETINGS);
  currentUserId = signal<string>('usr_rachid');

  // Shared tab state for section pages
  salesSubTab = signal<'deals' | 'proposals' | 'pos'>('deals');
  breadcrumbLabel = signal<string | null>(null);
  marketingSubTab = signal<'Email' | 'WhatsApp' | 'SMS'>('Email');
  partnersSubTab = signal<'Lead' | 'Customer' | 'Prospect' | 'Vendor'>('Lead');
  financeSubTab = signal<'Customer' | 'Vendor' | 'Recovery'>('Customer');

  // Global search navigation target — set before navigating to deep-link a sub-tab
  navigateTab = signal<string | null>(null);

  // Filter signals — set by dashboard widgets before navigating to filtered list pages
  taskFilter = signal<{ priority?: string } | null>(null);
  ticketFilter = signal<{ priority?: string } | null>(null);

  // Global currency setting — readable by all components, togglable from settings
  globalCurrency = signal<string>('MAD');

  // Computeds
  activeUsers = computed(() => this.users().filter(u => u.isActive));
  
  currentUserPermissions = computed(() => {
    const user = this.users().find(u => u.id === this.currentUserId());
    return CRM_ROLES.find(r => r.id === user?.roleId)?.permissions ?? {
      canManageUsers: false,
      canManageTeams: false,
      canManageRoles: false,
      canViewAllDeals: false,
      canDeleteRecords: false,
      canCreateGroups: false,
      canScheduleMeetings: false
    };
  });

  // Utility helpers
  usersByTeam(teamId: string): CrmUser[] {
    return this.users().filter(u => u.teamId === teamId);
  }

  groupsByUser(userId: string): CrmGroup[] {
    return this.groups().filter(g => g.memberUserIds.includes(userId));
  }

  deriveInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getAvatarColor(userId: string): string {
    const hash = userId.charCodeAt(userId.length - 1);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  }

  private patchUserCompatibility(user: CrmUser): CrmUser {
    user.name = user.displayName;
    if (user.roleId === 'admin') user.role = 'Admin';
    else if (user.roleId === 'manager') user.role = 'Manager';
    else if (user.roleId === 'salesperson') user.role = 'Salesperson';
    else if (user.roleId === 'support') user.role = 'Support Specialist';
    else if (user.roleId === 'viewer') user.role = 'Viewer';

    const teamObj = this.teams().find(t => t.id === user.teamId);
    if (teamObj) {
      if (teamObj.department === 'Sales') user.team = 'Sales';
      else if (teamObj.department === 'Operations') user.team = 'Operations';
      else if (teamObj.department === 'Finance') user.team = 'Finance';
      else if (teamObj.department === 'Support') user.team = 'Support';
      else user.team = null;
    } else {
      user.team = null;
    }
    return user;
  }

  private patchAllUsersCompatibility(usersList: CrmUser[]): CrmUser[] {
    return usersList.map(u => this.patchUserCompatibility({ ...u }));
  }

  // State mutations
  updateOrganization(patch: Partial<Organization>): void {
    const current = this.organization();
    if (current) {
      this.organization.set({ ...current, ...patch });
    }
  }

  addUser(draft: Omit<CrmUser, 'id' | 'initials' | 'createdAt' | 'lastActiveAt' | 'avatarColor' | 'name' | 'role' | 'team'>): CrmUser {
    const id = 'usr_' + Math.random().toString(36).substring(2, 9);
    const newUser: CrmUser = {
      ...draft,
      id,
      initials: this.deriveInitials(draft.displayName),
      avatarColor: this.getAvatarColor(id),
      createdAt: new Date(),
      lastActiveAt: new Date(),
      name: draft.displayName,
      role: '',
      team: null
    };
    const patched = this.patchUserCompatibility(newUser);
    this.users.update(list => [...list, patched]);

    if (draft.teamId) {
      this.addTeamMember(draft.teamId, id);
    }
    return patched;
  }

  updateUser(id: string, patch: Partial<CrmUser>): void {
    this.users.update(list => list.map(u => {
      if (u.id === id) {
        const merged = { ...u, ...patch };
        if (patch.displayName) {
          merged.initials = this.deriveInitials(patch.displayName);
        }
        return this.patchUserCompatibility(merged);
      }
      return u;
    }));
  }

  deactivateUser(id: string): void {
    this.assertNotLastAdmin(id);
    this.users.update(list => list.map(u => {
      if (u.id === id) {
        return { ...u, isActive: false };
      }
      return u;
    }));
    // Remove from team lists
    this.teams.update(teamsList => teamsList.map(t => {
      if (t.memberUserIds.includes(id)) {
        return { ...t, memberUserIds: t.memberUserIds.filter(mid => mid !== id) };
      }
      return t;
    }));
  }

  addTeam(draft: Omit<CrmTeam, 'id' | 'createdAt'>): CrmTeam {
    const id = 'team_' + Math.random().toString(36).substring(2, 9);
    const newTeam: CrmTeam = {
      ...draft,
      id,
      createdAt: new Date()
    };
    this.teams.update(list => [...list, newTeam]);

    // Update lead's teamId and role to manager
    this.updateUser(draft.leadUserId, { teamId: id, roleId: 'manager' });

    // Update members
    draft.memberUserIds.forEach(mid => {
      this.updateUser(mid, { teamId: id });
    });

    return newTeam;
  }

  updateTeam(id: string, patch: Partial<CrmTeam>): void {
    this.teams.update(list => list.map(t => {
      if (t.id === id) {
        return { ...t, ...patch };
      }
      return t;
    }));
    if (patch.leadUserId) {
      this.addTeamMember(id, patch.leadUserId);
      this.updateUser(patch.leadUserId, { roleId: 'manager' });
    }
  }

  addTeamMember(teamId: string, userId: string): void {
    this.teams.update(list => list.map(t => {
      if (t.id === teamId) {
        if (!t.memberUserIds.includes(userId)) {
          return { ...t, memberUserIds: [...t.memberUserIds, userId] };
        }
      }
      return t;
    }));
    this.updateUser(userId, { teamId });
  }

  removeTeamMember(teamId: string, userId: string): void {
    this.assertNotTeamLead(teamId, userId);
    this.teams.update(list => list.map(t => {
      if (t.id === teamId) {
        return { ...t, memberUserIds: t.memberUserIds.filter(id => id !== userId) };
      }
      return t;
    }));
    this.updateUser(userId, { teamId: null });
  }

  updateUserRole(userId: string, roleId: RoleId): void {
    this.assertNotLastAdmin(userId);
    this.updateUser(userId, { roleId });
  }

  createGroup(draft: Omit<CrmGroup, 'id' | 'createdAt'>): CrmGroup {
    const id = 'grp_' + Math.random().toString(36).substring(2, 9);
    const newGroup: CrmGroup = {
      ...draft,
      id,
      createdAt: new Date()
    };
    this.groups.update(list => [...list, newGroup]);
    return newGroup;
  }

  sendGroupMessage(groupId: string, senderUserId: string, content: string): void {
    const newMessage: GroupMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      groupId,
      senderUserId,
      content,
      sentAt: new Date(),
      readByUserIds: [senderUserId]
    };
    this.groupMessages.update(list => [...list, newMessage]);
  }

  scheduleMeeting(draft: Omit<GroupMeeting, 'id' | 'status'>): GroupMeeting {
    const newMeeting: GroupMeeting = {
      ...draft,
      id: 'meet_' + Math.random().toString(36).substring(2, 9),
      status: 'scheduled'
    };
    this.groupMeetings.update(list => [...list, newMeeting]);
    return newMeeting;
  }

  private assertNotLastAdmin(userId: string): void {
    const activeAdmins = this.users().filter(u => u.isActive && u.roleId === 'admin');
    if (activeAdmins.length === 1 && activeAdmins[0].id === userId) {
      throw new Error("Can't remove the last admin. Assign another admin first.");
    }
  }

  private assertNotTeamLead(teamId: string, userId: string): void {
    const team = this.teams().find(t => t.id === teamId);
    if (team?.leadUserId === userId) {
      throw new Error("Transfer team lead before removing this member.");
    }
  }


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
    { id: 'p1', name: 'Atlas Digital S.A.R.L.', type: 'Prospect', email: 'contact@atlasdigital.ma', phone: '+212-522-458922', comments: 'Grand intérêt pour la migration Cloud.', city: 'Casablanca', createdBy: 'usr_rachid', createdAt: '2026-01-15' },
    { id: 'p2', name: 'Casablanca Tech Wholesale', type: 'Vendor', email: 'sales@casatechwholesale.ma', phone: '+212-522-897452', comments: 'Fournisseur principal de serveurs physiques.', city: 'Casablanca', createdBy: 'usr_rachid', createdAt: '2026-01-20' },
    { id: 'p3', name: 'Maroc Telecom Systems', type: 'Customer', email: 'telecomsys@mts.co.ma', phone: '+212-537-778899', comments: 'Client historique pour le support réseau.', city: 'Rabat', createdBy: 'usr_rachid', createdAt: '2026-02-01' },
    { id: 'p4', name: 'Al-Maghrib Consulting', type: 'Prospect', email: 'hello@almaghribconsulting.ma', phone: '+212-661-345678', comments: 'En attente d\'une offre personnalisée CRM.', city: 'Marrakech', createdBy: 'usr_rachid', createdAt: '2026-03-10' },
    { id: 'p5', name: 'ABC Technologies', type: 'Customer', email: 'contact@abctech.ma', phone: '+212-522-112233', city: 'Casablanca', createdBy: 'usr_rachid', createdAt: '2026-04-05' }
  ]);

  tasks = signal<Task[]>([
    { id: 't1', title: 'Assign prospect and follow up', description: 'Sales manager needs to assign Atlas Digital to a salesperson', assignedTeam: 'Sales', assignedTo: 'Achraf (Manager)', status: 'Pending', priority: 'Urgent', deadline: '2026-07-15', relatedTo: 'Atlas Digital S.A.R.L.', relatedModule: 'Partners', relatedSubModule: 'Prospect', relatedEntityId: 'p4', createdBy: 'usr_rachid', createdAt: '2026-03-15' },
    { id: 't2', title: 'Review Q3 marketing budget', description: 'Approve the proposed marketing budget for Q3 campaigns', assignedTeam: 'Sales', assignedTo: 'Khadija (Ops Manager)', status: 'Pending', priority: 'Medium', deadline: '2026-07-25', createdBy: 'usr_rachid', createdAt: '2026-06-10' },
    { id: 't3', title: 'Follow up with ABC Technologies', description: 'Contact ABC Technologies regarding the pending proposal', assignedTeam: 'Sales', assignedTo: 'Youssef El Alami', status: 'Pending', priority: 'Urgent', deadline: '2026-07-10', relatedTo: 'ABC Technologies', relatedModule: 'Partners', relatedSubModule: 'Customer', relatedEntityId: 'p5', createdBy: 'usr_fatima', createdAt: '2026-06-12' },
    { id: 't4', title: 'Update invoice templates', description: 'Refresh the invoice template with new company branding', assignedTeam: 'Finance', assignedTo: 'Mehdi Benani', status: 'Pending', priority: 'Low', deadline: '2026-08-01', createdBy: 'usr_rachid', createdAt: '2026-06-01' },
    { id: 't5', title: 'Prepare monthly sales report', description: 'Compile and analyze June sales data for management review', assignedTeam: 'Sales', assignedTo: 'Youssef El Alami', status: 'In Progress', priority: 'Urgent', deadline: '2026-07-05', createdBy: 'usr_fatima', createdAt: '2026-06-14' },
    { id: 't6', title: 'Setup automated email sequences', description: 'Configure drip campaigns for new prospect onboarding', assignedTeam: 'Sales', assignedTo: 'Zineb Rami', status: 'Pending', priority: 'Medium', deadline: '2026-07-20', createdBy: 'usr_rachid', createdAt: '2026-06-08' },
    { id: 't7', title: 'Vendor contract renewal', description: 'Review and renew the contract with Maroc Express Logistics', assignedTeam: 'Operations', assignedTo: 'Khadija (Ops Manager)', status: 'Pending', priority: 'Low', deadline: '2026-07-30', createdBy: 'usr_mehdi', createdAt: '2026-05-20' },
    { id: 't8', title: 'Customer feedback survey analysis', description: 'Analyze results from the recent customer satisfaction survey', assignedTeam: 'Support', assignedTo: 'Fatima Chraibi', status: 'Pending', priority: 'Medium', deadline: '2026-07-18', createdBy: 'usr_aya', createdAt: '2026-06-13' },
    { id: 't9', title: 'Follow up with Maroc Telecom on support renewal', description: 'Contact Maroc Telecom regarding the upcoming support contract renewal', assignedTeam: 'Sales', assignedTo: 'Amine Bennani', status: 'Pending', priority: 'Urgent', deadline: '2026-07-15', relatedTo: 'Maroc Telecom Systems', relatedModule: 'Sales', relatedSubModule: 'Deal', relatedEntityId: 'd2', createdBy: 'usr_ahmed', createdAt: '2026-07-06' },
    { id: 't10', title: 'Prepare Q3 pipeline review deck', description: 'Create presentation deck for quarterly pipeline review meeting', assignedTeam: 'Sales', assignedTo: 'Fatima Zahra El Idrissi', status: 'In Progress', priority: 'Medium', deadline: '2026-07-14', createdBy: 'usr_rachid', createdAt: '2026-07-06' },
    { id: 't11', title: 'Update vendor contact details for Maroc Express', description: 'Verify and update contact information for Maroc Express Logistics', assignedTeam: 'Operations', assignedTo: 'Layla Cherkaoui', status: 'Pending', priority: 'Low', deadline: '2026-07-20', createdBy: 'usr_youssef', createdAt: '2026-07-07' },
    { id: 't12', title: 'Review ABC Technologies proposal revisions', description: 'Review the revised proposal changes for ABC Technologies Cloud ERP Migration', assignedTeam: 'Sales', assignedTo: 'Youssef El Alami', status: 'Pending', priority: 'Urgent', deadline: '2026-07-12', relatedTo: 'ABC Technologies', relatedModule: 'Sales', relatedSubModule: 'Proposal', createdBy: 'usr_fatima', createdAt: '2026-07-08' },
    { id: 't13', title: 'Approve Q3 marketing budget', description: 'Review and approve the proposed marketing budget for Q3 campaigns', assignedTeam: 'Finance', assignedTo: 'Samira Benjelloun', status: 'Pending', priority: 'Medium', deadline: '2026-07-16', createdBy: 'usr_rachid', createdAt: '2026-07-08' },
    { id: 't14', title: 'Resolve ticket #TK-0891 escalation', description: 'Coordinate with support team to resolve the critical SLA breach ticket', assignedTeam: 'Support', assignedTo: 'Mehdi Qadiri', status: 'In Progress', priority: 'Urgent', deadline: '2026-07-11', createdBy: 'usr_zineb', createdAt: '2026-07-08' },
    { id: 't15', title: 'Prepare monthly commission report', description: 'Calculate and prepare sales commission figures for June', assignedTeam: 'Finance', assignedTo: 'Hassan El Amrani', status: 'Pending', priority: 'Medium', deadline: '2026-07-18', createdBy: 'usr_samira', createdAt: '2026-07-09' },
    { id: 't16', title: 'Schedule client onboarding session for Atlas Digital', description: 'Coordinate with Atlas Digital for the post-sale onboarding session', assignedTeam: 'Operations', assignedTo: 'Omar Fassi', status: 'Pending', priority: 'Medium', deadline: '2026-07-17', relatedTo: 'Atlas Digital S.A.R.L.', relatedModule: 'Sales', relatedSubModule: 'Deal', relatedEntityId: 'd1', createdBy: 'usr_fatima', createdAt: '2026-07-09' },
    { id: 't17', title: 'Send proposal to Fes Smart School', description: 'Deliver the finalized WiFi proposal to Fes Smart School administration', assignedTeam: 'Sales', assignedTo: 'Amine Bennani', status: 'Pending', priority: 'Urgent', deadline: '2026-07-12', createdBy: 'usr_fatima', createdAt: '2026-07-10' },
    { id: 't18', title: 'Update invoice payment reminders', description: 'Configure automated payment reminder emails for overdue invoices', assignedTeam: 'Finance', assignedTo: 'Samira Benjelloun', status: 'Pending', priority: 'Low', deadline: '2026-07-25', createdBy: 'usr_rachid', createdAt: '2026-07-10' },
    { id: 't19', title: 'Perform system backup verification', description: 'Verify that all critical system backups completed successfully over the weekend', assignedTeam: 'Operations', assignedTo: 'Youssef Alami', status: 'Pending', priority: 'Medium', deadline: '2026-07-13', createdBy: 'usr_rachid', createdAt: '2026-07-10' },
    { id: 't20', title: 'Contact new lead from Casablanca Expo', description: 'Follow up with the prospect who visited the booth at the Casablanca Tech Expo', assignedTeam: 'Sales', assignedTo: 'Karim Tazi', status: 'Pending', priority: 'Medium', deadline: '2026-07-14', createdBy: 'usr_rachid', createdAt: '2026-07-11' },
    { id: 't21', title: 'Submit expense reports for June', description: 'Compile and submit all outstanding expense reports for the month of June', assignedTeam: 'Finance', assignedTo: 'Samira Benjelloun', status: 'Pending', priority: 'Medium', deadline: '2026-07-14', createdBy: 'usr_samira', createdAt: '2026-07-11' },
    { id: 't22', title: 'Update client SLA documentation', description: 'Refresh SLA documentation for all active support contracts', assignedTeam: 'Support', assignedTo: 'Aya Mansouri', status: 'In Progress', priority: 'Low', deadline: '2026-07-20', createdBy: 'usr_zineb', createdAt: '2026-07-11' },
    { id: 't23', title: 'Review partner commission structure', description: 'Evaluate and propose updates to the partner commission structure for Q4', assignedTeam: 'Sales', assignedTo: 'Ahmed Bennani', status: 'Pending', priority: 'Medium', deadline: '2026-07-21', createdBy: 'usr_rachid', createdAt: '2026-07-11' },
    { id: 't24', title: 'Prepare weekly support metrics report', description: 'Compile weekly ticket resolution metrics and response time statistics', assignedTeam: 'Support', assignedTo: 'Zineb Tahiri', status: 'Pending', priority: 'Low', deadline: '2026-07-13', createdBy: 'usr_mehdi', createdAt: '2026-07-11' },
    { id: 't25', title: 'Audit vendor delivery performance', description: 'Review and audit delivery performance of all active vendors for June', assignedTeam: 'Operations', assignedTo: 'Layla Cherkaoui', status: 'Pending', priority: 'Medium', deadline: '2026-07-18', createdBy: 'usr_youssef', createdAt: '2026-07-11' }
  ]);

  proposals = signal<Proposal[]>([]);
  deals = signal<Deal[]>([
    {
      id: 'd1',
      title: 'Atlas Digital Cloud Migration Deal',
      partnerId: 'p1',
      amount: 13500,
      stage: 'Invoiced',
      createdBy: 'usr_fatima',
      createdAt: '2026-06-01',
      discount: 10,
      emailExchange: 'De: contact@atlasdigital.ma\nÀ: y.alami@acme.ma\nSujet: Bon de commande signé\n\nBonjour Youssef,\nVous trouverez ci-joint le BC signé. Merci de procéder à la livraison des serveurs.',
      orderNumber: 'ORD-2026-0087',
      dealNumber: 'DL-2026-0045',
      orderDate: '2026-06-18',
      requestedDeliveryDate: '2026-07-10',
      orderStatus: 'Confirmed',
      customerAccount: 'ACT-ATLAS-99',
      billingAddress: '120 Boulevard d\'Anfa, Casablanca, Maroc',
      deliveryAddress: 'Sidi Maârouf Technopark, Bâtiment B, Casablanca, Maroc',
      contactPerson: 'Karim Atlas',
      contactEmail: 'contact@atlasdigital.ma',
      contactPhone: '+212-522-458922',
      salesPerson: 'Youssef El Alami',
      salesRegion: 'Maroc - Casa',
      currency: 'MAD',
      paymentTerms: '30 Days Net',
      orderTotalAmount: 13500,
      vendorAccount: 'VND-CASA-04',
      purchaseOrderRef: 'PO-2026-0021',
      warehouseAddress: 'Zone Industrielle Sapino, Nouaceur, Maroc',
      transportationService: 'Maroc Express Logistics',
      expectedDeliveryDateVendor: '2026-07-02',
      deliveryDate: '2026-07-05',
      activityLog: {
        calls: [
          { id: 'c1_1', date: '2026-06-10', duration: 15, callerName: 'Youssef El Alami', summary: 'Introduction call, client interested in migration services.', outcome: 'Interested' },
          { id: 'c1_2', date: '2026-06-14', duration: 30, callerName: 'Youssef El Alami', summary: 'Detailed scoping of hosting requirements.', outcome: 'Follow-up' }
        ],
        emails: [
          { id: 'e1_1', date: '2026-06-10', from: 'youssef@acme.ma', to: 'contact@atlasdigital.ma', subject: 'Migration Proposal Intro', body: 'Bonjour Karim, merci pour notre échange. Voici notre présentation.', direction: 'sent' },
          { id: 'e1_2', date: '2026-06-11', from: 'contact@atlasdigital.ma', to: 'youssef@acme.ma', subject: 'Re: Migration Proposal Intro', body: 'Merci Youssef. Nous attendons votre chiffrage détaillé.', direction: 'received' }
        ],
        meetings: [
          { id: 'm1_1', date: '2026-06-15', time: '10:00', title: 'Tech Architecture Alignment', attendees: ['Youssef El Alami', 'Karim Atlas', 'Adnane (Tech Lead)'], location: 'Teams Meeting', summary: 'Aligned on server sizes and backup frequencies. Selected Casablanca Dedicated servers.', type: 'teams' }
        ],
        recordings: [
          { id: 'r1_1', date: '2026-06-15', title: 'Tech Architecture Alignment Recording', meetingLink: 'https://teams.microsoft.com/l/meetup-join/123456', recordingLink: 'https://share.acme.ma/rec/atlas-migration-06-15', duration: '45 mins' }
        ],
        notes: [
          { id: 'n1_1', date: '2026-06-10', author: 'Youssef El Alami', content: 'Client is transitioning away from AWS due to local compliance rules. High sensitivity to local latency.' }
        ],
        followUps: [
          { id: 'f1_1', dueDate: '2026-07-15', title: 'Check invoice status', assignedTo: 'Omar (Finance)', status: 'pending' }
        ]
      }
    },
    {
      id: 'd2',
      title: 'Maroc Telecom Systems Network Upgrade',
      partnerId: 'p3',
      amount: 120000,
      stage: 'Closed Won',
      createdBy: 'usr_ahmed',
      createdAt: '2026-05-10',
      orderNumber: 'ORD-2026-0088',
      dealNumber: 'DL-2026-0046',
      orderDate: '2026-06-10',
      salesPerson: 'Amine Bennani',
      salesRegion: 'Maroc - Rabat',
      currency: 'MAD',
      activityLog: {
        calls: [
          { id: 'c2_1', date: '2026-06-05', duration: 10, callerName: 'Amine Bennani', summary: 'Brief status update regarding support renewal.', outcome: 'Interested' }
        ],
        emails: [],
        meetings: [],
        recordings: [],
        notes: [
          { id: 'n2_1', date: '2026-06-05', author: 'Amine Bennani', content: 'Customer very satisfied with network latency and stability.' }
        ],
        followUps: []
      }
    },
    {
      id: 'd3',
      title: 'Rabat Finance System ERP',
      partnerId: 'p3',
      amount: 75000,
      stage: 'New',
      createdBy: 'usr_rachid',
      createdAt: '2026-06-25',
      orderDate: '2026-06-25',
      salesPerson: 'Youssef El Alami',
      salesRegion: 'Maroc - Rabat',
      currency: 'MAD',
      activityLog: {
        calls: [],
        emails: [],
        meetings: [
          { id: 'm3_1', date: '2026-06-25', time: '14:00', title: 'ERP Initial Demo', attendees: ['Youssef El Alami', 'Rachid Bennani'], location: 'Rabat HQ Office 402', summary: 'Showcased the financial reconciliation modules. Client was pleased.', type: 'demo' }
        ],
        recordings: [],
        notes: [],
        followUps: []
      }
    },
    {
      id: 'd4',
      title: 'Tangier Logistics Warehousing Integration',
      partnerId: 'p1',
      amount: 45000,
      stage: 'Closed Lost',
      createdBy: 'usr_karim',
      createdAt: '2026-05-12',
      orderDate: '2026-05-12',
      salesPerson: 'Amine Bennani',
      salesRegion: 'Maroc - Tanger',
      currency: 'MAD',
      activityLog: {
        calls: [
          { id: 'c4_1', date: '2026-05-10', duration: 12, callerName: 'Amine Bennani', summary: 'Negotiation on pricing.', outcome: 'Closed' }
        ],
        emails: [],
        meetings: [],
        recordings: [],
        notes: [
          { id: 'n4_1', date: '2026-05-12', author: 'Amine Bennani', content: 'Lost due to budget limitations. Competitor undercut by 25.' }
        ],
        followUps: []
      }
    },
    {
      id: 'd5',
      title: 'Fes Smart School WiFi',
      partnerId: 'p4',
      amount: 32000,
      stage: 'Confirmed',
      createdBy: 'usr_fatima',
      createdAt: '2026-06-20',
      orderDate: '2026-07-05',
      salesPerson: 'Amine Bennani',
      salesRegion: 'Maroc - Fès',
      currency: 'MAD',
      activityLog: {
        calls: [],
        emails: [],
        meetings: [],
        recordings: [],
        notes: [],
        followUps: []
      }
    },
    {
      id: 'd6',
      title: 'Agadir Agro ERP',
      partnerId: 'p4',
      amount: 95000,
      stage: 'Awaiting Invoicing',
      createdBy: 'usr_rachid',
      createdAt: '2026-06-28',
      orderDate: '2026-06-28',
      salesPerson: 'Youssef El Alami',
      salesRegion: 'Maroc - Agadir',
      currency: 'MAD',
      activityLog: {
        calls: [],
        emails: [],
        meetings: [],
        recordings: [],
        notes: [],
        followUps: []
      }
    },
    {
      id: 'd-p5-1',
      title: 'ABC Technologies Cloud ERP Migration',
      partnerId: 'p5',
      amount: 85000,
      stage: 'Confirmed',
      createdBy: 'usr_youssef',
      createdAt: '2026-06-12',
      orderDate: '2026-06-20',
      salesPerson: 'Youssef El Alami',
      salesRegion: 'Casablanca',
      currency: 'MAD',
      activityLog: {
        calls: [],
        emails: [],
        meetings: [
          { id: 'm-p5-1', date: '2026-06-12', time: '10:00', title: 'ERP Demo & Kickoff', attendees: ['Mohammed Alaoui', 'Youssef El Alami'], location: 'Teams', summary: 'Initial demo of ERP modules.', type: 'demo' },
          { id: 'm-p5-2', date: '2026-06-15', time: '14:00', title: 'Technical Review', attendees: ['Karim Benali', 'Youssef El Alami'], location: 'Casablanca Office', summary: 'Reviewed IT infrastructure requirements.', type: 'in-person' }
        ],
        recordings: [],
        notes: [],
        followUps: []
      }
    },
    {
      id: 'd-p5-2',
      title: 'ABC Technologies Hardware Procurement',
      partnerId: 'p5',
      amount: 42000,
      stage: 'Invoiced',
      createdBy: 'usr_nadia',
      createdAt: '2026-06-18',
      orderDate: '2026-06-22',
      salesPerson: 'Amine Bennani',
      salesRegion: 'Casablanca',
      currency: 'MAD',
      activityLog: {
        calls: [],
        emails: [],
        meetings: [
          { id: 'm-p5-3', date: '2026-06-18', time: '11:00', title: 'Pricing & Negotiation', attendees: ['Samira El Fassi', 'Amine Bennani'], location: 'Teams', summary: 'Agreed on hardware pricing and payment terms.', type: 'teams' }
        ],
        recordings: [],
        notes: [],
        followUps: []
      }
    }
  ]);
  purchaseOrders = signal<PurchaseOrder[]>([]);
  invoices = signal<Invoice[]>([
    { id: 'i1', type: 'Customer', partnerId: 'p1', amount: 13500, status: 'Overdue', dueDate: '2026-07-20', dealId: 'd1', createdBy: 'usr_samira', createdAt: '2026-06-20' },
    { id: 'i2', type: 'Customer', partnerId: 'p3', amount: 120000, status: 'Paid', dueDate: '2026-06-30', dealId: 'd2', createdBy: 'usr_samira', createdAt: '2026-06-10' },
    { id: 'inv-p5-1', type: 'Customer', partnerId: 'p5', amount: 85000, status: 'Pending', dueDate: '2026-07-20', dealId: 'd-p5-1', createdBy: 'usr_samira', createdAt: '2026-06-22' },
    { id: 'inv-p5-2', type: 'Customer', partnerId: 'p5', amount: 42000, status: 'Paid', dueDate: '2026-06-30', dealId: 'd-p5-2', createdBy: 'usr_samira', createdAt: '2026-06-22' }
  ]);

  campaigns = signal<Campaign[]>([
    { id: 'c1', title: 'Aïd Al-Adha Promotion', type: 'Email', status: 'Completed', targetAudience: 'Prospects', sentCount: 450, createdBy: 'usr_rachid', createdAt: '2026-05-01' },
    { id: 'c2', title: 'WhatsApp Alert - Nouveautés Cloud', type: 'WhatsApp', status: 'Active', targetAudience: 'Customers', sentCount: 180, createdBy: 'usr_rachid', createdAt: '2026-06-01' },
    { id: 'c3', title: 'SMS Offres Spéciales PME', type: 'SMS', status: 'Draft', targetAudience: 'Prospects', sentCount: 0, createdBy: 'usr_rachid', createdAt: '2026-06-25' }
  ]);

  tickets = signal<Ticket[]>([
    { id: 'tk1', title: 'Problème accès console Cloud', partnerId: 'p3', assignedTo: 'Fatima Chraibi', status: 'In Progress', priority: 'High', deadline: '2026-07-12', createdBy: 'usr_zineb', createdAt: '2026-06-05' },
    { id: 'tk-p5-1', title: 'ERP Login Issue', partnerId: 'p5', assignedTo: 'Fatima Chraibi', status: 'Open', priority: 'High', deadline: '2026-07-08', createdBy: 'usr_mehdi', createdAt: '2026-06-15' },
    { id: 'tk-p5-2', title: 'Hardware Delivery Delay', partnerId: 'p5', assignedTo: 'Khadija (Ops Manager)', status: 'Resolved', priority: 'Medium', createdBy: 'usr_aya', createdAt: '2026-06-10' }
  ]);

  ticketTypes = signal<string[]>(['Software issue', 'Broken product', 'Billing issue']);

  customerCards = signal<CustomerCard[]>([
    {
      id: 'cc-p1', partnerId: 'p1', accountId: 'ACT-ATLAS-01',
      recordType: 'Organization', name: 'Atlas Digital S.A.R.L.',
      searchName: 'ATLAS DIGITAL', erpAccount: 'ERP-ATLAS-01',
      ice: '', ifField: '', rc: '', rcCity: '', tp: '',
      vatStatus: ['Standard'], orgType: 'Headquarter', parentAccountId: null,
      addresses: [], mainPhone: '+212-522-458922',
      corporateEmail: 'contact@atlasdigital.ma', websiteUrl: 'www.atlasdigital.ma',
      personnel: [
        { id: 'per-atlas-1', fullName: 'Karim Atlas', jobTitle: 'CEO', directMobile: '+212661100100', directEmail: 'k.atlas@atlasdigital.ma', isPrimary: true },
        { id: 'per-atlas-2', fullName: 'Nadia Berrada', jobTitle: 'IT Director', directMobile: '+212661100200', directEmail: 'n.berrada@atlasdigital.ma', isPrimary: false },
        { id: 'per-atlas-3', fullName: 'Omar Filali', jobTitle: 'Finance Director', directMobile: '+212661100300', directEmail: 'o.filali@atlasdigital.ma', isPrimary: false }
      ],
      createdBy: 'usr_rachid',
      createdAt: '2026-03-01'
    },
    {
      id: 'cc-p4', partnerId: 'p4', accountId: 'ACT-ALMAGHRIB-01',
      recordType: 'Organization', name: 'Al-Maghrib Consulting',
      searchName: 'AL MAGHRIB', erpAccount: 'ERP-ALMAGHRIB-01',
      ice: '', ifField: '', rc: '', rcCity: '', tp: '',
      vatStatus: ['Standard'], orgType: 'Headquarter', parentAccountId: null,
      addresses: [], mainPhone: '+212-661-345678',
      corporateEmail: 'hello@almaghribconsulting.ma', websiteUrl: '',
      personnel: [
        { id: 'per-alm-1', fullName: 'Yassine Rhazi', jobTitle: 'Managing Director', directMobile: '+212661345678', directEmail: 'y.rhazi@almaghribconsulting.ma', isPrimary: true },
        { id: 'per-alm-2', fullName: 'Houda Sefrioui', jobTitle: 'Operations Manager', directMobile: '+212661345679', directEmail: 'h.sefrioui@almaghribconsulting.ma', isPrimary: false }
      ],
      createdBy: 'usr_rachid',
      createdAt: '2026-04-10'
    },
    {
      id: 'cc-p5', partnerId: 'p5', accountId: 'ACT-ABC-01',
      recordType: 'Organization', name: 'ABC Technologies',
      searchName: 'ABC TECH', erpAccount: 'ERP-ABC-01',
      ice: '', ifField: '', rc: '', rcCity: '', tp: '',
      vatStatus: ['Standard'], orgType: 'Headquarter', parentAccountId: null,
      addresses: [], mainPhone: '+212-522-112233',
      corporateEmail: 'contact@abctech.ma', websiteUrl: '',
      personnel: [
        { id: 'per-abc-1', fullName: 'Mohammed Alaoui', jobTitle: 'CEO', directMobile: '+212661001001', directEmail: 'ceo@abctech.ma', isPrimary: true },
        { id: 'per-abc-2', fullName: 'Karim Benali', jobTitle: 'IT Manager', directMobile: '+212661002002', directEmail: 'it@abctech.ma', isPrimary: false },
        { id: 'per-abc-3', fullName: 'Samira El Fassi', jobTitle: 'Finance Manager', directMobile: '+212661003003', directEmail: 'finance@abctech.ma', isPrimary: false }
      ],
      createdBy: 'usr_rachid',
      createdAt: '2026-05-01'
    }
  ]);

  // ────────────────────────────────────────────────────────
  // Automation Rules Signal & Execution Log
  // ────────────────────────────────────────────────────────
  automationRules = signal<AutomationRule[]>([
    {
      id: 'rule-001',
      name: 'Auto-Assign Lead – DIGITAL ABC',
      description: 'When a new lead from DIGITAL ABC is created, automatically assign it to Youssef El Alami.',
      isActive: true,
      trigger: 'LeadCreated',
      priority: 1,
      stopOnMatch: true,
      conflictStrategy: 'first-wins',
      version: 1,
      conditionGroups: [
        {
          id: 'group-1',
          logicalOperator: 'AND',
          conditions: [{ fieldKey: 'companyName', operator: 'contains', value: 'DIGITAL ABC' }]
        }
      ],
      actions: [
        {
          id: 'action-1',
          type: 'AssignSalesperson',
          params: { assignee: 'Youssef El Alami' }
        },
        {
          id: 'action-2',
          type: 'CreateFollowUpTask',
          params: {
            taskTitle: 'Follow up with DIGITAL ABC lead',
            taskDescription: 'Auto-created: Contact new DIGITAL ABC lead and qualify opportunity.',
            taskTeam: 'Sales',
            assignee: 'Youssef El Alami'
          }
        }
      ],
      createdAt: '2026-06-01',
      updatedAt: '2026-06-01',
      executionCount: 3
    },
    {
      id: 'rule-002',
      name: 'Notify Manager – Deal > 100k',
      description: 'When a deal exceeding 100,000 MAD is created or updated, notify the sales manager.',
      isActive: true,
      trigger: 'DealCreated',
      priority: 2,
      stopOnMatch: false,
      conflictStrategy: 'all-execute',
      version: 1,
      conditionGroups: [
        {
          id: 'group-1',
          logicalOperator: 'AND',
          conditions: [{ fieldKey: 'amount', operator: 'greaterThan', value: 100000 }]
        }
      ],
      actions: [
        {
          id: 'action-1',
          type: 'NotifyManager',
          params: {
            assignee: 'Achraf (Manager)',
            taskTitle: 'High-Value Deal Alert: Review Required',
            taskDescription: 'Auto-created: A deal exceeding 100,000 MAD was created. Please review and approve next steps.',
            taskTeam: 'Sales'
          }
        }
      ],
      createdAt: '2026-06-01',
      updatedAt: '2026-06-10',
      executionCount: 1
    },
    {
      id: 'rule-003',
      name: 'Sales Task – DIGITAL ABC Deal (Initiated or Deal Created)',
      description: 'If Customer Account = DIGITAL ABC AND Deal Status = Initiated OR Deal Status = Deal Created → Assign Sales Task to Sales Person ABC.',
      isActive: true,
      trigger: 'DealCreated',
      priority: 3,
      stopOnMatch: false,
      conflictStrategy: 'all-execute',
      version: 1,
      conditionGroups: [
        {
          id: 'group-1',
          logicalOperator: 'AND',
          conditions: [
            { fieldKey: 'customerAccount', operator: 'contains', value: 'DIGITAL ABC' },
            { fieldKey: 'stage', operator: 'equals', value: 'New' }
          ]
        },
        {
          id: 'group-2',
          logicalOperator: 'AND',
          conditions: [
            { fieldKey: 'customerAccount', operator: 'contains', value: 'DIGITAL ABC' },
            { fieldKey: 'stage', operator: 'equals', value: 'Proposal sent' }
          ]
        }
      ],
      actions: [
        {
          id: 'action-1',
          type: 'AssignSalesperson',
          params: { assignee: 'Amine Bennani' }
        },
        {
          id: 'action-2',
          type: 'CreateFollowUpTask',
          params: {
            taskTitle: 'Sales Follow-Up: DIGITAL ABC Deal',
            taskDescription: 'Auto-created: Deal for DIGITAL ABC is initiated. Assign and begin sales process.',
            taskTeam: 'Sales',
            assignee: 'Amine Bennani'
          }
        }
      ],
      createdAt: '2026-06-05',
      updatedAt: '2026-06-05',
      executionCount: 0
    },
    {
      id: 'rule-004',
      name: 'Send Welcome Email – New Lead',
      description: 'When a new lead is created, send a welcome email log to the contact.',
      isActive: true,
      trigger: 'LeadCreated',
      priority: 4,
      stopOnMatch: false,
      conflictStrategy: 'all-execute',
      version: 1,
      conditionGroups: [
        {
          id: 'group-1',
          logicalOperator: 'AND',
          conditions: [{ fieldKey: 'status', operator: 'equals', value: 'New' }]
        }
      ],
      actions: [
        {
          id: 'action-1',
          type: 'SendEmailLog',
          params: {
            emailSubject: 'Welcome – We received your inquiry',
            emailBody: 'Dear contact, thank you for reaching out. A member of our sales team will be in touch within 24 hours.',
            emailFrom: 'crm@acme.ma',
            emailTo: 'contact@lead.com'
          }
        }
      ],
      createdAt: '2026-06-10',
      updatedAt: '2026-06-10',
      executionCount: 5
    },
    {
      id: 'rule-005',
      name: 'Escalate Overdue Support Cases',
      description: 'When a ticket status is updated to Overdue/In Progress for more than 2 days, create an escalation task.',
      isActive: false,
      trigger: 'TicketUpdated',
      priority: 5,
      stopOnMatch: false,
      conflictStrategy: 'all-execute',
      version: 1,
      conditionGroups: [
        {
          id: 'group-1',
          logicalOperator: 'AND',
          conditions: [{ fieldKey: 'status', operator: 'equals', value: 'In Progress' }]
        }
      ],
      actions: [
        {
          id: 'action-1',
          type: 'NotifyManager',
          params: {
            assignee: 'Achraf (Manager)',
            taskTitle: 'Escalation: Overdue Support Ticket',
            taskDescription: 'Auto-created: A support ticket is In Progress and may need escalation.',
            taskTeam: 'Support'
          }
        }
      ],
      createdAt: '2026-06-15',
      updatedAt: '2026-06-15',
      executionCount: 0
    }
  ]);

  automationExecutions = signal<AutomationExecutionLog[]>([]);

  leadsData = signal<Lead[]>([
    {
      id: 'LEAD-10254',
      name: 'Ahmed Benali',
      companyName: 'MedCare Clinics',
      status: 'Qualified',
      qualification: 'Qualified',
      priority: 'High',
      score: 91,
      temperature: 'Hot',
      stage: 'Discovery Meeting',
      assignedSalesperson: 'Youness Nasrallah',
      salesTeam: 'Enterprise Sales',
      territory: 'Morocco',
      businessUnit: 'Cloud Solutions',
      decisionMaker: 'IT Director',
      estimatedDealValue: 135000,
      probability: 70,
      expectedCloseDate: '2026-07-30',
      notes: 'Customer wants to replace legacy antivirus across 600 endpoints and requested a technical proof of concept.',
      createdDate: '2026-06-01',
      createdBy: 'usr_fatima',
      modifiedDate: '2026-06-24',
      modifiedBy: 'usr_fatima',
      company: {
        industry: 'Healthcare',
        size: '450 Employees',
        annualRevenue: '€15M',
        country: 'Morocco',
        city: 'Casablanca',
        address: 'Sidi Maarouf Technopark',
        officesCount: 3
      },
      contacts: [
        {
          id: 'lc-1',
          name: 'Ahmed Benali',
          jobTitle: 'IT Director',
          email: 'a.benali@medcare.ma',
          phone: '+212 661 123456',
          mobile: '+212 661 123456'
        }
      ],
      activities: [
        {
          id: 'la-1',
          type: 'Meeting',
          date: '2026-06-24',
          summary: 'Discovery meeting completed',
          detail: 'Requested product demo and technical POC.',
          assignedTo: 'Youness Nasrallah'
        }
      ],
      attachments: [
        { id: 'lat-1', fileName: 'MedCare_Requirements_RFP.pdf', fileSize: '1.2 MB', uploadedAt: '2026-06-01' }
      ],
      statusHistory: [
        { status: 'New', timestamp: '2026-06-01 10:00', user: 'Sarah Johnson' },
        { status: 'Qualified', timestamp: '2026-06-24 14:30', user: 'Sarah Johnson' }
      ],
      productInterests: [
        { product: 'Microsoft Defender XDR', solution: 'Cybersecurity Endpoint Protection', usersCount: 600 }
      ],
      campaigns: [
        { source: 'Website Contact Form', campaign: 'Cybersecurity Awareness Webinar' }
      ]
    },
    {
      id: 'LEAD-000254',
      name: 'John Smith',
      companyName: 'ABC Technologies',
      status: 'New',
      qualification: 'Qualified',
      priority: 'High',
      score: 82,
      temperature: 'Hot',
      stage: 'Discovery Meeting',
      assignedSalesperson: 'Sarah Johnson',
      salesTeam: 'Enterprise Sales',
      territory: 'Northern Europe',
      businessUnit: 'Cloud Solutions',
      decisionMaker: 'CIO',
      influencer: 'Infrastructure Manager',
      financeContact: 'CFO',
      technicalContact: 'Network Engineer',
      estimatedDealValue: 150000,
      probability: 60,
      expectedCloseDate: '2026-09-30',
      notes: 'Customer is replacing VMware. Currently evaluating Microsoft Azure and AWS. Decision expected after internal budget approval in July. Main concern is migration downtime.',
      createdDate: '2026-06-01',
      createdBy: 'usr_fatima',
      modifiedDate: '2026-06-12',
      modifiedBy: 'usr_ahmed',
      company: {
        industry: 'Healthcare',
        size: '250 employees',
        annualRevenue: '€25M',
        country: 'UK',
        city: 'London',
        address: '15 Oxford Street',
        officesCount: 5
      },
      contacts: [
        {
          id: 'lc-2',
          name: 'John Smith',
          jobTitle: 'IT Manager',
          email: 'john.smith@abctech.com',
          phone: '+44 7912 345678',
          mobile: '+44 7912 987654',
          website: 'www.abctech.com',
          linkedin: 'linkedin.com/in/johnsmith'
        }
      ],
      activities: [
        {
          id: 'la-2',
          type: 'Call',
          date: '2026-06-12',
          summary: 'Phone Call with CIO',
          detail: 'Discussed high maintenance costs of legacy infrastructure. 4 calls, 9 emails sent.',
          assignedTo: 'Sarah Johnson'
        }
      ],
      attachments: [
        { id: 'lat-2', fileName: 'VMware_Infrastructure_Audit.pdf', fileSize: '2.5 MB', uploadedAt: '2026-06-02' }
      ],
      statusHistory: [
        { status: 'New', timestamp: '2026-06-01 09:00', user: 'Sarah Johnson' }
      ],
      productInterests: [
        { product: 'Microsoft Azure', solution: 'Cloud Migration', usersCount: 500 }
      ],
      campaigns: [
        { source: 'Website', campaign: 'Cybersecurity Webinar 2026', referralPartner: 'Arrow ECS', tradeShow: 'GITEX', marketingCampaign: 'Email Campaign June', socialMedia: 'LinkedIn', salesReferral: 'Existing Customer' }
      ]
    }
  ]);

  // ────────────────────────────────────────────────────────
  // Automation Rule Engine
  // ────────────────────────────────────────────────────────

  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  private evaluateCondition(condition: AutomationCondition, entity: Record<string, any>, trigger?: AutomationTrigger): { passed: boolean, actual: any } {
    let raw: any = undefined;
    if (trigger) {
      const fields = TRIGGER_FIELD_MAP[trigger];
      const desc = fields?.find(f => f.key === condition.fieldKey);
      if (desc) {
        raw = this.getNestedValue(entity, desc.path);
      }
    }
    if (raw === undefined) {
      raw = entity[condition.fieldKey];
    }

    if (condition.operator === 'isEmpty') {
      const passed = raw === undefined || raw === null || raw === '';
      return { passed, actual: raw };
    }
    if (condition.operator === 'isNotEmpty') {
      const passed = raw !== undefined && raw !== null && raw !== '';
      return { passed, actual: raw };
    }

    if (raw === undefined || raw === null) {
      return { passed: false, actual: raw };
    }

    const actualStr = String(raw).toLowerCase();
    const expectedStr = condition.value !== undefined && condition.value !== null ? String(condition.value).toLowerCase() : '';

    let passed = false;
    switch (condition.operator) {
      case 'equals':
        passed = actualStr === expectedStr;
        break;
      case 'notEquals':
        passed = actualStr !== expectedStr;
        break;
      case 'contains':
        passed = actualStr.includes(expectedStr);
        break;
      case 'notContains':
        passed = !actualStr.includes(expectedStr);
        break;
      case 'greaterThan':
        passed = parseFloat(String(raw)) > parseFloat(String(condition.value));
        break;
      case 'lessThan':
        passed = parseFloat(String(raw)) < parseFloat(String(condition.value));
        break;
      case 'greaterThanOrEqual':
        passed = parseFloat(String(raw)) >= parseFloat(String(condition.value));
        break;
      case 'lessThanOrEqual':
        passed = parseFloat(String(raw)) <= parseFloat(String(condition.value));
        break;
    }
    return { passed, actual: raw };
  }

  private evaluateRule(rule: AutomationRule, entity: Record<string, any>): { passed: boolean, trace: any[] } {
    const trace: any[] = [];
    let rulePassed = false;

    for (const group of rule.conditionGroups) {
      const conditionsTraceList: any[] = [];
      let groupPassed = true;

      for (const cond of group.conditions) {
        const { passed, actual } = this.evaluateCondition(cond, entity, rule.trigger);
        if (!passed) {
          groupPassed = false;
        }
        conditionsTraceList.push({
          fieldKey: cond.fieldKey,
          expected: cond.value,
          actual,
          passed
        });
      }

      if (group.conditions.length === 0) {
        groupPassed = true;
      }

      trace.push({
        groupId: group.id,
        passed: groupPassed,
        conditions: conditionsTraceList
      });

      if (groupPassed) {
        rulePassed = true;
      }
    }

    if (rule.conditionGroups.length === 0) {
      rulePassed = true;
    }

    return { passed: rulePassed, trace };
  }

  async evaluateRules(trigger: AutomationTrigger, entity: Record<string, any>, entityLabel: string, dryRunRuleId?: string): Promise<AutomationExecutionLog[]> {
    const logs: AutomationExecutionLog[] = [];
    
    await new Promise<void>(resolve => setTimeout(resolve, 0));

    const allRules = this.automationRules();
    let rulesToEvaluate = allRules.filter(r => r.isActive && r.trigger === trigger);

    if (dryRunRuleId) {
      const specificRule = allRules.find(r => r.id === dryRunRuleId);
      rulesToEvaluate = specificRule ? [specificRule] : [];
    } else {
      rulesToEvaluate.sort((a, b) => (a.priority || 99) - (b.priority || 99));
    }

    let entityType: 'Lead' | 'Deal' | 'Ticket' = 'Lead';
    if (trigger.startsWith('Deal')) entityType = 'Deal';
    else if (trigger.startsWith('Ticket')) entityType = 'Ticket';

    for (const rule of rulesToEvaluate) {
      const { passed, trace } = this.evaluateRule(rule, entity);
      if (!passed && !dryRunRuleId) {
        continue;
      }

      const actionsExecuted: { actionId: string; type: AutomationActionType; status: 'ok' | 'error'; error?: string }[] = [];
      let status: 'success' | 'partial' | 'failed' = passed ? 'success' : 'failed';

      if (passed && !dryRunRuleId) {
        let successCount = 0;
        let failCount = 0;

        for (const action of rule.actions) {
          try {
            switch (action.type) {
              case 'AssignSalesperson':
                if (action.params.assignee) {
                  if (trigger.startsWith('Lead')) {
                    this.leadsData.update(list => list.map(l =>
                      l.id === entity['id'] ? { ...l, assignedSalesperson: action.params.assignee } : l
                    ));
                  } else if (trigger.startsWith('Deal')) {
                    this.deals.update(list => list.map(d =>
                      d.id === entity['id'] ? { ...d, salesPerson: action.params.assignee } : d
                    ));
                  }
                }
                break;

              case 'CreateFollowUpTask':
                this.addTask({
                  id: 't-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
                  title: action.params.taskTitle || 'Automation Follow-Up Task',
                  description: action.params.taskDescription || 'Auto-created by workflow automation.',
                  assignedTeam: action.params.targetTeam || action.params.taskTeam || 'Sales',
                  assignedTo: action.params.assignee || '',
                  status: 'Pending',
                  relatedTo: entityLabel,
                  relatedModule: entityType === 'Lead' ? 'Partners' : entityType === 'Deal' ? 'Sales' : 'Support',
                  relatedSubModule: entityType === 'Lead' ? 'Lead' : entityType === 'Deal' ? 'Deal' : 'Ticket',
                  relatedEntityId: entity['id']
                } as any);
                break;

              case 'NotifyManager':
                this.addTask({
                  id: 't-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
                  title: action.params.taskTitle || 'Manager Notification',
                  description: action.params.taskDescription || 'Auto-created manager notification.',
                  assignedTeam: action.params.targetTeam || action.params.taskTeam || 'Sales',
                  assignedTo: action.params.assignee || 'Achraf (Manager)',
                  status: 'Pending',
                  relatedTo: entityLabel,
                  relatedModule: entityType === 'Lead' ? 'Partners' : entityType === 'Deal' ? 'Sales' : 'Support',
                  relatedSubModule: entityType === 'Lead' ? 'Lead' : entityType === 'Deal' ? 'Deal' : 'Ticket',
                  relatedEntityId: entity['id']
                } as any);
                break;

              case 'SendEmailLog':
                if (trigger.startsWith('Lead')) {
                  this.addLeadActivity(entity['id'], {
                    type: 'Email',
                    date: new Date().toISOString().split('T')[0],
                    summary: action.params.emailSubject || 'Automated Email',
                    detail: action.params.emailBody || '',
                    assignedTo: 'System'
                  });
                } else if (trigger.startsWith('Deal')) {
                  this.deals.update(list => list.map(d => {
                    if (d.id === entity['id']) {
                      const activityLog = d.activityLog || { calls: [], emails: [], meetings: [], recordings: [], notes: [], followUps: [] };
                      const newEmail = {
                        id: 'e-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
                        date: new Date().toISOString().split('T')[0],
                        from: action.params.emailFrom || 'crm@acme.ma',
                        to: action.params.emailTo || d.contactEmail || 'contact@client.com',
                        subject: action.params.emailSubject || 'Automated Email',
                        body: action.params.emailBody || '',
                        direction: 'sent' as const
                      };
                      return {
                        ...d,
                        activityLog: {
                          ...activityLog,
                          emails: [...activityLog.emails, newEmail]
                        }
                      };
                    }
                    return d;
                  }));
                }
                break;

              case 'UpdateEntityField':
                if (action.params.fieldKey && action.params.fieldValue !== undefined) {
                  const key = action.params.fieldKey;
                  const value = action.params.fieldValue;
                  if (trigger.startsWith('Lead')) {
                    this.leadsData.update(list => list.map(l =>
                      l.id === entity['id'] ? { ...l, [key]: value } : l
                    ));
                  } else if (trigger.startsWith('Deal')) {
                    this.deals.update(list => list.map(d =>
                      d.id === entity['id'] ? { ...d, [key]: value } : d
                    ));
                  } else if (trigger.startsWith('Ticket')) {
                    this.tickets.update(list => list.map(t =>
                      t.id === entity['id'] ? { ...t, [key]: value } : t
                    ));
                  }
                }
                break;

              case 'ChangeStage':
                if (action.params.targetStage) {
                  if (trigger.startsWith('Lead')) {
                    this.leadsData.update(list => list.map(l =>
                      l.id === entity['id'] ? { ...l, stage: action.params.targetStage! } : l
                    ));
                  } else if (trigger.startsWith('Deal')) {
                    this.deals.update(list => list.map(d =>
                      d.id === entity['id'] ? { ...d, stage: action.params.targetStage as any } : d
                    ));
                  }
                }
                break;

              case 'CreateNote':
                if (action.params.noteContent) {
                  if (trigger.startsWith('Lead')) {
                    this.addLeadActivity(entity['id'], {
                      type: 'Note',
                      date: new Date().toISOString().split('T')[0],
                      summary: 'Automated Note',
                      detail: action.params.noteContent,
                      assignedTo: 'System'
                    });
                  } else if (trigger.startsWith('Deal')) {
                    this.deals.update(list => list.map(d => {
                      if (d.id === entity['id']) {
                        const activityLog = d.activityLog || { calls: [], emails: [], meetings: [], recordings: [], notes: [], followUps: [] };
                        const newNote = {
                          id: 'n-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
                          date: new Date().toISOString().split('T')[0],
                          author: 'System',
                          content: action.params.noteContent!
                        };
                        return {
                          ...d,
                          activityLog: {
                            ...activityLog,
                            notes: [...activityLog.notes, newNote]
                          }
                        };
                      }
                      return d;
                    }));
                  }
                }
                break;

              case 'AddTag':
                if (action.params.tagName) {
                  if (trigger.startsWith('Lead')) {
                    this.leadsData.update(list => list.map(l => {
                      if (l.id === entity['id']) {
                        const existingNotes = l.notes || '';
                        const tagStr = `[Tag: ${action.params.tagName}]`;
                        return {
                          ...l,
                          notes: existingNotes.includes(tagStr) ? existingNotes : existingNotes ? `${existingNotes} ${tagStr}` : tagStr
                        };
                      }
                      return l;
                    }));
                  } else if (trigger.startsWith('Deal')) {
                    this.deals.update(list => list.map(d => {
                      if (d.id === entity['id']) {
                        const existingComments = d.comments || '';
                        const tagStr = `[Tag: ${action.params.tagName}]`;
                        return {
                          ...d,
                          comments: existingComments.includes(tagStr) ? existingComments : existingComments ? `${existingComments} ${tagStr}` : tagStr
                        };
                      }
                      return d;
                    }));
                  }
                }
                break;
            }
            actionsExecuted.push({
              actionId: action.id,
              type: action.type,
              status: 'ok'
            });
            successCount++;
          } catch (err: any) {
            actionsExecuted.push({
              actionId: action.id,
              type: action.type,
              status: 'error',
              error: err?.message || String(err)
            });
            failCount++;
          }
        }

        if (failCount > 0) {
          status = successCount > 0 ? 'partial' : 'failed';
        }
      }

      const logEntry: AutomationExecutionLog = {
        id: 'exec-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        ruleId: rule.id,
        ruleName: rule.name,
        ruleVersion: rule.version || 1,
        trigger,
        entityType,
        entityId: String(entity['id'] || ''),
        entityLabel,
        executedAt: new Date().toLocaleString(),
        dryRun: !!dryRunRuleId,
        conditionsTrace: trace,
        actionsExecuted,
        status
      };

      if (!dryRunRuleId) {
        this.automationExecutions.update(logs => [logEntry, ...logs]);
        this.automationRules.update(rules => rules.map(r =>
          r.id === rule.id ? { ...r, executionCount: (r.executionCount || 0) + 1 } : r
        ));
      }

      logs.push(logEntry);

      if (rule.stopOnMatch && passed && !dryRunRuleId) {
        break;
      }
    }

    return logs;
  }

  addAutomationRule(rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'executionCount' | 'changeHistory'>) {
    const newRule: AutomationRule = {
      ...rule,
      id: 'rule-' + Date.now(),
      version: 1,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      executionCount: 0,
      changeHistory: []
    };
    this.automationRules.update(rules => [...rules, newRule]);
    return newRule;
  }

  updateAutomationRule(ruleId: string, updates: Partial<AutomationRule>) {
    this.automationRules.update(rules => rules.map(r => {
      if (r.id === ruleId) {
        const nextVersion = (r.version || 1) + 1;
        const snapshot = { ...r };
        delete (snapshot as any).changeHistory;

        const history = r.changeHistory || [];
        const newHistory = [
          {
            version: r.version || 1,
            changedAt: new Date().toISOString().split('T')[0],
            changedBy: updates.lastModifiedBy || 'Achraf (Manager)',
            snapshot
          },
          ...history
        ].slice(0, 10);

        return {
          ...r,
          ...updates,
          version: nextVersion,
          updatedAt: new Date().toISOString().split('T')[0],
          changeHistory: newHistory
        };
      }
      return r;
    }));
  }

  toggleAutomationRule(ruleId: string) {
    this.automationRules.update(rules => rules.map(r =>
      r.id === ruleId ? { ...r, isActive: !r.isActive, updatedAt: new Date().toISOString().split('T')[0] } : r
    ));
  }

  deleteAutomationRule(ruleId: string) {
    this.automationRules.update(rules => rules.filter(r => r.id !== ruleId));
  }

  // ────────────────────────────────────────────────────────
  // Lead CRUD (automation-aware)
  // ────────────────────────────────────────────────────────
  addLead(lead: Omit<Lead, 'id' | 'createdDate' | 'createdBy' | 'createdAt' | 'modifiedDate' | 'modifiedBy' | 'statusHistory'>) {
    const newId = 'LEAD-' + String(this.leadsData().length + 1).padStart(6, '0');
    const nowStr = new Date().toISOString().split('T')[0];
    const currentUser = this.users().find(u => u.id === this.currentUserId());
    const currentUserName = currentUser?.displayName || 'Achraf (Manager)';
    const newLead: Lead = {
      ...lead,
      id: newId,
      createdDate: nowStr,
      createdBy: this.currentUserId(),
      modifiedDate: nowStr,
      modifiedBy: this.currentUserId(),
      statusHistory: [
        {
          status: lead.status,
          timestamp: new Date().toLocaleString(),
          user: currentUserName
        }
      ],
      activities: lead.activities || [],
      attachments: lead.attachments || [],
      contacts: lead.contacts || [],
      productInterests: lead.productInterests || [],
      campaigns: lead.campaigns || []
    };
    this.leadsData.update(list => [...list, newLead]);
    // Fire automation rules after lead is persisted
    setTimeout(() => this.evaluateRules('LeadCreated', newLead as unknown as Record<string, any>, `Lead: ${newLead.name} (${newLead.companyName})`), 0);
    return newLead;
  }

  updateLeadStatus(leadId: string, status: Lead['status']) {
    const currentUser = this.users().find(u => u.id === this.currentUserId());
    const currentUserName = currentUser?.displayName || 'Achraf';
    this.leadsData.update(list => list.map(l => {
      if (l.id === leadId) {
        const history = l.statusHistory || [];
        return {
          ...l,
          status,
          modifiedDate: new Date().toISOString().split('T')[0],
          modifiedBy: this.currentUserId(),
          statusHistory: [
            ...history,
            {
              status,
              timestamp: new Date().toLocaleString(),
              user: currentUserName
            }
          ]
        };
      }
      return l;
    }));
  }

  updateLead(leadId: string, updates: Partial<Lead>) {
    const currentUser = this.users().find(u => u.id === this.currentUserId());
    const currentUserName = currentUser?.displayName || 'Achraf';
    this.leadsData.update(list => list.map(l => {
      if (l.id === leadId) {
        const updated = {
          ...l,
          ...updates,
          modifiedDate: new Date().toISOString().split('T')[0],
          modifiedBy: this.currentUserId()
        };
        if (updates.status && updates.status !== l.status) {
          const history = l.statusHistory || [];
          updated.statusHistory = [
            ...history,
            {
              status: updates.status,
              timestamp: new Date().toLocaleString(),
              user: currentUserName
            }
          ];
        }
        return updated;
      }
      return l;
    }));
    const updatedLead = this.leadsData().find(l => l.id === leadId);
    if (updatedLead) {
      setTimeout(() => this.evaluateRules('LeadUpdated', updatedLead as unknown as Record<string, any>, `Lead: ${updatedLead.name} (${updatedLead.companyName})`), 0);
    }
  }

  addLeadActivity(leadId: string, activity: Omit<LeadActivity, 'id'>) {
    this.leadsData.update(list => list.map(l => {
      if (l.id === leadId) {
        const activities = l.activities || [];
        const newAct = {
          ...activity,
          id: 'la-' + (activities.length + 1) + '-' + Date.now()
        };
        return {
          ...l,
          activities: [...activities, newAct],
          modifiedDate: new Date().toISOString().split('T')[0],
          modifiedBy: this.currentUserId()
        };
      }
      return l;
    }));
  }

  addLeadAttachment(leadId: string, attachment: Omit<LeadAttachment, 'id'>) {
    this.leadsData.update(list => list.map(l => {
      if (l.id === leadId) {
        const attachments = l.attachments || [];
        const newAtt = {
          ...attachment,
          id: 'lat-' + (attachments.length + 1) + '-' + Date.now()
        };
        return {
          ...l,
          attachments: [...attachments, newAtt],
          modifiedDate: new Date().toISOString().split('T')[0],
          modifiedBy: this.currentUserId()
        };
      }
      return l;
    }));
  }

  activityLogs = signal<ActivityLog[]>([
    { id: 'act1', targetId: 'd1', type: 'Call', description: 'Initial discovery call with Atlas team.', timestamp: '2026-06-20' },
    { id: 'act2', targetId: 'd1', type: 'Email', description: 'Sent technical proposal and pricing breakdown.', timestamp: '2026-06-21' }
  ]);



  // Derived states
  customers = computed(() => this.partners().filter(p => p.type === 'Customer'));
  vendors = computed(() => this.partners().filter(p => p.type === 'Vendor'));
  prospects = computed(() => this.partners().filter(p => p.type === 'Prospect'));
  leads = computed(() => this.partners().filter(p => p.type === 'Lead'));

  allCustomers360 = computed(() =>
    this.partners()
      .filter(p => p.type === 'Customer')
      .map(p => this.getCustomer360(p.id)!)
      .filter(Boolean)
  );

  customerInvoices = computed(() => this.invoices().filter(i => i.type === 'Customer'));
  vendorInvoices = computed(() => this.invoices().filter(i => i.type === 'Vendor'));
  overdueInvoices = computed(() => this.invoices().filter(i => i.type === 'Customer' && i.status === 'Overdue'));

  salesThisMonth = computed(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    
    return this.deals()
      .filter(d => {
        if (!d.orderDate) return false;
        const dDate = new Date(d.orderDate);
        const isCurrentMonth = dDate.getFullYear() === currentYear && dDate.getMonth() === currentMonth;
        const isWon = ['Confirmed', 'Awaiting Invoicing', 'Invoiced', 'Closed Won'].includes(d.stage);
        return isCurrentMonth && isWon;
      })
      .reduce((sum, d) => sum + d.amount, 0);
  });

  conversionRate = computed(() => {
    const total = this.deals().length;
    if (total === 0) return 0;
    const converted = this.deals().filter(d => 
      ['Confirmed', 'Awaiting Invoicing', 'Invoiced', 'Closed Won'].includes(d.stage)
    ).length;
    return Math.round((converted / total) * 100);
  });

  winRate = computed(() => {
    const won = this.deals().filter(d => 
      ['Confirmed', 'Awaiting Invoicing', 'Invoiced', 'Closed Won'].includes(d.stage)
    ).length;
    const lost = this.deals().filter(d => d.stage === 'Closed Lost').length;
    if (won + lost === 0) return 0;
    return Math.round((won / (won + lost)) * 100);
  });

  avgDealSize = computed(() => {
    const validDeals = this.deals().filter(d => d.stage !== 'Closed Lost');
    if (validDeals.length === 0) return 0;
    const sum = validDeals.reduce((acc, d) => acc + d.amount, 0);
    return Math.round(sum / validDeals.length);
  });

  dealsByRegion = computed(() => {
    const groups: { [key: string]: number } = {};
    this.deals().forEach(d => {
      const region = d.salesRegion || 'Unspecified';
      const isWon = ['Confirmed', 'Awaiting Invoicing', 'Invoiced', 'Closed Won'].includes(d.stage);
      if (isWon) {
        groups[region] = (groups[region] || 0) + d.amount;
      }
    });
    return Object.entries(groups).map(([region, total]) => ({ region, total }));
  });

  topCustomers = computed(() => {
    const groups: { [key: string]: { name: string; totalValue: number; dealCount: number } } = {};
    this.deals().forEach(d => {
      const partner = this.partners().find(p => p.id === d.partnerId);
      const name = partner ? partner.name : 'Unknown Client';
      const isWon = ['Confirmed', 'Awaiting Invoicing', 'Invoiced', 'Closed Won'].includes(d.stage);
      if (isWon) {
        if (!groups[d.partnerId]) {
          groups[d.partnerId] = { name, totalValue: 0, dealCount: 0 };
        }
        groups[d.partnerId].totalValue += d.amount;
        groups[d.partnerId].dealCount += 1;
      }
    });
    return Object.values(groups).sort((a, b) => b.totalValue - a.totalValue);
  });

  lostOpportunities = computed(() => {
    return this.deals().filter(d => d.stage === 'Closed Lost');
  });

  salesForecast = computed(() => {
    const groups: { [key: string]: number } = {};
    this.deals()
      .filter(d => d.stage !== 'Closed Lost')
      .forEach(d => {
        const rep = d.salesPerson || 'Unassigned';
        let monthStr = 'Future';
        if (d.orderDate) {
          const date = new Date(d.orderDate);
          monthStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        }
        const key = `${monthStr}|${rep}`;
        groups[key] = (groups[key] || 0) + d.amount;
      });
    
    return Object.entries(groups).map(([key, total]) => {
      const [month, salesperson] = key.split('|');
      return { month, salesperson, total };
    });
  });

  isCustomizing = signal(false);

  dashboardKpis = signal<string[]>(['totalDeals', 'marketingSpend', 'latePayers', 'newTasksWeek']);

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

  convertLeadToProspect(partnerId: string) {
    this.partners.update(partners =>
      partners.map(p => p.id === partnerId ? { ...p, type: 'Prospect' } : p)
    );
  }

  convertLeadDataToProspect(lead: Lead) {
    this.addPartner({
      name: lead.name,
      type: 'Prospect',
      email: lead.contacts?.[0]?.email || '',
      phone: lead.contacts?.[0]?.phone || '',
      city: lead.company?.city || 'Casablanca',
      comments: lead.notes || '',
      score: lead.score,
      source: lead.campaigns?.[0]?.source || 'Website form' as any,
      assignedTo: lead.assignedSalesperson || ''
    });
    this.updateLeadStatus(lead.id, 'Converted');
  }

  getCustomerCard(partnerId: string): CustomerCard | undefined {
    return this.customerCards().find(c => c.partnerId === partnerId);
  }

  getCustomer360(partnerId: string): Customer360View | null {
    const partner = this.partners().find(p => p.id === partnerId);
    if (!partner) return null;

    const card = this.customerCards().find(c => c.partnerId === partnerId);
    const contacts: Customer360Contact[] = card
      ? (card.personnel || []).map(p => ({
          name: p.fullName,
          jobTitle: p.jobTitle,
          email: p.directEmail,
          phone: p.directMobile
        }))
      : [];

    const orders: Customer360Order[] = this.deals()
      .filter(d => d.partnerId === partnerId)
      .map(d => ({
        id: d.id,
        title: d.title,
        stage: d.stage,
        amount: d.amount,
        date: d.orderDate
      }));

    const meetings: Customer360Meeting[] = this.deals()
      .filter(d => d.partnerId === partnerId)
      .flatMap(d => (d.activityLog?.meetings || []).map(m => ({
        id: m.id,
        date: m.date,
        title: m.title,
        type: m.type
      })));

    const tickets: Customer360Ticket[] = this.tickets()
      .filter(t => t.partnerId === partnerId)
      .map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority
      }));

    const invoices: Customer360Invoice[] = this.invoices()
      .filter(i => i.partnerId === partnerId)
      .map(i => ({
        id: i.id,
        amount: i.amount,
        status: i.status,
        dueDate: i.dueDate
      }));

    return {
      partner,
      contacts,
      orders,
      meetings,
      tickets,
      invoices
    };
  }

  saveCustomerCard(card: Omit<CustomerCard, 'createdBy' | 'createdAt'> & { createdBy?: string; createdAt?: string }) {
    const now = new Date().toISOString().split('T')[0];
    const fullCard: CustomerCard = {
      ...card,
      createdBy: card.createdBy || this.currentUserId(),
      createdAt: card.createdAt || now,
    };
    this.customerCards.update(cards => {
      const existing = cards.findIndex(c => c.id === fullCard.id);
      if (existing >= 0) {
        const updated = [...cards];
        updated[existing] = fullCard;
        return updated;
      }
      return [...cards, fullCard];
    });
  }

  generateAccountId(): string {
    const count = this.customerCards().length + 1;
    return 'ACC-' + String(count).padStart(5, '0');
  }

  addPartner(partner: Omit<Partner, 'id' | 'createdBy' | 'createdAt'> & { createdBy?: string; createdAt?: string }) {
    const newId = 'p' + (this.partners().length + 1);
    const now = new Date().toISOString().split('T')[0];
    const newPartner = { ...partner, id: newId, createdBy: this.currentUserId(), createdAt: now };
    this.partners.update(pList => [...pList, newPartner]);

    return newPartner;
  }

  addTask(task: Omit<Task, 'id' | 'createdBy' | 'createdAt'> & { createdBy?: string; createdAt?: string }) {
    const newId = 't' + (this.tasks().length + 1);
    const now = new Date().toISOString().split('T')[0];
    const newTask = { ...task, id: newId, createdBy: this.currentUserId(), createdAt: now };
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

  getRelatedEntities(module: string, subModule: string): { id: string; label: string }[] {
    switch (module) {
      case 'Sales':
        switch (subModule) {
          case 'Deal': return this.deals().map(d => ({ id: d.id, label: d.title }));
          case 'Proposal': return this.proposals().map(p => ({ id: p.id, label: p.title }));
          case 'PurchaseOrder': return this.purchaseOrders().map(po => ({ id: po.id, label: `PO #${po.id}` }));
        }
        break;
      case 'Finance':
        switch (subModule) {
          case 'CustomerInvoice': return this.invoices().filter(i => i.type === 'Customer').map(i => ({ id: i.id, label: `Invoice #${i.id} - ${i.customerName || i.id}` }));
          case 'VendorInvoice': return this.invoices().filter(i => i.type === 'Vendor').map(i => ({ id: i.id, label: `Invoice #${i.id}` }));
          case 'Recovery': return this.invoices().filter(i => i.status === 'Overdue' || i.status === 'Pending').map(i => ({ id: i.id, label: `Invoice #${i.id} - ${i.customerName || i.id} (${i.status})` }));
        }
        break;
      case 'Partners':
        switch (subModule) {
          case 'Lead': return this.partners().filter(p => p.type === 'Lead').map(p => ({ id: p.id, label: p.name }));
          case 'Customer': return this.partners().filter(p => p.type === 'Customer').map(p => ({ id: p.id, label: p.name }));
          case 'Prospect': return this.partners().filter(p => p.type === 'Prospect').map(p => ({ id: p.id, label: p.name }));
          case 'Vendor': return this.partners().filter(p => p.type === 'Vendor').map(p => ({ id: p.id, label: p.name }));
        }
        break;
      case 'Support':
        if (subModule === 'Ticket') return this.tickets().map(t => ({ id: t.id, label: t.title }));
        break;
      case 'Marketing':
        if (subModule === 'Campaign') return this.campaigns().map(c => ({ id: c.id, label: c.title }));
        break;
    }
    return [];
  }

  addProposal(proposal: Omit<Proposal, 'id' | 'createdBy' | 'createdAt'> & { createdBy?: string; createdAt?: string }) {
    const newId = 'pr' + (this.proposals().length + 1);
    const now = new Date().toISOString().split('T')[0];
    const newProp = { ...proposal, id: newId, createdBy: this.currentUserId(), createdAt: now };
    this.proposals.update(props => [...props, newProp]);
    return newProp;
  }

  updateProposalStatus(propId: string, status: 'Draft' | 'Sent' | 'Confirmed' | 'Rejected') {
    this.proposals.update(props =>
      props.map(p => p.id === propId ? { ...p, status } : p)
    );
  }

  updateProposal(id: string, data: Partial<Proposal>) {
    this.proposals.update(proposals =>
      proposals.map(p => p.id === id ? { ...p, ...data } : p)
    );
  }

  addDeal(deal: Omit<Deal, 'id' | 'createdBy' | 'createdAt'> & { createdBy?: string; createdAt?: string }) {
    const newId = 'd' + (this.deals().length + 1);
    const now = new Date().toISOString().split('T')[0];
    const newDeal = { ...deal, id: newId, createdBy: this.currentUserId(), createdAt: now };
    this.deals.update(dList => [...dList, newDeal]);
    // Fire automation rules after deal is persisted
    setTimeout(() => this.evaluateRules('DealCreated', newDeal as unknown as Record<string, any>, `Deal: ${newDeal.title}`), 0);
    return newDeal;
  }

  updateDealStage(dealId: string, stage: DealStage) {
    let updatedDeal: Deal | undefined;
    this.deals.update(deals =>
      deals.map(d => {
        if (d.id === dealId) {
          updatedDeal = { ...d, stage };
          return updatedDeal;
        }
        return d;
      })
    );
    if (updatedDeal) {
      setTimeout(() => this.evaluateRules('DealUpdated', (updatedDeal as Deal) as unknown as Record<string, any>, `Deal: ${(updatedDeal as Deal).title}`), 0);
    }
  }

  addCallLog(dealId: string, call: Omit<CallLog, 'id'>) {
    this.deals.update(deals =>
      deals.map(d => {
        if (d.id === dealId) {
          const log = d.activityLog || { calls: [], emails: [], meetings: [], recordings: [], notes: [], followUps: [] };
          const newCall = { ...call, id: 'c' + (log.calls.length + 1) + '_' + Date.now() };
          return {
            ...d,
            activityLog: {
              ...log,
              calls: [...log.calls, newCall]
            }
          };
        }
        return d;
      })
    );
  }

  addEmailLog(dealId: string, email: Omit<EmailLog, 'id'>) {
    this.deals.update(deals =>
      deals.map(d => {
        if (d.id === dealId) {
          const log = d.activityLog || { calls: [], emails: [], meetings: [], recordings: [], notes: [], followUps: [] };
          const newEmail = { ...email, id: 'e' + (log.emails.length + 1) + '_' + Date.now() };
          return {
            ...d,
            activityLog: {
              ...log,
              emails: [...log.emails, newEmail]
            }
          };
        }
        return d;
      })
    );
  }

  addMeeting(dealId: string, meeting: Omit<Meeting, 'id'>) {
    this.deals.update(deals =>
      deals.map(d => {
        if (d.id === dealId) {
          const log = d.activityLog || { calls: [], emails: [], meetings: [], recordings: [], notes: [], followUps: [] };
          const newMeeting = { ...meeting, id: 'm' + (log.meetings.length + 1) + '_' + Date.now() };
          return {
            ...d,
            activityLog: {
              ...log,
              meetings: [...log.meetings, newMeeting]
            }
          };
        }
        return d;
      })
    );
  }

  addRecording(dealId: string, recording: Omit<TeamsRecording, 'id'>) {
    this.deals.update(deals =>
      deals.map(d => {
        if (d.id === dealId) {
          const log = d.activityLog || { calls: [], emails: [], meetings: [], recordings: [], notes: [], followUps: [] };
          const newRecording = { ...recording, id: 'r' + (log.recordings.length + 1) + '_' + Date.now() };
          return {
            ...d,
            activityLog: {
              ...log,
              recordings: [...log.recordings, newRecording]
            }
          };
        }
        return d;
      })
    );
  }

  addNote(dealId: string, note: Omit<Note, 'id'>) {
    this.deals.update(deals =>
      deals.map(d => {
        if (d.id === dealId) {
          const log = d.activityLog || { calls: [], emails: [], meetings: [], recordings: [], notes: [], followUps: [] };
          const newNote = { ...note, id: 'n' + (log.notes.length + 1) + '_' + Date.now() };
          return {
            ...d,
            activityLog: {
              ...log,
              notes: [...log.notes, newNote]
            }
          };
        }
        return d;
      })
    );
  }

  addFollowUp(dealId: string, followUp: Omit<FollowUp, 'id'>) {
    this.deals.update(deals =>
      deals.map(d => {
        if (d.id === dealId) {
          const log = d.activityLog || { calls: [], emails: [], meetings: [], recordings: [], notes: [], followUps: [] };
          const newFollowUp = { ...followUp, id: 'f' + (log.followUps.length + 1) + '_' + Date.now() };
          return {
            ...d,
            activityLog: {
              ...log,
              followUps: [...log.followUps, newFollowUp]
            }
          };
        }
        return d;
      })
    );
  }

  updateFollowUpStatus(dealId: string, followUpId: string, status: 'pending' | 'done') {
    this.deals.update(deals =>
      deals.map(d => {
        if (d.id === dealId) {
          const log = d.activityLog || { calls: [], emails: [], meetings: [], recordings: [], notes: [], followUps: [] };
          return {
            ...d,
            activityLog: {
              ...log,
              followUps: log.followUps.map(f => f.id === followUpId ? { ...f, status } : f)
            }
          };
        }
        return d;
      })
    );
  }



  addPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'createdBy' | 'createdAt'> & { createdBy?: string; createdAt?: string }, vendorId?: string) {
    const newId = 'po' + (this.purchaseOrders().length + 1);
    const now = new Date().toISOString().split('T')[0];
    const newPo = { ...po, id: newId, createdBy: this.currentUserId(), createdAt: now };
    if (vendorId) {
      newPo.vendorId = vendorId;
    }
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

  addInvoice(invoice: Omit<Invoice, 'id' | 'createdBy' | 'createdAt'> & { createdBy?: string; createdAt?: string }) {
    const newId = 'i' + (this.invoices().length + 1);
    const now = new Date().toISOString().split('T')[0];
    const newInv = { ...invoice, id: newId, createdBy: this.currentUserId(), createdAt: now };
    this.invoices.update(invs => [...invs, newInv]);
    return newInv;
  }

  updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    this.invoices.update(invs =>
      invs.map(i => i.id === invoiceId ? { ...i, status } : i)
    );
  }

  addTicket(ticket: Omit<Ticket, 'id' | 'createdBy' | 'createdAt'> & { createdBy?: string; createdAt?: string }) {
    const newId = 'tk' + (this.tickets().length + 1);
    const now = new Date().toISOString().split('T')[0];
    const newTicket = { ...ticket, id: newId, createdBy: this.currentUserId(), createdAt: now };
    this.tickets.update(tList => [...tList, newTicket]);
    return newTicket;
  }

  updateTicket(id: string, data: Partial<Ticket>) {
    this.tickets.update(tickets =>
      tickets.map(t => t.id === id ? { ...t, ...data } : t)
    );
  }

  deleteTicket(id: string) {
    this.tickets.update(tickets => tickets.filter(t => t.id !== id));
  }

  addActivityLog(log: Omit<ActivityLog, 'id'>) {
    const newId = 'act' + (this.activityLogs().length + 1);
    const newLog = { ...log, id: newId };
    this.activityLogs.update(logs => [...logs, newLog]);
    return newLog;
  }



}

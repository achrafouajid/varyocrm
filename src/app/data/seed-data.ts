import type { RoleId } from '../services/crm-state.service';

const AVATAR_COLORS = [
  '#7F77DD',  // purple
  '#1D9E75',  // teal
  '#D85A30',  // coral
  '#378ADD',  // blue
  '#BA7517',  // amber
  '#D4537E',  // pink
];

function getAvatarColor(userId: string): string {
  const hash = userId.charCodeAt(userId.length - 1);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function deriveInitials(displayName: string): string {
  const parts = displayName.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mapRoleToName(roleId: string): string {
  if (roleId === 'admin') return 'Admin';
  if (roleId === 'manager') return 'Manager';
  if (roleId === 'salesperson') return 'Salesperson';
  if (roleId === 'support') return 'Support Specialist';
  return 'Viewer';
}

function mapTeamIdToTeam(teamId: string | null): 'Sales' | 'Operations' | 'Finance' | 'Support' | null {
  if (teamId === 'team_sales') return 'Sales';
  if (teamId === 'team_ops') return 'Operations';
  if (teamId === 'team_finance') return 'Finance';
  if (teamId === 'team_support') return 'Support';
  return null;
}

const rawUsers: Array<{ id: string; displayName: string; email: string; roleId: RoleId; teamId: string | null; jobTitle: string }> = [
  { id: 'usr_ahmed', displayName: 'Ahmed Bennani', email: 'a.bennani@acg.ma', roleId: 'manager', teamId: 'team_sales', jobTitle: 'Sales Director' },
  { id: 'usr_fatima', displayName: 'Fatima Zahra El Idrissi', email: 'fz.elidrissi@acg.ma', roleId: 'salesperson', teamId: 'team_sales', jobTitle: 'Senior Account Executive' },
  { id: 'usr_karim', displayName: 'Karim Tazi', email: 'k.tazi@acg.ma', roleId: 'salesperson', teamId: 'team_sales', jobTitle: 'Account Executive' },
  { id: 'usr_nadia', displayName: 'Nadia Berrada', email: 'n.berrada@acg.ma', roleId: 'salesperson', teamId: 'team_sales', jobTitle: 'Business Development' },

  { id: 'usr_youssef', displayName: 'Youssef Alami', email: 'y.alami@acg.ma', roleId: 'manager', teamId: 'team_ops', jobTitle: 'Operations Manager' },
  { id: 'usr_layla', displayName: 'Layla Cherkaoui', email: 'l.cherkaoui@acg.ma', roleId: 'salesperson', teamId: 'team_ops', jobTitle: 'Operations Analyst' },
  { id: 'usr_omar', displayName: 'Omar Fassi', email: 'o.fassi@acg.ma', roleId: 'salesperson', teamId: 'team_ops', jobTitle: 'Project Coordinator' },

  { id: 'usr_samira', displayName: 'Samira Benjelloun', email: 's.benjelloun@acg.ma', roleId: 'manager', teamId: 'team_finance', jobTitle: 'Finance Manager' },
  { id: 'usr_hassan', displayName: 'Hassan El Amrani', email: 'h.elamrani@acg.ma', roleId: 'viewer', teamId: 'team_finance', jobTitle: 'Financial Analyst' },

  { id: 'usr_zineb', displayName: 'Zineb Tahiri', email: 'z.tahiri@acg.ma', roleId: 'manager', teamId: 'team_support', jobTitle: 'Support Team Lead' },
  { id: 'usr_mehdi', displayName: 'Mehdi Qadiri', email: 'm.qadiri@acg.ma', roleId: 'support', teamId: 'team_support', jobTitle: 'Support Specialist' },
  { id: 'usr_aya', displayName: 'Aya Mansouri', email: 'a.mansouri@acg.ma', roleId: 'support', teamId: 'team_support', jobTitle: 'Support Specialist' },

  { id: 'usr_rachid', displayName: 'Rachid Ouazzani', email: 'r.ouazzani@acg.ma', roleId: 'admin', teamId: null, jobTitle: 'CEO' }
];

export const SEED_ORG = {
  id: 'org_acg',
  name: 'Achraf Consulting Group',
  logoInitials: 'ACG',
  logoColor: '#7F77DD',
  industry: 'Technology',
  timezone: 'Africa/Casablanca',
  fiscalYearStart: 1,
  createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
};

export const SEED_USERS = rawUsers.map((u, i) => {
  return {
    ...u,
    name: u.displayName, // backward compatibility
    role: mapRoleToName(u.roleId), // backward compatibility
    team: mapTeamIdToTeam(u.teamId), // backward compatibility
    initials: deriveInitials(u.displayName),
    avatarColor: getAvatarColor(u.id),
    isActive: true,
    phone: u.id === 'usr_rachid' ? '+212-661-123456' : `+212-661-0000${i + 1}`,
    preferences: {
      language: 'fr' as const,
      notifyOnLeadAssign: true,
      notifyOnDealUpdate: true,
      notifyOnMention: true
    },
    createdAt: new Date(Date.now() - (180 + i * 10) * 24 * 60 * 60 * 1000),
    lastActiveAt: new Date(Date.now() - (i * 2 + 1) * 3600000)
  };
});

export const SEED_TEAMS = [
  {
    id: 'team_sales',
    name: 'Sales',
    department: 'Sales' as const,
    description: 'Morocco region commercial and account executives team',
    leadUserId: 'usr_ahmed',
    memberUserIds: ['usr_ahmed', 'usr_fatima', 'usr_karim', 'usr_nadia'],
    color: '#1D9E75',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'team_ops',
    name: 'Operations',
    department: 'Operations' as const,
    description: 'Onboarding, delivery, logistics, and resource allocation team',
    leadUserId: 'usr_youssef',
    memberUserIds: ['usr_youssef', 'usr_layla', 'usr_omar'],
    color: '#378ADD',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'team_finance',
    name: 'Finance',
    department: 'Finance' as const,
    description: 'Billing, vendor invoices, bookkeeping, and collections',
    leadUserId: 'usr_samira',
    memberUserIds: ['usr_samira', 'usr_hassan'],
    color: '#BA7517',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'team_support',
    name: 'Support',
    department: 'Support' as const,
    description: 'Customer service, technical support, and ticketing team',
    leadUserId: 'usr_zineb',
    memberUserIds: ['usr_zineb', 'usr_mehdi', 'usr_aya'],
    color: '#D4537E',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
  }
];

export const SEED_GROUPS = [
  {
    id: 'grp_sales_ops',
    name: 'Sales & Ops Sync',
    description: 'Cross-functional sync for customer handovers and pipeline alignment',
    createdByUserId: 'usr_ahmed',
    memberUserIds: ['usr_ahmed', 'usr_fatima', 'usr_youssef', 'usr_layla'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'grp_q3_close',
    name: 'Q3 Close Team',
    description: 'War room for high priority Q3 enterprise renewals and new logos',
    createdByUserId: 'usr_ahmed',
    memberUserIds: ['usr_ahmed', 'usr_fatima', 'usr_youssef', 'usr_samira'],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'grp_support_esc',
    name: 'Support Escalation',
    description: 'Urgent issues requiring dev, executive, and management support',
    createdByUserId: 'usr_zineb',
    memberUserIds: ['usr_zineb', 'usr_mehdi', 'usr_aya', 'usr_rachid'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  }
];

export const SEED_MESSAGES = [
  // Sales & Ops Sync
  {
    id: 'msg_1',
    groupId: 'grp_sales_ops',
    senderUserId: 'usr_ahmed',
    content: 'Pipeline review set for Thursday — Fatima please bring Q3 deal updates',
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
    readByUserIds: ['usr_ahmed', 'usr_fatima', 'usr_youssef', 'usr_layla']
  },
  {
    id: 'msg_2',
    groupId: 'grp_sales_ops',
    senderUserId: 'usr_youssef',
    content: "Confirmed. We'll also review the Casablanca account handoff",
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    readByUserIds: ['usr_ahmed', 'usr_fatima', 'usr_youssef', 'usr_layla']
  },
  {
    id: 'msg_3',
    groupId: 'grp_sales_ops',
    senderUserId: 'usr_fatima',
    content: 'DIGITAL ABC deal moved to Negotiation — high priority this week',
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 3600000),
    readByUserIds: ['usr_ahmed', 'usr_fatima', 'usr_youssef', 'usr_layla']
  },
  {
    id: 'msg_4',
    groupId: 'grp_sales_ops',
    senderUserId: 'usr_ahmed',
    content: "Great. Let's target close before end of month",
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 3600000 + 15 * 60 * 1000),
    readByUserIds: ['usr_ahmed', 'usr_fatima', 'usr_youssef'] // Layla has not read this yet
  },

  // Q3 Close Team
  {
    id: 'msg_5',
    groupId: 'grp_q3_close',
    senderUserId: 'usr_samira',
    content: 'Finance has approved the budget projections for Q3 targets',
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    readByUserIds: ['usr_ahmed', 'usr_fatima', 'usr_youssef', 'usr_samira']
  },
  {
    id: 'msg_6',
    groupId: 'grp_q3_close',
    senderUserId: 'usr_ahmed',
    content: "Excellent — we're at 78% of quota, strong close expected",
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    readByUserIds: ['usr_ahmed', 'usr_fatima', 'usr_youssef', 'usr_samira']
  },
  {
    id: 'msg_7',
    groupId: 'grp_q3_close',
    senderUserId: 'usr_youssef',
    content: 'Operations can support 2 additional enterprise onboardings in Q3',
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    readByUserIds: ['usr_ahmed', 'usr_youssef', 'usr_samira'] // Fatima has not read
  },

  // Support Escalation
  {
    id: 'msg_8',
    groupId: 'grp_support_esc',
    senderUserId: 'usr_zineb',
    content: 'Critical ticket #TK-0891 needs immediate escalation — client SLA breach',
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3 * 3600000),
    readByUserIds: ['usr_zineb', 'usr_mehdi', 'usr_aya', 'usr_rachid']
  },
  {
    id: 'msg_9',
    groupId: 'grp_support_esc',
    senderUserId: 'usr_mehdi',
    content: 'Investigating — root cause appears to be the API integration layer',
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3 * 3600000 + 10 * 60 * 1000),
    readByUserIds: ['usr_zineb', 'usr_mehdi', 'usr_aya', 'usr_rachid']
  },
  {
    id: 'msg_10',
    groupId: 'grp_support_esc',
    senderUserId: 'usr_rachid',
    content: "Loop in the client's technical contact. I'll handle executive communication",
    sentAt: new Date(Date.now() - 18 * 3600000),
    readByUserIds: ['usr_zineb', 'usr_mehdi', 'usr_aya', 'usr_rachid']
  },
  {
    id: 'msg_11',
    groupId: 'grp_support_esc',
    senderUserId: 'usr_aya',
    content: 'Patch deployed to staging. Testing now',
    sentAt: new Date(Date.now() - 12 * 3600000),
    readByUserIds: ['usr_zineb', 'usr_mehdi', 'usr_aya', 'usr_rachid']
  },
  {
    id: 'msg_12',
    groupId: 'grp_support_esc',
    senderUserId: 'usr_zineb',
    content: 'Client confirmed resolution. Closing escalation — post-mortem Friday',
    sentAt: new Date(Date.now() - 4 * 3600000),
    readByUserIds: ['usr_zineb', 'usr_mehdi', 'usr_aya', 'usr_rachid']
  }
];

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(9, 0, 0, 0);

const nextMonday = new Date();
nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
nextMonday.setHours(10, 0, 0, 0);

const nextWednesday = new Date();
nextWednesday.setDate(nextWednesday.getDate() + ((3 + 7 - nextWednesday.getDay()) % 7 || 7));
nextWednesday.setHours(15, 0, 0, 0);

const nextFriday = new Date();
nextFriday.setDate(nextFriday.getDate() + ((5 + 7 - nextFriday.getDay()) % 7 || 7));
nextFriday.setHours(14, 0, 0, 0);

export const SEED_MEETINGS = [
  {
    id: 'meet_1',
    groupId: 'grp_sales_ops',
    title: 'Weekly Pipeline Sync',
    description: 'Weekly sales pipeline sync and operation resource planning',
    scheduledAt: nextMonday,
    durationMinutes: 60,
    organizerUserId: 'usr_ahmed',
    attendeeUserIds: ['usr_ahmed', 'usr_fatima', 'usr_youssef', 'usr_layla'],
    status: 'scheduled' as const
  },
  {
    id: 'meet_2',
    groupId: 'grp_q3_close',
    title: 'Q3 Forecast Review',
    description: 'Review forecast targets for the end of Q3',
    scheduledAt: nextFriday,
    durationMinutes: 90,
    organizerUserId: 'usr_ahmed',
    attendeeUserIds: ['usr_ahmed', 'usr_fatima', 'usr_youssef', 'usr_samira'],
    status: 'scheduled' as const
  },
  {
    id: 'meet_3',
    groupId: 'grp_support_esc',
    title: 'Post-Mortem Debrief',
    description: 'Review SLA breach ticket #TK-0891 and propose API mitigation',
    scheduledAt: nextWednesday,
    durationMinutes: 60,
    organizerUserId: 'usr_zineb',
    attendeeUserIds: ['usr_zineb', 'usr_mehdi', 'usr_aya', 'usr_rachid'],
    status: 'scheduled' as const
  },
  {
    id: 'meet_4',
    groupId: 'grp_support_esc',
    title: 'Daily Standup',
    description: 'Daily standup to review active support ticket queue',
    scheduledAt: tomorrow,
    durationMinutes: 30,
    organizerUserId: 'usr_zineb',
    attendeeUserIds: ['usr_zineb', 'usr_mehdi', 'usr_aya'],
    status: 'scheduled' as const
  }
];

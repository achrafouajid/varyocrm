import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService, AutomationRule, AutomationRuleGroup, AutomationAction, AutomationExecutionLog, TRIGGER_FIELD_MAP, FieldDescriptor, ConditionOperator, AutomationTrigger, AutomationActionType } from '../services/crm-state.service';

const RULE_TEMPLATES: any[] = [
  {
    name: 'High-Value Deal Alert',
    description: 'When a deal exceeding 50,000 MAD is created, notify the manager.',
    isActive: true,
    trigger: 'DealCreated',
    priority: 2,
    stopOnMatch: false,
    conflictStrategy: 'all-execute',
    version: 1,
    isTemplate: true,
    conditionGroups: [
      {
        id: 'temp-grp-1',
        logicalOperator: 'AND',
        conditions: [{ fieldKey: 'amount', operator: 'greaterThan', value: 50000 }]
      }
    ],
    actions: [
      {
        id: 'temp-act-1',
        type: 'NotifyManager',
        params: {
          assignee: 'Achraf (Manager)',
          taskTitle: 'High-Value Deal Created',
          taskDescription: 'Review the high-value deal and verify client details.',
          taskTeam: 'Sales'
        }
      }
    ]
  },
  {
    name: 'New Lead Auto-Assign',
    description: 'Auto-assign new leads from MedCare to salesperson Youssef El Alami.',
    isActive: true,
    trigger: 'LeadCreated',
    priority: 1,
    stopOnMatch: true,
    conflictStrategy: 'first-wins',
    version: 1,
    isTemplate: true,
    conditionGroups: [
      {
        id: 'temp-grp-1',
        logicalOperator: 'AND',
        conditions: [{ fieldKey: 'companyName', operator: 'contains', value: 'MedCare' }]
      }
    ],
    actions: [
      {
        id: 'temp-act-1',
        type: 'AssignSalesperson',
        params: { assignee: 'Youssef El Alami' }
      }
    ]
  },
  {
    name: 'Stale Deal Follow-up',
    description: 'When a deal is in Proposal Sent stage, set a follow-up task.',
    isActive: true,
    trigger: 'DealUpdated',
    priority: 3,
    stopOnMatch: false,
    conflictStrategy: 'all-execute',
    version: 1,
    isTemplate: true,
    conditionGroups: [
      {
        id: 'temp-grp-1',
        logicalOperator: 'AND',
        conditions: [{ fieldKey: 'stage', operator: 'equals', value: 'Proposal sent' }]
      }
    ],
    actions: [
      {
        id: 'temp-act-1',
        type: 'CreateFollowUpTask',
        params: {
          taskTitle: 'Stale Deal Follow-up',
          taskDescription: 'Deal has been in Proposal Sent stage. Follow up with client regarding feedback.',
          taskTeam: 'Sales'
        }
      }
    ]
  },
  {
    name: 'Support Escalation',
    description: 'When a critical support ticket is created, notify support team.',
    isActive: true,
    trigger: 'TicketCreated',
    priority: 1,
    stopOnMatch: true,
    conflictStrategy: 'first-wins',
    version: 1,
    isTemplate: true,
    conditionGroups: [
      {
        id: 'temp-grp-1',
        logicalOperator: 'AND',
        conditions: [{ fieldKey: 'priority', operator: 'equals', value: 'High' }]
      }
    ],
    actions: [
      {
        id: 'temp-act-1',
        type: 'NotifyManager',
        params: {
          assignee: 'Khadija (Ops Manager)',
          taskTitle: 'Critical Ticket Alert',
          taskDescription: 'A high-priority ticket was created. Immediate action required.',
          taskTeam: 'Support'
        }
      }
    ]
  }
];

@Component({
  selector: 'app-automation',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './automation.component.html',
  styleUrls: ['./automation.component.css']
})
export class AutomationComponent {
  state = inject(CrmStateService);

  activeTab = signal<'rules' | 'templates' | 'logs'>('rules');

  // Rule Builder Form State
  isBuilderOpen = signal<boolean>(false);
  editingRuleId = signal<string | null>(null);
  ruleName = signal<string>('');
  ruleDescription = signal<string>('');
  ruleTrigger = signal<AutomationTrigger>('LeadCreated');
  rulePriority = signal<number>(3);
  ruleStopOnMatch = signal<boolean>(false);
  ruleConflictStrategy = signal<'first-wins' | 'all-execute'>('all-execute');

  conditionGroups = signal<AutomationRuleGroup[]>([]);
  ruleActions = signal<AutomationAction[]>([]);

  // Sandbox State
  isSandboxOpen = signal<boolean>(false);
  sandboxRuleId = signal<string>('');
  sandboxEntityType = signal<'Lead' | 'Deal' | 'Ticket'>('Lead');
  sandboxEntityId = signal<string>('');
  sandboxRawPayload = signal<string>('');
  sandboxLogs = signal<AutomationExecutionLog[]>([]);
  sandboxIsLiveRun = signal<boolean>(false);
  sandboxLoading = signal<boolean>(false);

  // Field descriptors cache based on builder trigger
  availableFields = computed<FieldDescriptor[]>(() => {
    return TRIGGER_FIELD_MAP[this.ruleTrigger()] || [];
  });

  // KPI Computations
  kpis = computed(() => {
    const rules = this.state.automationRules();
    const activeCount = rules.filter(r => r.isActive).length;
    const totalExecs = this.state.automationExecutions().length;
    const timeSavedMin = totalExecs * 3; // Est. 3 mins saved per execution
    const lastExec = this.state.automationExecutions()[0]?.executedAt || 'None';

    return {
      activeRules: activeCount,
      totalExecutions: totalExecs,
      timeSavedHours: (timeSavedMin / 60).toFixed(1),
      lastExecution: lastExec
    };
  });

  // Operators List
  operators: { key: ConditionOperator; label: string }[] = [
    { key: 'equals', label: 'Equals' },
    { key: 'notEquals', label: 'Does Not Equal' },
    { key: 'contains', label: 'Contains' },
    { key: 'notContains', label: 'Does Not Contain' },
    { key: 'greaterThan', label: 'Greater Than' },
    { key: 'lessThan', label: 'Less Than' },
    { key: 'greaterThanOrEqual', label: 'Greater Than or Equal' },
    { key: 'lessThanOrEqual', label: 'Less Than or Equal' },
    { key: 'isEmpty', label: 'Is Empty' },
    { key: 'isNotEmpty', label: 'Is Not Empty' }
  ];

  // Action Types List
  actionTypes: { key: AutomationActionType; label: string }[] = [
    { key: 'AssignSalesperson', label: 'Assign Salesperson' },
    { key: 'CreateFollowUpTask', label: 'Create Follow-Up Task' },
    { key: 'SendEmailLog', label: 'Send Email (Simulated Log)' },
    { key: 'NotifyManager', label: 'Notify Manager' },
    { key: 'UpdateEntityField', label: 'Update Entity Field' },
    { key: 'ChangeStage', label: 'Change Stage / Status' },
    { key: 'CreateNote', label: 'Append Note' },
    { key: 'AddTag', label: 'Add Segment Tag' }
  ];

  templates = RULE_TEMPLATES;

  // Selected Log Details Modal/Expanded row
  expandedLogId = signal<string | null>(null);

  constructor() {
    this.resetBuilder();
  }

  // Builder Methods
  openNewBuilder() {
    this.resetBuilder();
    this.isBuilderOpen.set(true);
  }

  resetBuilder() {
    this.editingRuleId.set(null);
    this.ruleName.set('');
    this.ruleDescription.set('');
    this.ruleTrigger.set('LeadCreated');
    this.rulePriority.set(3);
    this.ruleStopOnMatch.set(false);
    this.ruleConflictStrategy.set('all-execute');
    this.conditionGroups.set([
      {
        id: 'group-' + Date.now(),
        logicalOperator: 'AND',
        conditions: []
      }
    ]);
    this.ruleActions.set([]);
  }

  addConditionGroup() {
    this.conditionGroups.update(groups => [
      ...groups,
      {
        id: 'group-' + Date.now(),
        logicalOperator: 'AND',
        conditions: [{ fieldKey: this.availableFields()[0]?.key || '', operator: 'equals', value: '' }]
      }
    ]);
  }

  removeConditionGroup(index: number) {
    this.conditionGroups.update(groups => groups.filter((_, i) => i !== index));
  }

  addConditionToGroup(groupIndex: number) {
    this.conditionGroups.update(groups => groups.map((g, i) => {
      if (i === groupIndex) {
        return {
          ...g,
          conditions: [
            ...g.conditions,
            { fieldKey: this.availableFields()[0]?.key || '', operator: 'equals', value: '' }
          ]
        };
      }
      return g;
    }));
  }

  removeConditionFromGroup(groupIndex: number, condIndex: number) {
    this.conditionGroups.update(groups => groups.map((g, i) => {
      if (i === groupIndex) {
        return {
          ...g,
          conditions: g.conditions.filter((_, ci) => ci !== condIndex)
        };
      }
      return g;
    }));
  }

  addAction() {
    this.ruleActions.update(actions => [
      ...actions,
      {
        id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        type: 'AssignSalesperson',
        params: {}
      }
    ]);
  }

  removeAction(index: number) {
    this.ruleActions.update(actions => actions.filter((_, i) => i !== index));
  }

  cloneTemplate(tpl: any) {
    this.resetBuilder();
    this.ruleName.set(`Clone: ${tpl.name}`);
    this.ruleDescription.set(tpl.description || '');
    this.ruleTrigger.set(tpl.trigger);
    this.rulePriority.set(tpl.priority || 3);
    this.ruleStopOnMatch.set(tpl.stopOnMatch || false);
    this.ruleConflictStrategy.set(tpl.conflictStrategy || 'all-execute');
    this.conditionGroups.set(JSON.parse(JSON.stringify(tpl.conditionGroups)));
    this.ruleActions.set(JSON.parse(JSON.stringify(tpl.actions)));
    this.isBuilderOpen.set(true);
  }

  editRule(rule: AutomationRule) {
    this.editingRuleId.set(rule.id);
    this.ruleName.set(rule.name);
    this.ruleDescription.set(rule.description || '');
    this.ruleTrigger.set(rule.trigger);
    this.rulePriority.set(rule.priority || 3);
    this.ruleStopOnMatch.set(rule.stopOnMatch || false);
    this.ruleConflictStrategy.set(rule.conflictStrategy || 'all-execute');
    this.conditionGroups.set(JSON.parse(JSON.stringify(rule.conditionGroups)));
    this.ruleActions.set(JSON.parse(JSON.stringify(rule.actions)));
    this.isBuilderOpen.set(true);
  }

  saveRule() {
    if (!this.ruleName()) {
      alert('Please enter a rule name.');
      return;
    }

    const payload = {
      name: this.ruleName(),
      description: this.ruleDescription(),
      trigger: this.ruleTrigger(),
      isActive: true,
      priority: this.rulePriority(),
      stopOnMatch: this.ruleStopOnMatch(),
      conflictStrategy: this.ruleConflictStrategy(),
      conditionGroups: this.conditionGroups(),
      actions: this.ruleActions()
    };

    if (this.editingRuleId()) {
      this.state.updateAutomationRule(this.editingRuleId()!, payload);
    } else {
      this.state.addAutomationRule(payload);
    }

    this.isBuilderOpen.set(false);
    this.resetBuilder();
  }

  toggleActive(ruleId: string) {
    this.state.toggleAutomationRule(ruleId);
  }

  deleteRule(ruleId: string) {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      this.state.deleteAutomationRule(ruleId);
    }
  }

  duplicateRule(rule: AutomationRule) {
    const copy = {
      ...rule,
      name: `${rule.name} (Copy)`,
      executionCount: 0
    };
    delete (copy as any).id;
    delete (copy as any).createdAt;
    delete (copy as any).updatedAt;
    delete (copy as any).changeHistory;

    this.state.addAutomationRule(copy);
  }

  // Sandbox Methods
  openSandbox(ruleId?: string) {
    this.sandboxRuleId.set(ruleId || '');
    this.sandboxLogs.set([]);
    this.sandboxIsLiveRun.set(false);
    this.loadMockEntityList();
    this.isSandboxOpen.set(true);
  }

  loadMockEntityList() {
    const type = this.sandboxEntityType();
    if (type === 'Lead') {
      const leads = this.state.leads();
      this.sandboxEntityId.set(leads[0]?.id || '');
      this.updateSandboxPayload();
    } else if (type === 'Deal') {
      const deals = this.state.deals();
      this.sandboxEntityId.set(deals[0]?.id || '');
      this.updateSandboxPayload();
    } else if (type === 'Ticket') {
      const tickets = this.state.tickets();
      this.sandboxEntityId.set(tickets[0]?.id || '');
      this.updateSandboxPayload();
    }
  }

  updateSandboxPayload() {
    const type = this.sandboxEntityType();
    const id = this.sandboxEntityId();
    let entity: any = null;

    if (type === 'Lead') {
      entity = this.state.leads().find(l => l.id === id);
    } else if (type === 'Deal') {
      entity = this.state.deals().find(d => d.id === id);
    } else if (type === 'Ticket') {
      entity = this.state.tickets().find(t => t.id === id);
    }

    if (entity) {
      this.sandboxRawPayload.set(JSON.stringify(entity, null, 2));
    } else {
      this.sandboxRawPayload.set('{}');
    }
  }

  async runSandboxSimulation() {
    this.sandboxLoading.set(true);
    try {
      const entity = JSON.parse(this.sandboxRawPayload());
      const trigger = this.getTriggerForEntity(this.sandboxEntityType());
      const ruleId = this.sandboxRuleId();

      const label = `${this.sandboxEntityType()}: ${entity.name || entity.title || 'Sandbox'}`;

      if (this.sandboxIsLiveRun()) {
        // Mutation run
        await this.state.evaluateRules(trigger, entity, label);
        alert('Simulation executed and state changes written successfully.');
        this.isSandboxOpen.set(false);
      } else {
        // Dry run
        const results = await this.state.evaluateRules(trigger, entity, label, ruleId || undefined);
        this.sandboxLogs.set(results);
      }
    } catch (e: any) {
      alert('Failed to parse JSON payload or run simulation: ' + e?.message);
    } finally {
      this.sandboxLoading.set(false);
    }
  }

  getTriggerForEntity(type: 'Lead' | 'Deal' | 'Ticket'): AutomationTrigger {
    if (type === 'Lead') return 'LeadCreated';
    if (type === 'Deal') return 'DealCreated';
    return 'TicketCreated';
  }

  toggleLogExpand(logId: string) {
    this.expandedLogId.set(this.expandedLogId() === logId ? null : logId);
  }
}

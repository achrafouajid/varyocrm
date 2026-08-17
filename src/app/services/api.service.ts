import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from '../core/services/base-api.service';
import { CurrentUser } from '../core/services/auth-api.service';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService extends BaseApiService {

  // Auth
  getMe(): Observable<CurrentUser> {
    return this.get<CurrentUser>(`/auth/me`);
  }

  // Organization
  getOrganization(): Observable<any> {
    return this.get(`/organizations/me`);
  }

  updateOrganization(patch: any): Observable<any> {
    return this.patch(`/organizations/me`, patch);
  }

  // Users
  getUsers(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/users`).pipe(
      map(response => (response as any).content || [])
    );
  }

  getUser(id: string): Observable<any> {
    return this.get(`/users/${id}`);
  }

  createUser(user: any): Observable<any> {
    return this.post(`/users`, user);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.patch(`/users/${id}`, user);
  }

  updateOwnProfile(patch: any): Observable<any> {
    return this.patch(`/users/me`, patch);
  }

  deactivateUser(id: string): Observable<any> {
    return this.post(`/users/${id}/deactivate`, {});
  }

  // Teams
  getTeams(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/teams`).pipe(
      map(response => response.content || [])
    );
  }

  getTeam(id: string): Observable<any> {
    return this.get(`/teams/${id}`);
  }

  createTeam(team: any): Observable<any> {
    return this.post(`/teams`, team);
  }

  updateTeam(id: string, team: any): Observable<any> {
    return this.patch(`/teams/${id}`, team);
  }

  deleteTeam(id: string): Observable<any> {
    return this.delete(`/teams/${id}`);
  }

  // Groups
  getGroups(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/groups`).pipe(
      map(response => response.content || [])
    );
  }

  getGroup(id: string): Observable<any> {
    return this.get(`/groups/${id}`);
  }

  createGroup(group: any): Observable<any> {
    return this.post(`/groups`, group);
  }

  updateGroup(id: string, group: any): Observable<any> {
    return this.patch(`/groups/${id}`, group);
  }

  deleteGroup(id: string): Observable<any> {
    return this.delete(`/groups/${id}`);
  }

  // Messages
  getGroupMessages(groupId: string): Observable<any[]> {
    return this.get<PageResponse<any>>(`/groups/${groupId}/messages`).pipe(
      map(response => response.content || [])
    );
  }

  createGroupMessage(groupId: string, message: any): Observable<any> {
    return this.post(`/groups/${groupId}/messages`, message);
  }

  // Meetings
  getGroupMeetings(groupId: string): Observable<any[]> {
    return this.get<PageResponse<any>>(`/groups/${groupId}/meetings`).pipe(
      map(response => response.content || [])
    );
  }

  createGroupMeeting(groupId: string, meeting: any): Observable<any> {
    return this.post(`/groups/${groupId}/meetings`, meeting);
  }

  // Partners/Leads
  // NOTE: the backend does not support filtering /partners by a `type` query
  // param — it only accepts Pageable params on that route. Type/stage
  // filtering is exposed via dedicated path-variable endpoints instead.
  getPartners(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/partners`).pipe(
      map(response => response.content || [])
    );
  }

  getPartnersByType(type: string): Observable<any[]> {
    return this.get<PageResponse<any>>(`/partners/type/${type}`).pipe(
      map(response => response.content || [])
    );
  }

  getPartnersByStage(stage: string): Observable<any[]> {
    return this.get<PageResponse<any>>(`/partners/stage/${stage}`).pipe(
      map(response => response.content || [])
    );
  }

  getPartner(id: string): Observable<any> {
    return this.get(`/partners/${id}`);
  }

  createPartner(partner: any): Observable<any> {
    return this.post(`/partners`, partner);
  }

  updatePartner(id: string, partner: any): Observable<any> {
    return this.patch(`/partners/${id}`, partner);
  }

  deletePartner(id: string): Observable<any> {
    return this.delete(`/partners/${id}`);
  }

  // Lead (Partner) sub-resources
  getLeadContacts(partnerId: string): Observable<any[]> {
    return this.get<any[]>(`/partners/${partnerId}/contacts`);
  }

  createLeadContact(partnerId: string, contact: any): Observable<any> {
    return this.post(`/partners/${partnerId}/contacts`, contact);
  }

  updateLeadContact(partnerId: string, contactId: string, contact: any): Observable<any> {
    return this.patch(`/partners/${partnerId}/contacts/${contactId}`, contact);
  }

  deleteLeadContact(partnerId: string, contactId: string): Observable<any> {
    return this.delete(`/partners/${partnerId}/contacts/${contactId}`);
  }

  getLeadActivities(partnerId: string): Observable<any[]> {
    return this.get<any[]>(`/partners/${partnerId}/activities`);
  }

  createLeadActivity(partnerId: string, activity: any): Observable<any> {
    return this.post(`/partners/${partnerId}/activities`, activity);
  }

  deleteLeadActivity(partnerId: string, activityId: string): Observable<any> {
    return this.delete(`/partners/${partnerId}/activities/${activityId}`);
  }

  getLeadStatusHistory(partnerId: string): Observable<any[]> {
    return this.get<any[]>(`/partners/${partnerId}/status-history`);
  }

  createLeadStatusHistory(partnerId: string, entry: any): Observable<any> {
    return this.post(`/partners/${partnerId}/status-history`, entry);
  }

  // Deals
  getDeals(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/deals`).pipe(
      map(response => response.content || [])
    );
  }

  getDeal(id: string): Observable<any> {
    return this.get(`/deals/${id}`);
  }

  createDeal(deal: any): Observable<any> {
    return this.post(`/deals`, deal);
  }

  updateDeal(id: string, deal: any): Observable<any> {
    return this.patch(`/deals/${id}`, deal);
  }

  deleteDeal(id: string): Observable<any> {
    return this.delete(`/deals/${id}`);
  }

  // Deal Activities
  getDealActivities(dealId: string): Observable<any[]> {
    return this.get<any[]>(`/deals/${dealId}/activities`);
  }

  createDealActivity(dealId: string, activity: any): Observable<any> {
    return this.post(`/deals/${dealId}/activities`, activity);
  }

  updateDealActivity(dealId: string, activityId: string, activity: any): Observable<any> {
    return this.patch(`/deals/${dealId}/activities/${activityId}`, activity);
  }

  deleteDealActivity(dealId: string, activityId: string): Observable<any> {
    return this.delete(`/deals/${dealId}/activities/${activityId}`);
  }

  // Proposals
  getProposals(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/proposals`).pipe(
      map(response => response.content || [])
    );
  }

  getProposal(id: string): Observable<any> {
    return this.get(`/proposals/${id}`);
  }

  createProposal(proposal: any): Observable<any> {
    return this.post(`/proposals`, proposal);
  }

  updateProposal(id: string, proposal: any): Observable<any> {
    return this.patch(`/proposals/${id}`, proposal);
  }

  deleteProposal(id: string): Observable<any> {
    return this.delete(`/proposals/${id}`);
  }

  // Proposal Templates
  getProposalTemplates(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/proposal-templates`).pipe(
      map(response => response.content || [])
    );
  }

  createProposalTemplate(template: any): Observable<any> {
    return this.post(`/proposal-templates`, template);
  }

  updateProposalTemplate(id: string, template: any): Observable<any> {
    return this.patch(`/proposal-templates/${id}`, template);
  }

  deleteProposalTemplate(id: string): Observable<any> {
    return this.delete(`/proposal-templates/${id}`);
  }

  // Tasks
  getTasks(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/tasks`).pipe(
      map(response => response.content || [])
    );
  }

  getTask(id: string): Observable<any> {
    return this.get(`/tasks/${id}`);
  }

  createTask(task: any): Observable<any> {
    return this.post(`/tasks`, task);
  }

  updateTask(id: string, task: any): Observable<any> {
    return this.patch(`/tasks/${id}`, task);
  }

  deleteTask(id: string): Observable<any> {
    return this.delete(`/tasks/${id}`);
  }

  // Tickets
  getTickets(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/tickets`).pipe(
      map(response => response.content || [])
    );
  }

  getTicket(id: string): Observable<any> {
    return this.get(`/tickets/${id}`);
  }

  createTicket(ticket: any): Observable<any> {
    return this.post(`/tickets`, ticket);
  }

  updateTicket(id: string, ticket: any): Observable<any> {
    return this.patch(`/tickets/${id}`, ticket);
  }

  deleteTicket(id: string): Observable<any> {
    return this.delete(`/tickets/${id}`);
  }

  // Invoices
  getInvoices(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/invoices`).pipe(
      map(response => response.content || [])
    );
  }

  getInvoice(id: string): Observable<any> {
    return this.get(`/invoices/${id}`);
  }

  createInvoice(invoice: any): Observable<any> {
    return this.post(`/invoices`, invoice);
  }

  updateInvoice(id: string, invoice: any): Observable<any> {
    return this.patch(`/invoices/${id}`, invoice);
  }

  deleteInvoice(id: string): Observable<any> {
    return this.delete(`/invoices/${id}`);
  }

  // Purchase Orders
  getPurchaseOrders(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/purchase-orders`).pipe(
      map(response => response.content || [])
    );
  }

  getPurchaseOrder(id: string): Observable<any> {
    return this.get(`/purchase-orders/${id}`);
  }

  createPurchaseOrder(po: any): Observable<any> {
    return this.post(`/purchase-orders`, po);
  }

  updatePurchaseOrder(id: string, po: any): Observable<any> {
    return this.patch(`/purchase-orders/${id}`, po);
  }

  deletePurchaseOrder(id: string): Observable<any> {
    return this.delete(`/purchase-orders/${id}`);
  }

  // Campaigns
  getCampaigns(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/campaigns`).pipe(
      map(response => response.content || [])
    );
  }

  getCampaign(id: string): Observable<any> {
    return this.get(`/campaigns/${id}`);
  }

  createCampaign(campaign: any): Observable<any> {
    return this.post(`/campaigns`, campaign);
  }

  updateCampaign(id: string, campaign: any): Observable<any> {
    return this.patch(`/campaigns/${id}`, campaign);
  }

  deleteCampaign(id: string): Observable<any> {
    return this.delete(`/campaigns/${id}`);
  }

  // Automation Rules
  getAutomationRules(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/automation-rules`).pipe(
      map(response => response.content || [])
    );
  }

  getAutomationRule(id: string): Observable<any> {
    return this.get(`/automation-rules/${id}`);
  }

  createAutomationRule(rule: any): Observable<any> {
    return this.post(`/automation-rules`, rule);
  }

  updateAutomationRule(id: string, rule: any): Observable<any> {
    return this.patch(`/automation-rules/${id}`, rule);
  }

  deleteAutomationRule(id: string): Observable<any> {
    return this.delete(`/automation-rules/${id}`);
  }

  // Files
  uploadFile(file: File, ownerEntityType: string, ownerEntityId: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ownerEntityType', ownerEntityType);
    formData.append('ownerEntityId', ownerEntityId);
    return this.post(`/files`, formData);
  }

  getFilesForOwner(ownerEntityType: string, ownerEntityId: string): Observable<any[]> {
    return this.get<any[]>(`/files`, { ownerEntityType, ownerEntityId });
  }

  getFileDownloadUrl(id: string): string {
    return this.buildUrl(`/files/${id}`);
  }

  deleteFile(id: string): Observable<any> {
    return this.delete(`/files/${id}`);
  }

  // Notifications
  getNotifications(): Observable<any[]> {
    return this.get<PageResponse<any>>(`/notifications`).pipe(
      map(response => response.content || [])
    );
  }

  markNotificationRead(id: string): Observable<any> {
    return this.post(`/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<any> {
    return this.post(`/notifications/read-all`, {});
  }
}

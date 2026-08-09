import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Organization
  getOrganization(): Observable<any> {
    return this.http.get(`${this.apiUrl}/organizations/me`);
  }

  updateOrganization(patch: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/organizations/me`, patch);
  }

  // Users
  getUsers(): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/users`).pipe(
      map(response => (response as any).content || [])
    );
  }

  getUser(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, user);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}`, user);
  }

  deactivateUser(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${id}/deactivate`, {});
  }

  // Teams
  getTeams(): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/teams`).pipe(
      map(response => response.content || [])
    );
  }

  getTeam(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/teams/${id}`);
  }

  createTeam(team: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/teams`, team);
  }

  updateTeam(id: string, team: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/teams/${id}`, team);
  }

  deleteTeam(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teams/${id}`);
  }

  // Groups
  getGroups(): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/groups`).pipe(
      map(response => response.content || [])
    );
  }

  getGroup(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/groups/${id}`);
  }

  createGroup(group: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups`, group);
  }

  updateGroup(id: string, group: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/groups/${id}`, group);
  }

  deleteGroup(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/groups/${id}`);
  }

  // Messages
  getGroupMessages(groupId: string): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/groups/${groupId}/messages`).pipe(
      map(response => response.content || [])
    );
  }

  createGroupMessage(groupId: string, message: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/${groupId}/messages`, message);
  }

  // Meetings
  getGroupMeetings(groupId: string): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/groups/${groupId}/meetings`).pipe(
      map(response => response.content || [])
    );
  }

  createGroupMeeting(groupId: string, meeting: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups/${groupId}/meetings`, meeting);
  }

  // Partners/Leads
  getPartners(type?: string): Observable<any[]> {
    const url = type ? `${this.apiUrl}/partners?type=${type}` : `${this.apiUrl}/partners`;
    return this.http.get<PageResponse<any>>(url).pipe(
      map(response => response.content || [])
    );
  }

  getPartner(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/partners/${id}`);
  }

  createPartner(partner: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/partners`, partner);
  }

  updatePartner(id: string, partner: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/partners/${id}`, partner);
  }

  deletePartner(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/partners/${id}`);
  }

  // Deals
  getDeals(): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/deals`).pipe(
      map(response => response.content || [])
    );
  }

  getDeal(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/deals/${id}`);
  }

  createDeal(deal: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/deals`, deal);
  }

  updateDeal(id: string, deal: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/deals/${id}`, deal);
  }

  deleteDeal(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deals/${id}`);
  }

  // Proposals
  getProposals(): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/proposals`).pipe(
      map(response => response.content || [])
    );
  }

  getProposal(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/proposals/${id}`);
  }

  createProposal(proposal: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/proposals`, proposal);
  }

  updateProposal(id: string, proposal: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/proposals/${id}`, proposal);
  }

  deleteProposal(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/proposals/${id}`);
  }

  // Proposal Templates
  getProposalTemplates(): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/proposal-templates`).pipe(
      map(response => response.content || [])
    );
  }

  createProposalTemplate(template: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/proposal-templates`, template);
  }

  updateProposalTemplate(id: string, template: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/proposal-templates/${id}`, template);
  }

  deleteProposalTemplate(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/proposal-templates/${id}`);
  }

  // Tasks
  getTasks(): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/tasks`).pipe(
      map(response => response.content || [])
    );
  }

  getTask(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/${id}`);
  }

  createTask(task: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks`, task);
  }

  updateTask(id: string, task: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/tasks/${id}`, task);
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/${id}`);
  }

  // Tickets
  getTickets(): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/tickets`).pipe(
      map(response => response.content || [])
    );
  }

  getTicket(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tickets/${id}`);
  }

  createTicket(ticket: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets`, ticket);
  }

  updateTicket(id: string, ticket: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/tickets/${id}`, ticket);
  }

  deleteTicket(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tickets/${id}`);
  }

  // Invoices
  getInvoices(): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/invoices`).pipe(
      map(response => response.content || [])
    );
  }

  getInvoice(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/invoices/${id}`);
  }

  createInvoice(invoice: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/invoices`, invoice);
  }

  updateInvoice(id: string, invoice: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/invoices/${id}`, invoice);
  }

  deleteInvoice(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/invoices/${id}`);
  }

  // Purchase Orders
  getPurchaseOrders(): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/purchase-orders`).pipe(
      map(response => response.content || [])
    );
  }

  getPurchaseOrder(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/purchase-orders/${id}`);
  }

  createPurchaseOrder(po: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/purchase-orders`, po);
  }

  updatePurchaseOrder(id: string, po: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/purchase-orders/${id}`, po);
  }

  deletePurchaseOrder(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/purchase-orders/${id}`);
  }

  // Campaigns
  getCampaigns(): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/campaigns`).pipe(
      map(response => response.content || [])
    );
  }

  getCampaign(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/campaigns/${id}`);
  }

  createCampaign(campaign: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/campaigns`, campaign);
  }

  updateCampaign(id: string, campaign: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/campaigns/${id}`, campaign);
  }

  deleteCampaign(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/campaigns/${id}`);
  }

  // Automation Rules
  getAutomationRules(): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/automation-rules`).pipe(
      map(response => response.content || [])
    );
  }

  getAutomationRule(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/automation-rules/${id}`);
  }

  createAutomationRule(rule: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/automation-rules`, rule);
  }

  updateAutomationRule(id: string, rule: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/automation-rules/${id}`, rule);
  }

  deleteAutomationRule(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/automation-rules/${id}`);
  }

  // Files
  uploadFile(file: File, ownerEntityType: string, ownerEntityId: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ownerEntityType', ownerEntityType);
    formData.append('ownerEntityId', ownerEntityId);
    return this.http.post(`${this.apiUrl}/files`, formData);
  }

  getFileDownloadUrl(id: string): string {
    return `${this.apiUrl}/files/${id}`;
  }

  deleteFile(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/files/${id}`);
  }

  // Notifications
  getNotifications(): Observable<any[]> {
    return this.http.get<PageResponse<any>>(`${this.apiUrl}/notifications`).pipe(
      map(response => response.content || [])
    );
  }

  markNotificationRead(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications/read-all`, {});
  }
}

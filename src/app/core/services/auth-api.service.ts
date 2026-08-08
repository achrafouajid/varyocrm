import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { API_CONFIG } from '../config/api-config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthApiService extends BaseApiService {
  constructor(http: HttpClient) {
    super(http);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.post<LoginResponse>(API_CONFIG.endpoints.auth.login, credentials);
  }

  logout(): Observable<any> {
    return this.post<any>(API_CONFIG.endpoints.auth.logout, {});
  }

  refresh(): Observable<LoginResponse> {
    return this.post<LoginResponse>(API_CONFIG.endpoints.auth.refresh, {});
  }

  me(): Observable<any> {
    return this.get<any>(API_CONFIG.endpoints.auth.me);
  }
}

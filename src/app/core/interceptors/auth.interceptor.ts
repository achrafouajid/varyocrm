import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { CrmStateService } from '../../services/crm-state.service';
import { AuthApiService, LoginResponse } from '../services/auth-api.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private state = inject(CrmStateService);
  private authApi = inject(AuthApiService);

  // Coordinates concurrent 401s so only one /auth/refresh call is in flight
  // at a time; requests that 401 while a refresh is already running wait for
  // it instead of each triggering their own refresh.
  private refreshInFlight = false;
  private refreshedToken$ = new BehaviorSubject<string | null>(null);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const authedRequest = this.applyHeaders(request, token);
    const isAuthEndpoint = request.url.includes('/auth/login') || request.url.includes('/auth/refresh');

    return next.handle(authedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only treat this as "the session expired" when the request actually
        // carried a token. A 401 on an unauthenticated (anonymous) request is
        // expected, not an error condition — reacting to it here previously
        // triggered a hard `window.location.href` reload, which re-ran the
        // app's eager data loads, re-fired the same 401s, and reloaded again:
        // an infinite reload loop for anyone who wasn't logged in yet.
        if (error.status === 401 && token && !isAuthEndpoint) {
          return this.handleUnauthorized(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private applyHeaders(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
    let authedRequest = request;
    if (token) {
      authedRequest = authedRequest.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    // Let the browser set the multipart boundary itself for file uploads —
    // forcing application/json here would strip it and break the upload.
    if (!(request.body instanceof FormData)) {
      authedRequest = authedRequest.clone({
        setHeaders: { 'Content-Type': 'application/json' },
      });
    }

    return authedRequest;
  }

  private handleUnauthorized(originalRequest: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const refreshToken = typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) {
      this.state.logout();
      return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'No refresh token available' }));
    }

    if (!this.refreshInFlight) {
      this.refreshInFlight = true;
      this.refreshedToken$.next(null);

      return this.authApi.refresh(refreshToken).pipe(
        switchMap((response: LoginResponse) => {
          this.refreshInFlight = false;
          this.storeTokens(response);
          this.refreshedToken$.next(response.access_token);
          return next.handle(this.applyHeaders(originalRequest, response.access_token));
        }),
        catchError((refreshError) => {
          this.refreshInFlight = false;
          this.state.logout();
          return throwError(() => refreshError);
        })
      );
    }

    // A refresh is already in flight for another request — wait for it to
    // finish, then retry this request with the newly issued access token.
    return this.refreshedToken$.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next.handle(this.applyHeaders(originalRequest, token)))
    );
  }

  private storeTokens(response: LoginResponse): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('accessToken', response.access_token);
    if (response.refresh_token) {
      localStorage.setItem('refreshToken', response.refresh_token);
    }
  }
}

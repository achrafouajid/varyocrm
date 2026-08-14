import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CrmStateService } from '../../services/crm-state.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private state = inject(CrmStateService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;

    // Clone the request and add authorization header if token exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Add CORS headers
    request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    });

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only treat this as "the session expired" when the request actually
        // carried a token. A 401 on an unauthenticated (anonymous) request is
        // expected, not an error condition — reacting to it here previously
        // triggered a hard `window.location.href` reload, which re-ran the
        // app's eager data loads, re-fired the same 401s, and reloaded again:
        // an infinite reload loop for anyone who wasn't logged in yet.
        if (error.status === 401 && token) {
          this.state.logout();
        }
        return throwError(() => error);
      })
    );
  }
}

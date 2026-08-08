import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('accessToken');

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
        if (error.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // Optionally redirect to login
          window.location.href = '/login';
        }
        return throwError(() => error);
      })
    );
  }
}

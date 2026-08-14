import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService } from '../services/crm-state.service';
import { AuthApiService } from '../core/services/auth-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule, RouterLink],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--color-bg, #FAFAFA);
    }

    .login-container {
      display: flex;
      min-height: 100vh;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      background: #FFFFFF;
      border: 1px solid #E4E4E7;
      border-radius: 16px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      padding: 40px 32px 32px;
    }

    .login-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 32px;
    }

    .login-logo img {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      object-fit: contain;
    }

    .login-logo span {
      font-weight: 700;
      font-size: 20px;
      letter-spacing: -0.02em;
      color: #09090B;
    }

    .login-title {
      text-align: center;
      margin-bottom: 6px;
    }

    .login-title h1 {
      font-size: 18px;
      font-weight: 700;
      color: #09090B;
      margin: 0;
    }

    .login-title p {
      font-size: 13px;
      color: #71717A;
      margin: 4px 0 0;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #09090B;
      margin-bottom: 6px;
    }

    .form-input {
      width: 100%;
      padding: 9px 12px;
      background: #FAFAFA;
      border: 1px solid #E4E4E7;
      border-radius: 8px;
      font-size: 13px;
      color: #09090B;
      outline: none;
      transition: all 150ms ease;
      box-sizing: border-box;
    }

    .form-input::placeholder {
      color: #A1A1AA;
    }

    .form-input:focus {
      background: #FFFFFF;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .login-btn {
      width: 100%;
      padding: 10px 16px;
      background: var(--color-accent);
      color: #FFFFFF;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 150ms ease;
      margin-top: 8px;
    }

    .login-btn:hover {
      background: var(--color-accent-hover);
    }

    .login-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-msg {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      color: #991B1B;
      margin-bottom: 16px;
      text-align: center;
    }

    .forgot-link {
      display: block;
      text-align: right;
      font-size: 11px;
      font-weight: 500;
      color: #71717A;
      margin-top: 4px;
      cursor: pointer;
      text-decoration: none;
    }

    .forgot-link:hover {
      color: #09090B;
    }

    .signup-link {
      text-align: center;
      font-size: 12px;
      color: #71717A;
      margin: 20px 0 0;
    }

    .signup-link a {
      color: #09090B;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }

    .signup-link a:hover {
      color: var(--color-accent);
    }
  `],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-logo">
          <img src="logo.webp" alt="Bento Logo" />
          <span>Bento</span>
        </div>

        <div class="login-title">
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        @if (error()) {
          <div class="error-msg">{{ error() }}</div>
        }

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              class="form-input"
              placeholder="Enter your email"
              autocomplete="email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              class="form-input"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />
            <a class="forgot-link">Forgot password?</a>
          </div>

          <button
            type="submit"
            class="login-btn"
            [disabled]="loading()"
          >
            {{ loading() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <p class="signup-link">
          New to Bento?
          <a routerLink="/onboarding">Create an organization</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private state = inject(CrmStateService);
  private router = inject(Router);
  private authApi = inject(AuthApiService);

  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');

  onLogin(): void {
    const email = this.email().trim();
    const password = this.password().trim();

    if (!email || !password) {
      this.error.set('Please enter email and password');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authApi.login({ email, password }).subscribe({
      next: (response) => {
        localStorage.setItem('accessToken', response.access_token);
        if (response.refresh_token) {
          localStorage.setItem('refreshToken', response.refresh_token);
        }
        // Set auth flag for persistence across page refreshes
        localStorage.setItem('bento_auth', 'true');
        this.loading.set(false);
        // Set authentication state directly from API response
        (this.state as any).isAuthenticated.set(true);
        (this.state as any).currentUserId.set(response.user.id);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.error.set('Invalid email or password. Please try again.');
        this.loading.set(false);
      }
    });
  }

}

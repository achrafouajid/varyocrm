import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CrmStateService } from '../services/crm-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule],
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
      border-color: #09090B;
      box-shadow: 0 0 0 3px rgba(9, 9, 11, 0.08);
    }

    .login-btn {
      width: 100%;
      padding: 10px 16px;
      background: #09090B;
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
      background: #27272A;
    }

    .login-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 24px 0;
    }

    .divider-line {
      flex: 1;
      height: 1px;
      background: #E4E4E7;
    }

    .divider-text {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #A1A1AA;
      white-space: nowrap;
    }

    .google-btn {
      width: 100%;
      padding: 10px 16px;
      background: #FFFFFF;
      color: #09090B;
      border: 1px solid #E4E4E7;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .google-btn:hover {
      background: #F4F4F5;
      border-color: #D4D4D8;
    }

    .google-btn:disabled {
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

        <div class="divider">
          <div class="divider-line"></div>
          <span class="divider-text">or continue with</span>
          <div class="divider-line"></div>
        </div>

        <button
          class="google-btn"
          (click)="onGoogleLogin()"
          [disabled]="loading()"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
            <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
            <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
            <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  `
})
export class LoginComponent {
  private state = inject(CrmStateService);
  private router = inject(Router);

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

    setTimeout(() => {
      const success = this.state.login(email);
      if (success) {
        this.router.navigate(['/']);
      } else {
        this.error.set('Invalid email or password');
        this.loading.set(false);
      }
    }, 600);
  }

  onGoogleLogin(): void {
    this.loading.set(true);
    this.error.set('');

    setTimeout(() => {
      const success = this.state.loginWithGoogle();
      if (success) {
        this.router.navigate(['/']);
      } else {
        this.error.set('Google sign-in failed. Please try again.');
        this.loading.set(false);
      }
    }, 600);
  }
}

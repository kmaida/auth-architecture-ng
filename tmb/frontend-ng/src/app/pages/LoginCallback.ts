import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-callback',
  template: `
    <div class="login-callback">
      <h1 className="hero-title">Token-Mediating Backend</h1>
      <p className="hero-subtitle">Secure Token-Mediating Backend Auth Architecture Demo</p>
      <p className="hero-subtitle">This page is used to handle the login callback from the backend.</p>
      <p className="hero-subtitle">Authenticating...</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: []
})
export class LoginCallbackPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly isLoading = this.auth.isLoading;
  readonly loggedIn = this.auth.loggedIn;

  constructor() {
    this.handleCallback();
  }

  async handleCallback() {
    try {
      await this.auth.fetchAccessToken();
    } catch (error) {
      console.error('Authentication failed:', error);
    }
    // Redirect to homepage
    this.router.navigateByUrl('/');
  }
}

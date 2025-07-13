import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-callback">
      <h2 *ngIf="loading">Logging you in...</h2>
      <h2 *ngIf="!loading && !error">Login complete!</h2>
      <p *ngIf="error" class="error">{{ error }}</p>
    </div>
  `
})
export class LoginCallback implements OnInit {
  error: string | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const params = this.route.snapshot.queryParams;
    const code = params['code'];
    const state = params['state'];
    console.log('LoginCallback: code', code, 'state', state);
    if (!code || !state) {
      this.error = 'Missing authorization code or state.';
      this.loading = false;
      return;
    }
    try {
      console.log('LoginCallback: exchanging code for token...');
      await this.authService.exchangeCodeForToken(code, state);
      console.log('LoginCallback: exchange complete, navigating home.');
      this.router.navigate(['/']);
    } catch (err: any) {
      console.error('LoginCallback: error during exchange', err);
      this.error = err?.message || 'Login failed.';
    } finally {
      this.loading = false;
    }
  }
}

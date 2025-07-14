import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-callback',
  standalone: true,
  imports: [CommonModule],
  template: ``
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
    if (!code || !state) {
      this.error = 'Missing authorization code or state.';
      this.loading = false;
      return;
    }
    try {
      await this.authService.exchangeCodeForToken(code, state);
      this.router.navigate(['/'], { replaceUrl: true });
    } catch (err: any) {
      this.error = err?.message || 'Login failed.';
    } finally {
      this.loading = false;
    }
  }
}

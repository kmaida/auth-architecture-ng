import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-logout-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logout-callback">
      <h2>Logging you out...</h2>
      <p *ngIf="error" class="error">{{ error }}</p>
    </div>
  `
})
export class LogoutCallback implements OnInit {
  error: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    try {
      await this.authService.handleLogoutCallback(this.router);
    } catch (err: any) {
      this.error = err?.message || 'Logout failed.';
    }
  }
}

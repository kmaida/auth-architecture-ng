import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-logout-callback',
  standalone: true,
  imports: [CommonModule],
  template: ``
})
export class LogoutCallback implements OnInit {
  error: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    try {
      this.authService.handleLogoutCallback();
      await this.router.navigate(['/'], { replaceUrl: true });
    } catch (err: any) {
      this.error = err?.message || 'Logout failed.';
    }
  }
}

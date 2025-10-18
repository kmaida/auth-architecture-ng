import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-logout-callback',
  standalone: true,
  imports: [CommonModule],
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutCallback implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  error: string | null = null;

  async ngOnInit() {
    try {
      this.authService.handleLogoutCallback();
      await this.router.navigate(['/'], { replaceUrl: true });
    } catch (err: any) {
      this.error = err?.message || 'Logout failed.';
    }
  }
}

import { Component, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header, Footer],
  template: `
    <app-header />
    <div class="container-content">
      <ng-container>
        <router-outlet />
      </ng-container>
    </div>
    <app-footer />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly isLoading = this.auth.isLoading;

  constructor() {
    // Add body class for authentication state reactively
    effect(() => {
      document.body.classList.toggle('logged-in', this.auth.loggedIn());
      document.body.classList.toggle('logged-out', !this.auth.loggedIn());
    });
  }
}

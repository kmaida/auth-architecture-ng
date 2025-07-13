import { Component, inject, effect } from '@angular/core';
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
        <div *ngIf="isLoading()" class="global-loading-overlay">
          <div class="spinner"></div>
          <h2>Loading...</h2>
          <p>Checking authentication status...</p>
        </div>
        <router-outlet />
      </ng-container>
    </div>
    <app-footer />
  `,
  styles: [
    `.global-loading-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.7);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    `
  ]
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

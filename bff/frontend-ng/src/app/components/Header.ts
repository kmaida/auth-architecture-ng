import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <a routerLink="/" class="site-brand">
        <div class="site-brand-icon">
          <img src="https://fusionauth.io/img/favicon.png" alt="BFF Auth" />
        </div>
        <div class="site-brand-text">
          <span class="site-brand-main">BFF Auth</span>
          <span class="site-brand-sub">Architecture</span>
        </div>
      </a>
      <nav class="header-nav">
        <a routerLink="/" class="nav-link">Home</a>
        <a *ngIf="loggedIn()" routerLink="/protected" class="nav-link">Protected</a>
        <a *ngIf="loggedIn()" routerLink="/profile" class="nav-link">Profile</a>
        <a *ngIf="loggedIn()" routerLink="/call-api" class="nav-link">Call API</a>
      </nav>
      <ng-container *ngIf="loggedIn(); else loginBtn">
        <div class="header-auth">
          <p class="header-email">{{ userInfo()?.email }}</p>
          <button class="btn btn-logout" (click)="initLogout()">Log Out</button>
        </div>
      </ng-container>
      <ng-template #loginBtn>
        <button class="btn btn-login" (click)="initLogin()">Log In</button>
      </ng-template>
    </header>
  `,
  styles: [],
})
export class Header {
  protected readonly loggedIn = signal(false); // Replace with real auth state
  protected readonly userInfo = signal<{ email?: string } | null>(null); // Replace with real user info

  // Replace with real login/logout logic
  protected initLogin() {
    this.loggedIn.set(true);
    this.userInfo.set({ email: 'user@example.com' });
  }

  protected initLogout() {
    this.loggedIn.set(false);
    this.userInfo.set(null);
  }
}

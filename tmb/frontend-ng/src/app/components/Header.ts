import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <a routerLink="/" class="site-brand">
        <div class="site-brand-icon">
          <img src="https://fusionauth.io/img/favicon.png" alt="TMB Auth" />
        </div>
        <div class="site-brand-text">
          <span class="site-brand-main">TMB Auth</span>
          <span class="site-brand-sub">Architecture</span>
        </div>
      </a>
      <nav class="header-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Home</a>
        @if (loggedIn()) {
          <a routerLink="/protected" routerLinkActive="active" class="nav-link">Protected</a>
          <a routerLink="/profile" routerLinkActive="active" class="nav-link">Profile</a>
          <a routerLink="/call-api" routerLinkActive="active" class="nav-link">Call API</a>
        }
      </nav>
      @if (loggedIn()) {
        <div class="header-auth">
          <p class="header-email">{{ userInfo()?.email }}</p>
          <button class="btn btn-logout" (click)="logout()">Log Out</button>
        </div>
      } @else {
        <button class="btn btn-login" (click)="login()">Log In</button>
      }
    </header>
  `,
  styles: [],
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly loggedIn = this.auth.loggedIn;
  protected readonly userInfo = this.auth.userInfo;

  login() {
    this.auth.login();
  }

  logout() {
    this.auth.logout();
  }
}

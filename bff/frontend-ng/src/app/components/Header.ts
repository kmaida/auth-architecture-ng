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
          <button class="btn btn-logout" (click)="logout()">Log Out</button>
        </div>
      </ng-container>
      <ng-template #loginBtn>
        <button class="btn btn-login" (click)="login()">Log In</button>
      </ng-template>
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

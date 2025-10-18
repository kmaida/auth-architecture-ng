import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FusionAuthService, UserInfo } from '@fusionauth/angular-sdk';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <a routerLink="/" class="site-brand">
        <div class="site-brand-icon">
          <img src="https://fusionauth.io/img/favicon.png" alt="BFF-HB Auth" />
        </div>
        <div class="site-brand-text">
          <span class="site-brand-main">BFF-HB Auth</span>
          <span class="site-brand-sub">Architecture</span>
        </div>
      </a>
      <nav class="header-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Home</a>
        @if (loggedIn) {
          <a routerLink="/profile" routerLinkActive="active" class="nav-link">Profile</a>
          <a routerLink="/call-api" routerLinkActive="active" class="nav-link">Call API</a>
        }
      </nav>
      @if (loggedIn) {
        <div class="header-auth">
          <p class="header-email">{{ userInfo?.email }}</p>
          <button class="btn btn-logout" (click)="logout()">Log Out</button>
        </div>
      } @else {
        <button class="btn btn-login" (click)="login()">Log In</button>
      }
    </header>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header implements OnInit, OnDestroy {
  private auth: FusionAuthService = inject(FusionAuthService);

  loggedIn: boolean = this.auth.isLoggedIn();
  userInfo: UserInfo | null = null;
  isGettingUserInfo: boolean = false;
  subscription?: Subscription;

  ngOnInit(): void {
    if (this.loggedIn) {
      this.subscription = this.auth
        .getUserInfoObservable({
          onBegin: () => (this.isGettingUserInfo = true),
          onDone: () => (this.isGettingUserInfo = false),
        })
        .subscribe({
          next: (userInfo) => (this.userInfo = userInfo),
          error: (error) => console.error(error),
        });
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  logout() {
    this.auth.logout();
  }

  login() {
    this.auth.startLogin();
  }
}

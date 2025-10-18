import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FusionAuthService, UserInfo } from '@fusionauth/angular-sdk';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="profile-page">
      <h1>User Profile</h1>
      <p>This page uses the <code>angular-sdk</code> and subscribes to a user info observable. The returned data is a JSON object.</p>
      @if (error()) {
        <pre class="error">Error: {{ error()?.message }}</pre>
      } @else {
        @if (userInfo()) {
          <pre class="json">{{ userInfo() | json }}</pre>
        } @else {
          <pre>Fetching user info...</pre>
        }
      }
    </section>
  `,
  styles: []
})
export class ProfilePage implements OnInit{
  private readonly auth = inject(FusionAuthService);
  readonly userInfo$ = this.auth.getUserInfoObservable();
  readonly userInfo = signal<UserInfo | null>(null);
  readonly error = signal<Error | null>(null);
  readonly fusionAuthUrl = environment.fusionAuthUrl;

  ngOnInit() {
    this.userInfo$.subscribe({
      next: (userInfo) => {
        if (userInfo) {
          this.error.set(null);
          this.userInfo.set(userInfo);
        }
      },
      error: (err) => {
        this.error.set(err);
      }
    });
  }
}

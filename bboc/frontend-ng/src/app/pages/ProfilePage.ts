import { Component, signal, effect, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="profile-page">
      <h1>User Profile</h1>
      <p>This page makes a secured <code>GET</code> request to the FusionAuth <code>oauth2/userinfo</code> endpoint to fetch updated profile info. The user must be logged in and have a valid access token in order to retrieve their user info. The returned data is a JSON object.</p>
      @if (error()) {
        <pre class="error">Error: {{ error()?.message }}</pre>
      } @else {
        @if (userinfo()) {
          <pre class="json">{{ userinfo() | json }}</pre>
        } @else {
          <pre>Fetching user info...</pre>
        }
      }
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePage implements OnInit {
  private readonly http = inject(HttpClient);
  readonly userinfo = signal<any>(null);
  readonly error = signal<Error | null>(null);
  private readonly auth = inject(AuthService);

  ngOnInit() {
    this.fetchUserInfo();
  }

  fetchUserInfo() {
    // Fetch the latest access token from the backend
    const accessToken = this.auth.userToken();
    if (accessToken) {
      // Fetch user info using the access token
      this.http.get<unknown>(`${this.auth.fusionAuthUrl}/oauth2/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }).subscribe({
        next: (data) => this.userinfo.set(data),
        error: (err) => {
          console.error('Error fetching user info:', err);
          this.error.set(err);
        }
      });
    }
  }
}

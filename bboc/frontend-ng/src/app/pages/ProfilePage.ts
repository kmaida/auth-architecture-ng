import { Component, signal, effect, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

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
  styles: []
})
export class ProfilePage {
  readonly userinfo = signal<any>(null);
  readonly error = signal<Error | null>(null);
  private readonly auth = inject(AuthService);

  ngOnInit() {
    this.fetchUserInfo();
  }

  async fetchUserInfo() {
    try {
      // Fetch the latest access token from the backend
      const accessToken = this.auth.userToken();
      if (accessToken) {
        // Fetch user info using the access token
        const userInfo = await fetch(`${this.auth.fusionAuthUrl}/oauth2/userinfo`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (!userInfo.ok) throw new Error('Failed to fetch user info');
        const data = await userInfo.json();
        this.userinfo.set(data);
      }
    } catch (err: any) {
      this.error.set(err);
    }
  }
}

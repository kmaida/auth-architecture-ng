import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="profile-page">
      <h1>User Profile</h1>
      <p>This page makes a secured <code>GET</code> request to the backend auth API to fetch updated profile info. The user must be logged in and have a valid access token in an <code>httpOnly</code> cookie in order to retrieve their user info. The returned data is a JSON object.</p>
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
  protected readonly userinfo = signal<any>(null);
  protected readonly error = signal<any>(null);
  protected readonly apiUrl = environment.apiUrl ?? '';

  constructor() {
    this.fetchUserInfo();
  }

  private async fetchUserInfo() {
    try {
      this.error.set(null);
      const res = await fetch(`${this.apiUrl}/auth/userinfo`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch user info');
      const json = await res.json();
      this.userinfo.set(json);
    } catch (err: unknown) {
      this.error.set(err);
      this.userinfo.set(null);
    }
  }
}

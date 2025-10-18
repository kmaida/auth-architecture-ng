import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule],
  template: `
    <section class="profile-page">
      <h1>User Profile</h1>
      <p>
        This page makes a secured <code>GET</code> request to the backend auth API to fetch updated profile info. The user must be logged in and have a valid session in an <code>httpOnly</code> cookie in order to retrieve their user info. The returned data is a JSON object.
      </p>
      @if (error()) {
        <pre class="error">Error: {{ error() }}</pre>
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
export class ProfilePage {
  private readonly http = inject(HttpClient);
  protected readonly userinfo = signal<unknown>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly apiUrl = environment.apiUrl ?? 'http://localhost:4001';

  ngOnInit() {
    this.fetchUserInfo();
  }

  private fetchUserInfo() {
    this.error.set(null);
    this.http.get<unknown>(`${this.apiUrl}/auth/userinfo`, {
      credentials: 'include'
    }).subscribe({
      next: (json) => this.userinfo.set(json),
      error: (err) => {
        this.error.set(err);
        this.userinfo.set(null);
      }
    });
  }
}

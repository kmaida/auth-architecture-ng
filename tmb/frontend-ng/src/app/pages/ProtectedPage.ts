import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-protected-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="protected-page">
      <h1>Protected API Data</h1>
      <p>
        This page makes a secured <code>GET</code> request to the backend API to fetch and display a simple message. The user must be logged in and have a valid session in an <code>httpOnly</code> cookie in order for the backend to look up the access token and retrieve protected API data. The returned data is a simple JSON object with a <code>message</code> property, but you can return your own secure data instead in <code>/backend/src/api.ts</code>.
      </p>
      @if (error()) {
        <pre class="error">Error: {{ error()?.message }}</pre>
      } @else {
        @if (data()) {
          <pre>{{ data()?.message }}</pre>
        } @else {
          <pre>Fetching protected data...</pre>
        }
      }
    </section>
  `,
  styles: []
})
export class ProtectedPage {
  protected readonly data = signal<{ message: string } | null>(null);
  protected readonly error = signal<any>(null);
  protected readonly apiUrl = environment.apiUrl ?? 'http://localhost:4001';
  private readonly auth = inject(AuthService);

  ngOnInit() {
    this.fetchProtectedData();
  }

  private async fetchProtectedData() {
    this.error.set(null);
    try {
      // Fetch the latest access token from the backend
      const accessToken = await this.auth.preApiTokenFetch();
      if (accessToken) {
        this.auth.accessToken.set(accessToken);
        
        // Fetch protected data using the access token
        const res = await fetch(`${this.apiUrl}/api/protected-data`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch protected data');
        const json = await res.json();
        this.data.set(json);
      }
    } catch (err: unknown) {
      this.error.set(err);
      this.data.set(null);
    }
  }
}

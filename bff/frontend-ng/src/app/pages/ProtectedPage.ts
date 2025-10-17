import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
        <pre class="error">Error: {{ error() }}</pre>
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
  private readonly http = inject(HttpClient);
  protected readonly data = signal<{ message: string } | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly apiUrl = environment.apiUrl ?? 'http://localhost:4001';

  ngOnInit() {
    this.fetchProtectedData();
  }

  private fetchProtectedData() {
    this.error.set(null);
    this.http.get<{ message: string }>(`${this.apiUrl}/api/protected-data`, {
      credentials: 'include'
    }).subscribe({
      next: (json) => this.data.set(json),
      error: (err) => {
        this.error.set(err);
        this.data.set(null);
      }
    });
  }
}

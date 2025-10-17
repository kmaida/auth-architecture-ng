import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly loggedIn = signal(false);
  readonly userInfo = signal<unknown>(null);
  readonly isLoading = signal(true);

  private readonly apiUrl = environment.apiUrl ?? 'http://localhost:4001';

  constructor() {
    this.checkSession();
  }

  login(): void {
    window.location.href = `${this.apiUrl}/auth/login`;
  }

  logout(): void {
    window.location.href = `${this.apiUrl}/auth/logout`;
  }

  checkSession(): void {
    this.isLoading.set(true);
    this.http
      .get<{ loggedIn: boolean; user?: unknown }>(
        `${this.apiUrl}/auth/checksession`,
        {
          withCredentials: true,
          headers: { 'Accept': 'application/json' }
        }
      )
      .subscribe({
        next: data => {
          this.loggedIn.set(data?.loggedIn ?? false);
          this.userInfo.set(data?.loggedIn ? data?.user ?? null : null);
        },
        error: error => {
          // eslint-disable-next-line no-console
          console.error('Error checking session:', error);
          this.loggedIn.set(false);
          this.userInfo.set(null);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
  }

  getAccessToken() {
    return this.http.get<{ at?: string }>(
      `${this.apiUrl}/auth/token`,
      {
        withCredentials: true,
        headers: { 'Accept': 'application/json' }
      }
    );
  }
}

import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly loggedIn = signal(false);
  readonly userInfo = signal<unknown>(null);
  readonly isLoading = signal(true);

  private readonly apiUrl = environment.apiUrl ?? 'http://localhost:4001';

  constructor() {
    this.checkSession();
  }

  login() {
    window.location.href = `${this.apiUrl}/auth/login`;
  }

  logout() {
    window.location.href = `${this.apiUrl}/auth/logout`;
  }

  async checkSession() {
    this.isLoading.set(true);
    try {
      const response = await fetch(`${this.apiUrl}/auth/checksession`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      this.loggedIn.set(data.loggedIn);
      this.userInfo.set(data.loggedIn ? data.user ?? null : null);
    } catch (error) {
      console.error('Error checking session:', error);
      this.loggedIn.set(false);
      this.userInfo.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const atRes = await fetch(`${this.apiUrl}/auth/token`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (!atRes.ok) throw new Error('Unable to get access token');
      const atJson = await atRes.json();
      const accessToken = atJson?.at;
      if (!accessToken) throw new Error('No access token available');
      return accessToken;
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  }
}

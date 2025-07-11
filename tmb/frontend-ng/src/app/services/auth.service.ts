import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly loggedIn = signal(false);
  readonly userInfo = signal<any>(null);
  readonly isLoading = signal(true);

  readonly isLoading$ = new BehaviorSubject<boolean>(true);
  readonly loggedIn$ = new BehaviorSubject<boolean>(false);
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

  /**
   * Checks the current session status by making a request to the backend
   */
  async checkSession() {
    this.isLoading.set(true);
    this.isLoading$.next(true);
    try {
      const response = await fetch(`${this.apiUrl}/auth/checksession`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      this.loggedIn.set(data.loggedIn);
      this.loggedIn$.next(data.loggedIn);
      if (data.loggedIn) {
        this.userInfo.set(data.user ?? null);
      } else {
        this.userInfo.set(null);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      this.loggedIn.set(false);
      this.loggedIn$.next(false);
      this.userInfo.set(null);
    } finally {
      this.isLoading.set(false);
      this.isLoading$.next(false);
    }
  }

  /**
   * Fetch the access token from the backend only when needed
   * @returns The access token or null if not available
   */
  async getAccessToken(): Promise<string | null> {
    try {
      // Fetch the latest access token from the backend
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
      console.error('Error during preApiTokenFetch:', error);
      return null;
    }
  }
}

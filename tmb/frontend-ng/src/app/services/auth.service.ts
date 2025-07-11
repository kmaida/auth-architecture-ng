import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly loggedIn = signal(false);
  readonly userInfo = signal<any>(null);
  readonly isLoading = signal(true);
  readonly accessToken = signal<string | null>(null);

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
        await this.fetchAccessToken();
      } else {
        this.userInfo.set(null);
        this.accessToken.set(null);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      this.loggedIn.set(false);
      this.loggedIn$.next(false);
      this.userInfo.set(null);
      this.accessToken.set(null);
    } finally {
      this.isLoading.set(false);
      this.isLoading$.next(false);
    }
  }

  /**
   * Fetches the access token from the backend and stores it in the accessToken signal
   * This is typically called after a successful login
   * @returns The access token or null if not available
   */
  async fetchAccessToken(): Promise<string | null> {
    try {
      this.isLoading.set(true);
      const response = await fetch(`${this.apiUrl}/login/callback`, {
        credentials: 'include',
      });
      const data = await response.json(); // { at: 'accessToken' }
      const at = data.at ?? null;
      this.accessToken.set(at);
      return at;
    } catch (error) {
      console.error('Error getting access token:', error);
      this.accessToken.set(null);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Updates the access token by checking the current session
   * @returns The updated access token or null if not available
   */
  async updateAccessToken(): Promise<string | null> {
    try {
      const sessionRes = await fetch(`${this.apiUrl}/auth/checksession`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (!sessionRes.ok) throw new Error('Unable to check session');
      const session = await sessionRes.json();
      const accessToken = session?.at ?? null;
      this.accessToken.set(accessToken);
      return accessToken;
    } catch {
      this.accessToken.set(null);
      return null;
    }
  }
}

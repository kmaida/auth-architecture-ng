import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly loggedIn = signal(false);
  readonly userInfo = signal<any>(null);
  readonly isLoading = signal(true);
  private readonly apiUrl = environment.apiUrl ?? '';

  readonly isLoading$ = new BehaviorSubject<boolean>(true);
  readonly loggedIn$ = new BehaviorSubject<boolean>(false);

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
    this.isLoading$.next(true);
    try {
      const response = await fetch(`${this.apiUrl}/auth/checksession`, {
        credentials: 'include',
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
}

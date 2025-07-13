import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { FusionAuthClient } from '@fusionauth/typescript-client';
import { setupPKCE, clearAuthStorage } from './auth.utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly loggedIn = signal(false);
  readonly userToken = signal<string | null>(null);
  readonly userInfo = signal<any>(null);
  readonly isLoading = signal(true);

  readonly isLoading$ = new BehaviorSubject<boolean>(true);
  readonly loggedIn$ = new BehaviorSubject<boolean>(false);
  readonly userToken$ = new BehaviorSubject<string | null>(null);
  readonly fusionAuthUrl = environment.fusionAuthUrl;
  readonly frontendUrl = environment.frontendUrl;
  readonly clientId = environment.clientId;
  private readonly fusionAuthClient = new FusionAuthClient('', this.fusionAuthUrl);

  // --- Session and timer management ---
  private refreshTimerRef: { current: any } = { current: null };

  constructor() {
    // Only run checkSession if not on login or logout callback pages
    const path = window.location.pathname;
    if (path !== '/logout/callback' && path !== '/login/callback') {
      this.checkSession();
    }
  }

  async login() {
    try {
      await setupPKCE();
      window.location.href = `${this.fusionAuthUrl}/oauth2/authorize?` +
        `client_id=${this.clientId}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(`${this.frontendUrl}/login/callback`)}` +
        `&scope=${encodeURIComponent('offline_access openid profile email')}` +
        `&state=${encodeURIComponent(sessionStorage.getItem('state') ?? '')}` +
        `&code_challenge=${encodeURIComponent(sessionStorage.getItem('code_challenge') ?? '')}` +
        `&code_challenge_method=S256`;
    } catch (error) {
      console.error('Error logging in:', error);
      this.clearSession();
    } finally {
      this.setIsLoading(false);
    }
  }

  logout() {
    window.location.href = `${this.fusionAuthUrl}/oauth2/logout`;
  }

  /**
   * Checks the current session status by making a request to the backend
   */
  async checkSession() {
    this.setIsLoading(true);
    try {
      // Check if user is already logged in and if not, try to refresh the session
      const storedRefreshToken = sessionStorage.getItem('refresh_token');
      if (!this.userToken && storedRefreshToken) {
        try {
          await this.refreshAccessToken(storedRefreshToken);
        } catch (error) {
          console.error('Failed to refresh token:', error);
          this.clearSession();
          return;
        }
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
  * Exchange authorization code for tokens
   * @param {string} code - The authorization code received from the callback
   * @param {string} authzState - The state value to verify against session storage
   * @throws {Error} - If state or code verifier is missing, or token exchange fails
  */
  async exchangeCodeForToken(code: string, authzState: string) {
    this.setIsLoading(true);
    try {
      const state = sessionStorage.getItem('state');
      const codeVerifier = sessionStorage.getItem('code_verifier');
      if (authzState !== state) throw new Error('State mismatch during token exchange');
      if (!codeVerifier) throw new Error('Code verifier is missing');

      // FusionAuth expects empty string for public clients, not null
      const tokenRes = await this.fusionAuthClient.exchangeOAuthCodeForAccessTokenUsingPKCE(
        code,
        this.clientId,
        '', // No client secret for public clients
        `${this.frontendUrl}/login/callback`,
        codeVerifier
      );
      if (tokenRes.wasSuccessful()) {
        await this.tokensSuccess(tokenRes);
      } else {
        throw new Error(`Token exchange failed: ${tokenRes.statusCode}`);
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      this.clearSession();
      throw error;
    } finally {
      this.setIsLoading(false);
    }
  }

  /**
   * Fetch user info from FusionAuth
    * @param {string} accessToken - Access token to use for fetching user info
    * @returns {Promise<object|null>}
    * @throws {Error} - If access token is not available or user info fetch fails
   */
  async getUserInfo(accessToken?: string): Promise<any> {
    this.setIsLoading(true);
    try {
      const token = accessToken || this.userToken;
      if (!token) throw new Error('No access token available');
      const resUserInfo = await fetch(`${this.fusionAuthUrl}/oauth2/userinfo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!resUserInfo) throw new Error('Failed to fetch user info');
      return await resUserInfo.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    } finally {
      this.setIsLoading(false);
    }
  }

  /**
   * Refresh access token using refresh token
    * @param {string} refreshToken - The refresh token to use for refreshing the access token
    * @throws {Error} - If refresh token is not available or refresh fails
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      if (!refreshToken) throw new Error('No refresh token found');
      // FusionAuth expects 5 arguments: refreshToken, clientId, clientSecret, scope, redirectUri
      const resRefresh = await this.fusionAuthClient.exchangeRefreshTokenForAccessToken(
        refreshToken,
        this.clientId,
        '', // No client secret for public clients
        '', // scope (empty string if not used)
        ''  // redirectUri (empty string if not used)
      );
      if (resRefresh.wasSuccessful()) {
        await this.tokensSuccess(resRefresh);
      } else {
        throw new Error('Failed to refresh access token');
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      this.clearSession();
    }
  }

  /**
   * Log out and redirect to FusionAuth OAuth2 logout endpoint
   * @throws {Error} - If logout fails
   */
  async fusionAuthLogout() {
    this.setIsLoading(true);
    try {
      window.location.href = `${this.fusionAuthUrl}/oauth2/logout?` +
        `client_id=${this.clientId}` +
        `&redirect_uri=${encodeURIComponent(`${this.frontendUrl}/logout/callback`)}`;
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.setIsLoading(false);
    }
  }

  /**
   * Handle the logout callback by clearing session and redirecting home
   */
  async handleLogoutCallback(router: import('@angular/router').Router): Promise<void> {
    try {
      this.clearSession();
      await router.navigate(['/']);
    } catch (error) {
      console.error('Logout failed:', error);
      await router.navigate(['/']);
    }
  }

  /**
   * Clear any existing session stay-alive (refresh) timer
   */
  clearRefreshTimer() {
    if (this.refreshTimerRef && this.refreshTimerRef.current) {
      clearTimeout(this.refreshTimerRef.current);
      this.refreshTimerRef.current = null;
    }
  }

  /**
   * Set a timer to refresh the access token before it expires
    * @param {number} expiresAt - The timestamp when the access token expires in ms
    * This is important for a good user experience because the access token
    * expiry time should be very short in OAuth2 flows, especially for
    * browser-based apps
   */
  scheduleTokenRefresh(expiresAt: number) {
    this.clearRefreshTimer();
    const now = Date.now();
    // Refresh 1 minute before expiry, but never less than 0
    const refreshIn = Math.max(expiresAt - now - 60000, 0);
    this.refreshTimerRef.current = setTimeout(async () => {
      const refreshToken = sessionStorage.getItem('refresh_token');
      if (refreshToken) {
        await this.refreshAccessToken(refreshToken);
      }
    }, refreshIn);
  }

  /**
   * Handle tokens and user info after successful login/refresh
   * @param {object} tokenRes - The token response object
   */
  async tokensSuccess(tokenRes: any) {
    const { access_token, refresh_token, id_token } = tokenRes.response;
    this.setUserToken(access_token);
    sessionStorage.setItem('refresh_token', refresh_token);
    sessionStorage.setItem('id_token', id_token);
    // Calculate the timestamp when the access token expires based on its expiry length
    const expiresAt = Date.now() + (tokenRes.response.expires_in * 1000);
    sessionStorage.setItem('access_token_expires_at', expiresAt.toString());

    // Schedule automatic access token refresh for best user experience
    this.scheduleTokenRefresh(expiresAt);

    const userInfo = await this.getUserInfo(access_token);
    this.setUserInfo(userInfo);
    this.setLoggedIn(true);
    this.setIsLoading(false);

    // Clear PKCE values from session storage
    sessionStorage.removeItem('state');
    sessionStorage.removeItem('code_verifier');
    sessionStorage.removeItem('code_challenge');

    // Log successful authentication
    console.log('Authentication successful:', {
      userInfo,
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenExpiresAt: new Date(expiresAt).toISOString()
    });
  }

  /**
   * Clear all session and token state
   */
  clearSession() {
    this.clearRefreshTimer();
    this.clearAuthStorage();
    this.setUserToken(null);
    this.setUserInfo(null);
    this.setLoggedIn(false);
    this.setIsLoading(false);
  }

  // --- Helper methods for user/session state ---

  setIsLoading(loading: boolean) {
    this.isLoading.set(loading);
    this.isLoading$.next(loading);
  }

  setUserToken(token: string | null) {
    this.userToken.set(token);
    this.userToken$.next(token);
  }

  setUserInfo(user: any) {
    this.userInfo.set(user);
  }

  setLoggedIn(value: boolean) {
    this.loggedIn.set(value);
    this.loggedIn$.next(value);
  }

  clearAuthStorage() {
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('id_token');
    sessionStorage.removeItem('access_token_expires_at');
    // Add any other session keys you use here
  }
}

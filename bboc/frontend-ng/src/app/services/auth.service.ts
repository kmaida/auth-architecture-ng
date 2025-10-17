import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../environments/environment';
import { FusionAuthClient } from '@fusionauth/typescript-client';
import { setupPKCE, clearAuthStorage } from './auth.utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly loggedIn = signal(false);
  readonly userToken = signal<string | null>(null);
  readonly userInfo = signal<unknown>(null);
  readonly isLoading = signal(true);

  // Computed signals for derived state (if needed)
  readonly isAuthenticated = computed(() => !!this.userToken());

  readonly fusionAuthUrl = environment.fusionAuthUrl;
  readonly frontendUrl = environment.frontendUrl;
  readonly clientId = environment.clientId;
  private readonly fusionAuthClient = new FusionAuthClient('', this.fusionAuthUrl);

  // Refresh token (stored in memory only; not exposed anywhere outside the auth service)
  private readonly refreshTokenRef: { current: unknown } = { current: null };

  // Proactive token refresh
  private readonly refreshTimerRef: { current: unknown } = { current: null };
  private readonly accessTokenExpiresAtRef: { current: number | null } = { current: null };

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
  async getUserInfo(accessToken?: string): Promise<unknown> {
    this.setIsLoading(true);
    try {
      const token = accessToken ?? this.userToken();
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
   * Handle the logout callback by clearing session
   */
  async handleLogoutCallback(): Promise<void> {
    try {
      this.clearSession();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * Clear any existing session stay-alive (refresh) timer
   */
  clearRefreshTimer() {
    if (this.refreshTimerRef && this.refreshTimerRef.current) {
      clearTimeout(this.refreshTimerRef.current as number);
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
      const refreshToken = this.refreshTokenRef.current as string | null;
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
    this.refreshTokenRef.current = refresh_token;
    // Calculate the timestamp when the access token expires based on its expiry length
    const expiresAt = Date.now() + (tokenRes.response.expires_in * 1000);
    this.accessTokenExpiresAtRef.current = expiresAt;
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
      idToken: id_token,
      refreshToken: refresh_token,
      tokenExpiresAt: new Date(expiresAt).toISOString()
    });
  }

  /**
   * Clear all session and token state
   */
  clearSession() {
    this.clearRefreshTimer();
    clearAuthStorage();
    this.setUserToken(null);
    this.setUserInfo(null);
    this.setLoggedIn(false);
    this.setIsLoading(false);
  }

  // --- Helper methods for user/session state ---

  private setIsLoading(loading: boolean) {
    this.isLoading.set(loading);
  }

  private setUserToken(token: string | null) {
    this.userToken.set(token);
  }

  private setUserInfo(user: unknown) {
    this.userInfo.set(user);
  }

  private setLoggedIn(value: boolean) {
    this.loggedIn.set(value);
  }
}

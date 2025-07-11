import {Component} from '@angular/core';

@Component({
  selector: 'home-page',
  template: `
    <h1 class="hero-title">Token-Mediating Backend</h1>
    <p class="hero-subtitle">Secure Token-Mediating Backend Auth Architecture Demo</p>
    <p>This is a demo of the <strong>Token-Mediating Backend (TMB)</strong> architecture pattern, specifically as described in the <a href="https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps#name-token-mediating-backend" target="_blank">OAuth 2.0 for Browser-Based Applications</a> specification draft. The backend is a confidential client that handles (proxies) authentication requests with the authorization server (<a href="https://fusionauth.io" target="_blank">FusionAuth</a>). It then delivers access tokens to the frontend in a JSON object so the frontend can directly call the resource server. The frontend never interacts directly with the authorization server. It should store tokens in local app memory, <em>not</em> in localStorage. <a href="https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps#section-6.2.4.2" target="_blank">Token-Mediating Backend is the second most secure</a> of the three architecture patterns for browser-based apps.</p>

    <h2>Architecture Overview</h2>
    <ul>
      <li>
        <strong>Frontend:</strong>&nbsp;<a href="https://angular.dev" target="_blank">Angular</a> app
      </li>
      <li>
        <strong>Backend:</strong>&nbsp;<a href="https://nodejs.org" target="_blank">Node.js</a>&nbsp;<a href="https://expressjs.com" target="_blank">Express</a> API and server
      </li>
      <li>
        <strong>Authorization server:</strong> Self-hosted <a href="https://fusionauth.io" target="_blank">FusionAuth</a> running in a Docker container
      </li>
      <li>
        <strong>Authentication:</strong>&nbsp;<code>/auth</code> API on backend using <a href="https://fusionauth.io/docs/lifecycle/authenticate-users/oauth/endpoints" target="_blank">FusionAuth OAuth 2.0 endpoints</a> and <a href="https://github.com/FusionAuth/fusionauth-typescript-client" target="_blank">TypeScript SDK</a>
      </li>
      <li>
        <strong>Authorization:</strong>&nbsp;<code>/api</code> local API on the backend verifies the access token in the user's stored session before allowing access to protected resources
      </li>
      <li>
        <strong>Resource server:</strong> a cross-origin API that requires authorization, directly called by the frontend app (all three architectures use this same resource server)
      </li>
    </ul>

    <h2>Features</h2>
    <ul>
      <li>
        User authentication with FusionAuth using OAuth 2.0 Authorization Code flow with PKCE
      </li>
      <li>
        Local API on the backend with FusionAuth authorization through access token verification
      </li>
      <li>
        Authentication API on the backend
      </li>
      <li>
        Session persistence with refresh token grant on the backend and proactive session renewal
      </li>
      <li>
        Frontend can call the resource server directly with access tokens
      </li>
    </ul>

    <h2>How TMB Authentication Works</h2>
    <p>Here are all the steps for authentication in this TMB example in explicit detail. With this explanation, you should be able to trace the entire authentication lifecycle through both the backend and the frontend.</p>
    <ol>
      <li>
        User navigates to the frontend app
      </li>
      <li>
        Frontend calls the backend <code>/auth/checksession</code> endpoint with <code>credentials: include</code> to attach the session cookie, if it exists
      </li>
      <li>
        If present, backend uses the session ID cookie to look up user's session, which stores secure credentials (access token and refresh token), then <a href="https://www.youtube.com/shorts/zRY-ElxVa_U" target="_blank">verifies the JSON Web Token access token</a> (the session cookie is <code>httpOnly</code>, only the backend can use the contents of the cookie)
      </li>
      <li>
        If verification shows that the access token is expired, the backend checks for a refresh token and initiates a <a href="https://datatracker.ietf.org/doc/html/rfc6749#section-1.5" target="_blank">refresh grant</a> to get new tokens, if possible
      </li>
      <li>
        If the FusionAuth user session and access token are valid and not expired, the user's authenticated state is maintained and they are logged into the frontend app
      </li>
      <li>
        If there is no session cookie, the user's session is invalid, and/or if there is no refresh token, the backend prepares for an authorization request using <a href="https://datatracker.ietf.org/doc/html/rfc6749#section-4.1" target="_blank">OAuth 2.0 Authorization Code flow</a> with <a href="https://datatracker.ietf.org/doc/html/rfc7636" target="_blank">PKCE</a> by generating a <code>state</code> and...
      </li>
      <li>
        ...a <code>code_verifier</code> and a hash of the code verifier called a <code>code_challenge</code>, which is created by hashing the verifier with a function called a <code>code_challenge_method</code>
      </li>
      <li>
        Backend sets an <code>httpOnly</code> PKCE cookie with the <code>state</code>, <code>code_verifier</code>, and <code>code_challenge</code>
      </li>
      <li>
        Backend returns a response informing the frontend that the user is not authenticated
      </li>
      <li>
        User clicks the <code>Log In</code> button
      </li>
      <li>
        Frontend redirects to the backend <code>/auth/login</code> endpoint
      </li>
      <li>
        Backend generates an authorization request with the necessary configuration (e.g., <code>client_id</code>, <code>client_secret</code>, <code>state</code>, etc.) and the <code>code_challenge</code>, and sends the request to the authorization server's (<a href="https://fusionauth.io" target="_blank">FusionAuth</a>'s) <code>/oauth2/authorize</code> endpoint
      </li>
      <li>
        Authorization server validates the authorization request, authenticates the user, and redirects to the backend <code>/auth/callback</code> endpoint with a <code>code</code> and the same <code>state</code> it received with the authorization request
      </li>
      <li>
        Backend verifies the <code>state</code> the authorization server returned is the same <code>state</code> the backend set in the PKCE cookie and sent with the authorization request (steps 6 and 12)
      </li>
      <li>
        Backend sends a token request to the authorization server with the <code>code</code> and <code>code_verifier</code>
      </li>
      <li>
        Authorization server validates the token request, verifies the <code>code</code> is the same <code>code</code> it sent in step 13, and uses the <code>code_challenge_method</code> to hash the <code>code_verifier</code> and recreate a copy of the <code>code_challenge</code>
      </li>
      <li>
        Authorization server compares its new <code>code_challenge</code> to the backend's <code>code_challenge</code> (steps 7 and 12) and verifies they are identical
      </li>
      <li>
        Authorization server sends an access token and refresh token to the backend
      </li>
      <li>
        Backend deletes the PKCE cookie, generates a session ID, and stores the user's tokens and <code>userInfo</code> in a backend session (in-memory in this example, but I recommend Redis for production).
      </li>
      <li>
        Backend sets an <code>httpOnly</code> cookie for the user's session ID (this only contains the session ID, not tokens)
      </li>
      <li>
        Backend sets the <code>userInfo</code> in a cookie that is public to the frontend (note: this cookie is not actually read in this demo, but it's common practice to store user information in a cookie or ID token in the frontend)
      </li>
      <li>
        Backend <code>/auth/callback</code> redirects to the frontend login callback page
      </li>
      <li>
        Frontend runs <code>checkSession</code>, confirms authentication state, sets access token in app memory, fetches <code>userInfo</code>, and uses the information to set user-specific variables, etc.
      </li>
      <li>
        When the user clicks the <code>Log Out</code> button, the frontend redirects to the backend <code>/auth/logout</code> endpoint
      </li>
      <li>
        Backend redirects to the authorization server's <code>/oauth2/logout</code> endpoint with appropriate configuration
      </li>
      <li>
        Authorization server logs the user out and redirects to the backend <code>/auth/logout/callback</code> endpoint
      </li>
      <li>
        Backend deletes the server-side user session, clears all cookies, and redirects the unauthenticated user to the frontend homepage
      </li>
    </ol>

    <h2>How TMB   API Authorization Works</h2>
    <p>When a user requests access to secure data (either from a local backend API or external resource server), the frontend presents an access token to authorize access to the API (resource server). The frontend should protect routes that require authentication by checking the session before permitting navigation to the page that will call the secure API. Frontend checks like this improve the user experience.</p>
    <ol>
      <li>
        Authenticated user navigates to a protected frontend route that calls a secure API
      </li>
      <li>
        Frontend makes a request to the resource API for protected data with <code>Authorization: Bearer 'accessToken'</code> as authorization (for example, to the <code>http://resource-api.local:5001/api/recipe</code> endpoint)
      </li>
      <li>
        API middleware verifies the access token in the <code>Authorization</code> header and returns data to the frontend if the token is valid
      </li>
      <li>
        If the user isn't logged in or there's a problem with the access token, the resource server returns a <code>401: Unauthorized</code> error, which is displayed in the frontend
      </li>
    </ol>

    <h2>Other Auth Architectures</h2>
    <p>Token-Mediating Backend is one of three recommended authentication and authorization architecture choices for browser-based apps. The other two architectures are <a href="https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps#name-backend-for-frontend-bff" target="_blank">Backend-for-Frontend</a> and <a href="https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps#name-browser-based-oauth-20-clie" target="_blank">Browser-based OAuth 2.0 client</a>. Each architecture has different trade-offs and benefits. Demos of all three architectures are included in this repo.</p>
  `,
})
export class HomePage { /* Your component code goes here */ }
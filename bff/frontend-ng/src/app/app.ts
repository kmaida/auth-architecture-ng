import { Component, signal, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  template: `
    <app-header />
    <div class="container-content">
      <router-outlet />
    </div>
    <app-footer />
  `,
  styles: [],
})
export class App {
  protected readonly title = signal('frontend-ng');
  protected readonly auth = inject(AuthService);
  protected readonly isLoading = this.auth.isLoading;

  constructor() {
    // Add body class for authentication state reactively
    effect(() => {
      document.body.classList.toggle('logged-in', this.auth.loggedIn());
      document.body.classList.toggle('logged-out', !this.auth.loggedIn());
    });
  }
}

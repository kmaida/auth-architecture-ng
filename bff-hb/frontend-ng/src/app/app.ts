import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CommonModule } from '@angular/common';
import { FusionAuthService } from '@fusionauth/angular-sdk';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header, Footer],
  template: `
    <app-header />
    <div class="container-content">
      <ng-container>
        <router-outlet />
      </ng-container>
    </div>
    <app-footer />
  `
})
export class App {
  private fusionAuthService: FusionAuthService = inject(FusionAuthService);
  isLoggedIn: boolean = this.fusionAuthService.isLoggedIn();

  constructor() {
    // Add body class for authentication state reactively
    effect(() => {
      document.body.classList.toggle('logged-in', this.isLoggedIn);
      document.body.classList.toggle('logged-out', !this.isLoggedIn);
    });
  }
}

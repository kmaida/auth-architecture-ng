import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

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
}

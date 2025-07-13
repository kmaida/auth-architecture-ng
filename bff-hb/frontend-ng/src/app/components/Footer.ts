import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer>
      <p class="footer-text">
        <a href="https://github.com/kmaida/auth-architecture-ng/tree/main/bff-hb" target="_blank">BFF-HB</a>&nbsp;<a href="https://github.com/kmaida/auth-architecture-ng" target="_blank">Auth Architecture</a> | <a href="https://maida.kim" target="_blank">Kim Maida</a> for <a href="https://fusionauth.io" target="_blank">FusionAuth</a>
      </p>
    </footer>
  `,
  styles: []
})
export class Footer {}

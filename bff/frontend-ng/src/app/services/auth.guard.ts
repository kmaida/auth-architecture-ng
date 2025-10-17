import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoading()) {
    // Prevent navigation while loading
    // Optionally, show a loading indicator in your app
    return router.parseUrl('/');
  }

  if (auth.loggedIn()) {
    return true;
  }

  // Redirect to homepage if not logged in
  return router.parseUrl('/');
};

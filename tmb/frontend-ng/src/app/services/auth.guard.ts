import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait until loading is complete
  if (auth.isLoading()) {
    // Prevent navigation while loading
    return false;
  }

  // Check loggedIn signal
  if (auth.loggedIn()) {
    return true;
  }

  router.navigateByUrl('/');
  return false;
};

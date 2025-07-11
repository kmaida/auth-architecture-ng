import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { filter, first } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for isLoading$ to be false
  await firstValueFrom(auth.isLoading$.pipe(filter(loading => !loading), first()));

  // Check loggedIn$ reactively
  const isLoggedIn = await firstValueFrom(auth.loggedIn$.pipe(first()));
  if (isLoggedIn) {
    return true;
  }
  router.navigateByUrl('/');
  return false;
};

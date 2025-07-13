import { CanActivateFn, Router } from "@angular/router";
import { FusionAuthService } from "@fusionauth/angular-sdk";
import { inject } from "@angular/core";

export function authGuard(loggedIn: boolean): CanActivateFn {
  return () => {
    const auth = inject(FusionAuthService);
    const router = inject(Router);
    return auth.isLoggedIn() === loggedIn || router.createUrlTree(['/']);
  }
}
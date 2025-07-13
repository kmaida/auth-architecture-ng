import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { ResourceApiPage } from './pages/ResourceApiPage';
import { LoginCallback } from './pages/LoginCallback';
import { LogoutCallback } from './pages/LogoutCallback';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    pathMatch: 'full',
    title: 'Home'
  },
  {
    path: 'profile',
    component: ProfilePage,
    title: 'Profile',
    canActivate: [authGuard]
  },
  {
    path: 'call-api',
    component: ResourceApiPage,
    title: 'Call API',
    canActivate: [authGuard]
  },
  {
    path: 'login/callback',
    component: LoginCallback,
    title: 'Login Callback'
  },
  {
    path: 'logout/callback',
    component: LogoutCallback,
    title: 'Logout Callback'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

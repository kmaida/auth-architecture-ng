import { Routes } from '@angular/router';
import { HomePage } from './pages/HomePage';
import { ProtectedPage } from './pages/ProtectedPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResourceApiPage } from './pages/ResourceApiPage';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    pathMatch: 'full',
    title: 'Home'
  },
  {
    path: 'protected',
    component: ProtectedPage,
    title: 'Protected',
    canActivate: [authGuard]
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
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

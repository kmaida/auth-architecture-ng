
import { Routes } from '@angular/router';
import { HomePage } from './pages/HomePage';
import { ProtectedPage } from './pages/ProtectedPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResourceApiPage } from './pages/ResourceApiPage';
import { LoginCallbackPage } from './pages/LoginCallback';

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
    title: 'Protected'
  },
  {
    path: 'profile',
    component: ProfilePage,
    title: 'Profile'
  },
  {
    path: 'call-api',
    component: ResourceApiPage,
    title: 'Call API'
  },
  {
    path: 'login/callback',
    component: LoginCallbackPage,
  }
];

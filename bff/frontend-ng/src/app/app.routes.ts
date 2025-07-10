
import { Routes } from '@angular/router';
import { HomePage } from './pages/HomePage';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    pathMatch: 'full',
    title: 'Home'
  }
];

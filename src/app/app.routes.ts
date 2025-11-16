import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { List } from './components/list/list';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login },
  { path: 'list', component: List }
];

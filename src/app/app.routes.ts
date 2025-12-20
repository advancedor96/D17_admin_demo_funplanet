import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { List } from './components/list/list';
import { SessionDetail } from './components/session-detail/session-detail';
import { NotFound } from './components/not-found/not-found';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login },
  { path: 'list', component: List },
  { path: 'sessionDetail/:s_id', component: SessionDetail },
  { path: '**', component: NotFound }
];

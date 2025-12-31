import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { List } from './components/list/list';
import { SessionDetail } from './components/session-detail/session-detail';
import { NotFound } from './components/not-found/not-found';
import { AddSession } from './components/add-session/add-session';
import { UpdateSession } from './components/update-session/update-session';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login },
  { path: 'list', component: List },
  { path: 'addSession', component: AddSession },
  { path: 'updateSession/:s_id', component: UpdateSession },
  { path: 'sessionDetail/:s_id', component: SessionDetail },
  { path: '**', component: NotFound }
];

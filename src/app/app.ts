import { Component, signal, ViewChild, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Hello} from './components/hello/hello';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatSidenavModule, MatSidenav} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';import {MatButtonModule} from '@angular/material/button';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Hello, MatSlideToggleModule, MatToolbarModule, MatIconModule, MatButtonModule, MatSidenavModule, MatListModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  router = inject(Router);
  protected readonly title = signal('admin_demo_funplanet');
  @ViewChild('snav') snav!: MatSidenav;

  logout() {
    this.snav.close();
    localStorage.removeItem('token');
    this.router.navigateByUrl('/');
  }
}

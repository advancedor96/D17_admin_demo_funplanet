import { Component, signal, ViewChild, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router'; 
import { DrawerModule } from 'primeng/drawer';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToolbarModule, ButtonModule, DrawerModule, MenuModule, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  router = inject(Router);
  protected readonly title = signal('admin_demo_funplanet');
  drawerOpen=signal<boolean>(false);
  // @ViewChild('snav') snav!: MatSidenav;

  Menuitems : MenuItem[] = [
            { label: 'Add Session', routerLink: '/addSession', command: () => { this.router.navigate(['/addSession']); this.drawerOpen.set(false) }  },
            { label: 'List', routerLink: '/list', command: () => { this.drawerOpen.set(false) } },
            { label: 'Logout', command: ()=>{this.logout(); this.drawerOpen.set(false)} },
            { label: 'Login', routerLink: '/login', command: () => { this.drawerOpen.set(false) } },
        ];
  logout() {
    // this.snav.close();
    localStorage.removeItem('token');
    this.router.navigateByUrl('/');
  }
}

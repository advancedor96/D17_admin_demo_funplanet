import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Hello} from './components/hello/hello';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatIconModule} from '@angular/material/icon';import {MatButtonModule} from '@angular/material/button';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Hello, MatSlideToggleModule, MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('admin_demo_funplanet');
}

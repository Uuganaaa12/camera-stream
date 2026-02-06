import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CameraDashboardComponent } from './components/camera-dashboard/camera-dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CameraDashboardComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'dahua-angular';
}

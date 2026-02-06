import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraService, Camera } from '../../services/camera';
import { VideoPlayerComponent } from '../video-player/video-player';

@Component({
  selector: 'app-camera-dashboard',
  standalone: true,
  imports: [CommonModule, VideoPlayerComponent],
  templateUrl: './camera-dashboard.html',
  styleUrls: ['./camera-dashboard.css']
})
export class CameraDashboardComponent implements OnInit {

  cameras: Camera[] = [];
  location: string = '';
  loading: boolean = true;
  error: string = '';
constructor(
  private cameraService: CameraService,
  private cdr: ChangeDetectorRef  // ← Нэмэх
) {}

  ngOnInit() {
    this.loadCameras();
  }

loadCameras() {
  this.cameraService.getCameras().subscribe({
    next: (response) => {
      this.cameras = response.cameras;
      this.location = response.location;
      this.loading = false;
      this.cdr.detectChanges();  // ← Нэмэх
      console.log('Камерууд ачаалагдлаа:', this.cameras);
    },
    error: (err) => {
      this.error = 'Камер ачаалж чадсангүй: ' + err.message;
      this.loading = false;
      this.cdr.detectChanges();  // ← Нэмэх
      console.error(err);
    }
  });
}
}

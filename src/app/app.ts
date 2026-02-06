import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, ViewChild, ElementRef, QueryList, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CameraService, Camera } from './services/camera';

declare const Hls: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  cameras: Camera[] = [];
  location: string = '';
  loading: boolean = true;
  error: string = '';

  selectedCamera: Camera | null = null;

  @ViewChildren('gridVideo') gridVideos!: QueryList<ElementRef<HTMLVideoElement>>;
  @ViewChild('modalVideo') modalVideo?: ElementRef<HTMLVideoElement>;

  private hlsByCamera = new Map<string, any>();
  private modalHls: any;

  private baseUrl = 'https://ardelle-feeless-unwittingly.ngrok-free.dev';

  constructor(private cameraService: CameraService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCameras();
  }

  ngAfterViewInit() {
    this.gridVideos.changes.subscribe(() => this.initGridPlayers());
    this.initGridPlayers();
  }

  ngOnDestroy() {
    this.destroyAllPlayers();
  }

  trackByCamera(_index: number, camera: Camera) {
    return camera.id;
  }

  openModal(camera: Camera) {
    this.selectedCamera = camera;
    setTimeout(() => this.initModalPlayer(), 0);
  }

  closeModal() {
    this.selectedCamera = null;
    this.destroyModalPlayer();
  }

  private loadCameras() {
    this.cameraService.getCameras().subscribe({
      next: (response) => {
        this.cameras = response.cameras;
        this.location = response.location;
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.initGridPlayers(), 0);
      },
      error: (err) => {
        this.error = 'Камер ачаалж чадсангүй: ' + err.message;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private initGridPlayers() {
    if (!this.gridVideos || this.cameras.length === 0) {
      return;
    }

    this.gridVideos.forEach((videoRef, index) => {
      const camera = this.cameras[index];
      if (!camera || this.hlsByCamera.has(camera.id)) {
        return;
      }

      const hls = this.initPlayer(videoRef.nativeElement, camera.streamUrl);

      if (hls) {
        this.hlsByCamera.set(camera.id, hls);
      }
    });
  }

  private initModalPlayer() {
    if (!this.modalVideo || !this.selectedCamera) {
      return;
    }

    this.destroyModalPlayer();

    this.modalHls = this.initPlayer(this.modalVideo.nativeElement, this.selectedCamera.streamUrl);
  }

  private initPlayer(
    video: HTMLVideoElement,
    streamUrl: string
  ) {
    const fullStreamUrl = this.normalizeStreamUrl(streamUrl);

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 10,
        maxMaxBufferLength: 20,
        xhrSetup: function(xhr: any) {
          xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
        }
      });

      hls.loadSource(fullStreamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.tryAutoplay(video);
      });

      return hls;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = fullStreamUrl;
      video.addEventListener(
        'loadedmetadata',
        () => {
          this.tryAutoplay(video);
        },
        { once: true }
      );
    }

    return null;
  }

  private tryAutoplay(video: HTMLVideoElement) {
    video.muted = true;
    video.setAttribute('muted', 'true');
    video.playsInline = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => undefined);
    }
  }

  private normalizeStreamUrl(streamUrl: string) {
    if (streamUrl.startsWith('http')) {
      return streamUrl;
    }

    return this.baseUrl + streamUrl;
  }

  private destroyModalPlayer() {
    if (this.modalHls) {
      this.modalHls.destroy();
      this.modalHls = null;
    }

    if (this.modalVideo) {
      const video = this.modalVideo.nativeElement;
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
  }

  private destroyAllPlayers() {
    this.hlsByCamera.forEach((hls) => hls.destroy());
    this.hlsByCamera.clear();
    this.destroyModalPlayer();
  }
}

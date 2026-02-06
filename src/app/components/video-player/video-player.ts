import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const Hls: any;

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.html',
  styleUrls: ['./video-player.css']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {

  @Input() streamUrl!: string;
  @Input() cameraName!: string;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  private hls: any;
  status: string = 'Ачаалж байна...';
  statusClass: string = 'loading';

  private baseUrl = 'https://ardelle-feeless-unwittingly.ngrok-free.dev';

  ngOnInit() {
    setTimeout(() => this.initPlayer(), 100);
  }

initPlayer() {
  const video = this.videoElement.nativeElement;

  const fullStreamUrl = this.streamUrl.startsWith('http')
    ? this.streamUrl
    : this.baseUrl + this.streamUrl;

  console.log('Stream URL:', fullStreamUrl);

  if (typeof Hls !== 'undefined' && Hls.isSupported()) {
    this.hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      maxBufferLength: 10,
      maxMaxBufferLength: 20,
      xhrSetup: function(xhr: any, url: string) {
        xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
      }
    });

    this.hls.loadSource(fullStreamUrl);
    this.hls.attachMedia(video);

this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
  this.status = 'Тоглож байна';
  this.statusClass = 'playing';

  // Autoplay оролдлого
  const playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log('Autoplay амжилттай');
      })
      .catch(error => {
        console.log('Autoplay blocked, хэрэглэгч дарах хэрэгтэй:', error);
        this.status = 'Дарж эхлүүлнэ үү';
        this.statusClass = 'loading';
      });
  }
});

    this.hls.on(Hls.Events.ERROR, (event: any, data: any) => {
      if (data.fatal) {
        this.status = 'Алдаа гарлаа';
        this.statusClass = 'error';
        console.error('HLS error:', data);
      }
    });

  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = fullStreamUrl;
    video.addEventListener('loadedmetadata', () => {
      this.status = 'Тоглож байна';
      this.statusClass = 'playing';
      video.play();
    });
  }
}

  ngOnDestroy() {
    if (this.hls) {
      this.hls.destroy();
    }
  }
}

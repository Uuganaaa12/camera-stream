import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Camera {
  id: string;
  name: string;
  streamUrl: string;
}

export interface CameraResponse {
  location: string;
  cameras: Camera[];
}

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  private baseUrl = 'https://ardelle-feeless-unwittingly.ngrok-free.dev';
  
  private token = 'secret-token-location1-xyz';

  constructor(private http: HttpClient) {}

  getCameras(): Observable<CameraResponse> {
    // Ngrok warning давах header
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });

    return this.http.get<CameraResponse>(
      `${this.baseUrl}/api/cameras?token=${this.token}`,
      { headers }
    );
  }
}

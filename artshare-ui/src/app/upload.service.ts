import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface UploadArtworkRequest {
  title: string;
  description: string;
  fileBase64: string;
  fileType: string | null;
  fileName: string | null;
}

export interface UploadArtworkResponse {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private readonly apiUrl = '/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ⭐ Upload profile image
  uploadProfileImage(file: File, email: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);

    return this.http.post(`${this.apiUrl}/uploadProfileImage`, formData);
  }

  // ⭐ Upload artwork
  uploadArtwork(payload: UploadArtworkRequest): Observable<UploadArtworkResponse> {
    const user = this.authService.snapshot;

    const finalPayload = {
      ...payload,
      artistId: user.email,
      artistUsername: user.username
    };

    return this.http.post<UploadArtworkResponse>(
      `${this.apiUrl}/uploadArtwork`,
      finalPayload
    );
  }

  // ⭐ Normalize artwork objects
  private normalizeArtwork(a: any) {
    return {
      ...a,
      fileUrl: a.fileUrl || '',
      fileType: a.fileType || '',
      fileName: a.fileName || '',
      artistUsername: a.artistUsername || 'Unknown Artist'
    };
  }

  getAllArtwork(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAllArtwork`).pipe(
      map(list => list.map(a => this.normalizeArtwork(a)))
    );
  }

  getUserArtworks(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getArtworkByUserId/${userId}`).pipe(
      map(list => list.map(a => this.normalizeArtwork(a)))
    );
  }

  getArtworkById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getArtworkById/${id}`).pipe(
      map(a => this.normalizeArtwork(a))
    );
  }
}

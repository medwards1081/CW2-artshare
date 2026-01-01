import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiBase = 'http://localhost:7071/api';

  constructor(private http: HttpClient) {}

  searchArtworks(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/searchArtworks`, {
      params: { q: query }
    });
  }

  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/searchUsers`, {
      params: { q: query }
    });
  }
}

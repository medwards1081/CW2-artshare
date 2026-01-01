import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private api = '/api'; // Base path for Azure Functions

  constructor(private http: HttpClient) {}

  // ✅ Get the logged-in user's profile
  getProfile(): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.get<any>(`${this.api}/getProfile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // ⭐ Get artworks for a specific user
  getUserArtworks(userEmail: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/getArtworkByUserId/${encodeURIComponent(userEmail)}`);
  }

  // ✅ Update profile (username only)
  updateProfile(payload: any): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.put<any>(`${this.api}/updateProfile`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // ⭐ Get a public profile (username, avatar, follower counts)
  getPublicProfile(userId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/getPublicProfile/${encodeURIComponent(userId)}`);
  }

  // ⭐ Follow a user
  followUser(followerId: string, followingId: string): Observable<any> {
    return this.http.post<any>(`${this.api}/followUser`, {
      followerId,
      followingId
    });
  }

  // ⭐ Unfollow a user
  unfollowUser(followerId: string, followingId: string): Observable<any> {
    return this.http.post<any>(`${this.api}/unfollowUser`, {
      followerId,
      followingId
    });
  }

  // ⭐ NEW: Fetch full user objects for followers/following lists
  getUsersByEmails(emails: string[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.api}/getUsersByEmails`, { emails });
  }
}

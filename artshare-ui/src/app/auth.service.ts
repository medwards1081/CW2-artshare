import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export type UserRole = 'user' | 'admin';

export interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  username: string | null;
  role: UserRole | null;
  token: string | null;
  profileImageUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  getProfile() {
    throw new Error('Method not implemented.');
  }

  // ⭐ Get logged-in user's email (safe)
  getUserEmail(): string {
    const email = localStorage.getItem('email');
    return email ?? '';
  }

  // ⭐ NEW: Get logged-in user's username
  getCurrentUsername(): string | null {
    return localStorage.getItem('username');
  }

  // ⭐ NEW: Get logged-in user's profile image (Base64)
  getCurrentProfileImage(): string | null {
    const email = this.getUserEmail();
    if (!email) return null;
    return this.getProfileImage(email);
  }

  private state$ = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    email: null,
    username: null,
    role: null,
    token: null,
    profileImageUrl: null
  });

  get snapshot(): AuthState {
    return this.state$.value;
  }

  constructor(private http: HttpClient) {
    // Restore login state from localStorage
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role') as UserRole | null;

    // Load per-user profile image
    const savedImage = email ? this.getProfileImage(email) : null;

    if (token && email && username && role) {
      this.state$.next({
        isAuthenticated: true,
        email,
        username,
        role,
        token,
        profileImageUrl: savedImage
      });
    }
  }

  // ⭐ Save Base64 profile image for a specific user
  setProfileImage(email: string, base64: string) {
    localStorage.setItem(`profileImage_${email}`, base64);

    this.state$.next({
      ...this.state$.value,
      profileImageUrl: base64
    });
  }

  // ⭐ Load Base64 profile image for a specific user
  getProfileImage(email: string): string | null {
    return localStorage.getItem(`profileImage_${email}`);
  }

  signup(data: { email: string; username: string; password: string; dob: string }): Observable<any> {
    return new Observable(observer => {
      this.http.post<any>('/api/signup', data).subscribe({
        next: (res) => {
          if (res.token && res.user) {
            const savedImage = this.getProfileImage(res.user.email);

            this.setAuthState(
              res.user.email,
              res.user.username,
              res.user.role,
              res.token,
              savedImage
            );
          }

          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  login(email: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.http.post<any>('/api/login', { email, password }).subscribe({
        next: (res) => {
          if (res.token && res.user) {
            const savedImage = this.getProfileImage(res.user.email);

            this.setAuthState(
              res.user.email,
              res.user.username,
              res.user.role,
              res.token,
              savedImage
            );
          }

          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  // ⭐ Store full user state + persist to localStorage
  setAuthState(
    email: string,
    username: string,
    role: UserRole,
    token: string,
    profileImageUrl: string | null
  ) {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);

    this.state$.next({
      isAuthenticated: true,
      email,
      username,
      role,
      token,
      profileImageUrl
    });
  }

  logout(): void {
    const email = this.state$.value.email;

    // Do NOT delete profileImage_<email> so it persists across logins
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    this.state$.next({
      isAuthenticated: false,
      email: null,
      username: null,
      role: null,
      token: null,
      profileImageUrl: null
    });
  }
}

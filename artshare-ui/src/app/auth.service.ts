import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'user' | 'admin';

export interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  role: UserRole | null;
  token: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private state$ = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    email: null,
    role: null,
    token: null
  });

  get snapshot(): AuthState {
    return this.state$.value;
  }

  login(email: string, password: string): boolean {
    const isAdmin = email.endsWith('@admin.com');
    const ok = password.length >= 6;

    if (ok) {
      this.state$.next({
        isAuthenticated: true,
        email,
        role: isAdmin ? 'admin' : 'user',
        token: 'mock-token-' + Math.random().toString(36).slice(2)
      });
    }
    return ok;
  }

  signup(email: string, password: string, dob: string): boolean {
    return password.length >= 6;
  }

  logout() {
    this.state$.next({
      isAuthenticated: false,
      email: null,
      role: null,
      token: null
    });
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';

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

  constructor(private msal: MsalService) {}

  async login(): Promise<void> {
    try {
      const result: AuthenticationResult = await this.msal.instance.loginPopup({
        scopes: ['openid', 'profile', 'email']
      });

      const account = result.account;
      this.state$.next({
        isAuthenticated: true,
        email: account?.username ?? null,
        role: this.extractRole(result.idTokenClaims),
        token: result.accessToken
      });
    } catch (err) {
      console.error('Login failed', err);
    }
  }

  async signup(): Promise<void> {
    // In Entra ID B2C, signup is handled via a "user flow"
    try {
      await this.msal.instance.loginPopup({
        scopes: ['openid', 'profile', 'email'],
        authority: 'https://YOUR_TENANT.b2clogin.com/YOUR_TENANT.onmicrosoft.com/B2C_1_signup'
      });
    } catch (err) {
      console.error('Signup failed', err);
    }
  }

  logout(): void {
    this.msal.instance.logoutPopup();
    this.state$.next({
      isAuthenticated: false,
      email: null,
      role: null,
      token: null
    });
  }

  private extractRole(claims: any): UserRole | null {
    // Example: check custom claim or group membership
    if (claims?.roles?.includes('admin')) {
      return 'admin';
    }
    return 'user';
  }
}

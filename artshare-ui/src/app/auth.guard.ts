import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// ✅ Guard for normal authenticated users
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Check if a token exists in localStorage
  const token = localStorage.getItem('token');

  if (token && auth.snapshot.isAuthenticated) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

// ✅ Guard for admin-only routes
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('token');

  if (token && auth.snapshot.isAuthenticated && auth.snapshot.role === 'admin') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

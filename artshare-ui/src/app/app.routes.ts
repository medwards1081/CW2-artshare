import { Routes } from '@angular/router';
import { ArtworkListComponent } from './features/artwork-list/artwork-list.component';
import { UploadFormComponent } from './features/upload-form/upload-form.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

// Import guards
import { authGuard, adminGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'artworks', component: ArtworkListComponent },
  { path: 'upload', component: UploadFormComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },

  // New auth-related routes
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./features/auth/signup.component').then(m => m.SignupComponent) },
  { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },

  // Default route
  { path: '', redirectTo: '/artworks', pathMatch: 'full' },

  // Proper 404 page
  { path: '**', loadComponent: () => import('./features/error/not-found.component').then(m => m.NotFoundComponent) }
];

import { Routes } from '@angular/router';
import { ArtworkListComponent } from './features/artwork-list/artwork-list.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

// Artwork section components
import { GalleryComponent } from './features/artwork/gallery/gallery.component';
import { DetailComponent } from './features/artwork/detail/detail.component';
import { UploadComponent } from './features/artwork/upload/upload.component';

// Auth guards
import { authGuard, adminGuard } from './auth.guard';

export const routes: Routes = [
  // Homepage (preview grid)
  { path: 'artworks', component: ArtworkListComponent },

  // Artwork section
  { path: 'artwork', component: GalleryComponent },
  { path: 'artwork/:id', component: DetailComponent },

  // Upload (protected)
  { 
    path: 'upload', 
    canActivate: [authGuard],
    component: UploadComponent 
  },

  // Admin Dashboard (admin-only)
  { 
    path: 'admin', 
    canActivate: [adminGuard],
    component: AdminDashboardComponent 
  },

  // ⭐ Manage Users (admin-only)
  {
    path: 'admin/users',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/manage-users/manage-users.component')
        .then(m => m.ManageUsersComponent)
  },

  // ⭐ Manual Test Suite (admin-only)
  {
    path: 'admin/tests',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/manual-tests/manual-tests.component')
        .then(m => m.ManualTestsComponent)
  },

  // ⭐ SEARCH RESULTS PAGE (NEW)
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search-results.component')
        .then(m => m.SearchResultsComponent)
  },

  // Auth routes
  { 
    path: 'login', 
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'signup', 
    loadComponent: () =>
      import('./features/auth/signup.component').then(m => m.SignupComponent) 
  },

  // Profile (protected)
  { 
    path: 'profile', 
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent) 
  },

  // Edit Profile (protected)
  { 
    path: 'profile/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./edit-profile/edit-profile.component').then(m => m.EditProfileComponent) 
  },

  // ⭐ Followers list (protected)
  {
    path: 'profile/:id/followers',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/followers-list/followers-list.component')
        .then(m => m.FollowersListComponent)
  },

  // ⭐ Following list (protected)
  {
    path: 'profile/:id/following',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/following-list/following-list.component')
        .then(m => m.FollowingListComponent)
  },

  // ⭐ Public Artist Profile
  {
    path: 'user/:id',
    loadComponent: () =>
      import('./features/public-profile/public-profile/public-profile.component')
        .then(m => m.PublicProfileComponent)
  },

  // Default route → homepage
  { path: '', redirectTo: '/artworks', pathMatch: 'full' },

  // 404
  { 
    path: '**', 
    loadComponent: () =>
      import('./features/error/not-found.component').then(m => m.NotFoundComponent) 
  }
];

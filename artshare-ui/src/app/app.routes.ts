import { Routes } from '@angular/router';
import { ArtworkListComponent } from './features/artwork-list/artwork-list.component';
import { UploadFormComponent } from './features/upload-form/upload-form.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: 'artworks', component: ArtworkListComponent },
  { path: 'upload', component: UploadFormComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '', redirectTo: '/artworks', pathMatch: 'full' }, // default route
  { path: '**', redirectTo: '/artworks' } // wildcard fallback
];

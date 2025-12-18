import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArtworkListComponent } from './features/artwork-list/artwork-list.component';
import { UploadFormComponent } from './features/upload-form/upload-form.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  { path: 'artworks', component: ArtworkListComponent },
  { path: 'upload', component: UploadFormComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '', redirectTo: '/artworks', pathMatch: 'full' }, // default route
  { path: '**', redirectTo: '/artworks' } // wildcard fallback
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

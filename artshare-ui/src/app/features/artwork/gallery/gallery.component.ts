import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UploadService } from '../../../upload.service';

export interface Artwork {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  createdAt: string;
  artistUsername?: string;
  artistId?: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent {
  artworks: Artwork[] = [];

  constructor(
    private router: Router,
    private uploadService: UploadService
  ) {}

  ngOnInit() {
    this.loadArtworks();
  }

  loadArtworks() {
    this.uploadService.getAllArtwork().subscribe({
      next: (data: Artwork[]) => {
        // Ensure all items have required fields
        this.artworks = data.map(a => ({
          ...a,
          fileType: a.fileType || '',
          fileUrl: a.fileUrl || '',
          fileName: a.fileName || ''
        }))
        // Optional: newest first
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      error: (err: any) => {
        console.error('Failed to load artworks:', err);
      }
    });
  }

  openDetail(id: string) {
    this.router.navigate(['/artwork', id]);
  }

  trackByFn(index: number, item: Artwork) {
    return item.id;
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-artwork-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './artwork-list.component.html',
  styleUrls: ['./artwork-list.component.scss']
})
export class ArtworkListComponent implements OnInit, OnDestroy {
  allArtworks: { image: string; title: string }[] = [];
  displayedArtworks: { image: string; title: string }[] = [];

  private intervalId: any;
  rotationInterval = 5000; // 5 seconds

  ngOnInit() {
    // Generate all 16 artworks with exact filenames
    this.allArtworks = Array.from({ length: 16 }, (_, i) => ({
      image: `assets/artworks/Art${i + 1}.jpg`,
      title: `Artwork ${i + 1}`
    }));

    // Show the first 6 initially
    this.displayedArtworks = this.allArtworks.slice(0, 6);

    // Cycle through images every 5 seconds
    this.intervalId = setInterval(() => {
      const removed = this.displayedArtworks.shift();
      if (removed) {
        // Find the next index in the full set
        const nextIndex =
          (parseInt(removed.title.replace('Artwork ', ''), 10) + 6 - 1) % this.allArtworks.length;
        this.displayedArtworks.push(this.allArtworks[nextIndex]);
      }
    }, this.rotationInterval);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

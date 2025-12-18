import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  signupForm!: FormGroup;
  private intervalId: any;
  rotationInterval = 5000; // 5 seconds

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // ✅ Setup artworks
    this.allArtworks = Array.from({ length: 16 }, (_, i) => ({
      image: `assets/artworks/Art${i + 1}.jpg`,
      title: `Artwork ${i + 1}`
    }));
    this.displayedArtworks = this.allArtworks.slice(0, 6);

    // ✅ Shuffle logic: shuffle all displayed artworks in place
    this.intervalId = setInterval(() => {
      // Make a shallow copy of all artworks
      const shuffled = [...this.allArtworks];

      // Fisher–Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Update the displayed artworks in place (first 6 of shuffled)
      for (let i = 0; i < this.displayedArtworks.length; i++) {
        this.displayedArtworks[i] = shuffled[i];
      }
    }, this.rotationInterval);

    // ✅ Setup signup form
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      dob: ['', Validators.required]
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // ✅ Add onSubmit handler
  onSubmit() {
    if (this.signupForm.valid) {
      console.log('Form submitted:', this.signupForm.value);
      alert('Signup successful!'); // Replace with real logic later
    } else {
      console.log('Form invalid');
      alert('Please fill out all fields correctly.');
    }
  }

  // ✅ TrackBy to keep DOM nodes stable
  trackByFn(index: number, item: { image: string; title: string }) {
    return item.image; // unique per artwork
  }
}

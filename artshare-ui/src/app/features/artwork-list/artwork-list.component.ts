import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Auth
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-artwork-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    // ⭐ Required for Material signup form
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './artwork-list.component.html',
  styleUrls: ['./artwork-list.component.scss']
})
export class ArtworkListComponent implements OnInit, OnDestroy {

  allArtworks: { image: string; title: string }[] = [];
  displayedArtworks: { image: string; title: string }[] = [];

  signupForm!: FormGroup;
  private intervalId: any;
  rotationInterval = 5000; // 5 seconds

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // ⭐ Setup artworks
    this.allArtworks = Array.from({ length: 16 }, (_, i) => ({
      image: `assets/artworks/Art${i + 1}.jpg`,
      title: `Artwork ${i + 1}`
    }));
    this.displayedArtworks = this.allArtworks.slice(0, 6);

    // ⭐ Shuffle logic
    this.intervalId = setInterval(() => {
      const shuffled = [...this.allArtworks];

      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      for (let i = 0; i < this.displayedArtworks.length; i++) {
        this.displayedArtworks[i] = shuffled[i];
      }
    }, this.rotationInterval);

    // ⭐ Setup signup form (updated)
    this.signupForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        username: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        dob: ['', Validators.required]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // ⭐ Password match validator
  passwordMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  // ⭐ Submit handler (NOW CONNECTED TO BACKEND)
  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      alert('Please fill out all fields correctly.');
      return;
    }

    const payload = {
      email: this.signupForm.value.email,
      username: this.signupForm.value.username,
      password: this.signupForm.value.password,
      dob: this.signupForm.value.dob
    };

    this.auth.signup(payload).subscribe({
      next: (res: any) => {
        console.log('Signup successful:', res);
        alert('Signup successful! Welcome to ArtShare.');
      },
      error: (err: { error: { error: any; }; }) => {
        console.error('Signup failed:', err);
        alert(err.error?.error || 'Signup failed. Please try again.');
      }
    });
  }

  // ⭐ TrackBy for stable DOM
  trackByFn(index: number, item: { image: string; title: string }) {
    return item.image;
  }
}

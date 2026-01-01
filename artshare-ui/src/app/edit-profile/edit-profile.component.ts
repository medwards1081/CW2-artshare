import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../profile.service';
import { AuthService } from '../auth.service';
import { getAvatarColor } from '../utils/avatar.utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  profile: any = {
    username: '',
    email: '',
    profileImageUrl: ''
  };

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private profileService: ProfileService,
    private auth: AuthService,
    private router: Router   // ⭐ Added router
  ) {}

  ngOnInit() {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;

        // Load stored Base64 image from AuthService/localStorage
        const savedImage = this.auth.getProfileImage(data.email);
        this.previewUrl = savedImage || null;
        this.profile.profileImageUrl = savedImage || null;
      },
      error: (err) => console.error('Failed to load profile:', err)
    });
  }

  // Expose avatar color util to template
  getAvatarColor(seed: string): string {
    return getAvatarColor(seed);
  }

  // Trigger hidden file input
  triggerFileSelect() {
    this.fileInput.nativeElement.click();
  }

  // Handle file selection + preview
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = typeof reader.result === 'string' ? reader.result : null;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  // Save username + optionally save new profile picture locally
  saveChanges() {
    if (this.selectedFile) {
      this.saveProfileImageLocally();
    } else {
      this.updateProfileData();
    }
  }

  // ⭐ Save profile picture to localStorage (Base64)
  saveProfileImageLocally() {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      // Save Base64 image for this user
      this.auth.setProfileImage(this.profile.email, base64);

      // Update preview + local profile object
      this.previewUrl = base64;
      this.profile.profileImageUrl = base64;

      // Update username only (image is already saved locally)
      this.updateProfileData();
    };

    reader.readAsDataURL(this.selectedFile!);
  }

  // Update username in Cosmos DB
  updateProfileData() {
    const payload: any = {
      username: this.profile.username
    };

    this.profileService.updateProfile(payload).subscribe({
      next: () => {
        console.log('Profile updated');

        // Update AuthService so changes persist across refresh/login
        this.auth.setAuthState(
          this.profile.email,
          this.profile.username,
          this.auth.snapshot.role!,
          this.auth.snapshot.token!,
          this.profile.profileImageUrl
        );

        // ⭐ Redirect to profile page after saving
        this.router.navigate(['/profile']);
      },
      error: (err) => console.error('Failed to update profile:', err)
    });
  }
}

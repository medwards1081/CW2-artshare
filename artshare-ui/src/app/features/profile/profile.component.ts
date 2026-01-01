import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ProfileService } from '../../profile.service';
import { AuthService } from '../../auth.service';
import { getAvatarColor } from '../../utils/avatar.utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  profile: any = null;
  artworks: any[] = [];
  loadingProfile = true;
  loadingArtworks = true;

  followersCount = 0;
  followingCount = 0;

  private cacheBuster = Date.now();

  constructor(
    private profileService: ProfileService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (data: any) => {

        const savedImage = this.auth.getProfileImage(data.email);

        this.profile = {
          ...data,
          profileImageUrl: savedImage || null
        };

        this.loadingProfile = false;

        this.profile.followers = this.profile.followers || [];
        this.profile.following = this.profile.following || [];

        this.followersCount = data.followersCount ?? this.profile.followers.length;
        this.followingCount = data.followingCount ?? this.profile.following.length;

        if (this.profile?.email) {
          this.loadUserArtworks(this.profile.email);
        }
      },
      error: (err: any) => {
        this.loadingProfile = false;
        console.error('Failed to load profile:', err);
      }
    });
  }

  loadUserArtworks(userEmail: string) {
    this.profileService.getUserArtworks(userEmail).subscribe({
      next: (data: any[]) => {

        // ⭐ Normalize artwork fields (safety layer)
        this.artworks = data.map(a => ({
          ...a,
          fileUrl: a.fileUrl || '',
          fileType: a.fileType || '',
          fileName: a.fileName || '',
          artistUsername: a.artistUsername || 'Unknown Artist',
          createdAt: a.createdAt || a.uploadedAt || null
        }));

        this.loadingArtworks = false;
      },
      error: (err: any) => {
        this.loadingArtworks = false;
        console.error('Failed to load user artworks:', err);
      }
    });
  }

  // ⭐ Safe avatar URL getter
  get avatarUrl(): string | null {
    const url = this.profile?.profileImageUrl;
    if (!url) return null;

    if (url.startsWith('data:image')) {
      return url;
    }

    return `${url}?v=${this.cacheBuster}`;
  }

  get fallbackAvatar() {
    if (!this.profile?.username) return null;

    const letter = this.profile.username.charAt(0).toUpperCase();
    const bg = getAvatarColor(this.profile.username);

    return { letter, bg };
  }

  openEdit() {
    this.router.navigate(['/profile/edit']);
  }

  // ⭐ Followers navigation (correct route)
  openFollowers() {
    const id = this.profile?.id || this.profile?.email;
    this.router.navigate([`/profile/${id}/followers`]);
  }

  // ⭐ Following navigation (correct route)
  openFollowing() {
    const id = this.profile?.id || this.profile?.email;
    this.router.navigate([`/profile/${id}/following`]);
  }
}

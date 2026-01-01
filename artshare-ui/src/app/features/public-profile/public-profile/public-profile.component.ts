import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../profile.service';
import { AuthService } from '../../../auth.service';
import { getAvatarColor } from '../../../utils/avatar.utils';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent {

  userId!: string;

  artworks: any[] = [];
  loadingArtworks = true;

  publicProfile: any = null;
  loadingProfile = true;

  currentUser: any = null;
  isOwnProfile = false;

  isFollowing = false;
  followBusy = false;

  private cacheBuster = Date.now();

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.loadCurrentUser();
    this.loadPublicProfile();
    this.loadUserArtworks(); // fallback if backend doesn't return artworks
  }

  // Load logged-in user
  loadCurrentUser() {
    this.profileService.getProfile().subscribe({
      next: (data: any) => {
        this.currentUser = data;

        this.currentUser.following = this.currentUser.following || [];
        this.currentUser.followers = this.currentUser.followers || [];

        this.isOwnProfile = this.currentUser.email === this.userId;
        this.isFollowing = this.currentUser.following.includes(this.userId);
      },
      error: err => {
        console.error('Failed to load current user:', err);
      }
    });
  }

  // Load public profile (may include artworks)
  loadPublicProfile() {
    this.profileService.getPublicProfile(this.userId).subscribe({
      next: (data: any) => {

        const savedImage = this.auth.getProfileImage(this.userId);

        this.publicProfile = {
          ...data,
          profileImageUrl: savedImage || null
        };

        // ⭐ If backend returned artworks, normalize them
        if (Array.isArray(data.artworks)) {
          this.artworks = data.artworks.map((a: any) => this.normalizeArtwork(a));
          this.loadingArtworks = false;
        }

        this.loadingProfile = false;
      },
      error: err => {
        console.error('Failed to load public profile:', err);
        this.loadingProfile = false;
      }
    });
  }

  // Load artworks (fallback if backend didn't include them)
  loadUserArtworks() {
    this.profileService.getUserArtworks(this.userId).subscribe({
      next: (data: any[]) => {

        // Only apply fallback if backend didn't already provide artworks
        if (this.artworks.length === 0) {
          this.artworks = data.map(a => this.normalizeArtwork(a));
        }

        this.loadingArtworks = false;
      },
      error: err => {
        console.error('Failed to load user artworks:', err);
        this.loadingArtworks = false;
      }
    });
  }

  // ⭐ Normalize artwork fields (same as Profile page)
  private normalizeArtwork(a: any) {
    return {
      ...a,
      fileUrl: a.fileUrl || a.imageUrl || '',
      fileType: a.fileType || '',
      fileName: a.fileName || '',
      artistUsername: a.artistUsername || this.publicProfile?.username || 'Unknown Artist',
      createdAt: a.createdAt || a.uploadedAt || null
    };
  }

  // ⭐ Base64-safe avatar getter
  get avatarUrl(): string | null {
    const url = this.publicProfile?.profileImageUrl;
    if (!url) return null;

    if (url.startsWith('data:image')) {
      return url;
    }

    return `${url}?v=${this.cacheBuster}`;
  }

  // Fallback avatar
  get fallbackAvatar() {
    const username =
      this.publicProfile?.username ||
      this.artworks[0]?.artistUsername;

    if (!username) return null;

    const letter = username.charAt(0).toUpperCase();
    const bg = getAvatarColor(username);

    return { letter, bg };
  }

  // ⭐ Follow / Unfollow Toggle
  toggleFollow() {
    if (!this.currentUser?.email || this.isOwnProfile || this.followBusy) return;

    this.followBusy = true;

    // FOLLOW
    if (!this.isFollowing) {
      this.profileService.followUser(this.currentUser.email, this.userId).subscribe({
        next: () => {
          this.followBusy = false;
          this.isFollowing = true;

          if (!this.currentUser.following.includes(this.userId)) {
            this.currentUser.following.push(this.userId);
          }

          this.currentUser.followingCount =
            (this.currentUser.followingCount || 0) + 1;

          this.publicProfile.followersCount =
            (this.publicProfile.followersCount || 0) + 1;
        },
        error: err => {
          this.followBusy = false;
          console.error('Failed to follow user:', err);
        }
      });

      return;
    }

    // UNFOLLOW
    this.profileService.unfollowUser(this.currentUser.email, this.userId).subscribe({
      next: () => {
        this.followBusy = false;
        this.isFollowing = false;

        this.currentUser.following =
          this.currentUser.following.filter((id: string) => id !== this.userId);

        this.currentUser.followingCount =
          Math.max(0, (this.currentUser.followingCount || 0) - 1);

        this.publicProfile.followersCount =
          Math.max(0, (this.publicProfile.followersCount || 0) - 1);
      },
      error: err => {
        this.followBusy = false;
        console.error('Failed to unfollow user:', err);
      }
    });
  }
}

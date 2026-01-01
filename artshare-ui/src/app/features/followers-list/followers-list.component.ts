import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../profile.service';
import { AuthService } from '../../auth.service';
import { getAvatarColor } from '../../utils/avatar.utils';

@Component({
  standalone: true,
  selector: 'app-followers-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './followers-list.component.html',
  styleUrls: ['./followers-list.component.scss']
})
export class FollowersListComponent {

  userId!: string;
  followers: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id')!;

    // Step 1: Get the public profile to retrieve follower emails
    this.profileService.getPublicProfile(this.userId).subscribe({
      next: (data) => {
        const followerEmails = data.followers || [];

        if (followerEmails.length === 0) {
          this.loading = false;
          return;
        }

        // Step 2: Fetch full user objects for each email
        this.profileService.getUsersByEmails(followerEmails).subscribe({
          next: (users) => {
            this.followers = users;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Get avatar for each user
  getAvatar(email: string): string | null {
    const saved = this.auth.getProfileImage(email);
    return saved || null;
  }

  getFallback(username: string) {
    const letter = username?.charAt(0)?.toUpperCase() || '?';
    const bg = getAvatarColor(username || 'x');
    return { letter, bg };
  }
}

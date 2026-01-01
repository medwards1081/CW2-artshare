import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UploadService } from '../../../upload.service';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth.service';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../profile.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule, FormsModule],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  artwork: any = null;
  likesCount = 0;
  likedByUser = false;

  comments: any[] = [];
  myComments: any[] = [];
  newCommentText = '';
  editingCommentId: string | null = null;
  showMyComments = false;
  isLoadingComments = false;

  userEmail: string | null = null;
  username: string | null = null;
  profileImageUrl: string | null = null;

  // ⭐ Admin flag
  isAdmin = false;

  // ⭐ NEW: Admin OR Owner delete permission
  canDelete = false;

  constructor(
    private route: ActivatedRoute,
    private uploadService: UploadService,
    private http: HttpClient,
    private auth: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.userEmail = this.auth.getUserEmail();
    this.username = this.auth.getCurrentUsername();

    const rawImage = this.auth.getCurrentProfileImage();
    this.profileImageUrl = this.safeProfileImage(rawImage);

    // ⭐ Load admin status
    this.profileService.getProfile().subscribe({
      next: (user: any) => {
        this.isAdmin = user?.role === 'admin';
      },
      error: () => {
        this.isAdmin = false;
      }
    });

    if (id) {
      this.uploadService.getArtworkById(id).subscribe({
        next: (data: any) => {
          this.artwork = {
            ...data,
            fileType: data.fileType || '',
            fileUrl: data.fileUrl || '',
            fileName: data.fileName || ''
          };

          this.artwork.likes = this.artwork.likes || [];
          this.likesCount = this.artwork.likes.length;
          this.likedByUser = this.isLikedLocally(this.artwork.id);

          // ⭐ Allow delete if admin OR owner
          this.canDelete =
            this.isAdmin ||
            this.artwork.artistId === this.userEmail;

          this.loadComments();
        },
        error: (err: any) => console.error('Failed to load artwork:', err)
      });
    }
  }

  // ⭐ SAFE BASE64 → DATA URL
  safeProfileImage(raw: string | null): string {
    if (!raw || raw === 'null' || raw === 'undefined' || raw.trim() === '') {
      return 'assets/default-pfp.png';
    }

    if (raw.startsWith('data:image')) {
      return raw;
    }

    return `data:image/png;base64,${raw}`;
  }

  get isLoggedIn(): boolean {
    return !!this.userEmail;
  }

  private getLocalLikesKey(): string {
    const email = this.auth.getUserEmail();
    return `liked_artworks_${email}`;
  }

  private saveLikeLocally(artworkId: string) {
    const key = this.getLocalLikesKey();
    const stored = localStorage.getItem(key);
    const list = stored ? JSON.parse(stored) : [];

    if (!list.includes(artworkId)) {
      list.push(artworkId);
      localStorage.setItem(key, JSON.stringify(list));
    }
  }

  private removeLikeLocally(artworkId: string) {
    const key = this.getLocalLikesKey();
    const stored = localStorage.getItem(key);
    const list = stored ? JSON.parse(stored) : [];

    const updated = list.filter((id: string) => id !== artworkId);
    localStorage.setItem(key, JSON.stringify(updated));
  }

  private isLikedLocally(artworkId: string): boolean {
    const key = this.getLocalLikesKey();
    const stored = localStorage.getItem(key);
    const list = stored ? JSON.parse(stored) : [];
    return list.includes(artworkId);
  }

  likeArtwork() {
    const userEmail = this.auth.getUserEmail();
    return this.http.post('http://localhost:7071/api/likeArtwork', {
      artworkId: this.artwork.id,
      userEmail
    });
  }

  unlikeArtwork() {
    const userEmail = this.auth.getUserEmail();
    return this.http.post('http://localhost:7071/api/unlikeArtwork', {
      artworkId: this.artwork.id,
      userEmail
    });
  }

  toggleLike() {
    if (this.likedByUser) {
      this.unlikeArtwork().subscribe(() => {
        this.likedByUser = false;
        this.likesCount--;
        this.removeLikeLocally(this.artwork.id);
      });
    } else {
      this.likeArtwork().subscribe(() => {
        this.likedByUser = true;
        this.likesCount++;
        this.saveLikeLocally(this.artwork.id);
      });
    }
  }

  private api(path: string) {
    return `http://localhost:7071/api${path}`;
  }

  // ⭐ Load comments with safe profile images
  loadComments() {
    this.isLoadingComments = true;

    this.http.get<any[]>(this.api(`/getComments/${this.artwork.id}`)).subscribe({
      next: (comments) => {
        this.comments = (comments || []).map(c => {
          const raw = this.auth.getProfileImage(c.userEmail);
          const profileImageUrl = this.safeProfileImage(raw);
          return { ...c, profileImageUrl };
        });

        this.updateMyComments();
        this.isLoadingComments = false;
      },
      error: (err) => {
        console.error('Failed to load comments:', err);
        this.isLoadingComments = false;
      }
    });
  }

  private updateMyComments() {
    if (!this.userEmail) {
      this.myComments = [];
      return;
    }
    this.myComments = this.comments.filter(c => c.userEmail === this.userEmail);
  }

  addOrSaveComment() {
    if (!this.newCommentText.trim()) return;

    if (this.editingCommentId) {
      this.saveEditedComment();
    } else {
      this.addComment();
    }
  }

  private addComment() {
    const payload = {
      artworkId: this.artwork.id,
      userEmail: this.userEmail,
      username: this.username ?? 'Unknown User',
      text: this.newCommentText.trim(),
      profileImageUrl: this.profileImageUrl
    };

    this.http.post<any>(this.api('/addComment'), payload).subscribe({
      next: (newComment) => {
        const raw = this.auth.getProfileImage(this.userEmail!);
        newComment.profileImageUrl = this.safeProfileImage(raw);

        this.comments.push(newComment);
        this.updateMyComments();
        this.newCommentText = '';
      },
      error: (err) => console.error('Failed to add comment:', err)
    });
  }

  // ⭐ Allow admin OR owner to edit
  startEditComment(comment: any) {
    if (comment.userEmail !== this.userEmail && !this.isAdmin) return;

    this.editingCommentId = comment.id;
    this.newCommentText = comment.text;
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.newCommentText = '';
  }

  // ⭐ Allow admin OR owner to save edits
  private saveEditedComment() {
    const payload = {
      artworkId: this.artwork.id,
      commentId: this.editingCommentId,
      userEmail: this.userEmail,
      text: this.newCommentText.trim(),
      profileImageUrl: this.profileImageUrl
    };

    this.http.post<any>(this.api('/editComment'), payload).subscribe({
      next: (updatedComment) => {
        const raw = this.auth.getProfileImage(this.userEmail!);
        updatedComment.profileImageUrl = this.safeProfileImage(raw);

        const index = this.comments.findIndex(c => c.id === this.editingCommentId);
        if (index !== -1) this.comments[index] = updatedComment;

        this.updateMyComments();
        this.editingCommentId = null;
        this.newCommentText = '';
      },
      error: (err) => console.error('Failed to edit comment:', err)
    });
  }

  // ⭐ Allow admin OR owner to delete
  deleteComment(comment: any) {
    if (comment.userEmail !== this.userEmail && !this.isAdmin) return;

    const payload = {
      artworkId: this.artwork.id,
      commentId: comment.id,
      userEmail: this.userEmail
    };

    this.http.post<any>(this.api('/deleteComment'), payload).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== comment.id);
        this.updateMyComments();
      },
      error: (err) => console.error('Failed to delete comment:', err)
    });
  }

  toggleCommentsView(showMine: boolean) {
    this.showMyComments = showMine;
  }

  get visibleComments() {
    return this.showMyComments ? this.myComments : this.comments;
  }

  // ⭐ DELETE ARTWORK (admin OR owner)
  deleteArtwork() {
    if (!confirm("Are you sure you want to delete this artwork?")) return;

    this.http.delete(this.api(`/deleteArtwork/${this.artwork.id}?userEmail=${this.userEmail}`)).subscribe({
      next: () => {
        alert("Artwork deleted.");
        this.router.navigate(['/artwork']);
      },
      error: err => {
        console.error("Failed to delete artwork:", err);
        alert("Failed to delete artwork.");
      }
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

interface Post {
  id: number;
  title: string;
  author: string;
  comments: { id: number; text: string; author: string }[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule
  ]
})
export class AdminDashboardComponent {
  posts: Post[] = [
    {
      id: 1,
      title: 'Sunset Painting',
      author: 'Alice',
      comments: [
        { id: 1, text: 'Beautiful work!', author: 'Bob' },
        { id: 2, text: 'Love the colors', author: 'Charlie' }
      ]
    },
    {
      id: 2,
      title: 'Photography of Mountains',
      author: 'David',
      comments: [{ id: 3, text: 'Amazing shot!', author: 'Eve' }]
    }
  ];

  removePost(postId: number): void {
    this.posts = this.posts.filter(p => p.id !== postId);
    console.log('Post removed:', postId);
  }

  removeComment(postId: number, commentId: number): void {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.comments = post.comments.filter(c => c.id !== commentId);
      console.log('Comment removed:', commentId, 'from post:', postId);
    }
  }
}

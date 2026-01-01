import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from './auth.service';

// ⭐ Import your standalone search bar component
import { SearchBarComponent } from './core/search-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SearchBarComponent   // ⭐ REQUIRED so <app-search-bar> works
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'artshare-ui';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  // ⭐ Needed for (search)="onSearch($event)"
  onSearch(query: string) {
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

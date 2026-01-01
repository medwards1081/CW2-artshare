import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SearchService } from '../../search.service';

@Component({
  standalone: true,
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  imports: [CommonModule, RouterModule]
})
export class SearchResultsComponent implements OnInit {
  query = '';
  users: any[] = [];
  artworks: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.query = params.get('q') || '';
      this.runSearch();
    });
  }

  runSearch() {
    this.loading = true;

    this.searchService.searchUsers(this.query).subscribe(users => {
      this.users = users;
    });

    this.searchService.searchArtworks(this.query).subscribe(artworks => {
      this.artworks = artworks;
      this.loading = false;
    });
  }

  // ⭐ Decode Base64URL → original ID (email or UUID)
  decodeKey(encoded: string): string {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
  }

  // ⭐ Navigate to public profile
  openUser(user: any) {
    const realId = this.decodeKey(user.id);
    this.router.navigate(['/user', realId]);
  }

  // ⭐ Navigate to artwork detail
  openArtwork(art: any) {
    const realId = this.decodeKey(art.id);
    this.router.navigate(['/artwork', realId]);
  }
}
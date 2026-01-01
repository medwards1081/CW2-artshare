import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  query = '';

  @Output() search = new EventEmitter<string>();

  onSubmit() {
    const trimmed = this.query.trim();
    if (!trimmed) return;
    this.search.emit(trimmed);
  }
}

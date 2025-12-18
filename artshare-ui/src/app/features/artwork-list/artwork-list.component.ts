import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-artwork-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './artwork-list.component.html',
  styleUrls: ['./artwork-list.component.scss']

})
export class ArtworkListComponent {

}

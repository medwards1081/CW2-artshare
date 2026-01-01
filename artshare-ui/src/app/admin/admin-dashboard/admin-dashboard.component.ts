import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule
  ]
})
export class AdminDashboardComponent {

  // Navigation options for the admin dashboard
  adminOptions = [
    {
      title: 'Manage Users',
      description: 'View all users and update their roles.',
      icon: 'group',
      route: '/admin/users'
    },
    {
      title: 'Manual Test Suite',
      description: 'View the list of manual tests performed on the system.',
      icon: 'checklist',
      route: '/admin/tests'
    }
  ];

}

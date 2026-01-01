import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {

  users: any[] = [];
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:7071/api/getAllUsers').subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.isLoading = false;
      }
    });
  }

  updateRole(user: any) {
    this.http.post('http://localhost:7071/api/updateUserRole', {
      email: user.email,
      role: user.role
    }).subscribe({
      next: () => alert(`Updated role for ${user.email}`),
      error: (err) => console.error('Failed to update role:', err)
    });
  }

  deleteUser(user: any) {
    if (!confirm(`Are you sure you want to delete ${user.email}?`)) return;

    this.http.post('http://localhost:7071/api/deleteUser', {
      email: user.email
    }).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.email !== user.email);
        alert(`Deleted user: ${user.email}`);
      },
      error: (err) => console.error('Failed to delete user:', err)
    });
  }
}
